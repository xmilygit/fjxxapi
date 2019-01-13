const router = require('koa-router')()
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const term = require('../../models/schoolterm.js');
const base = require('../../models/Fjxx.js');
const crypto = require('crypto')

router.prefix('/sys/mark')
//添加学期记录
router.post('/termAdd/', async (ctx, next) => {
    let termdata=ctx.request.body.term
    try{
        let result=await term.Save(termdata) 
        ctx.body={"error":false,'result':result}
    }catch(err){
        ctx.body={'error':true,"message":"添加学期时出错："+err.message}
    }
    
})
//获取所有学期列表
router.get('/gettermlist/',async(ctx,next)=>{
    try{
        //let list=await term.FindAll();
        let list=await term.FindAll()
        ctx.body={'error':false,'result':list}
    }catch(err){
        ctx.body={'error':true,'message':'获取学期列表时出错:'+err.message}
    }
})
//删除学期记录
router.get('/delterm/',async(ctx,next)=>{
    let id=ctx.query.id
    let reqterm=ctx.query.term
    try{
        let result=await term.DelById(id)
        let result2=await base.delTerm(reqterm)
        ctx.body={'error':false,'result':result}
    }catch(err){
        ctx.body={'error':true,'message':'删除学期记录时出错:'+err.message}
    }
})
module.exports = router