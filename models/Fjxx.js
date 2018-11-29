var mongoose = require('mongoose')

var FjxxSchemanew = new mongoose.Schema({
    username: {
        type: String,
        required: [true, '用户名必须填写']
    },
    password: String,
    gender: String,
    pid: {
        type: String,
        validate: {
            validator: function (v) {
                return /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(v)
            },
            message: '身份证不符合要求'
        }
    },
    wxopenid: String,
    tkRecords: [{
        score: {
            type: Number,
            required: [true, '成绩必须要填写']
        },
        rightrate: {
            type: String,
            required: [true, '正确率必须要填写']
        },
        time: {
            type: String,
            required: [true, '用时必须填写']
        },
        finishdate: {
            type: Date,
            required: [true, '完成时间必须填写']
        }
    }]
}, { collections: 'Fjxx' });

var fjxxModel = mongoose.model('Fjxx', FjxxSchemanew)

function fjxxDAO(fjxxdao) {
    this.fjxxdao = fjxxdao;
}

fjxxDAO.myCreate=async function(doc){
    let one=new fjxxModel(doc);
    let temp=await one.save();
    return temp
}

module.exports=fjxxDAO;