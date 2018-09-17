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

module.exports = router
