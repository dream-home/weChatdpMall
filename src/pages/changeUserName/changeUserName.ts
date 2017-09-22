import { Component } from '@angular/core';
import { CommonService } from '../../app/app.base';
import { NavController} from 'ionic-angular';
@Component({
    selector: 'page-changeUserName',
    templateUrl: 'changeUserName.html'
})

export class ChangeUserNamePage {
    nickName:string="";//昵称
    
    constructor(
        public navCtrl: NavController,
        private commonService: CommonService
    
    ) {  

       
    }
    //页面事件
    ionViewWillEnter(){
       
    }
    /*返回上一页*/
    goToBackPage(){
       
        this.navCtrl.pop();
    }

 

    //验证数据
     validator(){
        if(!this.nickName || this.nickName == ''){
           this.commonService.toast("昵称不能为空"); 
           return false;
        }
        return true;
    }

    //保存资料
    saveInfo(){
        if(this.validator()){
            this.commonService.httpPost({
                    url:this.commonService.baseUrl+'/user/updatenick',
                    data:{
                        nickName:this.nickName
                    }
                }).then(data=>{
                    if(data.code==200){
                       this.commonService.toast("昵称修改成功");
                       this.commonService.user.nickName=this.nickName;
                       this.goToBackPage();
                    }else{
                        this.commonService.alert("系统提示",data.msg);
                    }
                });
        }
    }
}
