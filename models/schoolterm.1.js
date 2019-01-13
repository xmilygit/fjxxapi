var mongoose = require('mongoose')

var termSchema=new mongoose.Schema({
    // _id:mongoose.Schema.Types.ObjectId,
    term:{
        type:String,
        unique:true,
        required:[true,'学期名称必须填写'],
    },
    subject:{
        type:[String]
    }
    
},{collection:'schoolterm'});

var termModel=mongoose.model('schoolterm',termSchema)

function termDAO(termdao){
    this.termdao=termdao;
}
//获取所有
termDAO.FindAll=async function(sort,fields){
    sort=sort||'-_id';
    fields=fields||'term subject'
    let list=await termModel.find({},fields).sort(sort).exec()
    //let list=await termModel.find({}).sort(sort).exec()
    return list;
}

termDAO.FindById=async function(id,fields){
    if(fields)
    {
        return await termModel.findById(id,fields).exec()
    }
    return await termModel.findById(id).exec()
}

termDAO.FindByQuery=async function(query,fields){
    if(fields)
    {
        return await termModel.find(query,fields).exec()
    }
    return await termModel.find(query).exec()
}

//删除
termDAO.DelById=async function(id){
    let result=await termModel.deleteOne({_id:id}).exec();
    return result;
}

//新增
termDAO.Save=async function(doc){
    let one=new termModel(doc);
    let temp=await one.save();
    return temp;
}

//更新
termDAO.Edit=async function(doc){
    let result=await termModel.updateOne({_id:doc.id},doc).exec();
    return result;
}
//分页获取记录
termDAO.myPaging=async function(keyword,pagesize,currentpage,sort){
    sort=sort||'-_id';
    let query={}
    if(keyword)
        query={term:{$regex:keyword}}
    pagesize=pagesize||5;
    currentpage=currentpage||1;
    let start=(currentpage-1)*pagesize;
    let list=await termModel.find(query).skip(start).limit(pagesize).sort(sort).exec();
    let countnum=await termModel.countDocuments(query).exec();
    return {"recordset":list,"count":countnum}
}
module.exports=termDAO;