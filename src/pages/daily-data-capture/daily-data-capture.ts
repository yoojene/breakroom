import { Component } from '@angular/core';
import { NavController, NavParams, IonicPage } from 'ionic-angular';
import {
  DailyDataCaptureCigarettesPage
} from '../daily-data-capture-cigarettes/daily-data-capture-cigarettes';
import { DailyCapture } from '../../models/daily.capture.model';
import {
  DailyCaptureProvider
} from '../../providers/daily-capture/daily-capture';
import * as moment from 'moment';
import {
  UserInterfaceUtilsProvider
 } from '../../providers/utils/user-interface-utils';
import { DashboardPage } from '../dashboard/dashboard';
import { UserStore } from '../../stores/user.store';
import { TranslateService } from '@ngx-translate/core';
import { NotificationStore } from '../../stores/notification.store';
import {
  AnalyticsProvider,
  analyticsValues } from '../../providers/analytics/analytics';

@IonicPage()
@Component({
  selector: 'page-daily-data-capture',
  templateUrl: 'daily-data-capture.html',
})
export class DailyDataCapturePage {
  public fromDashBoard = false;

  public title = this.translate.instant('DAILY_DIARY.DAILY_DIARY');
  public smokeToday = this.translate.instant('DAILY_DIARY.SMOKE_TODAY');
  public yes = this.translate.instant('BUTTONS.YES');
  public no = this.translate.instant('BUTTONS.NO');
  public skip = this.translate.instant('BUTTONS.SKIP');
  public hasNotification: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public dailyCapture: DailyCaptureProvider,
    public translate: TranslateService,
    public userStore: UserStore,
    public nStore: NotificationStore,
    public analyticsService: AnalyticsProvider,
    private uiUtils: UserInterfaceUtilsProvider
  ) {}

  public ionViewWillEnter() {
    this.analyticsService.trackStateAction({
      pagename: analyticsValues.PAGE_DAILY_DIARY_SMOKE
    });

    this.hasNotification = this.nStore.isanyNotificationNotSeen();
  }

  public ionViewDidLoad() {
    this.fromDashBoard = this.navParams.get('fromDashBoard');
  }

  public onYesTap() {
    this.navCtrl.push(DailyDataCaptureCigarettesPage, {
      didSmokeToday: true,
      fromDashBoard: this.fromDashBoard,
      didSkip: false,
    });
  }

  public async onNoTap() {
    if (!this.dailyCapture.isDayAlreadyEntered(moment().format('YYYY-MM-DD'))) {
      await this.enterDailyEvent(0); // we entered 0 cigarettes
    }
    this.returnToDashboard(true, true);
  }

  public async onSkipTap() {
  // if are skipping, we put in our default value added during the profile setup
    if (!this.dailyCapture.isDayAlreadyEntered(moment().format('YYYY-MM-DD'))) {
      await this.enterDailyEvent(
        this.userStore.user.numberCigarettesSmoked, true);
    }
    this.returnToDashboard(true, true);

  }

  private async enterDailyEvent(
    numbCigarettesSmoked: number, didSkip?: boolean) {
    const dailyCapture: DailyCapture = {
      date: moment().format('YYYY-MM-DD'),
      didSmokeToday: false,
      cigarettesSmoked: numbCigarettesSmoked,
      didSkip
    };

    this.uiUtils.showLoading();
    await this.dailyCapture.addDailyCaptureEvent(dailyCapture);
    this.uiUtils.hideLoading();
  }

  private returnToDashboard(dailyCapture, useDailyData) {
    if (this.fromDashBoard) {
      this.navCtrl.setRoot(DashboardPage, {
        fromDailyCapture: dailyCapture,
        dailyDataNo: useDailyData,
      });
    } else {
      this.navCtrl.setRoot('TabsPage');
    }
  }
}
