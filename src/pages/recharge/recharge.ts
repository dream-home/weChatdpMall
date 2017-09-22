import { Component } from '@angular/core';
import { CommonService } from '../../app/app.base';
import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

var rechargePage: any;
declare var wx;
@Component({
    selector: 'page-recharge',
    templateUrl: 'recharge.html'
})

export class RechargePage {

    payType:string = '2';
    score:string;
    orderNo:string;
    /*userId:string;
    returnUrl:string;
 	wxSingle:any;*/
    constructor(public navCtrl: NavController, private commonService: CommonService,public alertCtrl: AlertController) {
        rechargePage = this;
    }

    /*返回上一页*/
    goToBackPage(){
        this.navCtrl.pop();
    }

    /*提交数据*/
    submitData(){
        if(parseFloat(this.score)<1){
            this.commonService.toast("充值余额必须大于1积分");
            return;
        }
        if(this.validator()){
      		    /*1:支付宝,2:微信,*/

                this.commonService.httpPost({
                    url:this.commonService.baseUrl+'/wallet/recharge',
                    data:{
                        score:this.score,
                        source:this.payType,
                        scenes:1
                    }
                }).then(data=>{
                    if(data.code=='200'){
                        console.log(data.result);
                        this.orderNo = data.result.orderNo;
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
                                    rechargePage.commonService.toast("支付成功");
                                    rechargePage.paycallback();
                                } else {
                                    this.commonService.toast(res.errMsg);
                                }
                            },
                            cancel: function(res) {
                                //支付取消
                                this.commonService.toast('支付取消');
                            }
                        });

                    }else{
                        this.commonService.alert("系统提示",data.msg);
                    }
                });


        }

    }


    validator(){
        if(!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/).test(this.score)){
            this.commonService.toast("余额输入有误");
            return false;
        }
        if(parseFloat(this.score) >= 100000){
            this.commonService.toast("余额充值需小于100000");
            return false;
        }
        return true;
    }



    paycallback(){
        var temnum =0 ;
        this.commonService.showLoading("提交数据中。。。");
        let interval = setInterval(()=>{
            this.commonService.httpPost({
                url:this.commonService.baseUrl+'/wallet/query/wxChargeCallback',
                data:{
                    orderNo:this.orderNo
                }
            }).then(data=>{ 
                if(data.code==200){
                    clearInterval(interval);//移除对象
                    this.commonService.hideLoading();
                    this.showConfirm();
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
        },3000);
    }

    showConfirm() {
      let confirm = this.alertCtrl.create({
        title: '系统提示',
        message: '充值成功',
        enableBackdropDismiss:false,
        buttons: [
          {
            text: '确定',
            handler: () => {
              this.navCtrl.pop();
            }
          }
        ]
      });
      confirm.present();
    }
}
