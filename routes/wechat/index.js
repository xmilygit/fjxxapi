const router = require('koa-router')()
const wechatapi = require('co-wechat-api')
const wechatconfig = require('../../cfg/wechatconfig.js')
const axios = require('axios')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const crypto = require('crypto')

const base = require('../../models/Fjxx');
//const curl="/wx/";
const curl = "http://mxthink2.cross.echosite.cn/"

router.prefix('/wechat')

// const api = new wechatapi(
//     wechatconfig.wechatauth.appid,
//     wechatconfig.wechatauth.appsecret,
//     async () => {
//         try {
//             var tokenStr = await fs.readFile('cfg/access_token.tk', 'utf8');
//             return JSON.parse(tokenStr);
//         } catch (err) {
//             console.log(err)
//         }
//     }, async (token) => {
//         await fs.writeFile('cfg/access_token.tk', JSON.stringify(token))
//     }
// )
var api = new wechatapi(
    wechatconfig.wechatauth.appid,
    wechatconfig.wechatauth.appsecret
);


router.get('/binder/', async (ctx, next) => {
    let code = ctx.query.code;
    let openid = null;
    //如果缓存中有openid
    if (ctx.session.info) {
        openid = JSON.parse(ctx.session.info).openid
        //如果session里有openid那么跳过
    } else {
        //否则检查code是否有
        console.log('session is null');
        console.log('code:' + code)
        if (code == null) {
            console.log("code is null")
            ctx.redirect('error.html')
        } else {
            //否则根据code查询openid
            let getopenidurl = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + wechatconfig.wechatauth.appid + "&secret=" + wechatconfig.wechatauth.appsecret + "&code=" + code + "&grant_type=authorization_code"
            try {
                let result = await axios.get(getopenidurl)
                openid = result.data.openid
                if (result.data.errcode) {
                    console.log(result.data)
                }
                //ctx.session.openid = openid
            } catch (err) {
                console.log(err)
                ctx.body = err
            }
        }
    }
    //对比数据库，有则转到指定页面，无则转入至登录界面
    try {
        let info = { openid: openid, isbinder: false }


        let finduser = await base.myFindByQuery({ 'wxopenid': openid })
        if (finduser.length == 1) {
            //info.isbinder = true;
            info.isbinder = false;
        }
        ctx.session.info = JSON.stringify(info)
        ctx.redirect(curl)
    } catch (err) {
        console.log(err)
    }
})
//客户端从服务器获取微信公众号的openid及相关信息
router.get('/cgetopenid/', async (ctx, next) => {
    console.log(ctx.session.info)
    ctx.body = { "info": ctx.session.info }
    return;
})

router.post('/binder/', async (ctx, next) => {
    let stuinfo = ctx.request.body.stuinfo
    if (!stuinfo)
        return;
    try {
        let user = await base.myFindOne({ 'username': stuinfo.stuname, 'password': Enpassword(stuinfo.stupassword)})
        if (user) {
            //存openid
            ctx.body = 'ok'
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


// router.get('/', async (ctx, next) => {
//     //var result=await api.api.sendText('openid', 'Hello world', callback);
//     try {
//         var result = await api.sendText('o_BZpuDFj3Gi-psvtFFDRgl9id-0', 'hellow')
//     } catch (err) {
//         console.log(err)
//     }
// })






module.exports = router