webpackJsonp([1],{GvcB:function(e,t){},NHnr:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var a=n("7+uW"),r=n("mtWM"),i=n.n(r),o=n("GLwI"),s=n("+zVC"),l=(n("GvcB"),n("QmSG")),c=n.n(l),u=n("Xxa5"),d=n.n(u),f=n("exGp"),p=n.n(f),h=n("fxnj"),g=n.n(h),m={render:function(){var e=this.$createElement;return(this._self._c||e)("div")},staticRenderFns:[]},w=n("VU/8")({data:function(){return{}},props:["loading","dialoginfo"],watch:{loading:function(e,t){e?this.showloading(!0):this.showloading(!1)},"dialoginfo.show":function(e,t){e&&(this.dialogshow(),this.dialoginfo.show=!1)}},methods:{showloading:function(e){e?this.$f7.preloader.show("green"):this.$f7.preloader.hide()},dialogshow:function(){var e=this;this.$f7.dialog.alert(this.dialoginfo.message,this.dialoginfo.title,function(){e.$emit("dialogclose")})}}},m,!1,null,null,null).exports;g.a.ready(function(){g.a.hideAllNonBaseMenuItem()});var v={data:function(){return{dialoginfo:{show:!1,title:"",message:""},dialogclosetype:0,loading:!1,isbinder:!1,forminfo:{stuname:"",stupassword:""}}},components:{loadingdialog:w},mounted:function(){var e=this;return p()(d.a.mark(function t(){return d.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:e.hiddebeginloading(),e.wxconfig();case 2:case"end":return t.stop()}},t,e)}))()},methods:{dialogclose:function(){switch(this.dialogclosetype){case 1:this.closewindow();break;case 2:this.jumptopage()}},closewindow:function(){g.a.closeWindow()},wxconfig:function(){var e=this;return p()(d.a.mark(function t(){var n,a;return d.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return n={debug:c.a.wxdebug,url:location.href.split("#")[0],jsApiList:["hideAllNonBaseMenuItem","closeWindow"]},e.prev=1,e.next=4,i.a.post("/wechatforsvr/jsconfig/",{cfgdata:n});case 4:a=e.sent,g.a.config(a.data.jsconfig),e.next=11;break;case 8:e.prev=8,e.t0=e.catch(1),alert(e.t0);case 11:case"end":return e.stop()}},t,e,[[1,8]])}))()},hiddebeginloading:function(){document.getElementById("beginloading").style.display="none"},jumptopage:function(){alert("jump"),this.isbinder&&(window.location=c.a.binderokPATH)},binder:function(){var e=this;return p()(d.a.mark(function t(){var n;return d.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(document.forms.myform.reportValidity()){t.next=2;break}return t.abrupt("return");case 2:return e.loading=!0,t.prev=3,t.next=6,i.a.post("/wechatforsvr/binder/",{stuinfo:e.forminfo},{headers:{Authorization:sessionStorage.getItem("token")}});case 6:if(n=t.sent,e.loading=!1,!n.data.error){t.next=11;break}return e.dialoginfo={show:!0,message:n.data.message,title:"出错了!"},t.abrupt("return");case 11:sessionStorage.setItem("token",n.data.token),e.isbinder=n.data.isbinder,e.dialogclosetype=2,e.dialoginfo={show:!0,message:"用户绑定成功!确定后跳转到补录页面。",title:"提示"},t.next=28;break;case 17:t.prev=17,t.t0=t.catch(3),e.loading=!1,t.t1=t.t0,t.next="关键数据链接失效或者是非法的！"===t.t1?23:25;break;case 23:return e.dialogclosetype=1,t.abrupt("break",27);case 25:return e.dialogclosetype=0,t.abrupt("break",27);case 27:e.dialoginfo={show:!0,message:t.t0,title:"系统错误!"};case 28:case"end":return t.stop()}},t,e,[[3,17]])}))()}}},b={render:function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("f7-page",[n("div",[n("f7-block-title",[e._v("请绑定学生帐号")]),e._v(" "),n("form",{attrs:{id:"myform"}},[n("f7-list",{attrs:{"no-hairlines-md":""}},[n("f7-list-input",{attrs:{outline:"",label:"学生姓名","floating-label":"",type:"text",placeholder:"学生姓名","clear-button":"",value:e.forminfo.stuname,required:""},on:{input:function(t){e.forminfo.stuname=t.target.value}}}),e._v(" "),n("f7-list-input",{attrs:{outline:"",label:"密码","floating-label":"",type:"password",placeholder:"学生的身份证后6位","clear-button":"",value:e.forminfo.stupassword,required:""},on:{input:function(t){e.forminfo.stupassword=t.target.value}}})],1)],1),e._v(" "),n("f7-block",[n("f7-button",{attrs:{fill:""},on:{click:e.binder}},[e._v("绑定")])],1)],1),e._v(" "),n("loadingdialog",{attrs:{loading:e.loading,dialoginfo:e.dialoginfo},on:{dialogclose:e.dialogclose}})],1)},staticRenderFns:[]},k=n("VU/8")(v,b,!1,null,null,null).exports,x={data:function(){return{}},mounted:function(){var e=this;return p()(d.a.mark(function t(){return d.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:e.hiddebeginloading();case 1:case"end":return t.stop()}},t,e)}))()},methods:{hiddebeginloading:function(){document.getElementById("beginloading").style.display="none"}}},_={render:function(){this.$createElement;this._self._c;return this._m(0)},staticRenderFns:[function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"weui_msg"},[t("div",{staticClass:"weui_icon_area"},[t("i",{staticClass:"weui_icon_info weui_icon_msg"})]),this._v(" "),t("div",{staticClass:"weui_text_area"},[t("h4",{staticClass:"weui_msg_title"},[this._v("请在微信客户端打开链接")])])])}]};var y=n("VU/8")(x,_,!1,function(e){n("adDh")},null,null).exports,A={render:function(){var e=this.$createElement,t=this._self._c||e;return t("f7-page",[t("f7-block",[t("f7-row",[t("f7-col",[t("f7-button",{attrs:{fill:"",href:"/homeinfoinput/"}},[this._v("家长信息补录")])],1)],1)],1)],1)},staticRenderFns:[]},U=(n("VU/8")({data:function(){return{}}},A,!1,null,null,null).exports,[{path:"/binder/",component:k},{path:"/error/",component:y},{path:"/",redirect:function(){var e=p()(d.a.mark(function e(t,n,a){var r;return d.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(!t.query.code){e.next=5;break}return window.location=c.a.serverURL+c.a.valiwechatcodePATH+"?code="+t.query.code,e.abrupt("return");case 5:if(!t.query.token){e.next=19;break}return e.prev=6,e.next=9,i.a.post(c.a.serverURL+c.a.valitoken,null,{headers:{Authorization:t.query.token}});case 9:(r=e.sent).data.vali?(sessionStorage.setItem("token",t.query.token),r.data.isbinder?window.location=c.a.clientURL+c.a.binderokPATH+"?token="+t.query.token:n("/binder/")):n("/error/"),e.next=16;break;case 13:e.prev=13,e.t0=e.catch(6),alert(e.t0);case 16:return e.abrupt("return");case 19:return n("/error/"),e.abrupt("return");case 21:case"end":return e.stop()}},e,this,[[6,13]])}));return function(t,n,a){return e.apply(this,arguments)}}()}]),R={data:function(){return{f7params:{routes:U,name:"wechatenter",id:"com.mxthink.wechatenter",theme:"auto"}}}},j={render:function(){var e=this.$createElement,t=this._self._c||e;return t("f7-app",{attrs:{params:this.f7params}},[t("f7-view",{attrs:{main:"",url:"/"}})],1)},staticRenderFns:[]};var E=n("VU/8")(R,j,!1,function(e){n("p7Tk")},null,null).exports;o.a.use(s.a),i.a.defaults.baseURL=c.a.serverURL,a.a.config.productionTip=!1,new a.a({el:"#app",components:{App:E},template:"<App/>"})},QmSG:function(e,t,n){var a=n("Av7u"),r=a.AES.decrypt("U2FsdGVkX19w4AIuYw48BkevhwMerlTmV76HWiPKHVa4MyXSpPYf7yeoGrM4UW8ZuxcQ1CA+6P14MJArUewDtjm+pGsAjXOAHipwgJ1nTappIFpMAuhOsN1svYWcCZ1/NiG/cWOQRYR31ZWlo9FSAfgCYXB3kHj7uZ+naRInEtdlfDdQAURcQk08qyCRRf8SYdyOTbhymvDAzBMyeqmYCWb3i46568DdEdAUWOXJco75K3rKzYSnwF58X0FEYmd/ptOlYmAjx9iIjsDiAnJ855QzbXxJbBqyDbol3Ug14SAiUbx+8YEYVA6Qyf/+bGlUt64IvVu39wx1Xk/1EDkjRQ","simple");e.exports=JSON.parse(r.toString(a.enc.Utf8))},adDh:function(e,t){},p7Tk:function(e,t){}},["NHnr"]);
//# sourceMappingURL=app.7ee995f66e303e5b31cb.js.map