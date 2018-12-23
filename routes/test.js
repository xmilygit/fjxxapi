const router = require('koa-router')()
const mongoose = require('mongoose');
// const jwt = require('jsonwebtoken');
// const Account = require('../../models/Account');
// const tkRecord = require('../../models/tkRecord');
// const tkLesson = require('../../models/tkLesson');
const base = require('../models/Fjxx');
const crypto = require('crypto')
// const fs=require('fs')
const path = require('path')
const xls=require('xls-to-json')
// const multer=require('koa-multer');
router.prefix('/test')


router.get('/xls2json', async (ctx, next) => {
    let exec=new Promise(xls2json);
    await exec.then((result)=>{
        ctx.body=result;
    })
    .catch((err)=>{
        ctx.body=err;
    })
})

function xls2json(resolve,reject){
    let p = path.join(__dirname, '../public/upload/在校生信息.xlsx');
    console.log('path:' + p)
    xls({
        input:p,
        output:null,
        sheet:'导入'
    },function(err,result){
        if(err){
            console.error(err)
            reject(err)
        }else{
            console.log(result)
            resolve(result)
        }
    })
}


module.exports = router