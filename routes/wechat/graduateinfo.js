const router = require('koa-router')()
const axios = require('axios')
const jwt = require('jsonwebtoken')
const graduateinfo = require('../../models/graduate/graduateinfo')
const sitecfg = require('../../cfg/siteconfig.js')

router.prefix('/graduate')

router.get('/getbaseinfo', async (ctx, next) => {
    try {
        let graduatebaseinfo = await graduateinfo.myFindOne({ '身份证件号': '' })
        if (graduatebaseinfo)
            ctx.body = { 'error': false, 'result': graduatebaseinfo }
        else
            ctx.body = { 'error': true, 'message': '没有找到学生信息，请上报该问题' }
    } catch (err) {
        throw new Error('获取数据时出错:[' + err + ']')
    }
})



module.exports = router