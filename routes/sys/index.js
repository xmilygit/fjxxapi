const router = require('koa-router')()
const mongoose = require('mongoose');
const Account = require('../../models/Account');

router.prefix('/sys')

router.get('/', async (ctx, next) => {
    //ctx.body="这是测试";
    //ctx.body ={"a":1,"b":2};
    var acct = mongoose.model('Account');
    var accts = await acct.myFindAll();
    ctx.body = accts;
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

router.get('/admin', async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', 'http://192.168.123.151:8080');
    // ctx.set('Access-Control-Allow-Methods', 'PUT,DELETE,POST,GET');
    ctx.set('Access-Control-Allow-Credentials', true);
    if (ctx.cookies.get('cookname'))
        ctx.body = '已经登录的用户'
    else
        ctx.body = '没有登录的用户'
})

router.get('/cookies', async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', 'http://192.168.123.151:8080');
    // ctx.set('Access-Control-Allow-Methods', 'PUT,DELETE,POST,GET');
    ctx.set('Access-Control-Allow-Credentials', true);
    console.log(ctx.querystring)
    console.log(ctx.query)
    if(ctx.cookies.get('cookname')){
        ctx.body='cookies已经存在'
        return
    }
    var username = ctx.query.username;
    var password = ctx.query.password;
    if (username == password) {
        ctx.cookies.set('cookname', 'aaaaaaaa')
        ctx.body = 'cookies写入完成'
    } else {
        ctx.body = 'cookies未写入'
    }
})

module.exports = router
