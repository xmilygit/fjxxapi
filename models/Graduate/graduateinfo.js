var mongoose=require('mongoose')

var graduateinfoSchema=new mongoose.Schema({
        _id:mongoose.Schema.Types.ObjectId,
        "学生姓名": String,
        "学籍号": String,
        "身份证件号": String,
        "性别": String,
        "民族": String,
        "家庭地址": String,
        "现住址": String,
        "班级": String,
        "成员1姓名": String,
        "成员1与学生关系":String,
        "成员1联系方式":String,
        "成员2姓名": String,
        "成员2与学生关系":String,
        "成员2联系方式":String
},{collection:'graduateinfo'})


graduateinfoSchema.statics.myFindOne=async function(query,value){
    let result=await this.findOne(query).exec()
    return result;
}


var graduateinfoModel=mongoose.model('graduateinfo',graduateinfoSchema)
module.exports=graduateinfoModel;