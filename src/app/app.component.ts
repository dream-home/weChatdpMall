import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { CommonService } from '../app/app.base';
import { HomePage } from '../pages/home/home';
import { FmyPage } from '../pages/fmy/fmy';
import { ShareCodePage } from '../pages/shareCode/shareCode';
import { StoreNotExistentPage } from '../pages/storeNotExistent/storeNotExistent';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;

  constructor(platform: Platform,
    private commonService: CommonService
    ) {
        function getUrl(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null){
              return r[2];
            }
            return null;
        }
        commonService.token = getUrl("token");
        console.log("huoqudao token "+commonService.token);

        commonService.shopID = getUrl("storeId");
        commonService.pageIndex = getUrl("index");
        commonService.Uid = getUrl("uid");
        if(commonService.token!=null&&commonService.token!=''){
            localStorage.setItem('mytoken',commonService.token);
            window.location.replace('http://m.yanbaocoin.cn/wxpage/'+'?storeId='+commonService.shopID+'&index='+commonService.pageIndex+'&uid='+commonService.Uid);
        }else{
            commonService.token = localStorage.getItem('mytoken');
        }


        var myUrl = getUrl("index");
        if(getUrl("storeId") == '' || getUrl("storeId") == null){
            myUrl = 'errorPage';
        }
        if(myUrl!="shareCode" && myUrl!="errorPage"){
          this.getUserInfo();
        }
        commonService.pageIndex = myUrl;
        switch(myUrl){
          case 'Im':
            this.rootPage = FmyPage;
            break;
          case 'Store':
            this.rootPage = HomePage;
            break;
          case 'shareCode':
            this.rootPage = ShareCodePage;
            break;
          case 'errorPage':
            this.rootPage = StoreNotExistentPage;
            break;
        }
        platform.ready().then(() => {

        });

  }
  //获取用户信息
  getUserInfo(){
       this.commonService.httpGet({
              url:this.commonService.baseUrl+'/user/login/getUser',
              data:{
              }
          }).then(data=>{
              if(data.code==200){
                    this.commonService.token = data.result.token;
                    this.commonService.user = data.result;
              }else{
                  this.commonService.alert("系统提示",data.msg);
              }
          });
  }
}
