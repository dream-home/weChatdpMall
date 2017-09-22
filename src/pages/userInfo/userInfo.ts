import { Component } from '@angular/core';
import { CommonService } from '../../app/app.base';
import { NavController, ActionSheetController  } from 'ionic-angular';
import { EditMobilePage } from '../editMobile/editMobile';
import { Area } from '../../app/app.data';
import { PayPwSettingPage } from '../payPwSetting/payPwSetting';
import { LoginPwdSettingPage } from '../loginPwdSetting/loginPwdSetting';
import { PerfectUserDataPage } from '../perfectUserData/perfectUserData';
import { ChangeUserNamePage } from '../changeUserName/changeUserName';
@Component({
    selector: 'page-userInfo',
    templateUrl: 'userInfo.html',
    providers:[Area]
})

export class UserInfoPage {
    userInfo:any;//用户信息
    subData: any;
    userImg: any;
    provinces:any[];
    citys:any[];
    countys:any[];
    province:string="110000";
    city:string="110100";
    county:string="110101";
    show:boolean=false;
    constructor(
        public navCtrl: NavController,
        public actionSheetCtrl: ActionSheetController,
        private commonService: CommonService,
        public area:Area
    ) {


    }

     //页面事件
    ionViewWillEnter(){
        this.getUserInfo();
    }

    // 支付密码
    settingPayPw(){
        this.navCtrl.push(PayPwSettingPage);
    }

    //设置登录密码
    settingLoginPw(){
        this.navCtrl.push(LoginPwdSettingPage);
    }

    //跳转到完善资料页面
    gotoPerfectUserDataPage(){
        this.navCtrl.push(PerfectUserDataPage);
    }

    /*返回上一页*/
    goToBackPage(){
        this.navCtrl.pop();
    }

    /*提交数据*/
    submitData(){
        if(this.validator()){
            this.subData.userBankcard.bankName = this.findName(this.subData.userBankcard.bankId);
            this.commonService.httpPost({
                url:this.commonService.baseUrl+'/user/edit',
                data:this.subData
            }).then(data=>{
                if(data.code==200){
                    let toast = this.commonService.toast("用户信息编辑成功");
                    this.commonService.user.nickName = this.subData.nickName;
                    this.commonService.user.userName = this.subData.userName;
                    this.commonService.user.userAddress = this.subData.userAddress;
                    this.commonService.user.userBankcard = this.subData.userBankcard;
                    toast.onDidDismiss(() => {
                        this.goToBackPage();
                    });
                }else{
                    this.commonService.alert("系统提示",data.msg);
                }
            },err=>{
                this.commonService.alert("系统异常",err);
            });
        }
    }

    /*绑定手机号*/
    bindMobile(phone){
        this.navCtrl.push(EditMobilePage);
    }

    /*数据验证*/
    validator(){
        if(this.subData.userName=='' || this.subData.userName==null){
            this.commonService.toast("真实姓名不能为空");
            return false;
        }
        if(this.subData.nickName=='' || this.subData.nickName==null){
            this.commonService.toast("昵称不能为空");
            return false;
        }
        if(this.subData.userBankcard.bankId==''){
            this.commonService.toast("银行不能为空");
            return false;
        }
        if(this.subData.userBankcard.cardNo==''){
            this.commonService.toast("银行卡号不能为空");
            return false;
        }

        if(!(/^[0-9]{15,19}$/.test(this.subData.userBankcard.cardNo))){
            this.commonService.toast("银行卡号输入有误");
            return false;
        }
        if(this.subData.userAddress.addr==''){
            this.commonService.toast("具体地址不能为空");
            return false;
        }
        return true;
    }

    findName(id){
        for(var o in this.commonService.user.bankList){
            if(this.commonService.user.bankList[o].id == id){
                return this.commonService.user.bankList[o].name;
            }
        }
        return '';
    }

    selectProvi(itm){
        this.citys = this.area.findCityLisByPid(this.province);
        this.city = this.citys[0].value;
        this.selectCity({text:this.citys[0].text});
        this.subData.userAddress.province = itm.text;
    }

    selectCity(itm){
        this.countys = this.area.findAreaLisByPid(this.city);
        this.county = this.countys[0].value;
        this.selectCounty({text:this.countys[0].text});
        this.subData.userAddress.city = itm.text;
    }

    selectCounty(itm){
        this.subData.userAddress.county = itm.text;
    }

    //获取用户信息
    getUserInfo(){
         this.commonService.httpGet({
                    url:this.commonService.baseUrl+'/user/login/getUser',
                    data:{

                    }
                }).then(data=>{
                    if(data.code==200){
                      this.userInfo=data.result;
                      if(this.userInfo.areaId==null ||this.userInfo.areaId=='' ||this.userInfo.isSetPassword==0||this.userInfo.isSetPayPwd==0||this.userInfo.phone==null ||this.userInfo.phone==""){
                          this.show=true;
                      }else{
                          this.show=false;
                      }
                    }else{
                        this.commonService.alert("系统提示",data.msg);
                    }
                });
    } 

    //跳转到修改昵称页面
    gotoChangeUserNamePage(){
        this.navCtrl.push(ChangeUserNamePage);
    }
}
