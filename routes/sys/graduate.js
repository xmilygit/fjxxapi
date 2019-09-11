const router = require('koa-router')()
const mongoose = require('mongoose');
const graduate=require('../../models/graduate/graduateinfo.js')
const base = require('../../models/Fjxx.js');
const crypto = require('crypto')

router.prefix('/sys/graduate')

router.post('/search/', async (ctx, next) => {
    var keyword = ctx.request.body.data.keyword;
    var pagesize = ctx.request.body.data.pagesize;
    var lastid = ctx.request.body.data.lastid;
    try {
        var result = await graduate.myPaging(keyword, pagesize, lastid);
        ctx.body = { "error": false, "result": result.recordset };
    } catch (err) {
        ctx.body = { 'error': true, 'message': err.message }
    }

})

module.exports = router