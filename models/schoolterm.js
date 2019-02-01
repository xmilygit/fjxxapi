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




termSchema.statics.FindAll=async function(sort,fields){
    sort=sort||'-_id';
    fields=fields||'term subject'
    let list=await this.find({},fields).sort(sort).exec()
    //let list=await termModel.find({}).sort(sort).exec()
    return list;
}

termSchema.statics.FindById=async function(id,fields){
    if(fields)
    {
        return await this.findById(id,fields).exec()
    }
    return await this.findById(id).exec()
}

termSchema.statics.FindByQuery=async function(query,fields){
    if(fields)
    {
        return await this.find(query,fields).exec()
    }
    return await this.find(query).exec()
}

//删除
termSchema.statics.DelById=async function(id){
    let result=await this.deleteOne({_id:id}).exec();
    return result;
}

//新增
termSchema.statics.Save=async function(doc){
    let one=new termModel(doc);
    let temp=await one.save();
    return temp;
}

//更新
termSchema.statics.Edit=async function(doc){
    let result=await this.updateOne({_id:doc.id},doc).exec();
    return result;
}
//分页获取记录
termSchema.statics.myPaging=async function(keyword,pagesize,currentpage,sort){
    sort=sort||'-_id';
    let query={}
    if(keyword)
        query={term:{$regex:keyword}}
    pagesize=pagesize||5;
    currentpage=currentpage||1;
    let start=(currentpage-1)*pagesize;
    let list=await this.find(query).skip(start).limit(pagesize).sort(sort).exec();
    let countnum=await this.countDocuments(query).exec();
    return {"recordset":list,"count":countnum}
}


var termModel=mongoose.model('schoolterm',termSchema)

module.exports=termModel;