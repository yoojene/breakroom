import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { ContentProvider } from '../../providers/content/content';
import { ContentDetailPage } from '../content-detail/content-detail';
import * as moment from 'moment';
import { NotificationStore } from '../../stores/notification.store';
import {
  AnalyticsProvider,
  analyticsValues } from '../../providers/analytics/analytics';
import { pharmaContentAsset } from '../../models/content.model';

@IonicPage()
@Component({
  selector: 'page-content',
  templateUrl: 'content.html',
})
export class ContentPage {
  public selectedSegment: any;
  public isLoadingContent = true;

  public contentAssets: pharmaContentAsset[];

  // Labels
  public contentTitle = this.translate.instant('CONTENT.TITLE');

  public quitTipsText = this.translate.instant('CONTENT.K1_QUITTIPS');
  public lifestyleText = this.translate.instant('CONTENT.K1_LIFESTYLE');
  public educationText = this.translate.instant('CONTENT.K1_EDUCATION');

  public headline: any;
  public headerImage: any;
  public contentBody: any;
  public hasNotification: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public content: ContentProvider,
    public nStore: NotificationStore,
    public translate: TranslateService,
    public analyticsService: AnalyticsProvider
  ) {
    this.selectedSegment = 'Lifestyle'; // Default
  }

  // Lifecycle
  public ionViewDidLoad() {
    this.analyticsService.trackStateAction({
      pagename: analyticsValues.PAGE_CONTENT,
    });

    this.getContent();
  }

  public ionViewWillEnter() {
    this.hasNotification = this.nStore.isanyNotificationNotSeen();
  }

  // Public
  public onContentCardTap(content) {
    this.navCtrl.push(ContentDetailPage, { content });
  }

  // Private
  private async getContent() {
    this.isLoadingContent = true;
    const contentRes = await this.content.getAllContent();

    const contentAssets: pharmaContentAsset[] = contentRes.results;

    this.contentAssets = contentAssets.map((res, idx) => {
      res.sharedTime = moment(res.lastModifiedTime).format('MMM DD');
      this.isLoadingContent = false;

      return res;
    });
  }
}
