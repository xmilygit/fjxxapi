const router = require('koa-router')()
const mongoose = require('mongoose');
const graduate=require('../../models/graduate/graduateinfo.js')
const base = require('../../models/Fjxx.js');
const crypto = require('crypto')

router.prefix('/sys/graduate')

router.post('/search1/', async (ctx, next) => {
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

router.post('/search/', async (ctx, next) => {
    var keyword = ctx.request.body.keyword;
    var pagesize = ctx.request.body.pagesize;
    var lastid = ctx.request.body.lastid;
    try {
        var result = await graduate.myPaging(keyword, pagesize, lastid);
        ctx.body = { "error": false, "result": {items:result.recordset,totalitems:result.count} };
    } catch (err) {
        ctx.body = { 'error': true, 'message': err.message }
    }

})

module.exports = router