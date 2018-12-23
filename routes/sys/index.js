const router = require('koa-router')()
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
// const Account = require('../../models/Account');
// const tkRecord = require('../../models/tkRecord');
// const tkLesson = require('../../models/tkLesson');
const base = require('../../models/Fjxx');
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const multer = require('koa-multer');
const xls = require('xls-to-json')
router.prefix('/sys')

router.get('/', async (ctx, next) => {
    //ctx.body="这是测试";
    //ctx.body ={"a":1,"b":2};
    var acct = mongoose.model('Account');
    var accts = await acct.myFindAll();
    ctx.body = accts;
})

//用户登录入口
router.post('/login', async (ctx, next) => {
    let un = ctx.request.body.username;
    let up = Enpassword(ctx.request.body.password);
    try {
        var accts = await base.myFindByQuery({ username: un, password2: up }, "username _id baseinfo.classno")
        if (accts.length == 0) {
            ctx.body = { "error": true, "message": "登录失败，请检查用户名和密码是否正确！" }
            return;
        }
        var userinfo = {
            username: accts[0].username,
            id: accts[0]._id,
            admin: accts[0].username == '徐明' ? true : false
        };
        let token = jwt.sign(userinfo, "mxthink")
        ctx.body = { "error": false, 'userinfo': userinfo, userotherinfo: accts[0], "token": token }
    } catch (err) {
        ctx.body = { 'error': true, "message": "登录失败:" + err.message }
    }
})

router.post('/search', async (ctx, next) => {
    var keyword = ctx.request.body.keyword;
    var pagesize = ctx.request.body.pagesize;
    var lastid = ctx.request.body.lastid;
    try {
        var accts = await base.myPaging(keyword, pagesize, lastid);
        ctx.body = { "error": false, "result": accts };
        //console.log(accts);
    } catch (err) {
        ctx.body = { 'error': true, 'message': err.message }
    }
    //var acct = mongoose.model('Account');
    // acct.myPaging(keyword, pagesize, lastid)
    //     .then(function (result) {
    //         console.log(result)
    //     })
    //     .catch(function (err) {
    //         console.log(err)
    //     })

})
//拦截所有请求，如果有token则将用户信息注入到请求中
router.use(async (ctx, next) => {
    console.log('拦截的访问:' + ctx.request.href)
    let posttoken = ctx.request.body.token;
    var token = posttoken || ctx.query.token;
    if (token) {
        jwt.verify(token, 'mxthink', function (err, decoded) {
            if (err) {

            } else {
                ctx.request.decoded = decoded;
            }
        })
    } else {

    }
    await next();
})
//页面刷新时验证登录状态
router.post('/validsignin', async (ctx, next) => {
    var token = ctx.request.decoded;
    if (token) {
        ctx.body = { 'signin': true, 'userinfo': token }
    } else {
        ctx.body = { 'signin': false }
    }
})

router.post('/admin', async (ctx, next) => {
    // ctx.set('Access-Control-Allow-Origin', 'http://192.168.123.151:8080');
    // ctx.set('Access-Control-Allow-Credentials', true);
    if (ctx.request.decoded)
        ctx.body = '已经登录的用户'
    else
        ctx.body = '没有登录的用户'
})

router.get('/cookies', async (ctx, next) => {
    // ctx.set('Access-Control-Allow-Origin', 'http://192.168.123.151:8080');
    // ctx.set('Access-Control-Allow-Methods', 'PUT,DELETE,POST,GET');
    // ctx.set('Access-Control-Allow-Credentials', true);
    console.log(ctx.querystring)
    console.log(ctx.query)
    var userinfo = {
        username: "xmily",
        admin: false
    }

    // if(ctx.cookies.get('cookname')){
    //     ctx.body='cookies已经存在'
    //     return
    // }
    var username = ctx.query.username;
    var password = ctx.query.password;
    if (username == password) {
        // ctx.cookies.set('cookname', 'aaaaaaaa')
        // ctx.body = 'cookies写入完成'
        var token = jwt.sign(userinfo, 'xmilyhh');
        ctx.body = { 'message': '授权完成', 'token': token };
    } else {
        ctx.body = '授权未成功'
    }
})

router.get('/test', async (ctx, next) => {
    let doc = {
        username: 'hh',
        pid: '450205198008141012',
    }
    try {
        let one = await base.myCreate(doc)
        console.log(one)
        ctx.body = one
    } catch (err) {
        console.log(err.message)
        ctx.body = err.message;
    }
})

router.get('/dbinsertsubdata', async (ctx, next) => {
    let data = {
        "score": 90,
        "rightrate": "100",
        "time": "00:00:05",
        "finishdate": "2018-11-30 08:34:33",
    }
    try {
        let update = await base.myUpdate({ _id: '5c008b293fb9b72ec46c2ac6' }, { '$push': { 'tkRecords': data } });
        let one = await base.myFindById({ _id: '5c008b293fb9b72ec46c2ac6' })
        ctx.body = one
    } catch (err) {
        ctx.body = err.message
    }
})

router.get('/dbinsertobjectdata', async (ctx, next) => {
    let data = {
        "classno": "小学2013级1班",
        "born": "20060902",
        "name": "劳鼎淋",
        "gender": "男",
        "ethnic": "苗族",
        "regaddress": "融安县长安镇桔香南路12号",
        "homeaddress": "融安县长安镇龙潭街18号,融安县长安镇龙潭街18号",
        "contact": "13768853300",
        "fsname": "劳益锋,贾丽萍",
        "grade": "小学2013级"
    }
    try {
        let result = await base.myUpdateField({ _id: '5c00a2436ba3c50d5cf77f1f' }, { baseinfo: data })
        ctx.body = result;
    } catch (err) {
        ctx.body = err.message;
    }
})

//测试上传用koa-multer
//控制上传文件存储方式，如果不设置默认情况下文件上传以随机字符且无后缀来存放
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/upload'))
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
//excel转换json的Promise方法
function exceltojson(filepath) {
    return new Promise(function (resolve, reject) {
        xls({
            input: filepath,
            output: null,
            sheet: '导入'
        }, function (err, result) {
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
}

var limits = { fileSize: 10 * 1024 * 1024 }
var upload = multer({ storage: storage, limits: limits })
router.post('/importaccount', upload.single('file'), async (ctx, next) => {
    let newaccount = [];
    try {
        let items = await exceltojson(ctx.req.file.path)
        items.forEach(item => {
            newaccount.push({
                username: item.username,
                gender: item.gender,
                pid: item.pid,
                sid: item.sid,
                password: Enpassword(item.pid.substr(12, 6)),
                password2: Enpassword(item.born),
                baseinfo: {
                    classno: item.classno,
                    born: item.born,
                    regaddress: item.regaddress,
                    homeaddress: item.homeaddress,
                    contact: item.contact,
                    grade: item.grade
                }
            })
        });
        let result = await base.insertManyAccount(newaccount);
        // ctx.body = newaccount;
        ctx.body = { 'error': false, 'result': '成功导入' + result.length + '条记录' }
    } catch (err) {
        ctx.body = { 'error': true, 'message': err.message };
    }
})
//密码HASH
function Enpassword(password) {
    var sha1 = crypto.createHash('sha1');
    sha1.update(password);
    return sha1.digest('hex')
}

module.exports = router
