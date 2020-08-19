const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const cors=require('koa2-cors')
const session=require('koa-session2')

const db=require('./cfg/dbconfig');
//const index = require('./routes/index')
//const users = require('./routes/users')
const sys=require('./routes/sys/index');
const mark=require('./routes/sys/mark');
const graduate=require('./routes/sys/graduate');
const transschool=require('./routes/sys/transschool')
const typekey=require('./routes/typekey/index');
const sitenav=require('./routes/sitenav/index')
const test=require('./routes/test');
const wechat=require('./routes/wechat/index')
const homeinfo=require('./routes/wechat/homeinfo')
const graduateinfo=require('./routes/wechat/graduateinfo')
const newstudentreg=require('./routes/wechat/newstudentreg')
const student=require('./routes/wechat/student.js')


// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
//session
app.use(session())
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'nunjucks'
}))

//app.use(cors());
app.use(cors({
  //origin://"*",//"http://mxthink.cross.echosite.cn",
      //return 'http://localhost:8080'; / 这样就能只允许 http://localhost:8080 这个域名的请求了
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 5,
  credentials: true,
  allowMethods: ['GET', 'POST', 'DELETE','OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}))


// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

//拦截请求
// app.use(async (ctx,next)=>{
//   console.log('app拦截的访问:' + ctx.request.href)
//   if (ctx.header.authorization) {
//     try {
//         //验证token合法性
//         let token = await jwt.verify(ctx.header.authorization, sitecfg.tokenKey);
//         ctx.request.token = token;
//     } catch (err) {
//         ctx.body = { vali: false, message: "验证token时出错：[" + err + "]程序终止!" };
//         return;
//     }
// }
//   await next()
// })

//koa-body
// app.use(koabody({
//   multipart:true,
//   formidable:{
//     maxFileSize:10*1024*1024
//   }
// }))

// routes
// app.use(index.routes(), index.allowedMethods())
// app.use(users.routes(), users.allowedMethods())
app.use(sys.routes(),sys.allowedMethods())
app.use(typekey.routes(),typekey.allowedMethods())
app.use(sitenav.routes(),sitenav.allowedMethods())
app.use(mark.routes(),mark.allowedMethods())
app.use(graduate.routes(),mark.allowedMethods())
app.use(wechat.routes(),wechat.allowedMethods())
app.use(homeinfo.routes(),homeinfo.allowedMethods())
app.use(graduateinfo.routes(),graduateinfo.allowedMethods())
app.use(newstudentreg.routes(),newstudentreg.allowedMethods())
app.use(test.routes(),test.allowedMethods())
app.use(transschool.routes(),transschool.allowedMethods())
app.use(student.routes(),student.allowedMethods())
// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
