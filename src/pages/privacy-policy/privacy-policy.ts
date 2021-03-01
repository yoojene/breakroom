import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { ContentProvider } from '../../providers/content/content';
import {
  UserInterfaceUtilsProvider
 } from '../../providers/utils/user-interface-utils';

@Component({
  selector: 'page-privacy-policy',
  templateUrl: 'privacy-policy.html',
})
export class PrivacyPolicyPage {
  public privacyPolicy: any;
  public privacyPolicyTitle = this.translate.instant('SETTINGS.PRIVACY_POLICY');

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public content: ContentProvider,
    public uiUtils: UserInterfaceUtilsProvider
  ) {}

  // Lifecycle
  public ionViewWillEnter() {
    this.uiUtils.showLoading();
    this.content.getPrivacyPolicy().then(res => {
      this.uiUtils.hideLoading();
      this.privacyPolicy = res[0].attributes.body.body_text;
    }).catch(() => {
      this.uiUtils.hideLoading();
    });
  }
}
