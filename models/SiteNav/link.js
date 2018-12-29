var mongoose = require('mongoose')

var linkSchema=new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    title:{
        type:String,
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

var linkModel=mongoose.model('link',linkSchema)

function linkDAO(linkdao){
    this.linkdao=linkdao;
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
linkDAO.UpdateDoc=async function(query,value){
    let result=await linkModel.update(query,value).exec();
    return result;
}

module.exports=linkDAO;