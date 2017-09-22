import { Component } from '@angular/core';
import { CommonService } from '../../app/app.base';
import { NavController,ModalController } from 'ionic-angular';
import { SellerGoodsInfoPage } from '../sellerGoodsInfo/sellerGoodsInfo';
import { ReferralsPage } from '../referrals/referrals';
import { BuyGoodsPage } from '../buyGoods/buyGoods';
import { ViewImgPage } from '../viewImg/viewImg';
import { ShoppingCartPage } from '../shoppingCart/shoppingCart';
import { FmyPage } from '../fmy/fmy';
import { MyRedopenPage } from '../myRedopen/myRedopen';
import { StoreNotExistentPage } from '../storeNotExistent/storeNotExistent';
declare var wx;
var homepage:any;
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

    id:string;
    pet:string = "all";
    shopData:any;
    shopImages:any;
    items:any;
    icons:any;
    inviteCode:string = "";
    showCodePanel:boolean = false;
    showScroll:boolean=false;
    pageNo:number;
    showBack:boolean = false;
    showShare:boolean = false;//显示分享提示

    userCarts:any = [];
    myuserCarts ={
        cartsMoney:0,
        shopData:{}
    };
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
        businessSendEp:''
    };
    /*底下购物车信息*/
    ShoppingCart = {
      goodsNum:0,
      goodsAllPrice:0,
      goodsAllMoney:0,
      goodsAllEp:0
    }
    constructor(
        public navCtrl: NavController,
        private commonService: CommonService,
        public modalCtrl: ModalController
    ) {
        homepage = this;
        this.id = this.commonService.shopID;
        this.pageNo = 1;
        this.loadData(false);
        this.loadShopImages();
        if(this.commonService.token!=null && this.commonService.token!=''){
            //加载是否显示红包
            this.loadRedInfo();
        }
        this.sharesign();
    }
    /*页面事件*/
    ionViewWillEnter(){
        let data = localStorage.getItem(this.id);
        if(data != null && data != '' && data != 'null'){
            this.myShopGoodData = JSON.parse(data);
            if(this.myShopGoodData!=null && this.myShopGoodData.myShopGoods.length >0){
                this.myShopGoods = this.myShopGoodData.myShopGoods;
                this.saveMyGoodsData();
                this.pageNo = 1;
                this.loadGoodsLis();
            }else{
                this.pageNo = 1;
                this.loadGoodsLis();
            }
        }else{
            this.pageNo = 1;
            this.loadData(false);

        }
    }

    //显示分享
    showSharePrompt(idx){
        if(idx == '1'){
            this.showShare = true;
        }else{
            this.showShare = false;
        }
    }
    goPayForGoods(){
        if(this.commonService.token==null){
            this.navCtrl.push(ReferralsPage);
        }else{
            if(this.ShoppingCart.goodsAllPrice > 99999){
                this.commonService.toast("总金额不能超过99999");
            }else{
                this.navCtrl.push(BuyGoodsPage,{storeId:this.shopData.id});
            }
        }
    }

    /*返回上一页*/
    goToBackPage(){
        this.navCtrl.pop();
    }

    showImg(path){
        let modal = this.modalCtrl.create(ViewImgPage, {imgStr:path});
        modal.present();
    }

    loadData(showMsg){
        this.commonService.httpGet({
            url:this.commonService.baseUrl+'/mall/store/info',
            data:{
                storeId:this.id
            }
        }).then(data=>{
            if(data.code==200){
                this.loadGoodsLis();
                this.shopData = data.result;
                this.showCodePanel = false;
                // sessionStorage.setItem(this.id,this.inviteCode);
                this.initShare(this.shopData);
            }else if(data.code == 3){
                if(showMsg){
                    this.commonService.toast(data.msg);
                }
                this.showCodePanel =true;
            }else{
                this.navCtrl.push(StoreNotExistentPage);
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }

    /*查询店铺图片*/
    loadShopImages(){
        this.commonService.httpGet({
            url:this.commonService.baseUrl+'/mall/store/icons',
            data:{
                id:this.id,
                type:3
            }
        }).then(data=>{
            if(data.code=='200'){
                this.shopImages = data.result;
            }else{
                this.commonService.alert("系统提示",data.msg);
            }
            this.showBack = true;
        });
    }

    loadGoodsLis(){
        this.commonService.httpGet({
            url:this.commonService.baseUrl+'/mall/store/goods/page',
            data:{
                storeId:this.id,
                pageNo:this.pageNo,
                pageSize:this.commonService.pageSize
            }
        }).then(data=>{
            if(data.code==200){
                this.showScroll = true;
                this.items = data.result != null ? data.result.rows : null;
                for (var i = 0; i < this.items.length; i++){
                    if (this.myShopGoods[i] != null) {
                        let goodsnum = this.myShopGoods[i].num;
                        this.myShopGood = this.items[i];
                        if(this.items[i].stock=='0'){
                            this.myShopGood.num = 0;
                        }else{
                            if(this.items[i].stock*1<goodsnum && this.items[i].stock*1>0){
                                this.myShopGood.num = this.items[i].stock*1;
                            }else{
                                this.myShopGood.num = goodsnum;
                            }

                        }

                        this.myShopGoods[i] = this.myShopGood;
                    }else{
                        //alert(this.myShopGood);
                        this.myShopGood = this.items[i];
                        this.myShopGood.num = 0;
                        this.myShopGoods[i] = this.myShopGood;
                    }
                }
                this.saveMyGoodsData();
            }else{
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }

    /*移除商品*/
    numRemove(ev,numRe){
        ev.stopPropagation();
        if(this.commonService.token==null){
            this.navCtrl.push(ReferralsPage);
        }else{
            if(this.myShopGoods[numRe].num == 0 || this.myShopGoods[numRe].num < 0){

            }else{
                this.myShopGoods[numRe].num=this.myShopGoods[numRe].num- 1
            }
            this.saveMyGoodsData();
        }
    }

    /*添加商品*/
    numAdd(ev,numAd){
        ev.stopPropagation();
        if(this.commonService.token==null){
            this.navCtrl.push(ReferralsPage);
        }else if(this.myShopGoods[numAd].num >= this.myShopGoods[numAd].stock){
            this.commonService.toast("该商品库存不足");
        }else{
            if(this.ShoppingCart.goodsAllPrice > 99999){
                this.commonService.toast("总金额不能超过99999");
            }else{
                this.myShopGoods[numAd].num = this.myShopGoods[numAd].num + 1;
            }
            this.saveMyGoodsData();
        }
    }

    stopPropagation(ev){
        ev.stopPropagation();
    }

    // 跳转到购物车页面
    gotoShoppingCart(){
      if(this.commonService.token==null){
          this.navCtrl.push(ReferralsPage);
      }else{
        this.navCtrl.push(ShoppingCartPage,{storeId:this.shopData.id});
      }
    }

    /*商品详情*/
    showGoodsInfo(id,tp){
        this.navCtrl.push(SellerGoodsInfoPage,{goodsId:id,pageType:tp,storeId:this.shopData.id});
    }

    /*跳转到用户中心*/
    gotoUserCenter(){
        this.navCtrl.push(FmyPage);
    }

    /*取消*/
    removeCollection(id){
        if(this.commonService.token==null){
            this.navCtrl.push(ReferralsPage);
        }else{
            this.commonService.httpGet({
                url:this.commonService.baseUrl+'/store/collect/cancel',
                data:{
                    storeId:this.id
                }
            }).then(data=>{
                if(data.code==200){
                    this.shopData.isCollect = 0;
                    this.commonService.toast("已取消店铺收藏");
                }else{
                    this.commonService.alert("系统提示",data.msg);
                }
            });
        }
    }

    doInfinite(infiniteScroll) {
        this.pageNo++;
        this.commonService.httpLoad({
            url:this.commonService.baseUrl+'/mall/store/goods/page',
            data:{
                storeId:this.id,
                pageNo:this.pageNo,
                pageSize:this.commonService.pageSize
            }
        }).then(data=>{
            infiniteScroll.complete();
            if(data.code==200){
                let tdata = data.result.rows;
                this.showScroll =(eval(tdata).length==this.commonService.pageSize);
                if(this.items!=null){
                    for(var o in tdata){
                        this.items.push(tdata[o]);
                    }

                    for(var i=0;i<this.items.length;i++){
                        if(this.myShopGoods[i]!=null){
                            let goodsnum = this.myShopGoods[i].num;
                            this.myShopGood = this.items[i];
                            this.myShopGood.num = goodsnum;
                            this.myShopGoods[i] = this.myShopGood;
  /*                            console.log(this.myShopGoods[i].name+"  ----   "+this.myShopGoods[i].num);*/
                        }else{
                          //alert(this.myShopGood);
                            this.myShopGood = this.items[i];
                            this.myShopGood.num = 0;
                            this.myShopGoods[i] = this.myShopGood;
                        }

                    }
                }

                this.saveMyGoodsData();
            }else{
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }
    /*保存购物车商品信息*/
    saveMyGoodsData(){
        if(this.shopData!=null){
            this.myShopGoodData.storeId = this.shopData.id;
            this.myShopGoodData.myShopGoods = this.myShopGoods;
        }
        let goodsnum = 0;
        let goodsprice = 0;
        let goodsmoney = 0;
        let goodsep = 0;
        let gnum = 0;

        for(let goods in this.myShopGoodData.myShopGoods){
              if(this.myShopGoodData.myShopGoods[goods].num*1>0){
                  gnum = this.myShopGoodData.myShopGoods[goods].num*1;
                  goodsnum = goodsnum+gnum;
                  goodsprice = goodsprice + this.myShopGoodData.myShopGoods[goods].price*1*gnum;
                  goodsmoney = goodsmoney + this.myShopGoodData.myShopGoods[goods].originalPrice*1*gnum;
                  goodsep = goodsep + this.myShopGoodData.myShopGoods[goods].businessSendEp*1*gnum;
              }
        }
        this.ShoppingCart.goodsNum = goodsnum;
        this.ShoppingCart.goodsAllPrice = goodsprice;
        this.ShoppingCart.goodsAllMoney = goodsmoney;
        this.ShoppingCart.goodsAllEp = goodsep;
        if(this.shopData!=null&&this.commonService.token!=null){
            localStorage.setItem(this.shopData.id,JSON.stringify(this.myShopGoodData));
            let usercart = localStorage.getItem(this.commonService.user.id);
            if(usercart!=null && usercart!='' && usercart!='null'){
                this.userCarts = JSON.parse(usercart);
                var hasShop = 0;
                for(var i=0;i<this.userCarts.length;i++){
                    // console.log("店铺id ---》》》 "+this.userCarts[i].shopData.id+"店铺 名称 ====》》》 "+this.userCarts[i].shopData.storeName);
                    if(this.userCarts[i].shopData.id==this.shopData.id){
                        this.myuserCarts.cartsMoney = this.ShoppingCart.goodsAllPrice;
                        this.myuserCarts.shopData = this.shopData;
                        this.userCarts[i] = this.myuserCarts;
                        hasShop=hasShop+1;
                    }
                }
                if(hasShop==0){
                    this.myuserCarts.cartsMoney = this.ShoppingCart.goodsAllPrice;
                    this.myuserCarts.shopData = this.shopData;
                    this.userCarts.push(this.myuserCarts);
                }
            }else{
                this.myuserCarts.cartsMoney = this.ShoppingCart.goodsAllPrice;
                this.myuserCarts.shopData = this.shopData;
                this.userCarts.push(this.myuserCarts);
            }
            localStorage.setItem(this.commonService.user.id,JSON.stringify(this.userCarts));
            // userCarts
        }


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
            }else if(data.code=='-1'){

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
                    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                    appId: data.result.appId, // 必填，公众号的唯一标识
                    timestamp: data.result.timestamp, // 必填，生成签名的时间戳
                    nonceStr: data.result.nonceStr, // 必填，生成签名的随机串
                    signature: data.result.signature,// 必填，签名，见附录1
                    jsApiList: ['onMenuShareAppMessage','onMenuShareTimeline','chooseWXPay'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                });
                this.checkJsApi();
                if(this.shopData!=null){
                    this.initShare(this.shopData);
                }
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
                    if(homepage.shopData!=null){
                        homepage.initShare(homepage.shopData);
                    }
                    // 以键值对的形式返回，可用的api值true，不可用为false
                    // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
                }
            });
        });
    }

    initShare(item){
        wx.onMenuShareAppMessage({//分享到微信朋友
             title: item.storeName, // 分享标题
             link: this.commonService.baseWXUrl+'/user/wdtransition?index=Store&uid='+this.commonService.user.uid+'&storeId='+this.id,  // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
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
          link: this.commonService.baseWXUrl+'/user/wdtransition?index=Store&uid='+this.commonService.user.uid+'&storeId='+this.id,  // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
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

}
