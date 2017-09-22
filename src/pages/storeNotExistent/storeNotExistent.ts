import { Component } from '@angular/core';
import { NavController,ActionSheetController} from 'ionic-angular';

@Component({
    selector: 'page-storeNotExistent',
    templateUrl: 'storeNotExistent.html'
})
export class StoreNotExistentPage {

    constructor(
        public navCtrl: NavController,
        public actionSheetCtrl: ActionSheetController
    ){

    }

    /*页面事件*/
    ionViewWillEnter(){

    }
}
