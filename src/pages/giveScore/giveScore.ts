import { Component } from '@angular/core';
import { CommonService } from '../../app/app.base';
import { NavController } from 'ionic-angular';

@Component({
    selector: 'page-giveScore',
    templateUrl: 'giveScore.html'
})
export class GiveScorePage {
    isShowPayPw:boolean = false;
    totalScore:string;
    score:string;
    donateTo:string;
    payPwd:string;
    uid:string;
    name:string;
    isDisable:boolean=false;
    constructor(private navCtrl: NavController,private commonService: CommonService) {
        this.uid = sessionStorage.getItem("uid");
        this.donateTo = this.uid;
        if(this.donateTo != null && this.donateTo!=''){
            this.showName();
        }
        this.loadScore();
    }

    /*返回上一页*/
    goToBackPage(){
        if(this.isShowPayPw){
            this.isShowPayPw = false;
        }else{
            this.navCtrl.pop();
        }
    }

    loadScore(){
        this.commonService.httpGet({
            url:this.commonService.baseUrl+'/user/score',
            data:{}
        }).then(data=>{
            if(data.code==200){
                this.totalScore = data.result!=null?data.result.score:0;
            }else{
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }

    showName(){
        if(this.donateTo != null && this.donateTo !=''){
            this.commonService.httpLoad({
                url:this.commonService.baseUrl+'/wallet/donate/userinfo',
                data:{
                    donateTo:this.donateTo
                }
            }).then(data=>{
                if(data.code==200){
                    this.name = data.result!=null ? data.result.nickName:'';
                    this.name = data.result!=null && data.result.userName != null?data.result.userName:this.name;
                }else{
                    this.name='';
                }
            });
        }
    }

    /*确认赠送*/
    submitData(){
        if(this.validator()){
            this.isShowPayPw = true;
        }
    }

    /*确认支付*/
    submitPay(){
        this.isDisable = true;
        this.commonService.httpPost({
            url:this.commonService.baseUrl+'/wallet/donate',
            data:{
                donateTo:this.donateTo,
                payPwd:this.payPwd,
                score:this.score
            }
        }).then(data=>{
            if(data.code==200){
                let toast = this.commonService.toast("赠送余额成功");
                this.goToBackPage();
                this.goToBackPage();
                toast.onDidDismiss(() => {
                });
            }else{
                this.isDisable = false;
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }
    //取消按钮
    cancel(){
        this.payPwd = '';
        this.isShowPayPw = false;
    }

    /*验证*/
    validator(){
        if(!(/^[0-9]{3,20}$/.test(this.donateTo)) || this.name==null ||this.name ==''){
            this.commonService.toast("对方账户输入有误，请重填");
            return false;
        }
        if(!(/^[0-9]*[1-9][0-9]*$/).test(this.score)){
            this.commonService.toast("赠送余额必须是正整数");
            return false;
        }
        if(!(/^[0-9]{1,30}$/.test(this.score))){
            this.commonService.toast("赠送余额输入有误，请重填");
            return false;
        }
        if(Number(this.score) == 0){
            this.commonService.toast("赠送余额必须大于0");
            return false;
        }
        if(parseFloat(this.score)<this.commonService.params.donateMin || parseFloat(this.score)>this.commonService.params.donateMax){
            this.commonService.toast("赠送余额范围只能在"+this.commonService.params.donateMin+"~"+this.commonService.params.donateMax);
            return false;
        }
        if(parseFloat(this.score)>parseFloat(this.totalScore)){
            this.commonService.toast("余额不足，请充值或重新填写");
            return false;
        }
        return true;
    }


}
