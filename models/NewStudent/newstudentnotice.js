var mongoose = require('mongoose')

var newstudentNoticeSchema = new mongoose.Schema({
    "报名时间": String,
    "报名序号": String,
    "fid": String,
    "openid": String,
    "time": String,
    "学生姓名": String,
    "msgid":String,
    "sendresult":String,
    "readed":Boolean,
}, { collection: 'newstudentNotice' })

newstudentNoticeSchema.statics.findall = async function () {
    let result = await this.find({}).exec();
    return result;
}

newstudentNoticeSchema.statics.findByQuery = async function (query) {
    let result = await this.find(query).exec();
    return result;
}
newstudentNoticeSchema.statics.findOneByQuery = async function (query) {
    let result = await this.findOne(query).exec();
    return result;
}
newstudentNoticeSchema.statics.updateone = async function (query,value) {
    let result = await this.updateOne(query, value).exec()
    return result
}

// newstudentSchema.statics.myFindOne=async function(query,value){
//     let result=await this.findOne(query).exec()
//     return result;
// }

var newstudentNoticeModel = mongoose.model('newstudentNotice', newstudentNoticeSchema)
module.exports = newstudentNoticeModel;