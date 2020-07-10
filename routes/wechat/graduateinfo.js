const router = require('koa-router')()
const base = require('../../models/Fjxx');
const axios = require('axios')
const jwt = require('jsonwebtoken')
const graduateinfo = require('../../models/graduate/graduateinfo')
const graduatetable=require('../../models/Graduate/graduatetable')
const sitecfg = require('../../cfg/siteconfig.js')
const wechatapi = require('co-wechat-api')
const wechatconfig = require('../../cfg/wechatconfig.js')


router.prefix('/graduate')


var api = new wechatapi(
    wechatconfig.wechatauth.appid,
    wechatconfig.wechatauth.appsecret
);

router.get('/getbaseinfo/', async (ctx, next) => {
    if (!ctx.header.authorization) {
        throw new Error('关键数据链接失效或者是非法的！')
        // ctx.body = { error: true, message: '关键数据链接失效或者是非法的！' }
        // return;
    }
    let wxuserinfo = {}
    try {
        wxuserinfo = await jwt.verify(ctx.header.authorization, sitecfg.tokenKey);
    } catch (err) {
        throw new Error('关键数据链接失效或者是非法的！')
        // ctx.body = { error: true, message: '关键数据链接失效或者是非法的！' }
        // return;
    }

    //关闭毕业生填报系统
    // ctx.body={
    //     'error':true,
    //     'message':'毕业生信息录入已结束！如果需要修改，请携带相关证明到学校修改。'
    // }
    //end 
    // return ;

    try {
        let baseinfo = await base.myFindOne({
            'wxopenid': wxuserinfo.openid
        })
        let graduatebaseinfo = await graduateinfo.myFindOne({
            '身份证件号': baseinfo.pid
        })
        // let graduatebaseinfo = await graduateinfo.myFindOne({ '身份证件号': '450205198008141012' })
        if (graduatebaseinfo)
            ctx.body = {
                'error': false,
                'result': graduatebaseinfo
            }
        else
            ctx.body = {
                'error': true,
                'message': '没有找到学生信息，请上报该问题'
            }
    } catch (err) {
        throw new Error('获取数据时出错:[' + err + ']')
    }
})

router.post('/getresult/', async (ctx, next) => {
    if (!ctx.header.authorization) {
        throw new Error('关键数据链接失效或者是非法的！')
    }
    let wxuserinfo = {}
    try {
        wxuserinfo = await jwt.verify(ctx.header.authorization, sitecfg.tokenKey);
    } catch (err) {
        throw new Error('关键数据链接失效或者是非法的！')
    }

    let stuinfodata = ctx.request.body.stuinfo;
    let stuinfo = {}
    stuinfo.result = result(stuinfodata)
    stuinfo.学生姓名 = stuinfodata.stuname;
    stuinfo.班级 = stuinfodata.stuclass;
    stuinfo.学籍号 = stuinfodata.stuid;
    stuinfo.身份证件号 = stuinfodata.stupid;
    stuinfo.性别 = stuinfodata.gender;
    stuinfo.民族 = stuinfodata.ethnic;
    stuinfo.born = stuinfodata.born;
    stuinfo.成员1姓名 = stuinfodata.fname;
    stuinfo.成员1与学生关系 = stuinfodata.frelation;
    stuinfo.成员2姓名 = stuinfodata.sname;
    stuinfo.成员2与学生关系 = stuinfodata.srelation;
    stuinfo.现住址 = stuinfodata.regaddress;
    stuinfo.家庭地址 = stuinfodata.homeaddress;
    stuinfo.成员1联系方式 = stuinfodata.ftel;
    stuinfo.成员2联系方式 = stuinfodata.stel;
    stuinfo.成员1身份证件号 = stuinfodata.fpid;
    stuinfo.成员2身份证件号 = stuinfodata.spid;
    stuinfo.fregaddress = stuinfodata.fregaddress;
    stuinfo.sregaddress = stuinfodata.sregaddress;
    stuinfo.hashouse = stuinfodata.hashouse;
    stuinfo.hometype = stuinfodata.hometype;
    stuinfo.sigle = stuinfodata.sigle;
    stuinfo.stulocal = stuinfodata.stulocal;
    stuinfo.regmainname = stuinfodata.regmainname;

    try {
        let res = await graduateinfo.myUpdateOne({
            '身份证件号': stuinfo.身份证件号
        },
            stuinfo
        )
        let msg = "根据您所填写的信息，需要您提供以下材料进行小升初的材料审核（无特别说明，材料均需提交原件）："
        let rs = stuinfo.result.split(";")
        for (i = 0; i < rs.length - 1; i++) {
            msg += '\n\r' + (i + 1) + "、" + rs[i]
        }
        // let sendmessage=api.sendText(wxuserinfo.openid,stuinfo.result)
        let sendmessage = api.sendText(wxuserinfo.openid, msg)
        ctx.body = {
            'error': false,
            'result': stuinfo.result
        }
    } catch (err) {
        throw new Error("保存时出错:[" + err + "]")
    }
})

//拦截所有请求，如果有token则将用户信息注入到请求中
router.use(async (ctx, next) => {
    console.log('拦截的访问:' + ctx.request.href)
    //let token = ctx.header.authorization;
    //var token = posttoken || ctx.query.token;
    if (ctx.header.authorization) {
        try {
            //验证token合法性
            let token = await jwt.verify(ctx.header.authorization, sitecfg.tokenKey);
            ctx.request.token = token;
        } catch (err) {
            ctx.body = { vali: false, message: "验证token时出错：[" + err + "]程序终止!" };
            return;
        }
    }
    await next();
})

router.get('/graduatetableinfo/', async (ctx, next) => {
    if (!ctx.header.authorization) {
        throw new Error('关键数据链接失效或者是非法的！')
    }
    let wxuserinfo = {}
    try {
        wxuserinfo = await jwt.verify(ctx.header.authorization, sitecfg.tokenKey);
    } catch (err) {
        throw new Error('关键数据链接失效或者是非法的！')
    }


    try {
        let baseinfo = await base.myFindOne({
            'wxopenid': wxuserinfo.openid
        })
        let graduateinfo = await graduatetable.FindOne({
            'pid': baseinfo.pid
            // 'pid': '45030320071128101X'
        })
        // let graduatebaseinfo = await graduateinfo.myFindOne({ '身份证件号': '450205198008141012' })
        if (graduateinfo)
            ctx.body = {
                'error': false,
                'result': graduateinfo
            }
        else
            ctx.body = {
                'error': true,
                'message': '没有找到学生信息，请上报该问题'
            }
    } catch (err) {
        throw new Error('获取数据时出错:[' + err + ']')
    }
})

function result(stuinfo) {
    //学生是否四城区户籍
    let stulocal = /叠彩|七星|秀峰|象山/gi.test(
        stuinfo.regaddress
    );
    let flocal = false;
    let slocal = false;

    //监护人1是否四城区户籍
    if ((stulocal && stuinfo.fregaddress == 5) || stuinfo.fregaddress == 4) flocal = true;
    //监护人2是否四城区户籍
    if ((stulocal && stuinfo.sregaddress == 5 || stuinfo.sregaddress == 4)) slocal = true;

    let stuys = /雁山/gi.test(stuinfo.regaddress)
    if (stuys) {
        //alert('雁山区户籍，请携带户口本，居住证明单独咨询')
        return "雁山区户籍，提交户口本，由雁山区教育局统筹安排到所属辖区就读。;"
    }
    //有产权房否
    let hashouse = /监护人共有产权房|监护人1产权房|监护人2产权房|监护人1单位集资房|监护人2单位集资房|独立产权房/gi.test(
        stuinfo.hometype
    );

    //判断是谁的房产
    let whohouse = "";
    //住地归属别名用于程序识别
    let whohouseAlias = "";
    if (/监护人1/gi.test(stuinfo.hometype)) {
        whohouse = stuinfo.fname;
        whohouseAlias = 1;
    } else if (/监护人2/gi.test(stuinfo.hometype)) {
        whohouse = stuinfo.sname;
        whohouseAlias = 2;
    } else if (/祖父母或外祖父母/gi.test(stuinfo.hometype)) {
        whohouse = "祖父母(外祖父母)";
        whohouseAlias = 3;
    } else if (/学生/gi.test(stuinfo.hometype)) {
        whohouse = stuinfo.stuname;
        whohouseAlias = 4;
    } else {
        whohouse = "监护人";
        whohouseAlias = 0;
    }


    let islocalstu = true
    //判断本地生还是外地生
    if (stulocal && !flocal && !slocal) {
        islocalstu = false;
    } else if (!stulocal && !flocal && !slocal) {
        islocalstu = false;
    } else if (!hashouse && !stulocal) {
        islocalstu = false;
    }

    //需要用的到描述";"分号结束，输出时会根据;换行"
    let rs = [
        stuinfo.stuname + "所在的户口本（即户口本首页户主姓名是" + stuinfo.regmainname + "的户口本）;",
        whohouse + "名下房产证，尚未办理房产证的，提供购房合同、购房发票及完税证明;",
        whohouse + "与房东签订的租房合同、房东的房产证（或复印件）;",
        "祖父母（外祖父母）房产证，尚未办理房产证的，提供购房合同、购房发票及完税证明;",
        whohouse + "名下集资房购房协议及房款发票;",
        whohouse + "与单位签订的租房合同（工资条房租扣款凭证、水、电缴费证明）;",
        whohouse + "的公租房（租约房）、廉租房证本;",
        "监护人无房，已收集监护人身份证信息，由叠彩区教育局统一到房管部门查询;",
        "的户口本",
    ]
    let resultText = rs[0]
    if (stuinfo.regmainname != stuinfo.fname && stuinfo.regmainname != stuinfo.sname) {
        resultText += "学生出生证;"
    } else {
        if ((whohouseAlias == 2 && stuinfo.sregaddress != 5) || (whohouseAlias == 1 && stuinfo.fregaddress != 5)) {
            resultText += "提供监护人结婚证或者学生出生证明;"
        }
    }
    if (islocalstu) {
        //"本地生;"
        switch (stuinfo.hometype) {
            case "监护人共有产权房":
            case "监护人1产权房":
            case "监护人2产权房":
            case "学生名下独立产权房":
                resultText += rs[1];
                if (!stulocal) {
                    //半边户
                    resultText += whohouse + rs[8] + "，如果" + whohouse + "的户口不是四城区户籍，请提供与另一具有本市户籍的监护人户口本以及与其的关系证明（结婚证）;";
                }
                break;
            case "监护人1单位集资房":
            case "监护人2单位集资房":
                resultText += rs[4];
                if (!stulocal) {
                    //半边户
                    resultText += whohouse + rs[8] + "，如果" + whohouse + "的户口不是四城区户籍，请提供与另一具有本市户籍的监护人户口本以及与其的关系证明（结婚证）;";
                }
                break;
            case "祖父母或外祖父母产权房":
                resultText += rs[3]
                resultText += rs[7]
                break;
            case "监护人1名义租房":
            case "监护人2名义租房":
                resultText += rs[2]
                resultText += rs[7]
                break;
            case "监护人1名下单位房":
            case "监护人2名下单位房":
                resultText += rs[5]
                resultText += rs[7]
                break;
            case "监护人1名下公租房（租约房）或廉租房":
            case "监护人2名下公租房（租约房）或廉租房":
                resultText += rs[6]
                resultText += rs[7]
                break;
        }

        return resultText
    } else {
        resultText2 = "外来务工人员子女就读类型。;"
        resultText2 += "户口簿（如法定监护人与随迁子女不在同一户口本，则须提供双方户口簿或出生证明等法定监护证明材料）。;"
        resultText2 += "法定监护人《居住证》。外来人员首次领取《居住证》时间应满1年(截止日期按随迁子女毕业当年8月31日计，下同)。;"
        resultText2 += "合法稳定就业证明。为《居住证》持有人在流入地拥有合法稳定职业的证明，包括工商营业执照、纳税证明、国家规定的企事业单位劳动用工合同等(满足其中任意一项即可)。上述就业证明的签发(订)时间应满1年且在有效期内。;";
        resultText2 += "合法稳定住所证明。为《居住证》持有人在流入地拥有合法稳定居住场所的证明，包括房屋所有权证、不动产权证书、购房合同（须附购房发票和完税凭证）、房屋租赁合同（须附出租人的房产证和房屋租赁完税凭证或发票）等(满足其中任意一项即可)。商业用途场所不得作为合法住所。上述住所证明的签发(订)时间应满1年且在有效期内。;"
        resultText2 += "上述证明材料的持有人(签订人)须一致，且为申请就读随迁子女的法定监护人。;"
        resultText2 += "入学申请人提供的《居住证》登记居住地址要与其合法稳定住所地址一致。;";
        resultText2 += "上述证明，小学只需要查看户口簿和居住证，对外来务工子女就读条件的审核由初中进行认定。;"

        return resultText2
    }
}



module.exports = router