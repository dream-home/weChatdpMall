import { Component } from '@angular/core';
import { CommonService } from '../../app/app.base';
import { NavController,NavParams } from 'ionic-angular';
import { PayPwSettingPage } from '../payPwSetting/payPwSetting';
import { DeliveryAddressPage } from '../deliveryAddress/deliveryAddress';
declare var wx;
var buyGoodsPage: any;
@Component({
    selector: 'page-buyGoods',
    templateUrl: 'buyGoods.html'
})
export class BuyGoodsPage {

    goodsInfo: any;
    payPwd:string='';
    toUrl:string;
    discountBoolean:boolean = false;
    scorebuy:number;
    goodId:string;
    type:string;
    orderNo:string;
    num:number;
    storeName:string;
    originalPrice:number;
    businessSendEp:number;
    myScore:number;
    myEP:number;
    source:string = "3";
    payTime:string;
    isShowPayPw:boolean = false;
    userData={
        name:'',
        phone:'',
        addr:'',
        province: '',
        city: '',
        county: ''
    };

    isDisable:boolean=false;//余额支付确定按钮点击后禁用，防止连点
    submitDisabled:boolean=false;//点击提交订单按钮禁用该按钮，防止连点

    /*用于全局保存用户在购物车里面的信息*/
    myShopGoodData = {
        storeId:'',
        myShopGoods:[]
    };
    /*购物车里面的商品数组*/
    myShopGoods:any = [];
    /*购物车里面的商品信息*/
    myShopGood = {
        id:'',
        num:0,
        icon:'',
        name:'',
        price:'',
        originalPrice:'',
        businessSendEp:'',
        discountEP:''
    };
    /*底下购物车信息*/
    ShoppingCart = {
      goodsNum:0,
      goodsAllPrice:0,
      goodsAllMoney:0,
      goodsAllEp:0,
      discountEP:0
    }
    /*订单商品数据对象*/
    carGood = {
        goodsId:'',
        num:0,
        discountEP:0
    }
    carGoods:any = [];
    shopId:string;
    epDiscountAmount:string="2";
    onePayWay:boolean=false;//是否只能余额支付,在EP抵用券设置为100时
    /*ep折扣总费用*/
    epDiscountNum:number;
    MyUserAddr:any;//收货地址信息
    constructor(
        public navCtrl: NavController,
        private commonService: CommonService,
        private navParams: NavParams
    ) {
        buyGoodsPage = this;
        this.goodId = navParams.get('goodsId');

        this.scorebuy = navParams.get('scorebuy');
        this.type = navParams.get('type');
        this.orderNo = navParams.get('orderNo');
        this.num = navParams.get('num');
        this.storeName = navParams.get('storeName');
        this.originalPrice = navParams.get('originalPrice');
        this.businessSendEp = navParams.get('businessSendEp');
        this.loadAddress();

        this.userData.phone = commonService.user.phone;
        this.userData.name = commonService.user.userName;

        if(this.type=='1001'){
          this.toUrl=this.commonService.baseUrl+'/mall/store/goods/purchase';
        }else if(this.type=='1002'){
          this.toUrl=this.commonService.baseUrl+'/mall/goods/purchase';
        }else if(this.type=='1003'){
          this.toUrl=this.commonService.baseUrl+'/user/goods/win/buy';
        }else if(this.type=='1004'){
          this.toUrl=this.commonService.baseUrl+'/mall/goods/epexchange';
        }

        this.commonService.httpLoad({
             url:this.commonService.baseUrl+'/user/score',
             data:{
             }
         }).then(data=>{
             if(data.code=='200'){
                  this.myScore = data.result.score;
                  this.myEP = data.result.exchangeEP;
             }
         });

    }

    /*是否使用EP兑换券*/
    epDiscount(){
        if(this.discountBoolean){
            this.discountBoolean = false;
            this.onePayWay=false;
            this.saveMyGoodsData();
        }else{
            this.discountBoolean = true;
            this.saveMyGoodsData();
            if(this.ShoppingCart.goodsAllPrice==this.epDiscountNum){
                this.onePayWay=true;
                this.source='3';
            }
        }
    }

    /*页面事件*/
    ionViewWillEnter(){
        this.submitDisabled=false;
        this.shopId = this.navParams.get("storeId");
        let data = localStorage.getItem(this.shopId);
        let goodinfo = this.navParams.get('goodsInfo');
        if(this.shopId != '' && this.shopId !=null){
            if(data != null && data != '' && data != 'null'){
                console.log("data"+data);
                this.myShopGoodData = JSON.parse(data);
                if(this.myShopGoodData!=null){
                    this.myShopGoods = this.myShopGoodData.myShopGoods;
                    this.saveMyGoodsData();
                }
            }
        }else{
            if(goodinfo != '' && goodinfo != null){
                this.myShopGood = JSON.parse(goodinfo);
                this.myShopGood.num = 1;
                this.myShopGoods[0]=this.myShopGood;
                this.saveMyGoodsData();
            }
        }
        var myUserAddr = sessionStorage.getItem("BuyGoodsPage_MyUserAddr");
        if(myUserAddr!=null && myUserAddr!=''){
            this.MyUserAddr =JSON.parse(myUserAddr);
            sessionStorage.removeItem('BuyGoodsPage_MyUserAddr');
        }else{
            this.loadAddress();
        }
    }

    /*返回上一页*/
    goToBackPage(){
        if(this.isShowPayPw){
            this.isShowPayPw = false;
        }else{
            this.navCtrl.pop();
        }
    }

    changeSource(sourceId){
        this.source = sourceId;
    }

    stopPropagation(ev){
        ev.stopPropagation();
    }

    /*移除商品*/
    numRemove(ev,numRe){
        ev.stopPropagation();
        if(this.myShopGoods[numRe].num == 0 || this.myShopGoods[numRe].num < 0){

        }else{
            this.myShopGoods[numRe].num=this.myShopGoods[numRe].num- 1
        }
        this.saveMyGoodsData();
        if(this.ShoppingCart.goodsNum == 0){
            this.navCtrl.pop();
        }
        if(this.ShoppingCart.goodsAllPrice==this.epDiscountNum){
            this.onePayWay=true;
            this.source='3';
        }
    }
    /*添加商品*/
    numAdd(ev,numAd){
        ev.stopPropagation();
        if(this.myShopGoods[numAd].num >= this.myShopGoods[numAd].stock){
            this.commonService.toast("该商品库存不足");
        }else if(this.ShoppingCart.goodsAllPrice > 99999){
            this.commonService.toast("总金额不能超过99999");
        }else{
            this.myShopGoods[numAd].num = this.myShopGoods[numAd].num + 1;
        }
        this.saveMyGoodsData();
        if(this.ShoppingCart.goodsAllPrice==this.epDiscountNum){
            this.onePayWay=true;
            this.source='3';
        }
    }

    /*清空购物车*/
    clearCart(){
        for(let goods in this.myShopGoodData.myShopGoods){
            this.myShopGoodData.myShopGoods[goods].num = 0;
        }
        this.saveMyGoodsData();
    }

    /*初始化购物车信息*/
    saveMyGoodsData(){
        this.myShopGoodData.storeId = this.shopId;
        this.myShopGoodData.myShopGoods = this.myShopGoods;
        let goodsnum = 0;
        let goodsprice = 0;
        let goodsmoney = 0;
        let goodsep = 0;
        let gnum = 0;
        let goodsDiscount = 0;
        for(let goods in this.myShopGoodData.myShopGoods){
              //console.log(this.myShopGoodData.myShopGoods[goods]);
              if(this.myShopGoodData.myShopGoods[goods].num*1>0){
                  gnum = this.myShopGoodData.myShopGoods[goods].num*1;
                  goodsnum = goodsnum+gnum;
                  goodsprice = goodsprice + this.myShopGoodData.myShopGoods[goods].price*1*gnum;
                  goodsmoney = goodsmoney + this.myShopGoodData.myShopGoods[goods].originalPrice*1*gnum;
                  goodsep = goodsep + this.myShopGoodData.myShopGoods[goods].businessSendEp*1*gnum;
                  goodsDiscount = goodsDiscount + (this.myShopGoodData.myShopGoods[goods].discountEP*1/100)*this.myShopGoodData.myShopGoods[goods].price*1*gnum;
              }
        }
        this.num = goodsnum;
        this.ShoppingCart.goodsNum = goodsnum;
        this.ShoppingCart.goodsAllPrice = goodsprice;
        this.ShoppingCart.goodsAllMoney = goodsmoney;
        this.ShoppingCart.goodsAllEp = goodsep;
        this.ShoppingCart.discountEP = goodsDiscount;
        if(this.discountBoolean){
            if(this.ShoppingCart.discountEP>this.myEP){
                this.epDiscountNum = this.myEP;
                // this.ShoppingCart.goodsAllPrice = (this.ShoppingCart.goodsAllPrice - this.myEP);
            }else{
                this.epDiscountNum = this.ShoppingCart.discountEP;
                // this.ShoppingCart.goodsAllPrice = (this.ShoppingCart.goodsAllPrice - this.ShoppingCart.discountEP);
            }
        }else{
            this.epDiscountNum = 0;
        }
        console.log(goodsnum+" goodsprice "+goodsprice+" goodsmoney "+goodsmoney+" goodsep "+goodsep+" this.ShoppingCart "+this.ShoppingCart+" 折扣this.ShoppingCart.discountEP "+this.ShoppingCart.discountEP);
        if(this.shopId!='' && this.shopId!=null){
            localStorage.setItem(this.shopId,JSON.stringify(this.myShopGoodData));
        }
    }

    buyGoods(){
        if(this.validator() && this.source == '3'){
            if((this.scorebuy*1)*(this.num*1) > this.myScore*1){
                this.commonService.toast('您的余额不足');
            }else{
                this.isShowPayPw = true;
            }
        }
    }
    /*确认购买*/
    submitBuyGoods(){
        let tempAddr = this.MyUserAddr.province+this.MyUserAddr.city+this.MyUserAddr.county+this.MyUserAddr.addr;
        this.isDisable = true;
        this.commonService.httpPost({
            url:this.toUrl,
            data:{
                addr:tempAddr,
                goodsId:this.myShopGoods[0].id,
                num:this.myShopGoods[0].num,
                payPwd:this.payPwd,
                phone:this.MyUserAddr.receivePhone,
                userName:this.MyUserAddr.receiveName
            }
        }).then(data=>{
            if(data.code==200){
                this.commonService.toast("兑换商品成功");
                this.goToBackPage();
                this.goToBackPage();
            }else{
                this.isDisable = false;
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }
    /*购物车支付*/
    carPay(){
        if(!this.validator()){
            return;
        }
        if(this.type=='1004'){
          if(this.isShowPayPw == false){
              if(this.ShoppingCart.goodsAllPrice*1 > 99999){
                  this.commonService.toast('EP总金额不能超过99999');
              }else if(this.ShoppingCart.goodsAllPrice*1 > this.myEP){
                  this.commonService.toast('您的EP不足');
              }else{
                  this.isShowPayPw = true;
              }
              return;
          }
          this.submitBuyGoods();
        }else {
          if(this.ShoppingCart.goodsAllPrice > 99999){
              this.commonService.toast("总金额不能超过99999");
              return;
          }else if(this.source=='3' && this.isShowPayPw == false){
              if(this.ShoppingCart.goodsAllPrice*1 > this.myScore*1){
                  this.commonService.toast('您的余额不足');
              }else{
                  this.isShowPayPw = true;
                  this.isDisable=false;
              }
              return;
          }

          let tempAddr = this.MyUserAddr.province+this.MyUserAddr.city+this.MyUserAddr.county+this.MyUserAddr.addr;
          this.carGoods = [];
          for(var i =0 ; i<this.myShopGoods.length ; i++ ){
              this.carGood = {goodsId:'', num:0 ,discountEP:0};
              if(this.myShopGoods[i].num>0){
                  this.carGood.goodsId = this.myShopGoods[i].id;
                  this.carGood.num = this.myShopGoods[i].num;

                  if(this.discountBoolean){
                       this.carGood.discountEP = this.myShopGoods[i].discountEP;
                  }else{
                      this.carGood.discountEP = 0;
                  }
                  this.carGoods.push(this.carGood);
                  // alert(JSON.stringify(this.carGoods));
              }
          }
          this.submitDisabled=true;
          this.isDisable=true;
          this.commonService.httpPost({
              url:this.commonService.baseUrl+"/order/appPurchase",
              data:{
                  addr:tempAddr,
                  cartList:this.carGoods,
                  payPwd:this.payPwd,
                  payType:this.source,
                  phone:this.MyUserAddr.receivePhone,
                  scenes:1,
                  userName:this.MyUserAddr.receiveName
              }
          }).then(data=>{
              if(data.code==200){
                  if(this.source == '2'){//微信
                      this.payTime = data.result.payTime;
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
                                  buyGoodsPage.commonService.toast("支付成功");
                                  buyGoodsPage.buyCompleted();
                              } else {
                                  buyGoodsPage.commonService.toast(res.errMsg);
                              }
                          },
                          cancel: function(res) {
                              buyGoodsPage.clearCart();
                              buyGoodsPage.goToBackPage();
                              //支付取消
                              buyGoodsPage.commonService.toast('支付取消');
                          }
                      });
                        let interval = setInterval(()=>{
                          this.submitDisabled=false;clearInterval(interval);//移除对象
                        },2000);

                  }else if(this.source == '3'){//余额
                      this.clearCart();
                      this.isShowPayPw = false;
                      this.goToBackPage();
                      this.commonService.toast("购买商品成功");
                  }
              }else{

                  this.goToBackPage();
                  this.isDisable=false;
                  this.submitDisabled=false;
                  this.commonService.alert("系统提示",data.msg);
                  if(data.msg=="请先设置支付密码"){
                      this.navCtrl.push(PayPwSettingPage);
                  }else if(data.code == '3'){
                      this.payPwd='';
                  }else if(data.code != '3'){
                      this.clearCart();
                  }
              }
          });

      }
    }



    validator(){
        if(this.MyUserAddr == null || this.MyUserAddr == ''){
            this.commonService.toast("您还没有设置收货地址，暂时无法提交订单");
            return false;
        }
        if(this.num==null || this.num==0 || this.num<0){
            this.commonService.toast("商品数量不能小于1");
            return false;
        }
        if(this.MyUserAddr.receiveName==null || this.MyUserAddr.receiveName=='' || (/^\s+$/g).test(this.MyUserAddr.receiveName)){
            this.commonService.toast("联系人不能为空");
            return false;
        }

        if(!(/^1[34578]\d{9}$/).test(this.MyUserAddr.receivePhone) && this.MyUserAddr.receivePhone.length > 7){
            this.commonService.toast("收货人电话有误，请重填");
            return false;
        }
        if((/^\s+$/g).test(this.MyUserAddr.receivePhone)){
            this.commonService.toast("联系电话不能为空");
            return false;
        }
        return true;
    }

    buyCompleted(){
        var temnum =0 ;
        this.commonService.showLoading("提交数据中。。。");
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
                    this.clearCart();
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
        },2000);


    }

    gotoDeliveryAddress(urlId){
        this.navCtrl.push(DeliveryAddressPage,{fromId:urlId});
    }

    //获取收货地址
    loadAddress(){
        this.commonService.httpGet({
            url:this.commonService.baseUrl+'/address/getUserAddress',
            data:{}
        }).then(data=>{
            if(data.code==200){
                this.MyUserAddr = null;
                var userAddrs = data.result;
                if(userAddrs!=null && userAddrs.length>0){
                    for(var o in userAddrs){
                        if(userAddrs[o].isDefault*1  == 1){
                            this.MyUserAddr = userAddrs[o];
                        }
                    }
                    if(this.MyUserAddr==null || this.MyUserAddr ==''){
                        this.MyUserAddr = userAddrs[0];
                    }
                }
            }else{
                this.commonService.alert("系统提示",data.msg);
            }
        });
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
                    debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
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
