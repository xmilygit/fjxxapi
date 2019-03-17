const router = require('koa-router')()
const wechatapi = require('co-wechat-api')
const wechatconfig = require('../../cfg/wechatconfig.js')
const sitecfg = require('../../cfg/siteconfig.js')
const axios = require('axios')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const crypto = require('crypto')

const base = require('../../models/Fjxx');
const homeinfo = require('../../models/HomeInfo/homeinfo')


router.prefix('/wechatforsvr')

var api = new wechatapi(
    wechatconfig.wechatauth.appid,
    wechatconfig.wechatauth.appsecret
);

//菜单配置
var mymenu = {
    "button": [
        {
            "name": "我的凤集",
            "type": "view",
            "url": 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + wechatconfig.wechatauth.appid + '&redirect_uri=' + encodeURIComponent("http://mxthink.cross.echosite.cn/wechat/binder/") + '&response_type=code&scope=snsapi_base&state=123#wechat_redirect'
        },
        {
            "name": "测试",
            "type": "view",
            "url": 'http://mxthink.cross.echosite.cn/wechat/binder/'
        },
        {
            "name": '测试2',
            "type": "view",
            "url": 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + wechatconfig.wechatauth.appid + '&redirect_uri=' + encodeURIComponent("http://mxthink2.cross.echosite.cn/") + '&response_type=code&scope=snsapi_base&state=123#wechat_redirect'
        }
    ]
};

// router.get('/delmenu/', async (ctx, next) => {
//     try {
//         let delmenu = await api.removeMenu();
//         console.log("菜单删除成功")
//         ctx.body = "菜单删除成功"
//     } catch (err) {
//         console.log(err)
//         ctx.body = "菜单删除失败"
//     }
// }
// )

// router.get('/creatmenu/', async (ctx, net) => {
//     try {
//         let createmenu = api.createMenu(mymenu)
//         console.log("菜单创建成功");
//         ctx.body = "菜单创建成功"
//     } catch (err) {
//         console.log(err)
//         ctx.body = "菜单创建失败"
//     }

// })

var errhtml = '<title>抱歉，出错了</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0"><link rel="stylesheet" type="text/css" href="https://res.wx.qq.com/open/libs/weui/0.4.1/weui.css">';
errhtml += '<div class="weui_msg"><div class="weui_icon_area"><i class="weui_icon_info weui_icon_msg"></i></div><div class="weui_text_area"><h4 class="weui_msg_title">请在微信客户端打开链接</h4></div></div>';


router.get('/binder/', async (ctx, next) => {
    // if (!ctx.query.code && !ctx.session.wxuserinfo) {
    //     ctx.body = errhtml
    //     return;
    // }
    //使用token认证，以上代码改为以下代码：
    if (!ctx.query.code)
        ctx.body = errhtml;

    let wxuserinfo = {
        code: ctx.query.code,
        openid: null,
        isbinder: false,
        error: false
    }

    let getopenidurl = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + wechatconfig.wechatauth.appid + "&secret=" + wechatconfig.wechatauth.appsecret + "&code=" + wxuserinfo.code + "&grant_type=authorization_code"
    try {
        let result = await axios.get(getopenidurl)
        console.log(result.data.openid)
        wxuserinfo.openid = result.data.openid;
        //ctx.redirect(sitecfg.clientURL + "/?openid=" + result.data.openid)
    } catch (err) {
        //获取用户授权出错了，跳转到出错页面
        console.log(err)
        wxuserinfo.error = true;
        ctx.body = err;
    }

    try {
        if (!wxuserinfo.isbinder) {
            let finduser = await base.myFindByQuery({ 'wxopenid': wxuserinfo.openid })
            if (finduser.length == 1) {
                wxuserinfo.isbinder = true;
            }
        }
        let token = jwt.sign(wxuserinfo, sitecfg.tokenKey, { expiresIn: "1h" });
        ctx.redirect(sitecfg.clientURL + "/?token=" + token + "&isbinder=" + wxuserinfo.isbinder)
    } catch (err) {
        //根据openid 查询数据库时出错，这里后期要放置出错界面
        wxuserinfo.error = true;
        console.log(err)
        ctx.body = err
    }
    return
})

//微信JSSDK调用配置
router.post('/jsconfig/', async (ctx, ncext) => {
    let cfgdata = ctx.request.body.cfgdata
    try {
        let res = await api.getJsConfig(cfgdata)
        ctx.body = { 'jsconfig': res }
    } catch (err) {   //console.log(result);
        throw new Error('JSSDK授权失败:[' + err + ']')
    }
})
//绑定微信用户帐号
router.post('/binder/', async (ctx, next) => {
    let stuinfo = ctx.request.body.stuinfo
    let wxuserinfo = {}
    if (!ctx.header.authorization) {
        throw new Error('关键数据链接失效或者是非法的！')
        // ctx.body = { error: true, message: '数据链接失效或者是非法的！' }
        // return;
    }
    try {
        wxuserinfo = await jwt.verify(ctx.header.authorization, sitecfg.tokenKey);
    } catch (err) {
        throw new Error('关键数据链接失效或者是非法的！')
        // ctx.body = { error: true, message: '数据链接失效或者是非法的！' }
        // return;
    }
    if (!stuinfo)
        return;
    try {
        let user = await base.myFindOne({
            'username': stuinfo.stuname,
            'password': Enpassword(stuinfo.stupassword)
        })
        if (user) {
            if (user.wxopenid) {
                ctx.body = { 'error': true, 'message': '该微信用户已经绑定！无需重复绑定！' }
                return;
            }
            //存openid
            let res = await base.myUpdateOne({ '_id': user._id }, { $set: { 'wxopenid': wxuserinfo.openid } })
            wxuserinfo.isbinder = true;
            try {
                delete wxuserinfo.exp;
                delete wxuserinfo.iat;
                let newtoken = await jwt.sign(wxuserinfo, sitecfg.tokenKey, { expiresIn: "1h" })
                ctx.body = { 'error': false, 'token': newtoken, 'isbinder': true };
                return
            } catch (err) {
                ctx.body = { 'error': true, 'message': '重新授权过程中出错!' }
                return
            }
        } else {
            //返回无该用户的提示
            ctx.body = { 'error': true, 'message': '该学生不存在，请检查姓名及密码输入是否正确！' }
        }
    } catch (err) {
        throw new Error('执行绑定时出错：' + err)
    }
})

//密码HASH
function Enpassword(password) {
    var sha1 = crypto.createHash('sha1');
    sha1.update(password);
    return sha1.digest('hex')
}


module.exports = router