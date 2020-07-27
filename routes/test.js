const router = require('koa-router')()
const mongoose = require('mongoose');
// const jwt = require('jsonwebtoken');
// const Account = require('../../models/Account');
// const tkRecord = require('../../models/tkRecord');
// const tkLesson = require('../../models/tkLesson');
const base = require('../models/Fjxx');
const nstest=require('../models/NewStudent/newstudent')
const crypto = require('crypto')
const fs=require('fs')
const path = require('path')
const xls=require('xls-to-json')
const key=require('../cfg/key.js')
const pp=require('puppeteer-core');
const ExcelJS = require('exceljs');
const nss=require('../models/NewStudent/newstudentsign.js');
const findchrome=require('../node_modules/carlo/lib/find_chrome')

// const multer=require('koa-multer');
router.prefix('/test')

router.get('/output',async(ctx,next)=>{
    ctx.body="abcd"
})
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

router.get('/webpagetopdf',async(ctx,next)=>{
let findc=await findchrome({});
let cpath=findc.executablePath;
const browser=await pp.launch({
    executablePath:cpath,
})
const page=await browser.newPage();
await page.goto('http://mxthink.cross.echosite.cn/xmng/graduatetable',{waitUntil:'networkidle0'});
//生成PDF
// const res=await page.pdf({
//     //path: 'baidu.pdf',
//     printBackground:true,
// })
// ctx.set('Content-Disposition','attachment;filename="test.pdf"')
// ctx.set('Content-Type', 'application/octet-stream;charset=utf-8')

const res=await page.screenshot();
// (
//     {
//     // printBackground:true,
// //    path:"test.jpg",
//     type:"jpeg"
// }
// )
ctx.set('Content-Disposition','attachment;filename="test.png"')
ctx.set('Content-Type', 'application/octet-stream;charset=utf-8')

browser.close();
// ctx.type="image/png"
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

router.get('/datatoexcel2',async(ctx,next)=>{
    // let ws=fs.createWriteStream('./wb.xlsx')
    // var workbook=new ExcelJS.stream.xlsx.WorkbookWriter({
        //filename:'./wb.xlsx'
        // stream:ws
    // });
    var workbook=new ExcelJS.stream.xlsx.WorkbookWriter();
    var worksheet=workbook.addWorksheet('Sheet');
    worksheet.columns=[
        {header:"id",key:"id"},
        {header:"name",key:"name"},
        {header:"phone",key:"phone"},
    ];
    var data=[{
        id:100,
        name:'abc',
        phone:'1231123123'
    }];
    for(let i in data){
        worksheet.addRow(data[i]).commit();
    }
    await workbook.commit();
    ctx.body=workbook
})

router.get('/datatoexcel',async(ctx,next)=>{
    //let data=await nss.findbyquery({});
    //ctx.body=data
    //let p = path.join(__dirname, '../public/upload/报名数据.xlsx');
    let data=await xls2json2("../public/upload/20200720报名数据导出.xlsx","桂林小学报名数据")
    let wb=new ExcelJS.stream.xlsx.WorkbookWriter({
        filename:"./wb.xlsx"
    });
    let st=wb.addWorksheet('房产查询');
    let st2=wb.addWorksheet('居住证查询');
    st.columns=[
        {header:"姓名",key:"name"},
        {header:"身份证号",key:"pid"},
    ]
    st2.columns=[
        {header:"姓名",key:'name'},
        {header:"性别",key:'gender'},
        {header:"居住证持有人",key:'name2'},
        {header:"持有人身份证号",key:'pid'},
        {header:"联系电话",key:'tel'},
    ]
    let count=data.length;
    let k=0;
    for(let o in data){
        if(data[o].学生类型=="A户籍生"){
            st.addRow({name:data[o].学生姓名,pid:data[o].学生身份证号}).commit();
            st.addRow({name:data[o].成员1姓名,pid:data[o].成员1身份证件号}).commit();
            st.addRow({name:data[o].成员2姓名,pid:data[o].成员2身份证件号}).commit();
        }else{
            let name2=data[o].产权房证持有人居住证持有人.trim();
            let tel=''
            if(name2==data[o].成员1姓名.trim()){
                tel=data[o].成员1联系电话
            }else{
                tel=data[o].成员2联系电话
            }
            st2.addRow(
                {
                    name:data[o].学生姓名,
                    gender:data[o].性别,
                    name2:data[o].产权房证持有人居住证持有人,
                    pid:data[o].持有人身份证件号,
                    tel:tel
                }
            ).commit();
        }
        k++
        console.log(k+"/"+count);
    }

    wb.commit();
    ctx.body="ok"
})
function xls2json2(filepath,sheet){
    return new Promise((resolve,reject)=>{
        let p = path.join(__dirname, filepath);
        console.log('path:' + p)
        xls({
            input:p,
            output:null,
            sheet:sheet
        },function(err,result){
            if(err){
                console.error(err)
                reject(err)
            }else{
                console.log(result)
                resolve(result)
            }
        }) 
    })
}
//https://www.jianshu.com/p/8aa148435499
function xls2json(resolve,reject){
    let p = path.join(__dirname, '../public/upload/signtemplate.xlsx');
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
