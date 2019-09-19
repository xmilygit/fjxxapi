const router = require('koa-router')()
const axios = require('axios')
const jwt = require('jsonwebtoken')
const base = require('../../models/Fjxx');
const newstureg = require('../../models/NewStudent/newstudent')
const sitecfg = require('../../cfg/siteconfig.js')

router.prefix('/newstureg')

router.get('/getbaseinfo/', async (ctx, next) => {
    // if (!ctx.header.authorization) {
    //     throw new Error('关键数据链接失效或者是非法的！')
    // }
    // let wxuserinfo = {}
    // try {
    //     wxuserinfo = await jwt.verify(ctx.header.authorization, sitecfg.tokenKey);
    // } catch (err) {
    //     throw new Error('关键数据链接失效或者是非法的！')
    // }
    try {
        let baseinfo = await base.myFindOne({ 'wxopenid': 'o_BZpuDFj3Gi-psvtFFDRgl9id-0'})//wxuserinfo.openid })
        let newstuinfo = await newstureg.myFindOne({ '身份证件号': baseinfo.pid })
        if (newstuinfo)
            ctx.body = { 'error': false, 'result': newstuinfo,'otherinfo':{classno:baseinfo.baseinfo.classno} }
        else
            ctx.body = { 'error': true, 'message': '没有找到学生信息,请将问题上报班主任!' }
        return
    } catch (err) {
        throw new Error('获取数据时出错:[' + err + ']')
        // ctx.body = { 'error': true, 'message': err }
        // return
    }
})

router.post('/savehomeinfo/', async (ctx, next) => {
    if (!ctx.header.authorization) {
        throw new Error('关键数据链接失效或者是非法的！')
        // ctx.body = { error: true, message: '关键数据链接失效或者是非法的！' }
        // return;
    }
    let wxuserinfo = {}
    try {
        wxuserinfo = await jwt.verify(ctx.header.authorization, sitecfg.tokenKey);
    } catch (err) {
        throw new Error('关键数据链接失效或者是非法的！')
        // ctx.body = { error: true, message: '关键数据链接失效或者是非法的！' }
        // return;
    }
    let homeinfo = ctx.request.body.homeinfo;
    try {
        let baseinfo = await base.myFindOne({ 'wxopenid': wxuserinfo.openid })
        let res = await homedb.myUpdateOne(
            { '身份证件号': baseinfo.pid },
            {
                "成员1姓名": homeinfo.fname,
                "成员1关系": homeinfo.frelation,
                "成员1是否监护人": homeinfo.fguradian,
                "成员1身份证件类型": homeinfo.fpidtype,
                "成员1身份证件号": homeinfo.fpid,

                "成员2姓名": homeinfo.sname,
                "成员2关系": homeinfo.srelation,
                "成员2是否监护人": homeinfo.sguradian,
                "成员2身份证件类型": homeinfo.spidtype,
                "成员2身份证件号": homeinfo.spid,
            }
        )
        ctx.body = { 'error': false, result: res }
    } catch (err) {
        throw new Error("保存时出错:[" + err + "]")
    }



})


module.exports = router
