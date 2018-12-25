var mongoose=require('mongoose')
var tkLessonSchema=new mongoose.Schema({
    lessonname:{
        type:String,
        unique:true,
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
/* 排序方式
Room.find({}).sort('-date').exec(function(err, docs) { ... });
Room.find({}).sort({date: -1}).exec(function(err, docs) { ... });
Room.find({}).sort({date: 'desc'}).exec(function(err, docs) { ... });
Room.find({}).sort({date: 'descending'}).exec(function(err, docs) { ... });
Room.find({}).sort([['date', -1]]).exec(function(err, docs) { ... });
Room.find({}, null, {sort: '-date'}, function(err, docs) { ... });
Room.find({}, null, {sort: {date: -1}}, function(err, docs) { ... });
*/
//获取所有记录
tkLessonDAO.myFindAll=async function(sort,fields){
    sort=sort||'-_id';
    fields=fields||'lessonname'
    let list=await tkLessonModel.find({},fields).sort(sort).exec()
    return list;
}

//删除指定记录
tkLessonDAO.myDelete=async function(id){
    let result=await tkLessonModel.deleteOne({_id:id}).exec();
    return result;
}
//获取指定记录
tkLessonDAO.myFind=async function(id){
    let result=await tkLessonModel.findById(id).exec();
    return result;
}

//修改指定记录
tkLessonDAO.myEdit=async function(doc){
    let result=await tkLessonModel.updateOne({_id:doc.id},doc).exec();
    return result;
}

//分页获取记录
tkLessonDAO.myPaging=async function(keyword,pagesize,currentpage,sort){
    sort=sort||'-_id';
    let query={}
    if(keyword)
        query={lessonname:{$regex:keyword}}
    pagesize=pagesize||5;
    currentpage=currentpage||1;
    let start=(currentpage-1)*pagesize;
    let list=await tkLessonModel.find(query).skip(start).limit(pagesize).sort(sort).exec();
    let countnum=await tkLessonModel.countDocuments(query).exec();
    return {"recordset":list,"count":countnum}
}

module.exports=tkLessonDAO

