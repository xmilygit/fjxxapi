const router = require('koa-router')();
const mongoose = require('mongoose');
// const base = require('../../models/Fjxx');
const linkmodel =require('../../models/SiteNav/link.js')
router.prefix('/sitenav');

//查找所有
router.get('/', async (ctx, next) => {

})
//查找一个
router.get('/findone', async (ctx, next) => {

})
//删除(要验证)
router.get('/del', async (ctx, next) => {

})

//保存链接
router.post('/savelink', async (ctx, next) => {
    let link = ctx.request.body.linkinfo;
    try {
        var linkinfo = await linkmodel.Save({title:link.linktext,url:link.linkaddress})
        ctx.body = { 'error': false, 'link': linkinfo };
    } catch (err) {
        if (err.message.indexOf('duplicate key error') !== -1)
            ctx.body = { 'error': true, 'message': '链接名称已经存在' }
        else
            ctx.body = { 'error': true, 'message': err.message };
    }
})

//分页获取链接列表
router.get('/getalllinkpaging', async (ctx, next) => {
    let keyword = ctx.query.keyword;
    let pagesize = ctx.query.pagesize;
    let currentpage = ctx.query.currentpage;
    let sort=ctx.query.sort;
    try {
        var data = await linkmodel.myPaging(keyword, pagesize, currentpage,sort);
        ctx.body = { 'error': false, 'pagingdata': data };
    } catch (err) {
        ctx.body = { 'error': true, 'message': err.message }
    }
})

//删除指定链接
router.get('/deletelink', async (ctx, next) => {
    let id = ctx.query.id;
    try {
        var deldata = await linkmodel.DelById(id);
        ctx.body = { 'error': false, 'data': deldata };
    } catch (err) {
        ctx.body = { 'error': true, 'message': err.message }
    }
})
//编辑链接
router.post('/editlink', async (ctx, next) => {
    let doc = ctx.request.body.linkinfo;
    try {
        var result = await linkmodel.Edit({id:doc.id,title:doc.linktext,url:doc.linkaddress});
        ctx.body = { 'error': false, 'result': result };
    } catch (err) {
        ctx.body = { 'error': true, 'message': err.message }
    }
})

//获取所有链接
router.get('/getlinks', async (ctx, next) => {
    let sort=ctx.query.sort
    try {
        var list = await linkmodel.FindAll(sort)
        ctx.body = { 'error': false, 'linklist': list };
    } catch (err) {
        ctx.body = { 'error': true, 'message': err.message }
    }
})
module.exports = router