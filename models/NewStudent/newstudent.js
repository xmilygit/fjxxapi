var mongoose=require('mongoose')

var newstudentSchema=new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    "姓名":String,
    "身份证":String,
    "password":String,
    "wxopenid":String,
},{collection:'2019NewStudent'})


newstudentSchema.statics.findall=async function(){
    let result=await this.find({}).exec();
    return result;
}

newstudentSchema.statics.updateone=async function(query,value){
    let result=await this.updateOne(query,value).exec()
    return result
}

var newstudentModel=mongoose.model('newstudent',newstudentSchema)
module.exports=newstudentModel;