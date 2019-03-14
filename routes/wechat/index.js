const router = require('koa-router')()
const wechatapi = require('co-wechat-api')
const wechatconfig = require('../../cfg/wechatconfig.js')
const axios = require('axios')
const jwt=require('jsonwebtoken')
const fs = require('fs')

const base = require('../../models/Fjxx');
const curl="http://mxthink2.cross.echosite.cn"

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
    let openid=null;
    //如果缓存中有openid
    if (ctx.session.openid) {
        openid=ctx.session.openid
        // console.log('session has openid')
        // ctx.body = "sesson has openid"
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
                if(result.data.errcode){
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
        let finduser = await base.myFindByQuery({ 'wxopenid': openid})
        if (finduser.length==1) {
            ctx.session.openid=openid;
            ctx.redirect(curl)
        } else {
            ctx.body = "redirect绑定用户界面"
        }
    } catch (err) {
        console.log(err)
    }
})

router.get('/cgetopenid',async(ctx,next)=>{
    ctx.body={"openid":ctx.session.openid}

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