var mongoose=require('mongoose')

// var newstudentSchema=new mongoose.Schema({
//     _id:mongoose.Schema.Types.ObjectId,
//     "姓名":String,
//     "身份证":String,
//     "password":String,
//     "wxopenid":String,
// },{collection:'2019NewStudent'})
var newstudentSchema=new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    "姓名":String,
    "性别": String,
    // "出生日期": String,
    "身份证件号": String,
    "出生地行政区划代码": String,
    "民族": String,
    "户口性质": String,
    "户口所在地行政区划": String,
    "现住址": String,
    "是否独生子女": String,
    "籍贯":String,
    "家庭地址": String,
    "是否受过学前教育": String,
    "成员1姓名": String,
    "成员1关系": String,
    "成员1户口所在地行政区划":String,
    "成员1联系电话": String,
    "成员1是否监护人": String,
    "成员1身份证件号": String,
    "成员2姓名": String,
    "成员2关系": String,
    "成员2户口所在地行政区划":String,
    "成员2联系电话": String,
    "成员2是否监护人": String,
    "成员2身份证件号": String
},{collection:'2019NSInfo'})

newstudentSchema.statics.findall=async function(){
    let result=await this.find({}).exec();
    return result;
}

newstudentSchema.statics.updateone=async function(query,value){
    let result=await this.updateOne(query,value).exec()
    return result
}

newstudentSchema.statics.myFindOne=async function(query,value){
    let result=await this.findOne(query).exec()
    return result;
}

var newstudentModel=mongoose.model('newstudent',newstudentSchema)
module.exports=newstudentModel;