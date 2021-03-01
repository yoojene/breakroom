import { Component} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { ContentProvider } from '../../providers/content/content';
import { UserInterfaceUtilsProvider } from '../../providers/utils/user-interface-utils';
import {
  AnalyticsProvider,
  analyticsValues } from '../../providers/analytics/analytics';

@Component({
  selector: 'page-terms-conditions',
  templateUrl: 'terms-conditions.html',
})
export class TermsConditionsPage {
  public termsOfUse: any;
  public termsOfUseTitle = this.translate.instant('SETTINGS.TERMS_OF_USE');

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public content: ContentProvider,
    public analyticsService: AnalyticsProvider,
    public uiUtils: UserInterfaceUtilsProvider,
    private domSanitizer: DomSanitizer) {}

  // Lifecycle
  public ionViewWillEnter() {
    this.analyticsService.trackStateAction({
      pagename: analyticsValues.PAGE_TERMS_AND_CONDITION
    });

    this.uiUtils.showLoading();
    this.content
      .getTermsConditions()
      .then(res => {
        const results = res.results;
        this.uiUtils.hideLoading();

        this.termsOfUse = this.domSanitizer.bypassSecurityTrustHtml(
          results[0].attributes.text.body
        );

      })
      .catch(() => {
        this.uiUtils.hideLoading();
      });
  }
}
