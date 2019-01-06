var mongoose = require('mongoose')

var linkSchema=new mongoose.Schema({
    // _id:mongoose.Schema.Types.ObjectId,
    title:{
        type:String,
        unique:true,
        index:true,
        required:[true,'链接标题必须填写'],
    },
    url:{
        type:String,
        required:[true,'链接地址必须填写']
    },
    show:{
        type:Boolean,
        default:true    
    }
},{collection:'sitenavlink'});

var linkModel=mongoose.model('sitenavlink',linkSchema)

function linkDAO(linkdao){
    this.linkdao=linkdao;
}
//获取所有
linkDAO.FindAll=async function(sort,fields){
    sort=sort||'-_id';
    fields=fields||'title url show'
    let list=await linkModel.find({},fields).sort(sort).exec()
    //let list=await linkModel.find({}).sort(sort).exec()
    return list;
}

linkDAO.FindById=async function(id,fields){
    if(fields)
    {
        return await linkModel.findById(id,fields).exec()
    }
    return await linkModel.findById(id).exec()
}

linkDAO.FindByQuery=async function(query,fields){
    if(fields)
    {
        return await linkModel.find(query,fields).exec()
    }
    return await linkModel.find(query).exec()
}

//删除
linkDAO.DelById=async function(id){
    let result=await linkModel.deleteOne({_id:id}).exec();
    return result;
}

//新增
linkDAO.Save=async function(doc){
    let one=new linkModel(doc);
    let temp=await one.save();
    return temp;
}

//更新
linkDAO.Edit=async function(doc){
    let result=await linkModel.updateOne({_id:doc.id},doc).exec();
    return result;
}
//分页获取记录
linkDAO.myPaging=async function(keyword,pagesize,currentpage,sort){
    sort=sort||'-_id';
    let query={}
    if(keyword)
        query={title:{$regex:keyword}}
    pagesize=pagesize||5;
    currentpage=currentpage||1;
    let start=(currentpage-1)*pagesize;
    let list=await linkModel.find(query).skip(start).limit(pagesize).sort(sort).exec();
    let countnum=await linkModel.countDocuments(query).exec();
    return {"recordset":list,"count":countnum}
}
module.exports=linkDAO;