var mongoose=require('../../cfg/dbconfig.js')

//转学学生信息模型
var baseInfoSchema=new mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    "classno": String,
    "born": String,
    "name": String,
    "pid": String,
    "sid": String,
    "gender": String,
    "ethnic": String,
    "regaddress": String,
    "homeaddress": String,
    "contact": String,
    "fsname": String,
    "grade": String,
    "status": String
},{collection:'BaseInfo'})


baseInfoSchema.statics.findByQuery=async function(query){
    let result=await this.findOne(query).exec();
    return result;
}

module.exports=mongoose.model('BaseInfo',baseInfoSchema)