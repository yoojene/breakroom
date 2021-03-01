import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  CreateAccountActivationPage
} from '../create-account-activation/create-account-activation';
import { TranslateService } from '@ngx-translate/core';
import { LoginPage } from '../login/login';
import { NetworkProvider } from '../../providers/network/network.provider';
import {
  AnalyticsProvider,
  analyticsValues } from '../../providers/analytics/analytics';

@IonicPage()
@Component({
  selector: 'page-app-landing',
  templateUrl: 'landing.html',
})
export class LandingPage {
  public landingTitle = this.translate.instant('SIGN_IN.B1_TITLE');
  public landingBody = this.translate.instant('SIGN_IN.B1_BODYTEXT');
  public signInText = this.translate.instant('SIGN_IN.B1_SIGN_IN_BUTTON');
  public reSignInText = this.translate.instant('SIGN_IN.B1_RESIGN_IN_BUTTON');
  public createAccountText = this.translate.instant(
    'SIGN_IN.B1_CREATE_ACC_BUTTON'
  );
  public showLogoutMessage = false;

  constructor(
    public navCtrl: NavController,
    public analyticsService: AnalyticsProvider,
    public navParams: NavParams,
    public translate: TranslateService,
    public network: NetworkProvider
  ) {
    if(!this.network.isOffline()){
      // if the phone's network is offline, its not just a case of session
      // expired  so we check this, and only display the error if the network is
      // online and the session is expired.
      this.showLogoutMessage = this.navParams.get('showLogoutMessage');
    }
  }

  // Lifecycle

  protected ionViewDidEnter() {
    // Report page view to analytics
    this.analyticsService.trackStateAction({
      pagename: analyticsValues.PAGE_LANDING
    });
  }

  // Public
  public onSignInTap() {
    this.navCtrl.push(LoginPage);
  }

  public onCreateAccountTap() {
    this.navCtrl.push(CreateAccountActivationPage);
  }
}
