const router = require('koa-router')()
const mongoose = require('mongoose');
const transschool = require('../../models/TransSchool/transschool.js')
const multer = require('koa-multer')
const path = require('path')
const fs = require('fs').promises;

router.prefix('/sys/transschool/')

router.post('/save/', async (ctx, next) => {
    let obj = ctx.request.body.obj;
    let result = null;
    try {
        if (obj._id) {
            result = await transschool.Update(obj);
        } else {
            result = await transschool.Save(obj);
        }
        // if((obj.newobj.stuname!=obj.oldobj.stuname&&obj.oldobj.stuname) ||(obj.newobj.stupid!=obj.oldobj.stupid&&obj.oldobj.stupid)){
        //     //修改目录名称
        //     console.log('修改目录名称')
        // }
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
        cb(null, pathstr)
    } catch (err) {
        try {
            let rs = await fs.mkdir(pathstr, {
                recursive: true
            })
            cb(null, pathstr)
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
    ctx.body = {
        'error': false,
        "result": '上传成功'
    }
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
//删除登记的转学学生信息
router.post('/delStuInfo/', async (ctx, next) => {
    let item = ctx.request.body.item;
    let id = item._id
    try {
        let rs = await transschool.Del(id)
        let pathstr = path.join(__dirname, '../../public/upload/transschool/' + item.stuname + item.stupid);
        let rs2 = await fs.rmdir(pathstr, {
            recursive: true
        })
        ctx.body = {
            'error': false,
            'result': rs
        }
    } catch (err) {
        ctx.body = {
            'error': true,
            'message': err.message
        }
    }
})
//删除单个文件材料
router.post('/delfile/', async (ctx, next) => {
    let targetfile = path.join(__dirname, '../../public/upload/transschool/' + ctx.request.body.targetfile);
    try {
        let rs = await fs.unlink(targetfile)
        ctx.body = {
            error: false,
            result: rs
        };
    } catch (err) {
        ctx.body = {
            error: true,
            message: err.message
        }
    }
})
//获取个人上传的材料列表 
router.post('/getfilesbynamepid/', async (ctx, next) => {
    let targetDir = path.join(__dirname, '../../public/upload/transschool/' + ctx.request.body.targetdir + '/');
    try {
        let files = await fs.readdir(targetDir);
        console.log(files)
        ctx.body = {
            error: false,
            result: files
        };
    } catch (err) {
        ctx.body = {
            error: true,
            message: err.message
        }
    }
})
module.exports = router