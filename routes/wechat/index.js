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

router.get("/",async(ctx, next)=>{
    let signature=ctx.query.signature;
    let echostr=ctx.query.echostr;
    let timestamp=ctx.query.timestamp;
    let nonce=ctx.query.nonce;
    ctx.body=echostr;//signature+"|"+echostr+"|"+timestamp+"|"+nonce;

})
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
            "url": 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + wechatconfig.wechatauth.appid + '&redirect_uri=' + encodeURIComponent("http://mxthink.cross.echosite.cn/testwechat/") + '&response_type=code&scope=snsapi_base&state=123#wechat_redirect'
        },
        {
            "name": '测试2',
            "type": "view",
            "url": 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + wechatconfig.wechatauth.appid + '&redirect_uri=' + encodeURIComponent("http://mxthink2.cross.echosite.cn/") + '&response_type=code&scope=snsapi_base&state=123#wechat_redirect'
        }
    ]
};

router.get('/delmenu/', async (ctx, next) => {
    try {
        let delmenu = await api.removeMenu();
        console.log("菜单删除成功")
        ctx.body = "菜单删除成功"
    } catch (err) {
        console.log(err)
        ctx.body = "菜单删除失败"
    }
}
)

router.get('/creatmenu/', async (ctx, net) => {
    try {
        let createmenu = api.createMenu(mymenu)
        console.log("菜单创建成功");
        ctx.body = "菜单创建成功"
    } catch (err) {
        console.log(err)
        ctx.body = "菜单创建失败"
    }

})

var errhtml = '<title>抱歉，出错了</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0"><link rel="stylesheet" type="text/css" href="https://res.wx.qq.com/open/libs/weui/0.4.1/weui.css">';
errhtml += '<div class="weui_msg"><div class="weui_icon_area"><i class="weui_icon_info weui_icon_msg"></i></div><div class="weui_text_area"><h4 class="weui_msg_title">请在微信客户端打开链接</h4></div></div>';


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
    }
    await next();
})

router.post('/valitoken/', async (ctx, next) => {
    ctx.body = { vali: true, isbinder: ctx.request.token.isbinder }
    return;
})

router.get('/binder/', async (ctx, next) => {
    // if (!ctx.query.code && !ctx.session.wxuserinfo) {
    //     ctx.body = errhtml
    //     return;
    // }
    //使用token认证，以上代码改为以下代码：
    if (!ctx.query.code) {
        //如果没有获得code表示来源客户端不是微信
        ctx.body = errhtml;
        return;
    }

    if (ctx.request.token) {
        //如果已经访问者已经获得token
        ctx.redirect(sitecfg.clientURL + "/?token=" + ctx.request.authorization)
        return;
    }
    //let code=ctx.query.code;

    //访问者没有token只有code，通过 code获得token
    let wxuserinfo = {
        code: ctx.query.code,
        openid: null,
        isbinder: false,
        error: false
    }

    let getopenidurl = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + wechatconfig.wechatauth.appid + "&secret=" + wechatconfig.wechatauth.appsecret + "&code=" + wxuserinfo.code + "&grant_type=authorization_code"


    try {
        let result = await axios.get(getopenidurl)
        if (result.data.errcode) {
            ctx.body = result.data.errmsg
            return;
        } else {
            wxuserinfo.openid = result.data.openid;
        }
    } catch (err) {
        //获取用户授权出错了，跳转到出错页面
        console.log('获取用户授权出错:' + err)
        wxuserinfo.error = true;
        ctx.body = err;
        return;
    }

    //wxuserinfo.openid="sadfsadfadf"
    try {
        if (!wxuserinfo.isbinder) {
            let finduser = await base.myFindByQuery({ 'wxopenid': wxuserinfo.openid })
            // if (finduser.length == 1) {
            //     wxuserinfo.isbinder = true;
            //     let token = jwt.sign(wxuserinfo, sitecfg.tokenKey, { expiresIn: "1h" });
            //     ctx.redirect(sitecfg.clientURL + "/?token=" + token + "&isbinder=" + wxuserinfo.isbinder)
            //     return;
            // } else {
            //     ctx.redirect(sitecfg.clientURL+'/?openid='+wxuserinfo.openid)
            //     return;
            // }
            if (finduser.length == 1) wxuserinfo.isbinder = true
            let token = jwt.sign(wxuserinfo, sitecfg.tokenKey, { expiresIn: "1h" });
            ctx.redirect(sitecfg.clientURL + "/?token=" + token)
            // ctx.redirect(sitecfg.serverURL + "/?token=" + token)
        }
    } catch (err) {
        //根据openid 查询数据库时出错，这里后期要放置出错界面
        wxuserinfo.error = true;
        console.log(err)
        ctx.body = err
        return
    }
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
    // if (!ctx.request.token) {
    //     ctx.body = { error: true, message: '数据链接失效或者是非法的！' }
    //     return;
    // }
    let stuinfo = ctx.request.body.stuinfo
    let wxuserinfo = {}
    // if (!ctx.header.authorization) {
    if (!ctx.request.token)
        throw new Error('关键数据链接失效或者是非法的！')
    wxuserinfo = ctx.request.token;
    // try {
    //     // wxuserinfo = await jwt.verify(ctx.header.authorization, sitecfg.tokenKey);
    //     wxuserinfo = ctx.request.token;
    // } catch (err) {
    //     throw new Error('关键数据链接失效或者是非法的！')
    //     // ctx.body = { error: true, message: '数据链接失效或者是非法的！' }
    //     // return;
    // }
    if (!stuinfo)
        return;
    try {
        let user = await base.myFindOne({
            'username': stuinfo.stuname,
            'password': Enpassword(stuinfo.stupassword)
        })
        if (user) {
            if (user.wxopenid) {
                //需要改进为申请重新绑定
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