import { Component } from '@angular/core';
import { CommonService } from '../../app/app.base';
import { NavController ,ModalController} from 'ionic-angular';
import { ReferralsPage } from '../referrals/referrals';
import { IntegroWalletPage } from '../integroWallet/integroWallet';
import { MyContactsPage } from '../myContacts/myContacts';
import { SysSettingPage } from '../sysSetting/sysSetting';
import { UserInfoPage } from '../userInfo/userInfo';
import { ShareFriendPage } from '../shareFriend/shareFriend';
import { SellerOrderPage } from '../sellerOrder/sellerOrder';
import { MyPartnerPage } from '../myPartner/myPartner';
import { ScoreExchangePage } from '../scoreExchange/scoreExchange';
import { RechargePage } from '../recharge/recharge';
import { MyScorePage } from '../myScore/myScore';
import { MyEPPage } from '../myEP/myEP';
import { MyDouDouPage } from '../myDouDou/myDouDou';
import { MyRedopenPage } from '../myRedopen/myRedopen';
import { HomePage } from '../home/home';
declare var wx;
var fmyPage:any;
@Component({
  selector: 'page-fmy',
  templateUrl: 'fmy.html'
})
export class FmyPage {

    myScore:number;
    myEP:number;
    doudou:number;
    public score: number =0;
    myorderNum:any;
    myPending:number=0;//我的订单待付款
    myPayed:number=0;//我的订单待发货
    constructor(public navCtrl: NavController,public commonService: CommonService,
    public modalCtrl: ModalController) {
        fmyPage = this;
        this.sharesign();
    }

    /*页面事件*/
    ionViewWillEnter(){
        /**加载消息**/
        if(this.commonService.token != null && this.commonService.token!= ''){
            //加载数据
                 this.commonService.httpLoad({
                        url:this.commonService.baseUrl+'/order/orderNum',
                        data:{
                         status:""
                        }
                    }).then(data=>{
                        if(data.code=='200'){
                             this.myPending = data.result.pending;
                             this.myPayed = data.result.payed;

                        }
                    });
                 this.commonService.httpLoad({
                    url:this.commonService.baseUrl+'/order/orderNum',
                    data:{
                     status:"",
                     storeId:this.commonService.user.storeId
                    }
                }).then(data=>{
                    if(data.code=='200'){
                         this.myorderNum = data.result;
                    }
                });

             this.commonService.httpLoad({
                    url:this.commonService.baseUrl+'/user/score',
                    data:{
                    }
                }).then(data=>{
                    if(data.code=='200'){
                         this.myScore = data.result.score;
                         this.myEP = data.result.exchangeEP;
                         this.doudou = data.result.doudou;
                    }
                });
                if((localStorage.getItem(this.commonService.getTodayDate()+this.commonService.user.id)==null || localStorage.getItem(this.commonService.getTodayDate()+this.commonService.user.id)=="false")&&this.commonService.showOpenRed){
                    //加载是否显示红包
                    this.loadRedInfo();
                }
        }
        /**加载参数**/
        this.commonService.loadParam();
    }

    //加载签到红包信息
    loadRedInfo(){
        this.commonService.httpGet({
            url:this.commonService.baseUrl+'/sign/getSignInInfo',
            data:{}
        }).then(data=>{
            if(data.code=='200'){
                this.commonService.showOpenRed = false;
              if(data.result.isSignInByPartner==false){
                  if(data.result.isSignInByDoudou==true){
                      localStorage.setItem(this.commonService.getTodayDate()+this.commonService.user.id,"false");
                      let profileModal = this.modalCtrl.create(MyRedopenPage, {isSignInByDoudou: data.result.isSignInByDoudou,isSignInByPartner:data.result.isSignInByPartner});
                      profileModal.present();
                  }else{
                      localStorage.setItem(this.commonService.getTodayDate()+this.commonService.user.id,"true");
                  }
              }else{
                 localStorage.setItem(this.commonService.getTodayDate()+this.commonService.user.id,"false");
                 let profileModal = this.modalCtrl.create(MyRedopenPage, {isSignInByDoudou: data.result.isSignInByDoudou,isSignInByPartner:data.result.isSignInByPartner});
                 profileModal.present();
              }
            }else{
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }
    /*登录页面*/
    goToLoginPage(){
        this.navCtrl.push(ReferralsPage);
    }

     /*返回上一页*/
    goToBackPage(){
        this.navCtrl.push(HomePage);
    }
    /*用户信息*/
    gotoUserInfoPage(){
        if(this.commonService.token==null){
            this.goToLoginPage();
        }else{
            this.navCtrl.push(UserInfoPage);
        }
    }

    /*积分钱包页面*/
    gotoIntegroWalletPage(){
        if(this.commonService.token==null){
            this.goToLoginPage();
        }else{
            this.navCtrl.push(IntegroWalletPage);
        }
    }

    //跳转到我的余额页面
    gotoMyScorePage(){
        if(this.commonService.token==null){
            this.goToLoginPage();
        }else{
            this.navCtrl.push(MyScorePage);
        }
    }

    /*跳转到我的EP页面*/
    gotoMyEPPage(){
        if(this.commonService.token==null){
            this.goToLoginPage();
        }else{
            this.navCtrl.push(MyEPPage);
        }
    }

    /*跳转到我的斗斗页面*/
    gotoMyDouDouPage(){
        if(this.commonService.token==null){
            this.goToLoginPage();
        }else{
            this.navCtrl.push(MyDouDouPage);
        }
    }



    /*我的订单页面*/
    gotoMyOrderPage(index,name){
        if(this.commonService.token==null){
            this.goToLoginPage();
        }else{
            this.navCtrl.push(SellerOrderPage,{id:index,order:name});
        }
    }
    gotoMyOrderPage2(){
        if(this.commonService.token==null){
            this.goToLoginPage();
        }else{
            this.navCtrl.push(SellerOrderPage);

        }
    }
    /*我的人脉页面*/
    gotoMyContactsPage(){
        if(this.commonService.token==null){
            this.goToLoginPage();
        }else{
            this.navCtrl.push(MyContactsPage);
        }
    }
    /*合伙人*/
    gotoMyPartnerPage(){
        if(this.commonService.token==null){
            this.goToLoginPage();
        }else{
            this.navCtrl.push(MyPartnerPage);
        }
    }


    /*分享好友*/
    gotoShareFriendPage(){
        if(this.commonService.token==null){
            this.goToLoginPage();
        }else{
            this.navCtrl.push(ShareFriendPage);
        }
    }

    /*系统设置页面*/
    gotoSysSettingPage(){
        this.navCtrl.push(SysSettingPage);
    }

     /*充值余额*/
     recharge(){
         if(this.commonService.token==null){
             this.goToLoginPage();
         }else{
             this.navCtrl.push(RechargePage);
        }
    }
    /*积分兑换*/
     exchange(){
         if(this.commonService.token==null){
             this.goToLoginPage();
         }else{
            sessionStorage.setItem("score",this.myScore+"");
            this.navCtrl.push(ScoreExchangePage);
        }
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
            }else{
                this.commonService.alert("系统提示",data.msg);
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
                    // 以键值对的形式返回，可用的api值true，不可用为false
                    // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
                }
            });
        });
    }



}
