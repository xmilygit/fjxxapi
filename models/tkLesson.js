var mongoose=require('mongoose')
var tkLessonSchema=new mongoose.Schema({
    lessonname:{
        type:String,
        required:[true,'课程名称必须填写']
    },
    lessoncontent:{
        type:String,
        required:[true,'课程内容必须填写']
    }
},{collection:'tkLesson'});


var tkLessonModel=mongoose.model('tkLesson',tkLessonSchema);

function tkLessonDAO(tklessondao){
    this.tklessondao=tklessondao;
}

//插入一条记录
tkLessonDAO.myCreate=async function(doc){
    let _doc=new tkLessonModel(doc);
    let temp=await _doc.save();
    return temp;
}

//获取所有记录
tkLessonDAO.myFindAll=async function(){
    let list=await tkLessonModel.find({}).exec()
    return list;
}

module.exports=tkLessonDAO

