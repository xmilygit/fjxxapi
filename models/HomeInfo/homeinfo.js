var mongoose = require('mongoose')

var homeinfoSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    "成员2身份证件号": {
        type:String,
        validate: {
            validator: function (v) {
                return /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(v)
            },
            message: '身份证不符合要求'
        }
    },
    "学生姓名": String,
    "全国学籍号": String,
    "身份证件类型": String,
    "身份证件号": String,
    "年级名称": String,
    "班级名称": String,
    "成员1姓名": String,
    "成员1关系": String,
    "成员1是否监护人": String,
    "成员1身份证件类型": String,
    "成员1身份证件号":{
        type:String,
        validate: {
            validator: function (v) {
                return /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(v)
            },
            message: '身份证不符合要求'
        }
    },
    "成员2姓名": String,
    "成员2关系": String,
    "成员2是否监护人": String,
    "成员2身份证件类型": String,
},{collection: 'homeinfo'})

//仅更新符合条件的一条记录
homeinfoSchema.statics.myUpdateOne=async function(query,value){
    let result=await this.updateOne(query,value).exec()
    return result
}

homeinfoSchema.statics.myFindOne=async function(query,value){
    let result=await this.findOne(query).exec()
    return result;
}


var homeinfoModel = mongoose.model('homeinfo', homeinfoSchema)

module.exports=homeinfoModel;