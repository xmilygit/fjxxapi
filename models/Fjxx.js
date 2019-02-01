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
        },
        _id:false
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

//根据ID查找记录，并返回所有字段
// baseDAO.myFindById=async function(id){
//     return await baseModel.findById(id).exec()
// }
//根据ID查找记录并返回（全部/指定）字段
//myFindById('15445445454')
//myFindById('15445445454','name gender')  myFindById('15445445454','-name -gender')  
baseSchema.statics.myFindById=async function(id,fields){
    if(fields)
    {
        return await this.findById(id,fields).exec()
    }
    return await this.findById(id).exec()
}

//根据条件查找记录并返回（全部/指定）字段
//myFindByQuery({"_id":'1231231231232'})
//myFindByQuery({"_id":'1231231231232'},'name gender')  myFindByQuery({"_id":'1231231231232'},'-name -gender')  
baseSchema.statics.myFindByQuery=async function(query,fields){
    if(fields)
    {
        return await this.find(query,fields).exec()
    }
    return await this.find(query).exec()
}

//给符合查询条件的记录，添加子记录
baseSchema.statics.myPushdata=async function(query,data){
    let result=await this.updateOne(
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
baseSchema.statics.myAggregate=async function(aggregations){
    let result=await this.aggregate(
        aggregations
    ).exec();
    return result;
}

baseSchema.statics.myCreate=async function(doc){
    let one=new baseModel(doc);
    let temp=await one.save();
    return temp
}

baseSchema.statics.myUpdate=async function(query,value){
    let result=await this.update(query,value).exec();
    return result;
}
baseSchema.statics.myUpdateField=async function(query,value){
    let result=await this.update(query,value).exec();
    return result;
}

//批量添加用户
baseSchema.statics.insertManyAccount=async function(data){
    let result=await this.insertMany(data)
    return result;
}

//分页查询

baseSchema.statics.myPaging=async function (keyword, pagesize, lastid) {
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

    reco = await this
            .find(query)
            .sort({ _id: -1 })
            .limit(pagesize)
            .exec();
    let count=await this.countDocuments(countQuery).exec();
    return {"recordset":reco,"count":count}
}

//删除teaching字段中的指定学期的记录
baseSchema.statics.delTerm=async function(term){
    let result=await this.updateMany({'teaching.term':term},{'$pull':{'teaching':{'term':term}}}).exec();
    return result;
}

//获取所教学科中指定subject的用户
baseSchema.statics.getBySubject=async function(subject,term){
    let result=await this.myFindByQuery({'teaching.subject':subject,'teaching.term':term},{'username':1})
    return result;
}

//添加新的学期后，给所有教师用户添加相关的teaching字段信息
baseSchema.statics.appendTeachingTerm=async function(term){
    let query = {
        'baseinfo': { $exists: 0 }
    };
    let update = {
        $addToSet:
        {
            'teaching':
                { 'term': term, 'subject': [] }
        }
    };
    let options={multi:true};
    let result=await this.update(query,update,options).exec();
}

//重置并初始化指定学期下的所有任教数据
baseSchema.statics.resetAllTeaching=async function(term){
    // let query = {
    //     $and: [
    //         { 'teaching': { $exists: 0 } },
    //         { 'baseinfo': { $exists: 0 } }
    //     ]
    // };
    // let update = {
    //     $addToSet:
    //     {
    //         'teaching':
    //             { 'term': term, 'subject': [] }
    //     }
    // };
    // let options={multi:true};
    // let result=await this.update(query,update,options).exec();

    let query={'baseinfo':{$exists:0}};
    let update = {$set:{'teaching.$[item].subject': []}}
    let options={arrayFilters:[{'item.term':term}],multi:true}
    let result=await this.update(query,update,options).exec();
    return result;
}

//更改学期名称时同时更改教师用户相关学期名称
baseSchema.statics.updateAllTerm=async function(oldterm,newterm,diffsubject){
    // if(oldterm==newterm) return
    let update={};
    if(oldterm!=newterm){
        update['$set']={'teaching.$[t].term':newterm}
    }
    if(diffsubject.length>0){
        update['$pull']={'teaching.$[t].subject':{$in:diffsubject}}
    }
    let query = {
        'baseinfo': { $exists: 0 }
    };
    // let update = {
    //     '$set':updatefield
    //         //{ 'teaching.$[t].term': newterm }
    // };
    let options = {
        arrayFilters: [{ 't.term': oldterm }],
        multi: true
    }
    let result=await this.update(query,update,options).exec();
    return result;
}

//给教师设置(添加)指定学期的任教学科
baseSchema.statics.setTeachingSubject=async function(term,subject,teachers){
    let query = { 'baseinfo': { $exists: 0 } }
    let update = { $pull: { 'teaching.$[item].subject': subject } }
    let options={arrayFilters:[{'item.term':term}],multi:true}
    //重置term学期下的subject课程任教数据
    let result=await this.update(query,update,options).exec();
    //设置新的任教信息
    query={'username':{$in:teachers}}
    update={$push:{'teaching.$[item].subject':subject}}
    result=await this.update(query,update,options).exec();
    return result
}



var baseModel = mongoose.model('base', baseSchema)

module.exports=baseModel;