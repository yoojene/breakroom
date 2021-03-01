import { Component } from '@angular/core';
import { NavController, NavParams, IonicPage } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { ContentProvider } from '../../providers/content/content';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { NotificationStore } from '../../stores/notification.store';
import { Logger } from '@pharma/pharma-component-utils';
import {
  AnalyticsProvider,
  analyticsValues } from '../../providers/analytics/analytics';

@IonicPage()
@Component({
  selector: 'page-champix-info',
  templateUrl: 'champix-info.html',
})
export class ChampixInfoPage {
  public selectedSegment: any;
  public isLoadingContent = true;

  public champixInfoTitle = this.translate.instant('CHAMPIX_INFO.TITLE');
  public dosage = this.translate.instant('CHAMPIX_INFO.L1_DOSAGE');
  public sideEffects = this.translate.instant('CHAMPIX_INFO.L2_SIDE_EFFETS');
  public champixJourney = this.translate.instant(
    'CHAMPIX_INFO.L3_CHAMPIX_JOURNEY'
  );
  public references = this.translate.instant('CHAMPIX_INFO.L4_REFERENCES');

  public champixJourneyText = this.translate.instant(
    'CHAMPIX_INFO.L3_CHAMPIX_JOURNEY_TEXT'
  );
  public dosageInfo: any = '';
  public dosageInfoBody: any = '';
  public dosageSubTitle: any = '';

  public sideEffectInfo: any = '';
  public sideEffectInfoTitle: any = '';
  public sideEffectInfoBody: any = '';
  public sideEffectSubTitle: any = '';

  public champixJourneyInfo: any = '';
  public champixJourneyInfoTitle: any = '';
  public champixJourneyInfoBody: any = '';
  public champixJourneySubTitle: any = '';
  public champixInfoImage: any;

  public referencesInfo: any = '';
  public referencesInfoTitle: any = '';
  public referencesInfoBody: any = '';
  public referencesInfoBody1: any = '';
  public referencesInfoBody2: any = '';
  public referencesInfoBody3: any = '';
  public referencesInfoBody4: any = '';
  public referencesSubTitle: any = '';
  public referencesLinkOne: any = '';
  public referencesLinkTwo: any = '';

  public hasNotification: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public contentProvider: ContentProvider,
    public nStore: NotificationStore,
    public iab: InAppBrowser,
    private logger: Logger,
    public analyticsService: AnalyticsProvider,
  ) {
    this.selectedSegment = 'dosage';
  }

  // Lifecycle
  public ionViewDidLoad() {
    this.analyticsService.trackStateAction({
      pagename: analyticsValues.PAGE_CHAMPIX_INFO
    });

    this.isLoadingContent = true;
    this.contentProvider
      .getAllChampixInfo()
      .then((result: any) => {
        result.forEach(champixInfo => {
          // Dosage tab
          if (champixInfo.attributes.weight === '1') {
            this.dosageInfo = champixInfo;
            this.dosageInfoBody = champixInfo.attributes['text'].body;
            this.dosageSubTitle = champixInfo.attributes['sub_title'];
            this.champixInfoImage = champixInfo.attributes.dosage_info.value;
            this.isLoadingContent = false;
          // Side Effects tab
          } else if (champixInfo.attributes.weight === '2') {
            this.sideEffectInfo = champixInfo;
            this.sideEffectInfoTitle = champixInfo.attributes['text'].title;
            this.sideEffectInfoBody = champixInfo.attributes['text'].body;
            this.sideEffectSubTitle = champixInfo.attributes['sub_title'];
            this.isLoadingContent = false;
          // CHAMPIX Journey tab
          } else if (champixInfo.attributes.weight === '3') {
            this.champixJourneyInfo = champixInfo;
            this.champixJourneyInfoTitle = champixInfo.attributes['text'].title;
            this.champixJourneyInfoBody = champixInfo.attributes['text'].body;
            this.champixJourneySubTitle = champixInfo.attributes['sub_title'];
            this.isLoadingContent = false;
          // Reference tab
          } else if (champixInfo.attributes.weight === '4') {
            this.referencesInfo = champixInfo;
            this.referencesInfoTitle = champixInfo.attributes['body_title'];
            this.referencesInfoBody =
              champixInfo.attributes['references_links'];
            this.logger.log('///////////////////////////');
            this.logger.log(this.referencesInfo);
            this.referencesSubTitle = champixInfo.attributes['sub_title'];
            this.referencesLinkOne = champixInfo.attributes['reference_1'];
            this.referencesLinkTwo = champixInfo.attributes['reference_2'];
            this.isLoadingContent = false;

          }
        });
      })
      .catch((error: any) => {
        this.isLoadingContent = false;
        this.logger.error(error);
      });
  }

  public ionViewWillEnter() {
    this.hasNotification = this.nStore.isanyNotificationNotSeen();
  }

  public ionViewDidEnter() {
    //
  }

  public doOpenReference(ref, idx) {
    if (ref.url) {
      this.iab.create(ref.url, '_system');
    }
  }
}
