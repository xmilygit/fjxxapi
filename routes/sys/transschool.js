const router = require('koa-router')()
const mongoose = require('mongoose');
const transschool = require('../../models/TransSchool/transschool.js')
const multer = require('koa-multer')
const path = require('path')
const fs = require('fs').promises;

router.prefix('/sys/transschool/')

router.post('/save/', async (ctx, next) => {
    var obj = ctx.request.body.obj;
    try {
        var result = await transschool.Save(obj);
        ctx.body = {
            "error": false,
            "result": result
        };
    } catch (err) {
        ctx.body = {
            'error': true,
            'message': err.message
        }
    }

})

router.post('/search/', async (ctx, next) => {
    var keyword = ctx.request.body.keyword;
    var pagesize = ctx.request.body.pagesize;
    var lastid = ctx.request.body.lastid;
    try {
        var result = await transschool.myPaging(keyword, pagesize, lastid);
        ctx.body = {
            "error": false,
            "result": {
                items: result.recordset,
                totalitems: result.count
            }
        };
    } catch (err) {
        ctx.body = {
            'error': true,
            'message': err.message
        }
    }

})

//控制上传文件存储方式，如果不设置默认情况下文件上传以随机字符且无后缀来存放
async function uploadDest(req, file, cb) {
    let pathstr = path.join(__dirname, '../../public/upload/transschool/' + req.body.path + '/');
    try {
        let rs = await fs.access(pathstr);
        cb(null,pathstr)
    } catch (err) {
        try {
            let rs = await fs.mkdir(pathstr, { recursive: true })
            cb(null,pathstr)
        } catch (err) {
            throw err
        }
    }
}
var storage = multer.diskStorage({
    destination: uploadDest,
    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split(".");
        cb(null, req.body.filename + "." + fileFormat[fileFormat.length - 1])
    }
})
var upload = multer({
    storage: storage
})
router.post('/upload/', upload.single('file'), async (ctx, next) => {
    ctx.body = { 'error': false, "result": '上传成功' }
});
// router.post('/upload/', async (ctx, next) => {
//     try{
//         let res=await upload.single('file');
//         ctx.body = {
//             'error': false,
//             "result": '上传成功'
//         }
//     }catch(err){
//         ctx.body = {
//             'error': true,
//             "message": '上传失败:'+err.message,
//         }
//     }

// });
module.exports = router