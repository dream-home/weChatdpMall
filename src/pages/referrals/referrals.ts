import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { CommonService } from '../../app/app.base';

@Component({
  selector: 'page-referrals',
  templateUrl: 'referrals.html'
})
export class ReferralsPage {

    constructor(
        public navCtrl: NavController,
        private commonService: CommonService
    ){

    }
    /*页面事件*/
    ionViewWillEnter(){

    }
    goToBackPage(){
        this.navCtrl.pop();
    }

    loginAgain(){
        window.location.replace(this.commonService.baseWXUrl+'/user/wdtransition?storeId='+this.commonService.shopID+'&uid='+this.commonService.Uid+'&index=Store');
    }
}
