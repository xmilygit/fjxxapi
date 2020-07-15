const router = require('koa-router')()
const axios = require('axios')
const jwt = require('jsonwebtoken')
const base = require('../../models/Fjxx');
const newstureg = require('../../models/NewStudent/newstudent')
const sitecfg = require('../../cfg/siteconfig.js')
const nss = require('../../models/NewStudent/newstudentsign.js')

router.prefix('/newstureg')

//网上报名序号获取
router.get('/getsignfid', async (ctx, next) => {
    let sid = ctx.query.sid;
    let name = ctx.query.stuname;
    try {
        let res = await nss.find({ "sid": sid, "stuname": name })
        if (res) {
            ctx.body = { 'error': false, 'result': res }
        } else {
            ctx.body = { 'error': true, 'message': "没有找到该学生信息，请检查报名号及姓名是否输入正确" }
        }
        return;
    } catch (err) {
        ctx.body = { 'error': true, 'message': "获取数据时出错！" + err.message }
        return;
    }
})
//修改网上报名的身份证号
router.get('/editpid', async (ctx, next) => {
    let sid = ctx.query.sid;
    let pid = ctx.query.pid;
    let who = ctx.query.who;
    let oldpid = ctx.query.oldpid;
    let oldwho = "old" + who;
    try {
        let res = await nss.update(sid, { [who]: pid, [oldwho]: oldpid })
        if (res) {
            ctx.body = { 'error': false, "result": res }
        } else {
            ctx.body = { "error": true, "message": "修改失败" }
        }
        return
    } catch (err) {
        ctx.body = { 'error': true, 'message': '修改出错!' + err.message }
    }
})
router.get('/getbaseinfo/', async (ctx, next) => {
    if (!ctx.header.authorization) {
        throw new Error('关键数据链接失效或者是非法的！')
    }
    let wxuserinfo = {}
    try {
        wxuserinfo = await jwt.verify(ctx.header.authorization, sitecfg.tokenKey);
    } catch (err) {
        throw new Error('关键数据链接失效或者是非法的！')
    }
    try {
        let baseinfo = await base.myFindOne({ 'wxopenid': wxuserinfo.openid })//'o_BZpuDFj3Gi-psvtFFDRgl9id-0' })
        let newstuinfo = await newstureg.myFindOne({ '身份证件号': baseinfo.pid })
        if (newstuinfo)
            ctx.body = { 'error': false, 'result': newstuinfo, 'otherinfo': { classno: baseinfo.baseinfo.classno } }
        else
            ctx.body = { 'error': true, 'message': '没有找到学生信息,请将问题上报班主任!' }
        return
    } catch (err) {
        throw new Error('获取数据时出错:[' + err + ']')
        // ctx.body = { 'error': true, 'message': err }
        // return
    }
})

router.post('/savenewstuinfo/', async (ctx, next) => {
    if (!ctx.header.authorization) {
        throw new Error('关键数据链接失效或者是非法的！')
    }
    let wxuserinfo = {}
    try {
        wxuserinfo = await jwt.verify(ctx.header.authorization, sitecfg.tokenKey);
    } catch (err) {
        throw new Error('关键数据链接失效或者是非法的！')
    }
    let newstuinfo = ctx.request.body.newstuinfo;
    // ctx.body=newstuinfo;
    // return;
    try {
        let baseinfo = await base.myFindOne({ 'wxopenid': wxuserinfo.openid })
        // let baseinfo=await base.myFindOne({'wxopenid':'o_BZpuDFj3Gi-psvtFFDRgl9id-0'})
        let res = await newstureg.updateone(
            { '身份证件号': baseinfo.pid },
            newstuinfo
        )
        ctx.body = { 'error': false, result: res }
    } catch (err) {
        throw new Error("保存时出错:[" + err + "]")
    }
})


module.exports = router
