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

function result_2(stuinfo) {
    let rs = [
        stuinfo.stuname + "所在的户口本（即户口本首页户主姓名是" + stuinfo.regmainname + "的户口本）;",
        "监护人名下房产证，尚未办理房产证的，提供购房合同、购房发票及完税证明;",
        "监护人与房东签订的租房合同、房东的房产证（或复印件）;",
        "祖父母（外祖父母）房产证，尚未办理房产证的，提供购房合同、购房发票及完税证明;",
        "监护人名下集资房购房协议及房款发票;",
        "监护人与单位签订的租房合同（工资条房租扣款凭证、水、电缴费证明）;",
        "监护人的公租房（租约房）、廉租房证本;",
        "学生与监护人的关系证明(出生证);",
        "监护人之间的关系证明（结婚证）;",
        stuinfo.stuname + "名下房产证，尚未办理房产证的，提供购房合同、购房发票及完税证明;",
        "监护人无房，已收集监护人身份证信息，由叠彩区教育局统一到房管部门查询;",
        "房产的所有人在以上所提供的材料中无法体现出与学生、学生监护人之间关系的，需要出示相关关系证明;",
        "注意：如果房产的所有人与" + stuinfo.stuname + "在户籍中的关系没有注名的，还需要提供与学生的关系证明（出生证）或者提供与学生在同一户籍的另一监护人的关系证明（结婚证）;",
        "所在的户口本;",
    ];
    let resultText = rs[0];
    //学生是否四城区户籍
    let stulocal = /叠彩|七星|秀峰|象山/gi.test(
        stuinfo.regaddress
    );
    let flocal = false;
    let slocal = false;

    //监护人1是否四城区户籍
    if ((stulocal && stuinfo.fregaddress == 5) || stuinfo.fregaddress == 4) {
        flocal = true;
    }
    //监护人2是否四城区户籍
    if ((stulocal && stuinfo.sregaddress == 5 || stuinfo.sregaddress == 4)) {
        slocal = true;
    }

    let stuys = /雁山/gi.test(stuinfo.regaddress)
    if (stuys) {
        //alert('雁山区户籍，请携带户口本，居住证明单独咨询')
        return "雁山区户籍，请携带户口本，居住证明咨询"
    }

    //有产权房否
    let hashouse = /监护人名下产权房|学生名下独立产权房|监护人名下单位集资房/gi.test(
        stuinfo.hometype
    );

    //外来务工人员
    if ((!stulocal && !flocal && !slocal) || (!stulocal && flocal && !hashouse) || (!stulocal && slocal && !hashouse)) {
        return "外来务工人员子女就读办法;"
    }

    //本市户籍学生 
    if (stuinfo.hometype == "学生名下独立产权房") {
        resultText += rs[9]
        return resultText;
    }
    if (hashouse) {
        if (!stulocal) {
            if (flocal) {
                resultText += stuinfo.fname + rs[13]
            } else {
                resultText += stuinfo.sname + rs[13]
            }
        }
        if (stuinfo.regmainname !== stuinfo.fname && stuinfo.regmainname !== stuinfo.sname) {
            resultText += rs[7];

            switch (stuinfo.hometype) {
                case "监护人名下产权房":
                    resultText += rs[1];
                    break;
                case "监护人名下单位集资房":
                    resultText += rs[4];
                    break;
            }
        } else if ((stuinfo.regmainname == stuinfo.fname) || (stuinfo.regmainname == stuinfo.sname)) {
            switch (stuinfo.hometype) {
                case "监护人名下产权房":
                    resultText += rs[1];
                    resultText += rs[12];
                    break;
                case "监护人名下单位集资房":
                    resultText += rs[4];
                    resultText += rs[12];
                    break;
            }
        }
        return resultText;
    } else {
        if (stuinfo.regmainname !== stuinfo.fname && stuinfo.regmainname !== stuinfo.sname) {
            resultText += rs[7];

            switch (stuinfo.hometype) {
                case "祖父母或外祖父母产权房":
                    resultText += rs[3];
                    break;
                case "监护人名义租房":
                    resultText += rs[2];
                    break;
                case "监护人名义单位房":
                    resultText += rs[5];
                    break;
                case "监护人名下公租房（租约房）或廉租房":
                    resultText += rs[6];
                    break;
            }
        } else if ((stuinfo.regmainname == stuinfo.fname) || (stuinfo.regmainname == stuinfo.sname)) {
            switch (stuinfo.hometype) {
                case "祖父母或外祖父母产权房":
                    resultText += rs[3];
                    resultText += rs[12];
                    break;
                case "监护人名义租房":
                    resultText += rs[2];
                    resultText += rs[12];
                    break;
                case "监护人名义单位房":
                    resultText += rs[5];
                    resultText += rs[12];
                    break;
                case "监护人名下公租房（租约房）或廉租房":
                    resultText += rs[6];
                    resultText += rs[12];
                    break;
            }
        }
        resultText += rs[10];
        return resultText;
    }






    /*


    */
    //let resultText = rs[0];

    let hasborn = false;
    if (stulocal) {
        //四城区户籍学生

        if (stuinfo.hometype == "学生名下独立产权房") {
            //学生单独产权房产
            resultText += rs[9]
            //alert(rs[0]+rs[1])
            return resultText;
        }
        if (stuinfo.sname === "" && stuinfo.sname.length <= 0) {
            if (stuinfo.regmainname != stuinfo.fname) {
                resultText += rs[7]; //"监护人与学生的关系证明(出生证);"
                hasborn = true
            }
        } else {
            if (stuinfo.regmainname != stuinfo.fname && stuinfo.regmainname != stuinfo.sname) {
                resultText += rs[7]; //"监护人与学生的关系证明(出生证);"
                hasborn = true
            }
        }
        // if(stuinfo.fregaddress!=5&&stuinfo.sregaddress!=5&&whohouseAlias==3){
        //     resultText+="监护人与学生的关系证明(出生证);"
        // }
        // if (stuinfo.fregaddress != 5 && stuinfo.fregaddress != 4 && stuinfo.sregaddress != 5 && stuinfo.sregaddress != 4 && !hashouse) {
        //     resultText+=rs[1]
        //     if (whohouseAlias == 3) {
        //         //只有学生单独四城区户籍且无房，用老人家房子，可认定学生
        //         //alert(rs[0]+rs[1]+rs[9])
        //         resultText +=whohouse+"与学生的关系证明（如与学生在同一户籍，则提供户口本）;"+ rs[9];
        //         return resultText
        //     }
        //     //只有学生单独四城区户籍且无房，认定为外来务工人员子女
        //     //alert(rs[0]+"监护人户口本;请带材料咨询")
        //     resultText += "监护人户口本;来校咨询负责人;"
        //     return resultText;
        // }

        // if (stuinfo.fregaddress != 5 && stuinfo.sregaddress != 5 && whohouseAlias !== 3) {
        //     //监护人与学生均不在同一户籍，需要证明与学生的关系
        //     resultText += rs[7]
        // }

        if (hashouse) {
            //有房
            let temphomeRS = rs[1]
            if (/集资/gi.test(stuinfo.hometype)) {
                temphomeRS = rs[4]
            }

            // if(!hasborn&&whohouse!=stuinfo.regmainname){
            //     resultText += temphomeRS + rs[7]
            //     return resultText
            // }


            // if (
            //     (stuinfo.fregaddress != 5 && whohouseAlias == 1 && stuinfo.sregaddress == 5)
            //     ||
            //     (stuinfo.sregaddress != 5 && whohouseAlias == 2 && stuinfo.fregaddress == 5)
            // ) {
            //     //房产所有人与学生不在同一户籍的
            //     resultText += temphomeRS + rs[7] + "或者" + rs[8]
            //     //alert(resultText)
            //     return resultText
            // }
            //房产所有人与学生同户籍
            // resultText += temphomeRS;
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
                (stuinfo.fregaddress != 5 && whohouseAlias == 1 && stuinfo.sregaddress == 5) ||
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
            (stuinfo.fregaddress == 4 && hashouse) ||
            (stuinfo.sregaddress == 4 && hashouse)
        ) {
            if (stuinfo.fregaddress == 4) {
                resultText += stuinfo.fname + "户口本;"
            } else if (stuinfo.sregaddress == 4) {
                resultText += stuinfo.sname + "户口本;"
            }
            resultText += rs[1]
            if (
                (stuinfo.fregaddress != 5 && stuinfo.sregaddress == 5) //&& whohouseAlias == 1
                ||
                (stuinfo.sregaddress != 5 && stuinfo.fregaddress == 5) //&& whohouseAlias == 2
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

function result_bak(stuinfo) {
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
        stuinfo.stuname + "所在的户口本（即户口本首页户主姓名是" + stuinfo.regmainname + "的户口本）;",
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
        if (stuinfo.fregaddress != 5 && stuinfo.sregaddress != 5 && whohouseAlias == 3) {
            resultText += "监护人与学生的关系证明(出生证);"
        }
        if (stuinfo.fregaddress != 5 && stuinfo.fregaddress != 4 && stuinfo.sregaddress != 5 && stuinfo.sregaddress != 4 && !hashouse) {
            resultText += rs[1]
            if (whohouseAlias == 3) {
                //只有学生单独四城区户籍且无房，用老人家房子，可认定学生
                //alert(rs[0]+rs[1]+rs[9])
                resultText += whohouse + "与学生的关系证明（如与学生在同一户籍，则提供户口本）;" + rs[9];
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
                (stuinfo.fregaddress != 5 && whohouseAlias == 1 && stuinfo.sregaddress == 5) ||
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
                (stuinfo.fregaddress != 5 && whohouseAlias == 1 && stuinfo.sregaddress == 5) ||
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
            (stuinfo.fregaddress == 4 && hashouse) ||
            (stuinfo.sregaddress == 4 && hashouse)
        ) {
            if (stuinfo.fregaddress == 4) {
                resultText += stuinfo.fname + "户口本;"
            } else if (stuinfo.sregaddress == 4) {
                resultText += stuinfo.sname + "户口本;"
            }
            resultText += rs[1]
            if (
                (stuinfo.fregaddress != 5 && stuinfo.sregaddress == 5) //&& whohouseAlias == 1
                ||
                (stuinfo.sregaddress != 5 && stuinfo.fregaddress == 5) //&& whohouseAlias == 2
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