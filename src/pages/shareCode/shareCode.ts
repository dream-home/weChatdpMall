import { Component } from '@angular/core';
import { CommonService } from '../../app/app.base';
import { NavController } from 'ionic-angular';
@Component({
    selector: 'page-shareCode',
    templateUrl: 'shareCode.html'
})

export class ShareCodePage {
    shopData:any;
    id:string="";//店铺id
     int:any;
    constructor(public navCtrl: NavController, private commonService: CommonService ) {
        /*if(this.shopData==null){
               this.reload();
            }*/
    }


  /*页面事件*/
    ionViewWillEnter(){
         this.shopData=null;
         this.id=this.commonService.shopID;
         let index=this.id.indexOf("?");
         
         if(index>0){
            this.id=this.id.split("?")[0]; 
         }
       /*  alert(index);
         alert(this.id);*/
          this.loadData();
    }
    reload(){
        let n=0;
       this.int=setInterval(() => {
            n++;
          this.loadData();
          if(this.shopData!=null||n==5){
               this.int=window.clearInterval(this.int);
            }

        },1000);
    }
    loadData(){
        // alert("店铺ID"+this.id);
        this.commonService.httpGet({
            url:this.commonService.baseUrl+'/mall/store/info',
            data:{
                storeId:this.id
            } 
        }).then(data=>{
            if(data.code==200){
                this.shopData = data.result;
                //alert("获取到了当前的店铺信息");
              
            }else{
                //this.commonService.alert("系统提示",data.msg);
            }
        });
    }


}
