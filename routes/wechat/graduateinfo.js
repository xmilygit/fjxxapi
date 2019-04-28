const router = require('koa-router')()
const base = require('../../models/Fjxx');
const axios = require('axios')
const jwt = require('jsonwebtoken')
const graduateinfo = require('../../models/graduate/graduateinfo')
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

    try {
        let baseinfo = await base.myFindOne({ 'wxopenid': wxuserinfo.openid })
        let graduatebaseinfo = await graduateinfo.myFindOne({ '身份证件号': baseinfo.pid })
        // let graduatebaseinfo = await graduateinfo.myFindOne({ '身份证件号': '450205198008141012' })
        if (graduatebaseinfo)
            ctx.body = { 'error': false, 'result': graduatebaseinfo }
        else
            ctx.body = { 'error': true, 'message': '没有找到学生信息，请上报该问题' }
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
    stuinfo.stulocal=stuinfodata.stulocal;

    try {
        let res = await graduateinfo.myUpdateOne(
            { '身份证件号':stuinfo.身份证件号 },
            stuinfo
        )
        let msg="根据您所填写的信息，预计需要您提供以下材料进行小升初的审核（无特别说明，材料均需提交原件）："
        let rs=stuinfo.result.split(";")
        for(i=0;i<rs.length-1;i++){
            msg+='\n\r'+(i+1)+"、"+rs[i]
        }
        // let sendmessage=api.sendText(wxuserinfo.openid,stuinfo.result)
        let sendmessage=api.sendText(wxuserinfo.openid,msg)
        ctx.body = { 'error': false, 'result': stuinfo.result }
    } catch (err) {
        throw new Error("保存时出错:[" + err + "]")
    }
})

function result(stuinfo) {
    //四城区学校否
    let stulocal = /叠彩|七星|秀峰|象山/gi.test(
        stuinfo.regaddress
    );

    let stuys = /雁山/gi.test(stuinfo.regaddress)
    if (stuys) {
        //alert('雁山区户籍，请携带户口本，居住证明单独咨询')
        return "雁山区户籍，请携带户口本，居住证明咨询"
    }

    //住地是谁名义下的
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


    let rs = [
        stuinfo.stuname + "户口本;",
        whohouse + "名下房产证，尚未办理房产证的，提供购房合同、购房发票及完税证明;",
        whohouse + "与房东签订的租房合同、房东的房产证（或复印件）;",
        "祖父母（外祖父母房产证）;",
        whohouse + "名下集资房购房协议及房款发票;",
        whohouse + "与单位签订的租房合同（工资条房租扣款凭证、水、电缴费证明）;",
        whohouse + "名下公租房（租约房）、廉租房证本;",
        whohouse + "与" + stuinfo.stuname + "的关系证明（出生证）;",
        whohouse + "与另一监护人的关系证明（结婚证）;",
        "填写无房查询登录表;",
    ];

    let resultText = rs[0];

    //有产权房否
    let hashouse = /监护人共有产权房|监护人1产权房|监护人2产权房|监护人1单位集资房|监护人2单位集资房|独立产权房/gi.test(
        stuinfo.hometype
    );
    // this.checkhome=hashouse?false:true;
    if (stulocal) {
        //四城区户籍学生

        if (whohouseAlias == 4) {
            //学生单独产权房产
            resultText += rs[1]
            //alert(rs[0]+rs[1])
            return resultText;
        }

        if (stuinfo.fregaddress != 5 && stuinfo.fregaddress != 4 && stuinfo.sregaddress != 5 && stuinfo.sregaddress != 4 && !hashouse) {
            if (whohouseAlias == 3) {
                //只有学生单独四城区户籍且无房，用老人家房子，可认定学生
                //alert(rs[0]+rs[1]+rs[9])
                resultText += rs[1] + rs[9];
                return resultText
            }
            //只有学生单独四城区户籍且无房，认定为外来务工人员子女
            //alert(rs[0]+"监护人户口本;请带材料咨询")
            resultText += "监护人户口本;来校咨询负责人;"
            return resultText;
        }

        if (stuinfo.fregaddress != 5 && stuinfo.sregaddress != 5 && whohouseAlias !== 3) {
            //监护人与学生均不在同一户籍，需要证明与学生的关系
            resultText += rs[7]
        }

        if (hashouse) {
            //有房
            let temphomeRS = rs[1]
            if (/集资/gi.test(stuinfo.hometype)) {
                temphomeRS = rs[4]
            }
            if (
                (stuinfo.fregaddress != 5 && whohouseAlias == 1 && stuinfo.sregaddress == 5)
                ||
                (stuinfo.sregaddress != 5 && whohouseAlias == 2 && stuinfo.fregaddress == 5)
            ) {
                //房产所有人与学生不在同一户籍的
                resultText += temphomeRS + rs[7] + "或者" + rs[8]
                //alert(resultText)
                return resultText
            }
            //房产所有人与学生同户籍
            resultText += temphomeRS;
            // alert(resultText)
        } else {
            //无房
            let temphomeRS = rs[1]
            if (/名义租房/gi.test(stuinfo.hometype))
                temphomeRS = rs[2]
            else if (/单位房/gi.test(stuinfo.hometype))
                temphomeRS = rs[5]
            else if (/公租房/gi.test(stuinfo.hometype))
                temphomeRS = rs[6]

            if (
                (stuinfo.fregaddress != 5 && whohouseAlias == 1 && stuinfo.sregaddress == 5)
                ||
                (stuinfo.sregaddress != 5 && whohouseAlias == 2 && stuinfo.fregaddress == 5)
            ) {
                //住所名下监护人与学生不在同一户籍的
                resultText += temphomeRS + rs[7] + "或者" + rs[8] + rs[9]
                //alert(resultText)
                return resultText
            }
            //住所名下监护人与学生同户籍
            resultText += temphomeRS + rs[9];
        }
        //alert(resultText)
        return resultText
    } else {
        //非四城区户籍学生
        //随具有四城区户籍监护人实际居住（有房产的)        
        if (
            (stuinfo.fregaddress == 4 && hashouse)
            ||
            (stuinfo.sregaddress == 4 && hashouse)
        ) {
            if(stuinfo.fregaddress==4){
                resultText+=stuinfo.fname+"户口本;"
            }else if(stuinfo.sregaddress==4){
                resultText+=stuinfo.sname+"户口本;"
            }
            resultText += rs[1]
            if (
                (stuinfo.fregaddress != 5  && stuinfo.sregaddress == 5)//&& whohouseAlias == 1
                ||
                (stuinfo.sregaddress != 5  && stuinfo.fregaddress == 5)//&& whohouseAlias == 2
            ) {
                resultText += rs[7] + "或者" + rs[8]
            }

            if (stuinfo.fregaddress != 5 && stuinfo.sregaddress != 5 && whohouseAlias !== 3) {
                //监护人与学生均不在同一户籍，需要证明与学生的关系
                resultText += rs[7]
            }
        } else {
            resultText = "学生及监护人户口本；以外来务工人员子女就读，由初中审核材料;"
        }
        //alert(resultText)
        return resultText
    }
}



module.exports = router