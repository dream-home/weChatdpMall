import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpModule} from '@angular/http';
import { CommonService } from './app.base';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { SellerPayPage } from '../pages/sellerPay/sellerPay';
import { SellerGoodsInfoPage } from '../pages/sellerGoodsInfo/sellerGoodsInfo';
import { BuyGoodsPage } from '../pages/buyGoods/buyGoods';
import { ShoppingCartPage } from '../pages/shoppingCart/shoppingCart';
import { ViewImgPage } from '../pages/viewImg/viewImg';
import { PayPwSettingPage } from '../pages/payPwSetting/payPwSetting';
import { DeliveryAddressPage } from '../pages/deliveryAddress/deliveryAddress';
import { NewAddressPage } from '../pages/newAddress/newAddress';
import { EditAddressPage } from '../pages/editAddress/editAddress';
import { FindPayPwdPage } from '../pages/findPayPwd/findPayPwd';
import { IntegroWalletPage } from '../pages/integroWallet/integroWallet';
import { MyContactsPage } from '../pages/myContacts/myContacts';
import { SysSettingPage } from '../pages/sysSetting/sysSetting';
import { UserInfoPage } from '../pages/userInfo/userInfo';
import { ShareFriendPage } from '../pages/shareFriend/shareFriend';
import { ShareCodePage } from '../pages/shareCode/shareCode';
import { SellerOrderPage } from '../pages/sellerOrder/sellerOrder';
import { MyPartnerPage } from '../pages/myPartner/myPartner';
import { ScoreExchangePage } from '../pages/scoreExchange/scoreExchange';
import { RechargePage } from '../pages/recharge/recharge';
import { MyScorePage } from '../pages/myScore/myScore';
import { MyEPPage } from '../pages/myEP/myEP';
import { MyDouDouPage } from '../pages/myDouDou/myDouDou';
import { MyRedopenPage } from '../pages/myRedopen/myRedopen';
import { ScoreRecordPage } from '../pages/scoreRecord/scoreRecord';
import { ChangeUserNamePage } from '../pages/changeUserName/changeUserName';
import { ScoreInfoPage } from '../pages/scoreInfo/scoreInfo';
import { EditMobilePage } from '../pages/editMobile/editMobile';
import { LoginPwdSettingPage } from '../pages/loginPwdSetting/loginPwdSetting';
import { PerfectUserDataPage } from '../pages/perfectUserData/perfectUserData';
import { SelectAddressPage } from '../pages/selectAddress/selectAddress';
import { OrderInfoPage } from '../pages/orderInfo/orderInfo';
import { AttendanceRecordPage } from '../pages/attendanceRecord/attendanceRecord';
import { FmyPage } from '../pages/fmy/fmy';
import { GiveScorePage } from '../pages/giveScore/giveScore';
import { StoreNotExistentPage } from '../pages/storeNotExistent/storeNotExistent';
import { GoodLuckEpPage } from '../pages/goodLuckEp/goodLuckEp';
import { LoginPage } from '../pages/login/login';
import { GoodsInfoPage } from '../pages/goodsInfo/goodsInfo';
import { ReferralsPage } from '../pages/referrals/referrals';
@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    SellerPayPage,
    SellerGoodsInfoPage,
    BuyGoodsPage,
    ViewImgPage,
    ShoppingCartPage,
    PayPwSettingPage,
    NewAddressPage,
    EditAddressPage,
    DeliveryAddressPage,
    FindPayPwdPage,
    IntegroWalletPage,
    MyContactsPage,
    SysSettingPage,
    UserInfoPage,
    ShareFriendPage,
    ShareCodePage,
    SellerOrderPage,
    MyPartnerPage,
    ScoreExchangePage,
    RechargePage,
    MyScorePage,
    MyEPPage,
    MyDouDouPage,
    MyRedopenPage,
    ScoreRecordPage,
    ChangeUserNamePage,
    ScoreInfoPage,
    EditMobilePage,
    LoginPwdSettingPage,
    PerfectUserDataPage,
    SelectAddressPage,
    OrderInfoPage,
    AttendanceRecordPage,
    FmyPage,
    GiveScorePage,
    StoreNotExistentPage,
    GoodLuckEpPage,
    GoodsInfoPage,
    ReferralsPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp,{
          backButtonText: '',
          iconMode: 'ios',
          modalEnter: 'modal-slide-in',
          modalLeave: 'modal-slide-out',
          tabsPlacement: 'bottom',
          pageTransition: 'ios',
          mode: 'ios',
          tabsHideOnSubPages:true
      })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    SellerPayPage,
    SellerGoodsInfoPage,
    BuyGoodsPage,
    ViewImgPage,
    ShoppingCartPage,
    PayPwSettingPage,
    NewAddressPage,
    EditAddressPage,
    DeliveryAddressPage,
    FindPayPwdPage,
    IntegroWalletPage,
    MyContactsPage,
    SysSettingPage,
    UserInfoPage,
    ShareFriendPage,
    ShareCodePage,
    SellerOrderPage,
    MyPartnerPage,
    ScoreExchangePage,
    RechargePage,
    MyScorePage,
    MyEPPage,
    MyDouDouPage,
    MyRedopenPage,
    ScoreRecordPage,
    ChangeUserNamePage,
    ScoreInfoPage,
    EditMobilePage,
    LoginPwdSettingPage,
    PerfectUserDataPage,
    SelectAddressPage,
    OrderInfoPage,
    AttendanceRecordPage,
    FmyPage,
    GiveScorePage,
    StoreNotExistentPage,
    GoodLuckEpPage,
    GoodsInfoPage,
    ReferralsPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler},CommonService]
})
export class AppModule {}
