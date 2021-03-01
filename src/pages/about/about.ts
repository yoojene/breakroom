import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import {
  AnalyticsProvider,
  analyticsValues } from '../../providers/analytics/analytics';
import { TermsConditionsPage } from '../terms-conditions/terms-conditions';
import { AppVersion } from '@ionic-native/app-version';
import { Platform } from 'ionic-angular/platform/platform';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {
// Text
public aboutPageTitle = this.translate.instant('ABOUT_APP.TITLE');
public appName = this.translate.instant('ABOUT_APP.APP_NAME');
public appVersion = this.translate.instant('ABOUT_APP.APP_VERSION');
public appVersionNumber;
public appTrademark = this.translate.instant('ABOUT_APP.APP_TRADEMARK');
public termsOfUse = this.translate.instant('ABOUT_APP.TERMS_OF_USE');
public appCopyRight = this.translate.instant('ABOUT_APP.APP_COPYRIGHT');

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public translate: TranslateService,
              public analyticsService: AnalyticsProvider,
              private platform: Platform,
              private version: AppVersion) {}

  public ionViewWillLoad() {

    if (!this.platform.is('cordova')) {
      this.appVersionNumber = this.translate
      .instant('ABOUT_APP.APP_VERSION_NUMBER');

      return;
    }
    this.version.getVersionNumber().then(
      res => this.appVersionNumber = res
    );
  }
  public ionViewWillEnter() {
    this.analyticsService.trackStateAction({
      pagename: analyticsValues.PAGE_ABOUT_APP
    });

  }

  public termsOfuse() {
    this.navCtrl.push(TermsConditionsPage);
  }
}
