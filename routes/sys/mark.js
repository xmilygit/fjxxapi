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
    termdata.subject=termdata.subject.split('\n');
    try{
        let result=await term.Save(termdata)
        let result2=await base.appendTeachingTerm(termdata.term)
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
//更新学期记录
router.post('/termEdit/',async(ctx,next)=>{
    let reqterm=ctx.request.body.term
    reqterm.subject=reqterm.subject.split('\n');
    try{        
        let result=await term.Edit(reqterm)
        let result2=await base.updateAllTerm(reqterm.oldterm,reqterm.term,reqterm.delsubject)
        ctx.body={'error':false,'result':{result1:result,result2:result2}}
    }catch(err){
        ctx.body={'error':true,'message':'更新学期数据时出错:'+err.message}
    }
})

//数组A不在数组B里的值
// function returnDel(a,b){
// 	return a.filter((s)=>{
// 		return b.indexOf(s)==-1
// 	})
// }

var myMethods={
    //数组A不在数组B里的值
    returnDle(a,b){
        return a.filter((s)=>{
            return b.indexOf(s)==-1
        })  
    }
}

//获取指定学科下的任课老师
router.get('/getTeacherBySubject/',async(ctx,next)=>{
    let reqsubject=ctx.query.subject;
    let reqterm=ctx.query.term;
    try{
        let result=await base.getBySubject(reqsubject,reqterm);
        ctx.body={'error':false,'result':result};
    }catch(err){
        ctx.body={'error':true,'message':'获取任教学科教师时出错:'+err.message}
    }
})

//获取所有教师列表
router.get('/getAllTeacher/',async(ctx,next)=>{
    try{
        let result=await base.myFindByQuery({'baseinfo':{$exists:false}},"_id username")
        ctx.body={'error':false,'result':result};
    }catch(err){
        ctx.body={'error':true,'message':'获取所有教师用户列表出错:'+err.message}
    }
})

//重置并初始化指定学科的任教信息
router.get('/resetAllTeaching/',async(ctx,next)=>{
    let reqterm=ctx.query.term;
    try{
        let result=await base.resetAllTeaching(reqterm)
        ctx.body={'error':false,'result':result}
    }catch(err){
        ctx.body={'error':true,'message':'重置学期任教信息时出错:'+err.message}
    }
})

//设置学科任教教师
router.post('/setTeachingSubject/',async(ctx,next)=>{
    let teachinginfo=ctx.request.body.teachinginfo;
    try{
        let result=await base.setTeachingSubject(teachinginfo.term,teachinginfo.subject,teachinginfo.teachers);
        ctx.body={'error':false,'result':result}
    }catch(err){
        ctx.body={'error':true,'message':'设置学科任教教师时出错：'+err.message}
    }
})
module.exports = router