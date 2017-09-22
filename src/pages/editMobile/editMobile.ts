import { Component } from '@angular/core';
import { CommonService } from '../../app/app.base';
import { NavController,NavParams } from 'ionic-angular';

var editMobile: any;
@Component({
    selector: 'page-editMobile',
    templateUrl: 'editMobile.html'
})
export class EditMobilePage {

    mobile:string;
    smsCode:string;
    showLoadMsgBtn:boolean = true;
    countDown:number = 60;
    constructor(
        public navCtrl: NavController,
        private commonService: CommonService,
        private navParams: NavParams
    ) {
        editMobile = this;
    }

    /*返回上一页*/
    goToBackPage(){
        this.navCtrl.pop();
    }

    //页面事件
    ionViewWillEnter(){

    }

    /*获取手机验证码*/
    loadMsgCode(){
        if(this.validator()){
            this.commonService.httpPost({
                url:this.commonService.baseUrl+'/common/sms',
                data:{
                    phone:this.mobile
                }
            }).then(data=>{
                if(data.code==200){
                    this.showLoadMsgBtn = false;
                    this.commonService.toast("短信验证码已发送到手机，请查收");
                    editMobile.loadCountDown();
                }else{
                    this.commonService.alert("系统提示",data.msg);
                }
            });
        }
    }

    //获取短信验证码倒计时
    loadCountDown() {
        if (this.countDown >= 1) {
            this.countDown -= 1;
            setTimeout(function() {
                editMobile.loadCountDown();
            }, 1000);
        }else{
            this.countDown = 60;
            this.showLoadMsgBtn = true;
        }
    }

    /*绑定手机号*/
    saveMobile(){
        if(this.validatorMobile()){
            this.commonService.httpPost({
                url:this.commonService.baseUrl+'/user/update/phone',
                data:{
                    phone:this.mobile,
                    smsCode:this.smsCode
                }
            }).then(data=>{
                if(data.code==200){
                    this.commonService.user.phone = this.mobile;
                    let toast = this.commonService.toast("更换手机号成功");
                    toast.onDidDismiss(() => {
                        this.goToBackPage();
                    });
                }else{
                    this.commonService.alert("系统提示",data.msg);
                }
            });
        }
    }

    /*绑定手机号验证*/
    validator(){
        if(!(/^1[34578]\d{9}$/.test(this.mobile))){
            this.commonService.toast("手机号码有误，请重填");
            return false;
        }
        return true;
    }

    validatorMobile(){
        if(!(/^\d{6}$/.test(this.smsCode))){
            this.commonService.toast("手机验证码输入有误，请重填");
            return false;
        }
        return true;
    }

}
