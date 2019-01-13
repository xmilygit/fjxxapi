var mongoose = require('mongoose')

var baseSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    username: {
        type: String,
        required: [true, '用户名必须填写']
    },
    password: String,
    password2:String,
    gender: String,
    baseinfo:Object,
    newstudentinfo:Object,
    graduate:Object,
    pid: {
        type: String,
        validate: {
            validator: function (v) {
                return /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(v)
            },
            message: '身份证不符合要求'
        }
    },
    wxopenid: String,
    teaching:[{
        term:{
            type:String,
            required:[true,'学期名称必须填写']
        },
        subject:{
            type:[String],
            required:[true,"学科信息必须填写"]
        }
    }],
    tkRecords: [{
        _id:{
            type:mongoose.Schema.Types.ObjectId,
            default:mongoose.Types.ObjectId()
        },
        lesson:{
            type:String,
            required:[true,'课程名称必须填写']
        },
        score: {
            type: Number,
            required: [true, '成绩必须要填写']
        },
        rightrate: {
            type: String,
            required: [true, '正确率必须要填写']
        },
        time: {
            type: String,
            required: [true, '用时必须填写']
        },
        finishdate: {
            type: Date,
            required: [true, '完成时间必须填写']
        }
    }]
}, { collection: 'base' });

var baseModel = mongoose.model('base', baseSchema)

function baseDAO(basedao) {
    this.basedao = basedao;
}
//根据ID查找记录，并返回所有字段
// baseDAO.myFindById=async function(id){
//     return await baseModel.findById(id).exec()
// }
//根据ID查找记录并返回（全部/指定）字段
//myFindById('15445445454')
//myFindById('15445445454','name gender')  myFindById('15445445454','-name -gender')  
baseDAO.myFindById=async function(id,fields){
    if(fields)
    {
        return await baseModel.findById(id,fields).exec()
    }
    return await baseModel.findById(id).exec()
}

//根据条件查找记录并返回（全部/指定）字段
//myFindByQuery({"_id":'1231231231232'})
//myFindByQuery({"_id":'1231231231232'},'name gender')  myFindByQuery({"_id":'1231231231232'},'-name -gender')  
baseDAO.myFindByQuery=async function(query,fields){
    if(fields)
    {
        return await baseModel.find(query,fields).exec()
    }
    return await baseModel.find(query).exec()
}

//给符合查询条件的记录，添加子记录
baseDAO.myPushdata=async function(query,data){
    let result=await baseModel.updateOne(
        query,
        {
            "$push":{
                tkRecords:data
            }
        }
    )
    return result
}

//针对该库的聚合操作
baseDAO.myAggregate=async function(aggregations){
    let result=await baseModel.aggregate(
        aggregations
    ).exec();
    return result;
}

baseDAO.myCreate=async function(doc){
    let one=new baseModel(doc);
    let temp=await one.save();
    return temp
}

baseDAO.myUpdate=async function(query,value){
    let result=await baseModel.update(query,value).exec();
    return result;
}
baseDAO.myUpdateField=async function(query,value){
    let result=await baseModel.update(query,value).exec();
    return result;
}

//批量添加用户
baseDAO.insertManyAccount=async function(data){
    let result=await baseModel.insertMany(data)
    return result;
}

//分页查询

baseDAO.myPaging=async function (keyword, pagesize, lastid) {
    //throw new Error("数据库查询异常:");
    //return;
    var query = {}
    let reco = []
    if (lastid) {
        query = {
            $or: [
                { username: { $regex: keyword } },
                { pid: { $regex: keyword } }
            ],
            _id: { $lt: lastid }
        }
    } else {
        query = {
            $or: [
                { username: { $regex: keyword } },
                { pid: { $regex: keyword } }
            ]
        }
    }

    let countQuery={
        $or:[
            {username:{$regex:keyword}},
            {pid:{$regex:keyword}}
        ]
    }

    reco = await baseModel
            .find(query)
            .sort({ _id: -1 })
            .limit(pagesize)
            .exec();
    let count=await baseModel.countDocuments(countQuery).exec();
    return {"recordset":reco,"count":count}
}

//删除teaching字段中的指定学期的记录
baseDAO.delTerm=async function(term){
    let result=await baseModel.updateMany({'teaching.term':term},{'$pull':{'teaching':{'term':term}}}).exec();
    return result;
}

module.exports=baseDAO;