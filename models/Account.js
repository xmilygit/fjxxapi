var mongoose = require('mongoose');
var AccountSchema = new mongoose.Schema({
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
    binders: [{
        _fk: mongoose.SchemaTypes.ObjectId,
        bindertype: String
    }]
}, { collection: 'Account' });

var accountModel=mongoose.model("Account",AccountSchema)

function accountDAO(accountdao){
    this.accountdao=accountdao;
}
//获取所有记录
accountDAO.myFindAll = async function () {
    // let intime = Date.now();
    // console.log(`进入时间:${intime}`)

    let list = await accountModel.find({}).exec()
    // let outtime = Date.now();
    // console.log(await sleep(10000))
    // console.log(`耗时时间:${outtime - intime}`)
    return list;
}
//根据给定的条件查找
accountDAO.myFind = async function (conditions) {
    let list = await accountModel.find(conditions).exec()
    return list
}
//根据ID查找记录
accountDAO.myFindById = async function (id) {
    let reco = await accountModel.findById(id).exec();
    return reco;
}

//插入数据
accountDAO.myCreate = async function (doc) {
    await this.model('Account').create(doc).exec()
}


//分页查询

accountDAO.myPaging=async function (keyword, pagesize, lastid) {
    //throw new Error("数据库查询异常:");
    //return;
    var query = {}
    let reco = []
    if (lastid) {
        query = {
            $or: [
                { username: { $regex: keyword } },
                { pid: { $regex: keyword } }
            ],
            _id: { $lt: lastid }
        }
    } else {
        query = {
            $or: [
                { username: { $regex: keyword } },
                { pid: { $regex: keyword } }
            ]
        }
    }

    let countQuery={
        $or:[
            {username:{$regex:keyword}},
            {pid:{$regex:keyword}}
        ]
    }

    reco = await accountModel
            .find(query)
            .sort({ _id: -1 })
            .limit(pagesize)
            .exec();
    let count=await accountModel.countDocuments(countQuery).exec();
    return {"recordset":reco,"count":count}
}

module.exports=accountDAO;

