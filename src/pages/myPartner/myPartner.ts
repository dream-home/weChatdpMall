import { Component } from '@angular/core';
import { CommonService } from '../../app/app.base';
import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

var myPartnerPage: any;
declare var wx;
@Component({
    selector: 'page-myPartner',
    templateUrl: 'myPartner.html'
})
export class MyPartnerPage {
    signlist:any;
    mypartnerInfo:any;
    showPay:boolean = false;
    isShowPayPw:boolean = false;
    source:string = "3";
    myScore:number;
    myEP:number;
    payScore:number = 0;
    payPwd:string='';
    orderNo:string;
    payTime:string;
    showScroll:boolean=true;
    //是否需要回调
    isDisable:boolean=false;//余额支付确定按钮点击后禁用，防止连点促发事件
    submitDisabled:boolean=false;//确定支付按钮点击后禁用，防止连点促发事件

    //是否EP折扣
    isdiscountEP:boolean = false;
    discountEPNum:number;//可抵扣EP数量
    discountEP:number;//ep抵扣数
    constructor(
        public navCtrl: NavController,
        private commonService: CommonService,
        public alertCtrl: AlertController
    ) {
        myPartnerPage = this;
        this.commonService.loadParam();
        this.commonService.httpLoad({
             url:this.commonService.baseUrl+'/user/score',
             data:{
             }
         }).then(data=>{
             if(data.code=='200'){
               this.myScore = data.result.score;
               this.myEP = data.result.exchangeEP;
               this.payScore = this.commonService.params.joinEp;
               this.discountEPNum = this.commonService.toDecimal(this.payScore * (1-(this.commonService.params.joinRmbScale/100)));
               console.log("-------this.myEP "+this.myEP+"    "+this.payScore * (1-(this.commonService.params.joinRmbScale/100)))
               this.discountEP = this.commonService.toDecimal(this.myEP>=this.discountEPNum?this.discountEPNum:this.myEP);
             }
         });
    }

    /*页面事件*/
    ionViewWillEnter(){
        this.submitDisabled=false;
        this.loadMypartnerInfo();
        this.loadSignList();
    }





    /*返回上一页*/
    goToBackPage(){
        if(this.showPay || this.isShowPayPw){
            this.showPay = false;
            this.isShowPayPw = false;
        }else{
            this.navCtrl.pop();
        }
    }

    changeSource(sourceId){
        this.source = sourceId;
    }

    //提交加入合伙人支付方式
    submitPay(){
        if(this.isdiscountEP){
            if(this.discountEP<=0){
                this.commonService.toast('请输入抵扣的EP');
                return;
            }
            if(this.discountEP*1 > this.myEP*1){
                this.commonService.toast('您的EP余额不足');
                return;
            }
            if(this.discountEP*1 > this.discountEPNum*1){
                this.commonService.toast('EP抵扣不能大于'+this.commonService.toDecimal(this.discountEPNum)+"EP");
                return;
            }
        }
        this.payScore = this.commonService.params.joinEp;
        if(this.source == '3'){
            if(this.payScore > this.myScore){
                this.commonService.toast('您的余额不足');
            }else{
                this.showPay = false;
                this.isShowPayPw = true;
                this.isDisable=false;
            }
        }else{
            this.partnerPay();
        }
    }

    //加入合伙人支付
    partnerPay(){
        this.submitDisabled=true;
        let interval = setInterval(()=>{
          this.submitDisabled=false;clearInterval(interval);//移除对象
        },3000);
        this.commonService.httpPost({
            url:this.commonService.baseUrl+'/join/partnerorder',
            data:{
              payPwd:this.payPwd,
              score:this.payScore,
              source:this.source,
              discountEP:this.isdiscountEP?this.discountEP:0
            }
          }).then(data=>{
              if(data.code==200){
                  if(this.source == '2'){//微信
                    console.log(data.result);
                    this.orderNo = data.result.orderNo;
                    this.payTime = data.result.payTime;
                    wx.chooseWXPay({
                        appId:data.result.generate.appid,     //公众号名称，由商户传入
                        timestamp: data.result.generate.timestamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                        nonceStr: data.result.generate.noncestr, // 支付签名随机串，不长于 32 位
                        package: data.result.generate.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
                        signType: 'MD5', // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                        paySign: data.result.generate.sign, // 支付签名
                        success: function(res) {
                            // 支付成功后的回调函数
                            if (res.errMsg == "chooseWXPay:ok") {
                                //支付成功
                                myPartnerPage.commonService.toast("支付成功");
                               	myPartnerPage.buyCompleted(); //支付回调
                            } else {
                                this.commonService.toast(res.errMsg);
                            }
                        },
                        cancel: function(res) {
                            //支付取消

                            this.commonService.toast('支付取消');
                        }
                    });
                  }else if(this.source == '3'){//余额
                      this.commonService.toast("加入合伙人成功");
                      this.mypartnerInfo.btnstate==3

                      this.goToBackPage();
                      this.loadMypartnerInfo();
                      this.loadSignList();
                  }
              }else{
                  this.commonService.alert("系统提示",data.msg);
                  this.isDisable=false;
                  this.submitDisabled=false;
              }
          });

    }

    //微信回调
    buyCompleted(){
        var temnum =0 ;
        this.commonService.showLoading("提交数据中。。。");
        let interval = setInterval(()=>{
            this.commonService.httpPost({
                url:this.commonService.baseUrl+'/join/query/wxjoinorder',
                data:{
                    orderNo:this.orderNo
                }
            }).then(data=>{
                if(data.code==200){
                    clearInterval(interval);//移除对象
                    this.commonService.hideLoading();
                    let toast = this.commonService.toast("支付成功");
                    this.goToBackPage();
                    this.goToBackPage();
                    this.loadMypartnerInfo();
                    this.loadSignList();
                }else{
                    if(temnum==2){
                        this.commonService.alert("系统提示",data.msg);
                    }
                }
            });
            temnum =temnum+1;
            if(temnum==3){
                this.commonService.hideLoading();
                clearInterval(interval);//移除对象
            }
        },2000);

    }

    /*我的合伙人获取签到积分列表*/
    loadSignList(){
        this.commonService.httpGet({
            url:this.commonService.baseUrl+'/sign/signlist',
            data:{
            }
        }).then(data=>{
            if(data.code=='200'){
                this.signlist = data.result.rows;
            }else{
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }

    doInfinite(infiniteScroll) {
        setTimeout(() => {
            this.commonService.httpLoad({
                url:this.commonService.baseUrl+"/sign/signlist",
                data:{}
            }).then(data=>{
                infiniteScroll.complete();
                if(data.code==200){
                    let tdata = data.result.rows;
                    this.showScroll =(eval(tdata).length==this.commonService.pageSize);
                }else{
                    this.commonService.alert("系统提示",data.msg);
                }
            });
        }, 500);
    }

    /*我的合伙人加入合伙人*/
    JoinParten(){
        this.commonService.httpPost({
            url:this.commonService.baseUrl+'/user/mypartner/join',
            data:{
            }
        }).then(data=>{
            if(data.code==200){
                this.loadMypartnerInfo();
                this.loadSignList();
                this.commonService.alert("系统提示",data.msg);
            }else{

                if(data.msg.indexOf('EP不足')){
                    let confirm = this.alertCtrl.create({
                      title: '系统提示',
                      message: '您的EP不足，暂时无法加入合伙人。是否跳到支付页面',
                      enableBackdropDismiss:false,
                      buttons: [
                        {
                          text: '确定',
                          handler: () => {
                              this.showPay = true;
                          }
                        },
                        {
                          text: '取消',
                          handler: () => {

                          }
                        }
                      ]
                    });
                    confirm.present();
                }else{
                    this.commonService.toast(data.msg);
                }

            }
        });
    }

    showConfirm() {
      let confirm = this.alertCtrl.create({
        title: '系统提示',
        message: '是否要加入合伙人?',
        enableBackdropDismiss:false,
        buttons: [
          {
            text: '确定',
            handler: () => {
                this.JoinParten();
            }
          },
          {
            text: '取消',
            handler: () => {

            }
          }
        ]
      });
      confirm.present();
    }

    /*我的合伙人获取信息*/
    loadMypartnerInfo(){
        this.commonService.httpGet({
            url:this.commonService.baseUrl+'/user/mypartner/partnerinfo',
            data:{
            }
        }).then(data=>{
            if(data.code=='200'){
                this.mypartnerInfo = data.result;
            }else{
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }

    /*签到*/
    public signedIn(){
        this.commonService.httpGet({
            url:this.commonService.baseUrl+'/user/signIn',
            data:{
            }
        }).then(data=>{
            if(data.code=='200'){
                if(data.result != null){
                    this.commonService.alert("签到成功","已签到"+data.result.signCount+"次,获得"+data.result.signEP+"余额");
                }
                this.loadMypartnerInfo();
                this.loadSignList();
            }else{
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }

}
