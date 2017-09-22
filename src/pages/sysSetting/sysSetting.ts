import { Component } from '@angular/core';
import { CommonService } from '../../app/app.base';
import { NavController,LoadingController } from 'ionic-angular';
import { ReferralsPage } from '../referrals/referrals';
import { UserInfoPage } from '../userInfo/userInfo';
import { DeliveryAddressPage } from '../deliveryAddress/deliveryAddress';
@Component({
    selector: 'page-sysSetting',
    templateUrl: 'sysSetting.html'
})
export class SysSettingPage {
    osType:number;
    isupdate:boolean=false;
    updateData:any;
    constructor(
        public navCtrl: NavController,
        public commonService: CommonService,
        public loadingCtrl:LoadingController,

    ) {
    }
    /*用户信息*/
    gotoUserInfoPage(){
        if(this.commonService.token==null){
            this.goToLoginPage();
        }else{
            this.navCtrl.push(UserInfoPage);
        }
    }
    /*返回上一页*/
    goToBackPage(){
        this.navCtrl.pop();
    }

    /*登录页面*/
    goToLoginPage(){
        this.navCtrl.push(ReferralsPage);
    }

    /*退出登陆*/
    exitLogin(){
        this.commonService.token = null;
        this.commonService.showOpenRed = true;
        localStorage.removeItem("token");
        localStorage.clear();
        sessionStorage.clear();
        this.commonService.alert("系统提示","您已成功退出当前账号!");
        this.navCtrl.pop();
    }

    //跳转收货地址页面
    gotoDeliveryAddress(urlId){
        if(this.commonService.token==null){
            this.goToLoginPage();
        }else{
            this.navCtrl.push(DeliveryAddressPage,{fromId:urlId});
        }
    }

}
