const router = require('koa-router')()
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Account = require('../../models/Account');
const tkRecord = require('../../models/tkRecord');
const tkLesson = require('../../models/tkLesson');
const base = require('../../models/Fjxx');
const crypto = require('crypto')
router.prefix('/typekey')


//添加用户的键盘练习记录
router.post('/addtkrecord', async (ctx, next) => {
    let record = ctx.request.body.record;
    if (!ctx.request.decoded) {
        ctx.body = { 'error': true, 'message': '用户未登录！' }
        return;
    }
    let uid = ctx.request.decoded.id
    try {
        var tkrecord = await base.myPushdata({ _id: uid }, record)
        ctx.body = { 'error': false, 'record': tkrecord }
    } catch (err) {
        ctx.body = { 'error': true, 'message': err.message }
    }
})

//保存键盘练习课程
router.post('/savetklesson', async (ctx, next) => {
    let lesson = ctx.request.body.lessoninfo;
    try {
        var tklesson = await tkLesson.myCreate(lesson)
        ctx.body = { 'error': false, 'lesson': tklesson };
    } catch (err) {
        if (err.message.indexOf('duplicate key error') !== -1)
            ctx.body = { 'error': true, 'message': '课程名称已经存在' }
        else
            ctx.body = { 'error': true, 'message': err.message };
    }
})

//获取键盘练习课程
router.get('/getalltklesson', async (ctx, next) => {
    try {
        var list = await tkLesson.myFindAll()
        ctx.body = { 'error': false, 'lessonlist': list };
    } catch (err) {
        ctx.body = { 'error': true, 'message': err.message }
    }
})

//分页获取键盘练习课程列表
router.get('/getalltklessonpaging', async (ctx, next) => {
    let keyword = ctx.query.keyword;
    let pagesize = ctx.query.pagesize;
    let currentpage = ctx.query.currentpage;
    try {
        var data = await tkLesson.myPaging(keyword, pagesize, currentpage);
        ctx.body = { 'error': false, 'pagingdata': data };
    } catch (err) {
        ctx.body = { 'error': true, 'message': err.message }
    }
})

//删除键盘练习课程
router.get('/deletelesson', async (ctx, next) => {
    let id = ctx.query.id;
    try {
        var deldata = await tkLesson.myDelete(id);
        ctx.body = { 'error': false, 'data': deldata };
    } catch (err) {
        ctx.body = { 'error': true, 'message': err.message }
    }
})

//根据ID获取键盘练习课程
router.get('/getlessonbyid', async (ctx, next) => {
    let id = ctx.query.id;
    try {
        var result = await tkLesson.myFind(id);
        ctx.body = { 'error': false, 'result': result };
    } catch (err) {
        ctx.body = { 'error': true, 'message': err.message };
    }
})

//编辑键盘练习课程
router.post('/edittklesson', async (ctx, next) => {
    let doc = ctx.request.body.lessoninfo;
    try {
        var result = await tkLesson.myEdit(doc);
        ctx.body = { 'error': false, 'result': result };
    } catch (err) {
        ctx.body = { 'error': true, 'message': err.message }
    }
})
//获取当前用户指定课程的所有练习记录
router.get('/gettkrecord', async (ctx, next) => {
    //let id=ctx.request.decoded.id;
    if (!ctx.request.decoded) {
        ctx.body = { 'error': true, 'message': '请先登录' };
        return;
    };
    let id = ctx.request.decoded.id;
    let lesson = ctx.query.lesson;
    let aggregations = [
        { $match: { _id: mongoose.Types.ObjectId(id) } },
        { $unwind: '$tkRecords' },
        { $match: { 'tkRecords.lesson': lesson } },
        {
            '$project':
            {
                'lesson': '$tkRecords.lesson',
                "score": "$tkRecords.score",
                "rightrate": "$tkRecords.rightrate",
                "time": "$tkRecords.time",
                //"finishdate": { $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$tkRecords.finishdate" } },
                "finishdate": "$tkRecords.finishdate",
                _id: 0,
                //"id":"$tkRecords._id"
            },

        },
        { $sort: { "finishdate": -1 } }
    ]
    try {
        // var result = await base.myFindByQuery({ '_id': id, 'tkRecords.lesson': lesson }, "tkRecords -_id");
        var result = await base.myAggregate(aggregations)
        //console.log(result)
        ctx.body = { 'error': false, 'result': result };
    } catch (err) {
        ctx.body = { 'error': true, 'message': err.message }
    }
})

//获取指定课程的所有练习者练习记录的最好成绩
router.get('/gettkrecordrank', async (ctx, next) => {
    let lesson = ctx.query.lesson;
    let aggregations = [
        { $unwind: '$tkRecords' },
        { $match: { 'tkRecords.lesson': lesson, 'baseinfo.classno': { $exists: true } } },
        { $sort: { "tkRecords.score": -1 } },
        {
            $group: {
                _id: "$username",
                score: { "$first": "$$ROOT" },
            }
        },
        {
            '$project':
            {
                'username': '$_id',
                'lesson': '$score.tkRecords.lesson',
                "score": "$score.tkRecords.score",
                "rightrate": "$score.tkRecords.rightrate",
                "time": "$score.tkRecords.time",
                "finishdate": "$score.tkRecords.finishdate",
                "class": "$score.baseinfo.classno",
                _id: 0
            }
        },
        { $sort: { "score": -1 } },

    ]
    try {
        // var result = await base.myFindByQuery({ '_id': id, 'tkRecords.lesson': lesson }, "tkRecords -_id");
        var result = await base.myAggregate(aggregations)
        //console.log(result)
        ctx.body = { 'error': false, 'result': result };
    } catch (err) {
        ctx.body = { 'error': true, 'message': err.message }
    }
})

//获取用户所在班级的练习成绩排名
router.get('/gettkrecordrankbyclass', async (ctx, next) => {
    //let id=ctx.request.decoded.id;
    if (!ctx.request.decoded) {
        ctx.body = { 'error': true, 'message': '请先登录' };
        return;
    };
    let classno = ctx.query.classno;
    let lesson = ctx.query.lesson;
    let aggregations = [
        { $match: { 'baseinfo.classno': classno } },
        { $unwind: '$tkRecords' },
        { $match: { 'tkRecords.lesson': lesson } },
        { $sort: { "tkRecords.score": -1 } },
        {
            $group: {
                _id: "$username",
                score: { "$first": "$$ROOT" },
            }
        },
        {
            '$project':
            {
                'username': '$_id',
                'lesson': '$score.tkRecords.lesson',
                "score": "$score.tkRecords.score",
                "rightrate": "$score.tkRecords.rightrate",
                "time": "$score.tkRecords.time",
                "finishdate": "$score.tkRecords.finishdate",
                "class": "$score.baseinfo.classno",
                _id: 0
            }
        },
        { $sort: { "score": -1 } },
    ]
    try {
        // var result = await base.myFindByQuery({ '_id': id, 'tkRecords.lesson': lesson }, "tkRecords -_id");
        var result = await base.myAggregate(aggregations)
        //console.log(result)
        ctx.body = { 'error': false, 'result': result };
    } catch (err) {
        ctx.body = { 'error': true, 'message': err.message }
    }

})

//获取用户当前课程最好成绩在班级中的排名
router.get('/getuserrankbyclass', async (ctx, next) => {
    //let id=ctx.request.decoded.id;
    if (!ctx.request.decoded) {
        ctx.body = { 'error': true, 'message': '请先登录' };
        return;
    };
    let classno = ctx.query.classno;
    let lesson = ctx.query.lesson;
    let aggregations = [
        { $match: { '_id': mongoose.Types.ObjectId(ctx.request.decoded.id) } },
        { $unwind: '$tkRecords' },
        { $match: { 'tkRecords.lesson': lesson } },
        { $sort: { "tkRecords.score": -1 } },
        {
            $group: {
                _id: "$username",
                score: { "$first": "$tkRecords.score" },
            }
        },
    ]
    try {
        // var result = await base.myFindByQuery({ '_id': id, 'tkRecords.lesson': lesson }, "tkRecords -_id");
        var result = await base.myAggregate(aggregations)
        //console.log(result)
        if(result.length<=0){
            ctx.body={'error':false,'message':'你还没有当前课程的练习记录，快来练习吧！'}
            return;
        }
        var result2=await base.myAggregate([
                { $match: { 'tkRecords.lesson': lesson, 'baseinfo.classno': classno } },
                { $unwind: '$tkRecords' },
                { $sort: { "tkRecords.score": -1 } },
                {
                    $group: {
                        _id: "$username",
                        score: { "$first": "$$ROOT" },
                    }
                },
                { $match: { 'score.tkRecords.score': { $gt: result[0].score } } },
                {
                    $count: "rank"
                },
            ]
        )
        ctx.body = { 'error': false, 'result': result2 };
    } catch (err) {
        ctx.body = { 'error': true, 'message': err.message }
    }

})

//获取用户当前课程最好成绩在全校中的排名
router.get('/getuserrankbyschool', async (ctx, next) => {
    //let id=ctx.request.decoded.id;
    if (!ctx.request.decoded) {
        ctx.body = { 'error': true, 'message': '请先登录' };
        return;
    };
    // let classno = ctx.query.classno;
    let lesson = ctx.query.lesson;
    let aggregations = [
        { $match: { '_id': mongoose.Types.ObjectId(ctx.request.decoded.id) } },
        { $unwind: '$tkRecords' },
        { $match: { 'tkRecords.lesson': lesson } },
        { $sort: { "tkRecords.score": -1 } },
        {
            $group: {
                _id: "$username",
                score: { "$first": "$tkRecords.score" },
            }
        },
    ]
    try {
        // var result = await base.myFindByQuery({ '_id': id, 'tkRecords.lesson': lesson }, "tkRecords -_id");
        var result = await base.myAggregate(aggregations)
        if(result.length<=0){
            ctx.body={'error':false,'message':'你还没有当前课程的练习记录，快来练习吧！'}
            return;
        }
        var result2=await base.myAggregate([
                { $match: { 'tkRecords.lesson': lesson,'baseinfo.classno':{$exists:true} } },
                { $unwind: '$tkRecords' },
                { $sort: { "tkRecords.score": -1 } },
                {
                    $group: {
                        _id: "$username",
                        score: { "$first": "$$ROOT" },
                    }
                },
                { $match: { 'score.tkRecords.score': { $gt: result[0].score } } },
                {
                    $count: "rank"
                },
            ]
        )
        ctx.body = { 'error': false, 'result': result2 };
    } catch (err) {
        ctx.body = { 'error': true, 'message': err.message }
    }

})


module.exports = router