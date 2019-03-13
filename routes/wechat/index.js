const router = require('koa-router')()
const wechatapi = require('co-wechat-api')
const wechatconfig = require('../../cfg/wechatconfig.js')
const axios = require('axios')
const fs = require('fs')

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
router.get('*', async (ctx, next) => {
    let code = ctx.query.code;
    //如果缓存中有openid
    if (ctx.session.openid) {
        console.log('session has openid')
        ctx.body = "sesson has openid"
    } else {
        //否则检查code是否有
        console.log('session is null');
        console.log('code:' + code)
        if (code == null) {
            console.log("code is null")
            ctx.redirect('error.html')
        } else {
            //否则根据code查询openid
            let getopenidurl = "https://api.weixin.qq.com/sns/oauth2/access_token?appid="+wechatconfig.wechatauth.appid+"&secret="+wechatconfig.wechatauth.appsecret+"&code="+code+"&grant_type=authorization_code"
            try {
                let result = await axios.get(getopenidurl)
                console.log(result)
            } catch (err) {
                if (err)
                    console.log(err)
                ctx.body="error"
            }
        }
    }
})

// router.get('/', async (ctx, next) => {
//     //var result=await api.api.sendText('openid', 'Hello world', callback);
//     try {
//         var result = await api.sendText('o_BZpuDFj3Gi-psvtFFDRgl9id-0', 'hellow')
//     } catch (err) {
//         console.log(err)
//     }
// })






module.exports = router