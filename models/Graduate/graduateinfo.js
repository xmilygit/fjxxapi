var mongoose = require('mongoose')

var graduateinfoSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    "学生姓名": String,
    "学籍号": String,
    "身份证件号": String,
    "性别": String,
    "民族": String,
    "家庭地址": String,
    "现住址": String,
    "班级": String,
    "成员1姓名": String,
    "成员1与学生关系": String,
    "成员1联系方式": String,
    "成员2姓名": String,
    "成员2与学生关系": String,
    "成员2联系方式": String,
    "result": String,
    "born": String,
    "成员1身份证件号": String,
    "成员2身份证件号": String,
    "fregaddress": String,
    "sregaddress": String,
    "hashouse": Boolean,
    "hometype": String,
    "sigle": Boolean,
    "stulocal":Boolean,
    "regmainname":String,
}, { collection: 'graduateinfo2014' })


graduateinfoSchema.statics.myFindOne = async function (query, value) {
    let result = await this.findOne(query).exec()
    return result;
};
//仅更新符合条件的一条记录
graduateinfoSchema.statics.myUpdateOne = async function (query, value) {
    let result = await this.updateOne(query, value).exec()
    return result
}

//分页查询

graduateinfoSchema.statics.myPaging=async function (keyword, pagesize, lastid) {
    //throw new Error("数据库查询异常:");
    //return;
    var query = {}
    let reco = []
    if (lastid) {
        query = {
            $or: [
                { '学生姓名': { $regex: keyword } },
                { '身份证件号': { $regex: keyword } }
            ],
            _id: { $lt: lastid }
        }
    } else {
        query = {
            $or: [
                { '学生姓名': { $regex: keyword } },
                { '身份证件号': { $regex: keyword } }
            ]
        }
    }

    let countQuery={
        $or:[
            {'学生姓名':{$regex:keyword}},
            {'身份证件号':{$regex:keyword}}
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


var graduateinfoModel = mongoose.model('graduateinfo', graduateinfoSchema)
module.exports = graduateinfoModel;