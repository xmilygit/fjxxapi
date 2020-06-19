var mongoose=require('../../cfg/dbconfig.js')

//转学学生信息模型
var transschoolSchema=new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    'stuname':String,
    'gender':String,
    'born':String,
    'nation':String,
    'hometown':String,
    'fname':String,
    'sname':String,
    'fwork':String,
    'swork':String,
    'foffice':String,
    'soffice':String,
    'fedu':String,
    'sedu':String,
    'sourceschool':String,
    'stupid':String,
    'regaddress':String,
    'homeaddress':String,
    'ftel':String,
    'stel':String,
    'transgrade':String,
},{collection:'transschool'})

module.exports=mongoose.model('transschool',transschoolSchema)
