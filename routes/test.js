const router = require('koa-router')()
const mongoose = require('mongoose');
// const jwt = require('jsonwebtoken');
// const Account = require('../../models/Account');
// const tkRecord = require('../../models/tkRecord');
// const tkLesson = require('../../models/tkLesson');
const base = require('../models/Fjxx');
const nstest=require('../models/NewStudent/newstudent')
const crypto = require('crypto')
// const fs=require('fs')
const path = require('path')
const xls=require('xls-to-json')
const key=require('../cfg/key.js')
const pp=require('puppeteer-core');
const findchrome=require('../node_modules/carlo/lib/find_chrome')

// const multer=require('koa-multer');
router.prefix('/test')

router.get('/2019ns',async(ctx,next)=>{
    let all=await nstest.findall()
    
    all.forEach(async doc => {
        await nstest.updateone({'身份证':doc.身份证},{$set:{password:doc.身份证.substr(12,6),wxopenid:null}})
    });
    // let rs=await nstest.update({'身份证':'450303201210150526'},{$set:{password:'aabbcc',wxopenid:null}})

    //console.log(rs)
    ctx.body=''
})

router.get('/xls2json', async (ctx, next) => {
    let exec=new Promise(xls2json);
    await exec.then((result)=>{
        ctx.body=result;
    })
    .catch((err)=>{
        ctx.body=err;
    })
})

router.post('/webpagetopdf',async(ctx,next)=>{
let findc=await findchrome({});
let cpath=findc.executablePath;
const browser=await pp.launch({
    executablePath:cpath,
})
const page=await browser.newPage();
await page.goto('http://192.168.3.151:3000/testtable/',{waitUntil:'networkidle0'});
const res=await page.pdf({
    //path: 'baidu.pdf',
    printBackground:true,
})
// ctx.set('Content-Disposition','attachment;filename="test.pdf"')
ctx.set('Content-Type', 'application/octet-stream;charset=utf-8')

browser.close();
ctx.body=res
})

router.get('/cfgtostring',async(ctx,next)=>{
    let str="http://mxthink2.cross.echosite.cn"
    let psw="simple"
    
    //加密
    let cipher=crypto.createCipher('aes-192-ccm',psw);
    let crypted=cipher.update(str,'utf-8','hex')
    crypted+=cipher.final('hex')

    //解密
    let decipher=crypto.createDecipher('aes-192-ccm',psw);
    let decrypted=decipher.update(crypted,'hex','utf-8');
    decrypted+=decipher.final('utf-8');

    ctx.body="加密:"+crypted+"<br>解密:"+decrypted

//没成功
    //ctx.body=crypted
})

function xls2json(resolve,reject){
    let p = path.join(__dirname, '../public/upload/2014.xlsx');
    console.log('path:' + p)
    xls({
        input:p,
        output:null,
        sheet:'Sheet1'
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