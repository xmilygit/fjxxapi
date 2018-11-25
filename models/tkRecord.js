var mongoose = require('mongoose');
var tkRecordSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: [true, '记录生成者ID必须填写']
    },
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
}, { collection: 'tkRecord' });

var tkRecordModel = mongoose.model('tkRecord', tkRecordSchema)

function tkRecordDAO(tkrecorddao) {
    this.tkrecorddao = tkrecorddao;
}

//插入一条记录
tkRecordDAO.myCreate = async function (doc) {
    let record = new tkRecordModel(doc)
    let temp = await record.save()
    return temp
}

tkRecordDAO.myFind = async function (conditions) {
    let list = await tkRecordModel.find(conditions).exec()
    return list
}

module.exports = tkRecordDAO;