import { Component } from '@angular/core';
import { CommonService } from '../../app/app.base';
import { NavController } from 'ionic-angular';
import { UserInfoPage } from '../userInfo/userInfo';

@Component({
    selector: 'page-scoreExchange',
    templateUrl: 'scoreExchange.html'
})
export class ScoreExchangePage {

    score:number;
    total:string;
    fee:number=0.05;
    trueScore:string;
    payPanel:boolean=false;
    payPwd:string;
    banks:string="";//提现银行卡名称和id
    username:string="";//体现银行卡姓名
    idcarNumber:string="";//提现的银行卡号
    isDisable:boolean=false;
    flage:boolean=false;
    constructor(public navCtrl: NavController, private commonService: CommonService ) {
        this.total = sessionStorage.getItem("score");
        this.fee = commonService.params!=null?commonService.params.exchangePoundageScale:0.05;
        this.username=this.commonService.user.userName;
       // console.log(this.username);
        if(this.username==""||this.username==null){
            this.flage=true;
        }else{
            this.flage=false;
        }
        if(commonService.user.userBankcard!=null && commonService.user.userBankcard!=''){
            this.banks = commonService.user.userBankcard.bankId+','+commonService.user.userBankcard.bankName;
            this.idcarNumber = commonService.user.userBankcard.cardNo;
        }
    }

    /*返回上一页*/
    goToBackPage(){
        if(this.payPanel){
            this.payPanel = false;
        }else{
            this.navCtrl.pop();
        }
    }

    ionViewWillEnter(){

    }

    showTrueScore(){
        let n = this.score;
        this.trueScore = new Number(n-this.score * this.fee).toFixed(2);
    }

    submitData(){
        if(this.validator()){
            this.payPanel = true;
        }
    }

    submitPay(){
        this.isDisable = true;
        let bankInfo=[];
        bankInfo=this.banks.split(","); //字符分割
       /* console.log("银行："+this.banks);
        console.log("银行id："+bankInfo[0]);
         console.log("银行名："+bankInfo[1]);
          console.log("银行卡号："+this.idcarNumber);
           console.log("支付密码"+this.payPwd);
           console.log("兑换数量"+this.score);*/
        this.commonService.httpPost({
            url:this.commonService.baseUrl+'/wallet/v42/exchange',
            data:{
                bankId:bankInfo[0],
                bankName:bankInfo[1],
                cardNo:this.idcarNumber,
                source:0,
                payPwd:this.payPwd,
                userName:this.username,
                score:this.score
            }
        }).then(data=>{
            if(data.code==200){
                let toast = this.commonService.toast("余额兑换成功");
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

    cancel(){
        this.payPwd = '';
        this.payPanel = false;
    }

    validator(){
        if(!this.score || this.score==0){
            this.commonService.toast("兑换余额不能为空且必须大于0");
            return false;
        }
        if(!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/).test(this.score+'')){
            this.commonService.toast("兑换余额输入有误(如有小数精确到2位)");
            return false;
        }
        if(this.score*1<this.commonService.params.exchangeMin*1 || this.score*1>this.commonService.params.exchangeMax*1){
            this.commonService.toast("兑换余额范围只能在"+this.commonService.params.exchangeMin+"~"+this.commonService.params.exchangeMax);
            return false;
        }
        if(this.score>parseFloat(this.total)){
            this.commonService.toast("兑换余额不能大于"+this.total);
            return false;
        }
        if(this.username==null||this.username==""){
            this.commonService.toast("姓名不能为空！");
            return false;
        }
        if(this.banks==null||this.banks==""){
            this.commonService.toast("银行不能为空！");
            return false;
        }
        if(this.idcarNumber==null||this.idcarNumber==""){
            this.commonService.toast("银行卡号不能为空！");
            return false;
        }
       if(!(/^[0-9]*$/).test(this.idcarNumber+'')){
            this.commonService.toast("请输入纯数字的银行卡号！");
            return false;
        }
        this.payPanel = true;
        return true;
    }

    bindCard(){
        this.navCtrl.push(UserInfoPage);
    }

}
