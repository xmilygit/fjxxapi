var mongoose=require('../../cfg/dbconfig.js')

var graduateTableSchema=new mongoose.Schema({
    "stel": String,
    "no": String,
    "sid": String,
    "name": String,
    "pid": String,
    "gender": String,
    "born": String,
    "nation": String,
    "regaddress": String,
    "homeaddress": String,
    "fname": String,
    "sname": String,
    "ftel": String
},{collection:'graduateTable'})

graduateTableSchema.statics.FindOne=async function(query){
    let result=await this.findOne(query).exec()
    return result;
}

module.exports =mongoose.model('graduateTable',graduateTableSchema)