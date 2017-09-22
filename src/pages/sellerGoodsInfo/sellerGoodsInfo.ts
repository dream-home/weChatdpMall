import { Component } from '@angular/core';
import { CommonService } from '../../app/app.base';
import { NavController,NavParams,ModalController,ActionSheetController} from 'ionic-angular';
import { ReferralsPage } from '../referrals/referrals';
// import { SellerPayPage } from '../sellerPay/sellerPay';
import { BuyGoodsPage } from '../buyGoods/buyGoods';
import { ViewImgPage } from '../viewImg/viewImg';
import { ShoppingCartPage } from '../shoppingCart/shoppingCart';
declare var wx;
@Component({
  selector: 'page-sellerGoodsInfo',
  templateUrl: 'sellerGoodsInfo.html'
})
export class SellerGoodsInfoPage {

    id:string;
    shopData:any;
    inviteCode:string;
    goodsInfo:any;
    goodsImages:any;
    pet:string = "info";
    records:any;
    goodsId:string;
    showtype:string;
    pageType:number;
    GoodDetails=[];//商品详情
    shopAddr:string;
    showBack:boolean = false;
    showShare:boolean = false;//显示分享提示

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
    goodsIndex:number = -1;
    constructor(
        public navCtrl: NavController,
        private commonService: CommonService,
        public actionSheetCtrl: ActionSheetController,
        private navParams: NavParams,
        public modalCtrl: ModalController
    ) {
          this.goodsId = this.navParams.get("goodsId");
          this.showtype =this.navParams.get("showtype");
          this.pageType =this.navParams.get("pageType");
          this.loadGoodsInfo();
          this.loadGoodsImages();
          this.getDeailts(this.goodsId);
          this.sharesign();
    }

    /*页面事件*/
    ionViewWillEnter(){
        let shopId = this.navParams.get("storeId");
        let data = localStorage.getItem(shopId);
        if(data != null && data != '' && data != 'null'){
            this.myShopGoodData = JSON.parse(data);
            if(this.myShopGoodData!=null){

                this.myShopGoods = this.myShopGoodData.myShopGoods;
                for(var ind in this.myShopGoods){
                    if(this.myShopGoods[ind].id == this.goodsId){
                        this.myShopGood = this.myShopGoods[ind];
                        this.goodsIndex = parseInt(ind);
                    }
                }
                this.saveMyGoodsData();
            }
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

    getDeailts(gid){
          this.commonService.httpPost({
                url:this.commonService.baseUrl+'/mall/goods/detaillist',

                data:{
                    goodsId:gid
                }
            }).then(data=>{

                 if(data.code==200){
                    this.GoodDetails=data.result;
                    }else{
                        this.commonService.alert("系统提示",data.msg);
                    }
            });
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

    addGoods(){
        if(this.commonService.token==null){
            this.navCtrl.push(ReferralsPage);
        }else{
            this.myShopGood.num = this.myShopGood.num + 1;
            this.myShopGoods[this.goodsIndex] = this.myShopGood;
            this.saveMyGoodsData();
        }
    }

    goToHomePage(){
        this.navCtrl.pop();
    }
    showImg(path){
        let modal = this.modalCtrl.create(ViewImgPage, {imgStr:path});
        modal.present();
    }

    numRemove(ev){
        ev.stopPropagation();
        if(this.commonService.token==null){
            this.navCtrl.push(ReferralsPage);
        }else{
            if(this.myShopGood.num >=1){

                this.myShopGood.num=this.myShopGood.num- 1
            }
            this.myShopGoods[this.goodsIndex] = this.myShopGood;
            this.saveMyGoodsData();
        }
    }

    numAdd(ev){
        ev.stopPropagation();
        if(this.commonService.token==null){
            this.navCtrl.push(ReferralsPage);
        }else if(this.myShopGood.num >= this.myShopGoods[this.goodsIndex].stock){
            this.commonService.toast("该商品库存不足");
        }else{
            if(this.ShoppingCart.goodsAllPrice > 99999){
                this.commonService.toast("总金额不能超过99999");
            }else{
                this.myShopGood.num = this.myShopGood.num + 1;
                this.myShopGoods[this.goodsIndex] = this.myShopGood;
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

    /*查询商品信息*/
    loadGoodsInfo(){
        this.commonService.httpGet({
            url:this.commonService.baseUrl+'/mall/store/goods/info',
            data:{
                goodsId:this.goodsId
            }
        }).then(data=>{
            if(data.code=='200'){
                this.goodsInfo = data.result;
                this.records = data.result.drawUsers;
                this.loadShopCollect();
                this.initShare(this.goodsInfo);
            }else{
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }

    /*查询商品图片*/
    loadGoodsImages(){
        this.commonService.httpGet({
            url:this.commonService.baseUrl+'/mall/store/icons',
            data:{
                id:this.goodsId,
                type:4
            }
        }).then(data=>{
            if(data.code=='200'){
                this.goodsImages = data.result;
            }else{
                this.commonService.alert("系统提示",data.msg);
            }
            this.showBack = true;
        });
    }

    /*初始化购物车信息*/
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
              //console.log(this.myShopGoodData.myShopGoods[goods]);
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
        //console.log(goodsnum+" goodsprice "+goodsprice+" goodsmoney "+goodsmoney+" goodsep "+goodsep+" this.ShoppingCart "+this.ShoppingCart);
        if(this.shopData!=null){
            localStorage.setItem(this.shopData.id,JSON.stringify(this.myShopGoodData));
        }


    }


    /*查询收藏信息*/
    loadShopCollect(){
        this.commonService.httpGet({
            url:this.commonService.baseUrl+'/mall/store/storeinfo',
            data:{
                storeId:this.goodsInfo.storeId
            }
        }).then(data=>{
            if(data.code==200){
                this.shopData = data.result;
                this.shopAddr = this.shopData.province+this.shopData.city+this.shopData.county+this.shopData.addr;
            }else{
                this.commonService.alert("系统提示",data.msg);
                this.goToHomePage();
            }
        });
    }

    /*我要购买*/
    gotobuyGoods(goodsInfo,event,num){
        event.stopPropagation();
        if(this.commonService.token==null){
            this.navCtrl.push(ReferralsPage);
        }else{
            this.navCtrl.push(BuyGoodsPage,{goodsInfo:JSON.stringify(goodsInfo),type:'1001',orderNo:'',num:num});
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
                if(this.goodsInfo!=null){
                    this.initShare(this.goodsInfo);
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

                    // 以键值对的形式返回，可用的api值true，不可用为false
                    // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
                }
            });
        });
    }

    initShare(item){
        wx.onMenuShareAppMessage({//分享到微信朋友
             title: item.name, // 分享标题
             link: this.commonService.baseWXUrl+'/user/transition?index=3&goodsId='+item.id+
             '&uid='+this.commonService.user.uid+'&storeId='+item.storeId+'&shareUserId='+this.commonService.user.id,  // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
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
             title: item.name, // 分享标题
             link: this.commonService.baseWXUrl+'/user/transition?index=3&goodsId='+item.id+
             '&uid='+this.commonService.user.uid+'&storeId='+item.storeId+'&shareUserId='+this.commonService.user.id, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
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
