import { Component } from '@angular/core';
import { CommonService } from '../../app/app.base';
import { NavController } from 'ionic-angular';
declare var wx;

@Component({
    selector: 'page-shareFriend',
    templateUrl: 'shareFriend.html'
})

export class ShareFriendPage {

    info:any;
    groupType:any;
    showShare:boolean=false;
    shopData:any;
    id:string="";//店铺id
    constructor(public navCtrl: NavController, private commonService: CommonService ) {

        this.id = this.commonService.shopID;
        this.loadData();
        this.changeCode(1);
        this.sharesign();
    }


  /*页面事件*/
    ionViewWillEnter(){

    }
     /*初始化jsapi*/
    sharesign(){
        this.commonService.httpGet({
            url:this.commonService.baseWXUrl+'/share/sharesign',
            data:{
                url:window.location.href
            }
        }).then(data=>{
            if(data.code=='200'){
                console.log(JSON.stringify(data.result));
                wx.config({
                    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                    appId: data.result.appId, // 必填，公众号的唯一标识
                    timestamp: data.result.timestamp, // 必填，生成签名的时间戳
                    nonceStr: data.result.nonceStr, // 必填，生成签名的随机串
                    signature: data.result.signature,// 必填，签名，见附录1
                    jsApiList: ['onMenuShareAppMessage','onMenuShareTimeline','chooseWXPay'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                });
                this.checkJsApi();
              /*  if(this.shopData!=null){
                    this.initShare(this.shopData);
                }*/
            }else{
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }
     initShare(item){
        wx.onMenuShareAppMessage({//分享到微信朋友
             title: item.storeName, // 分享标题
             link: this.commonService.baseWXUrl+'/user/wdtransition?shareUrl='+this.commonService.basePageUrl+'&index=shareCode&storeId='+this.id+"&uid="+this.commonService.user.uid,  // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
             imgUrl: item.icon, // 分享图标
             type: 'link', // 分享类型,music、video或link，不填默认为link
             dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
             desc: item.detail, // 分享描述
             trigger: function (res) {

             },
             complete: function (res) {

             },
             success: function () {
                 // 用户确认分享后执行的回调函数
                 this.commonService.alert("系统提示",'分享成功');
             },
             cancel: function () {
                 // 用户取消分享后执行的回调函数
                 this.commonService.alert("系统提示",'分享失败');
             }
        });

        wx.onMenuShareTimeline({//分享到微信朋友圈
          title: item.storeName, // 分享标题
          link:this.commonService.baseWXUrl+'/user/wdtransition?shareUrl='+this.commonService.basePageUrl+'&index=shareCode&storeId='+this.id+"&uid="+this.commonService.user.uid,  // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
             imgUrl: item.icon, // 分享图标
             trigger: function (res) {

             },
             complete: function (res) {

             },
             success: function () {
                 // 用户确认分享后执行的回调函数
                 this.commonService.alert("系统提示",'分享成功');
             },
             cancel: function () {
                 // 用户取消分享后执行的回调函数
                 this.commonService.alert("系统提示",'分享失败');
             }
        });
    }

    /*检查微信接口是否正常*/
    checkJsApi(){
        wx.ready(function(){
            // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
            wx.checkJsApi({
                jsApiList:  ['onMenuShareAppMessage','onMenuShareTimeline','chooseWXPay'] , // 需要检测的JS接口列表，所有JS接口列表见附录2,
                success: function(res) {
                    if(this.shopData!=null){
                        this.initShare(this.shopData);
                    }
                    // 以键值对的形式返回，可用的api值true，不可用为false
                    // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
                }
            });
        });
    }
 //显示分享
    showSharePrompt(idx){
        if(idx == '1'){
            this.showShare = true;
            setTimeout(() => {//最长显示10秒
                this.showSharePrompt(0);
            },5000);
        }else{
            this.showShare = false;
        }
    }
    /*返回上一页*/
    goToBackPage(){
        this.navCtrl.pop();
    }

    changeCode(idx){
        switch (idx) {
            case 1:
                this.groupType = 'A';break;
            case 2:
                this.groupType = 'B';break;
            case 3:
                this.groupType = 'C';break;
        }
        this.commonService.httpGet({
            url:this.commonService.baseUrl+'/user/wxstore/qrcode',
            data:{
                groupType:this.groupType,
                uid:this.commonService.user.uid,
                storeId:this.id
            }
        }).then(data=>{
            if(data.code==200){
                this.info = data.result;
            }else{
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }

    loadData(){
        this.commonService.httpGet({
            url:this.commonService.baseUrl+'/mall/store/info',
            data:{
                storeId:this.id
            }
        }).then(data=>{
            if(data.code==200){
                this.shopData = data.result;
                this.initShare(this.shopData);
            }else{
                //this.commonService.alert("系统提示",data.msg);
            }
        });
    }


}
