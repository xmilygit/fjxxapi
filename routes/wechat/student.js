const router = require('koa-router')()
const base = require('../../models/Fjxx');
const axios = require('axios')
const jwt = require('jsonwebtoken')
const stuBaseInfo = require('../../models/Student/BaseInfo.js')
const sitecfg = require('../../cfg/siteconfig.js')
const wechatapi = require('co-wechat-api')
const wechatconfig = require('../../cfg/wechatconfig.js')


router.prefix('/student')


var api = new wechatapi(
    wechatconfig.wechatauth.appid,
    wechatconfig.wechatauth.appsecret
);



//拦截所有请求，如果有token则将用户信息注入到请求中
router.use(async (ctx, next) => {
    console.log('拦截的访问:' + ctx.request.href)
    //let token = ctx.header.authorization;
    //var token = posttoken || ctx.query.token;
    if (ctx.header.authorization) {
        try {
            //验证token合法性
            let token = await jwt.verify(ctx.header.authorization, sitecfg.tokenKey);
            ctx.request.token = token;
        } catch (err) {
            ctx.body = { vali: false, message: "验证token时出错：[" + err + "]程序终止!" };
            return;
        }
    } else {
        throw new Error('未授权的访问')
        return;
    }
    await next();
})

router.get('/getbaseinfo/', async (ctx, next) => {
    let wxuserinfo = {}
    try {
        wxuserinfo = await jwt.verify(ctx.header.authorization, sitecfg.tokenKey);
    } catch (err) {
        throw new Error('关键数据链接失效或者是非法的！')
    }

    try {
        let baseinfo = await base.myFindOne({
            'wxopenid': wxuserinfo.openid
        })
        let student = await stuBaseInfo.findByQuery({
            'pid': baseinfo.pid
        })
        // let graduatebaseinfo = await graduateinfo.myFindOne({ '身份证件号': '450205198008141012' })
        if (student) {
            let msg="姓名："+student.name+"\n学籍号："+student.sid
            let sendmessage = api.sendText(wxuserinfo.openid, msg)
            ctx.body = {
                'error': false,
                'result': student
            }
        } else
            ctx.body = {
                'error': true,
                'message': '没有找到学生信息，请上报该问题'
            }
    } catch (err) {
        throw new Error('获取数据时出错:[' + err + ']')
    }
})






module.exports = router