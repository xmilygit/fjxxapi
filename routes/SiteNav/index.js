const router = require('koa-router')();
const mongoose = require('mongoose');
const base = require('../../models/Fjxx');
router.prefix('/sitenav');

//查找所有
router.get('/',async(ctx,next)=>{

})
//查找一个
router.get('/findone',async(ctx,next)=>{

})
//删除(要验证)
router.get('/del',async(ctx,next)=>{

})
//保存（含编辑保存）(要验证)
router.get('/save',async(ctx,next)=>{
    
})
module.exports=router