import { Component, AfterViewInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import {
  AnalyticsProvider,
  analyticsValues } from '../../providers/analytics/analytics';
import { ImageViewerController } from 'ionic-img-viewer';

@IonicPage()
@Component({
  selector: 'page-content-detail',
  templateUrl: 'content-detail.html',
})
export class ContentDetailPage implements AfterViewInit {

  // Labels
  public contentTitle = this.translate.instant('CONTENT.TITLE');

  public content: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public imageViewerCtrl: ImageViewerController,
    public analyticsService: AnalyticsProvider,
    public translate: TranslateService) {
  }
  // Lifecycle

  public ngAfterViewInit() {

  this.analyticsService.trackAction({
    pagename: `${analyticsValues.PAGE_CONTENT}`,
    linkname: `Article read|${this.contentTitle}`,
  });
    this.content = this.navParams.get('content');
  }

  public ionViewWillEnter(){
    const imageElements = Array.from(
      document.getElementById('content').querySelectorAll('img'));
    imageElements.forEach(element => {
      element.addEventListener('click',()=> {
        this.presentImage(element);
      });
    });
  }

  public presentImage(myImage) {
    const imageViewer = this.imageViewerCtrl.create(myImage);
    imageViewer.present();
  }

}
