const router = require('koa-router')()
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Account = require('../../models/Account');
const tkRecord = require('../../models/tkRecord');
const tkLesson = require('../../models/tkLesson');
const crypto = require('crypto')

router.prefix('/sys')

router.get('/', async (ctx, next) => {
    //ctx.body="这是测试";
    //ctx.body ={"a":1,"b":2};
    var acct = mongoose.model('Account');
    var accts = await acct.myFindAll();
    ctx.body = accts;
})

router.post('/login', async (ctx, next) => {
    let un = ctx.request.body.username;
    let up = Enpassword(ctx.request.body.password);
    try {
        var accts = await Account.myFind({ username: un, password: up })
        if (accts.length == 0) {
            ctx.body = { "error": true, "message": "登录失败，请检查用户名和密码是否正确！" }
            return;
        }
        var userinfo = {
            username: accts[0].username,
            id: accts[0]._id,
            admin: false
        }
        let token = jwt.sign(userinfo, "mxthink")
        ctx.body = { "error": false, 'userinfo': userinfo, "token": token }
    } catch (err) {
        ctx.body = { 'error': true, "message": "登录失败:" + err.message }
    }
})

router.post('/search', async (ctx, next) => {
    var keyword = ctx.request.body.keyword;
    var pagesize = ctx.request.body.pagesize;
    var lastid = ctx.request.body.lastid;
    try {
        var accts = await Account.myPaging(keyword, pagesize, lastid);
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

router.use(async (ctx, next) => {
    // console.log('拦截的访问:'+ctx.request.body.token)
    var token = ctx.request.body.token;
    if (token) {
        jwt.verify(token, 'xmilyhh', function (err, decoded) {
            if (err) {

            } else {
                ctx.request.decoded = decoded;
                ///next();
            }
        })
    } else {

    }
    await next();
})
router.post('/validsignin', async (ctx, next) => {
    var token = ctx.request.body.token;
    if (token) {
        jwt.verify(token, 'mxthink', function (err, decoded) {
            if (err) {
                ctx.body = { 'signin': false }
            } else {
                ctx.body = { 'signin': true, 'userinfo': decoded }
                ///next();
            }
        })
    } else {
        ctx.body = { 'signin': false }
    }
})

router.post('/addtkrecord', async (ctx, next) => {
    let record = ctx.request.body.record;
    try {
        var tkrecord = await tkRecord.myCreate(record)
        ctx.body = { 'error': false, 'record': tkrecord }
    } catch (err) {
        ctx.body = { 'error': true, 'message': err.message }
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

router.post('/savetklesson', async (ctx, next) => {
    let lesson = ctx.request.body.lessoninfo;
    try {
        var tklesson = await tkLesson.myCreate(lesson)
        ctx.body = { 'error': false, 'lesson': tklesson };
    } catch (err) {              
        if (err.message.indexOf('duplicate key error') !== -1)
            ctx.body = { 'error': true, 'message': '课程名称已经存在' }
        else
            ctx.body = { 'error': true, 'message': err.message };
    }
})


router.get('/getalltklesson', async (ctx, next) => {
    try {
        var list = await tkLesson.myFindAll()
        ctx.body = { 'error': false, 'lessonlist': list };
    } catch (err) {
        ctx.body = { 'error': true, 'message': err.message }
    }
})

router.get('/getalltklessonpaging',async(ctx,next)=>{
    let keyword=ctx.query.keyword;
    let pagesize=ctx.query.pagesize;
    let currentpage=ctx.query.currentpage;
    try{
        var data=await tkLesson.myPaging(keyword,pagesize,currentpage);
        ctx.body={'error':false,'pagingdata':data};
    }catch(err){
        ctx.body={'error':true,'message':err.message}
    }
})

router.get('/deletelesson',async(ctx,next)=>{
    let id=ctx.query.id;
    try{
        var deldata=await tkLesson.myDelete(id);
        ctx.body={'error':false,'data':deldata};
    }catch(err){
        ctx.body={'error':true,'message':err.message}
    }
})

router.get('/getlessonbyid',async(ctx,next)=>{
    let id=ctx.query.id;
    try{
        var result=await tkLesson.myFind(id);
        ctx.body={'error':false,'result':result};
    }catch(err){
        ctx.body={'error':true,'message':err.message};
    }
})

router.post('/edittklesson',async(ctx,next)=>{
    let doc=ctx.request.body.lessoninfo;
    try{
        var result=await tkLesson.myEdit(doc);
        ctx.body={'error':false,'result':result};
    }catch(err){
        ctx.body={'error':true,'message':err.message}
    }
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

//密码HASH
function Enpassword(password) {
    var sha1 = crypto.createHash('sha1');
    sha1.update(password);
    return sha1.digest('hex')
}

module.exports = router
