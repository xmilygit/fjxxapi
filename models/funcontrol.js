var mongoose = require('mongoose')

var funcontrolSchema=new mongoose.Schema({
    funname:String,
    funvalue:Boolean
},{collection:'funcontrol'});

// var funcontrolSchema=funcontrolSchema

funcontrolSchema.statics.FindByQuery=async function(query,fields){
    if(fields)
    {
        return await this.find(query,fields).exec()
    }
    return await this.find(query).exec()
}

//更新
funcontrolSchema.statics.Edit=async function(funname,value){
    let result=await this.updateOne({'funname':funname},{$set:{'funvalue':value}}).exec();
    return result;
}

module.exports=mongoose.model("funcontrol",funcontrolSchema)