import { Component } from '@angular/core';
import { CommonService } from '../../app/app.base';
import { NavController ,NavParams,AlertController} from 'ionic-angular';
var orderInfoPage: any;
declare var wx;
@Component({
    selector: 'page-orderInfo',
    templateUrl: 'orderInfo.html'
})

export class OrderInfoPage {

    orderNo:string;
    info:any;
    allPrice: number = 0;
    source: string = "3";
    isShowPayPw: boolean = false;
    myScore: number;
    myEP: number;
    payPwd: string = '';
    discountBoolean:boolean = false;
    onePayWay:boolean=false;//是否只能余额支付,在EP抵用券设置为100时
    /*商品订单的 ep折扣对象*/
    orderGoodsEp:any;
    //是否需要回调
    WechatCallback:boolean = false;
    isDisable:boolean=false;//余额支付确定按钮点击后禁用，防止连点促发事件
    submitDisabled:boolean=false;//立即付款按钮点击后禁用，防止连点促发事件
    noPay:boolean = false;//订单不存在或者下架时不可支付
    constructor(public navCtrl: NavController, private commonService: CommonService,private navParams: NavParams,public alertCtrl: AlertController) {
        orderInfoPage = this;
        this.orderNo =this.navParams.get("orderNo");
        this.commonService.httpLoad({
            url: this.commonService.baseUrl + '/user/score',
            data: {
            }
        }).then(data => {
            if (data.code == '200') {
                this.myScore = data.result.score;
                this.myEP = data.result.exchangeEP;
            }
        });
        this.loadData();
        this.getPurchasingep();
    }

      /*页面事件*/
    ionViewWillEnter(){
        this.submitDisabled=false;
        this.orderNo =this.navParams.get("orderNo");
    }



    /*返回上一页*/
    goToBackPage(){
        if(this.isShowPayPw){
            this.isShowPayPw = false;
            this.submitDisabled=false;
        }else{
            this.navCtrl.pop();
        }
    }

/*进入店铺*/
    gotoShop(id){
        /*let inviteCode = sessionStorage.getItem(id);*/
    }

    loadData(){
        this.commonService.httpGet({/* /user/store/order/info*/
            url:this.commonService.baseUrl+'/order/orderdetail',
            data:{
                orderNo:this.orderNo
            }
        }).then(data=>{
            if(data.code==200){
                this.info = data.result;
                for(var index in this.info.orderlist){
                    this.allPrice = this.allPrice+ this.info.orderlist[index].price*this.info.orderlist[index].num;
                }
                var date = new Date();
                var nowdate = date.getTime();
                var orderdate = data.result.createTime;
                var datecha = (nowdate-orderdate);
                console.log(" nowdate "+nowdate+" orderdate "+orderdate+"  --  "+(nowdate-orderdate));
                if(datecha>7200000){
                    this.noPay = true;
                }
            }else if(data.code==1){
                let alert = this.alertCtrl.create({
                    title: "系统提示",
                    subTitle: data.msg,
                    buttons: [{
                    text: '确认',
                    role: 'cancel',
                    handler: data => {
                        this.navCtrl.pop();
                    }
                  }]
                });
                alert.present();
            }else{
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }
    /*获取订单商品的ep优惠值*/
    getPurchasingep(){
        this.commonService.httpPost({
            url:this.commonService.baseUrl+'/order/purchasingep',
            data:{
                orderNo:this.orderNo
            }
        }).then(data=>{
            if(data.code==200){
                this.orderGoodsEp = data.result;
            }else if(data.code==2||data.code==3){
                this.noPay = true;
                let alert = this.alertCtrl.create({
                    title: "系统提示",
                    subTitle: data.msg,
                    buttons: [{
                    text: '确认',
                    role: 'cancel',
                    handler: data => {
                        // this.navCtrl.pop();
                    }
                  }]
                });
                alert.present();
            }else{
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }

    orderCancel(){
        this.commonService.httpGet({
            url:this.commonService.baseUrl+'/order/ordercancle',
            data:{
                orderNo:this.orderNo

            }
        }).then(data=>{
            if(data.code==200){
                this.commonService.toast('取消订单成功');
                this.navCtrl.pop();
            }else{
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }

    orderPay(){
        let discountEP;
        if(this.discountBoolean){
            discountEP=(this.orderGoodsEp.totalDiscountEp>this.myEP?this.myEP:this.orderGoodsEp.totalDiscountEp);
        }else{
            discountEP = 0;
        }
        if (this.source == '3' && this.isShowPayPw == false) {
            if (this.info.price * 1 > this.myScore) {
                this.commonService.toast('您的余额不足');
            } else {
                this.isShowPayPw = true;
                this.isDisable=false;
            }
            return;
        }

         this.submitDisabled=true;

	     this.isDisable=true;

	         this.commonService.httpPost({
	            url: this.commonService.baseUrl + "/order/purchasing",
	            data: {
	                orderNo: this.orderNo,
	                source: this.source,
	                payPwd: this.payPwd,
	                discountEP:discountEP,
	                scenes:1
	            }
	         }).then(data => {
	            if (data.code == 200) {
	                if (this.source == '2') {//微信
	                    this.orderNo = data.result.orderNo;
	                  	wx.chooseWXPay({
	                        appId:data.result.appid,     //公众号名称，由商户传入
	                        timestamp: data.result.timestamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
	                        nonceStr: data.result.noncestr, // 支付签名随机串，不长于 32 位
	                        package: data.result.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
	                        signType: 'MD5', // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
	                        paySign: data.result.sign, // 支付签名
	                        success: function(res) {
	                            // 支付成功后的回调函数
	                            if (res.errMsg == "chooseWXPay:ok") {
	                                //支付成功
	                               	orderInfoPage.buyCompleted(); //支付回调
	                            } else {
	                                orderInfoPage.commonService.toast(res.errMsg);
	                            }
	                        },
	                        cancel: function(res) {
	                            //支付取消

	                            this.commonService.toast('支付取消');
	                        }
	                    });
	                    let interval = setInterval(()=>{
	                      this.submitDisabled=false;clearInterval(interval);//移除对象
	                    },2000);
	                    this.WechatCallback = true;

	                } else if (this.source == '3') {//余额
	                    this.goToBackPage();
	                    this.goToBackPage();
	                    this.commonService.toast("购买商品成功");
	                }
	            } else {
	                this.isDisable=false;
	                this.submitDisabled=false;
	                this.commonService.alert("系统提示",data.msg);
	            }
	        });


    }

    /*是否使用EP兑换券*/
    epDiscount(){
        if(this.discountBoolean){
            this.discountBoolean = false;
            this.onePayWay = false;
        }else{
            this.discountBoolean = true;
            if((this.orderGoodsEp.originalPrice-(this.orderGoodsEp.totalDiscountEp>this.myEP?this.myEP:this.orderGoodsEp.totalDiscountEp))  <=0){
                this.onePayWay = true;
                this.source = '3'
            }
        }
    }
    buyCompleted(){
        // this.commonService.alert("系统提示","进行回调orderNo  "+this.orderNo);
        // this.commonService.httpGet({
        //     url:this.commonService.baseUrl+'/wallet/isPaySuccess',
        //     data:{
        //         orderNo:this.orderNo
        //     }
        // }).then(data=>{
        //     if(data.code==200){
        //         this.commonService.alert("系统提示","支付成功");
        //         this.goToBackPage();
        //     }else{
        //         this.commonService.alert("系统提示","isPaySuccess "+"   "+this.orderNo+"  "+data.msg);
        //     }
        // });
        var temnum =0 ;
        this.commonService.showLoading("提交数据中。。。");
        // alert("weixinhuidiao"+this.orderNo);
        let interval = setInterval(()=>{
            this.commonService.httpPost({
                url:this.commonService.baseUrl+'/order/wxapporder',
                data:{
                    orderNo:this.orderNo
                }
            }).then(data=>{
                if(data.code==200){
                    clearInterval(interval);//移除对象
                    this.commonService.hideLoading();
                    this.commonService.toast("购买商品成功");
                    this.goToBackPage();
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
    /*支付方式*/
    changeSource(sourceId) {
        this.source = sourceId;
    }



}
