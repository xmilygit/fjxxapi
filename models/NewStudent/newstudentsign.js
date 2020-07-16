var mongoose=require('../../cfg/dbconfig.js')

var newstudentsignSchema=new mongoose.Schema({
    "stuname":String,
    "fid":String,//面审号
    "sid":String,//报名序号
    "valitime":String,
    "pid":String,
    "newpid":String,
    "fpid":String,
    "oldfpid":String,
    "spid":String,
    "oldspid":String,
    "wxopenid":String,
    "type":String,
    "window":String,
    "fgx":String,
    "sgx":String
},{collection:'newstudentsign'})


newstudentsignSchema.statics.findbyquery=async function(query){
    let result=await this.find(query).exec()
    return result;
}

newstudentsignSchema.statics.getOne=async function(query){
    let result=await this.findOne(query).exec()
    return result;
}

newstudentsignSchema.statics.update=async function(sid,value){
    let result=await this.updateOne({'sid':sid},{$set:value},{upsert:true})
    return result;
}

module.exports=mongoose.model('newstudentsign',newstudentsignSchema)