import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavController, NavParams, IonicPage } from 'ionic-angular';
import { UserStore } from '../../stores/user.store';
import * as moment from 'moment';
import {
  DailyCaptureProvider
 } from '../../providers/daily-capture/daily-capture';
import { DailyCapture } from '../../models/daily.capture.model';
import {
  UserInterfaceUtilsProvider
} from '../../providers/utils/user-interface-utils';
import { DashboardPage } from '../dashboard/dashboard';
import { NotificationStore } from '../../stores/notification.store';
import {
  AnalyticsProvider,
  analyticsValues } from '../../providers/analytics/analytics';

@IonicPage()
@Component({
  selector: 'page-daily-data-capture-cigarettes',
  templateUrl: 'daily-data-capture-cigarettes.html',
})
export class DailyDataCaptureCigarettesPage {
  // Labels

  public dailyDiaryHeader = this.translate.instant('DAILY_DIARY.DAILY_DIARY');
  public cigsSmokedTodayText = this.translate.instant(
    'DAILY_DIARY.CIGS_SMOKED_TODAY'
  );
  public totalCigarettes = null;
  public reviewMessage = this.translate.instant('GENERIC_MESSAGES.REVIEW');

  public selectDateText = this.translate.instant('ERROR_MSG.F2_SELECT_DATE');
  public selectDateInvalidText = this.translate.instant(
    'ERROR_MSG.F2_SELECT_INVALID_DATE'
    );

  public smokingDate;

  // Cigarettes allowed validation
  public currentDate = moment().startOf('day');

  public SIX = 6;
  public minDate;

  public maxDate = moment(this.currentDate).format('YYYY-MM-DD');

  public cigarettes = [];
  private cigLimit = 100; // Arbitrary total limit?

  private rtqFirstPeriod = 28;
  private rtqSecondPeriod = 57;

  private half = 0.5;
  private quart = 0.25;
  public disabled = true;
  public showDateErrorMessage = false;
  public showDateEInvalidrrorMessage = false;
  public showTotalCigarettesErrorMessage = false;
  public fromDashBoard = false;
  public title = 'Daily Diary';
  public hasNotification: boolean;

  // private rtqThirdPeriod = 28;

  constructor(
    public navCtrl: NavController,
    public translate: TranslateService,
    public userStore: UserStore,
    public dailyCapture: DailyCaptureProvider,
    private uiUtils: UserInterfaceUtilsProvider,
    public navParams: NavParams,
    public nStore: NotificationStore,
    public analyticsService: AnalyticsProvider,
  ) {
    this.setMindateLimit();
  }

  // Lifecycle
  public async ionViewWillEnter() {

    this.analyticsService.trackStateAction({
      pagename: analyticsValues.PAGE_DAILY_DIARY_CIGARETTES
    });

    this.showDateErrorMessage = false;
    this.showDateEInvalidrrorMessage = false;
    this.showTotalCigarettesErrorMessage = false;
    this.generateCigaretteList();

    this.hasNotification = this.nStore.isanyNotificationNotSeen();
    await this.dailyCapture.getDailyEvents();
    this.fromDashBoard = this.navParams.get('fromDashBoard');

    if (this.userStore.user.quitMethod === 'Reduced_quit') {
      this.calculateAllowedCigarettes();
    }

  }

  // Public
  public setMindateLimit(){

      const startDate = moment(
          this.userStore.user.startDate)
          .format('YYYY-MM-DD');
      this.minDate = moment(this.currentDate)
          .subtract(this.SIX, 'days')
          .format('YYYY-MM-DD');

      // if (this.minDate < startDate) {
      //     this.minDate = startDate;
      // }

  }

  public isTotalCigarettesBlank() {
    this.showTotalCigarettesErrorMessage = false;

    if (this.totalCigarettes<0) {
      this.showTotalCigarettesErrorMessage = true;

      return;
    }
    this.isSmokingDateBlank();
    this.isEnableButton();
  }

  public isSmokingDateBlank() {
    this.showDateErrorMessage = false;

    if (!this.smokingDate) {
      this.showDateErrorMessage = true;

      return;
    }

    this.showDateEInvalidrrorMessage = this.dailyCapture.isDayAlreadyEntered(
      moment().format(this.smokingDate)
    );
    this.isEnableButton();
  }

  public isEnableButton(){

    this.disabled = true;

    if (this.totalCigarettes !==null &&
      this.smokingDate &&
      !this.showDateEInvalidrrorMessage){
      this.disabled = false;
    }
  }

  public async onYesTap() {
    const dailyCapture: DailyCapture = {
      date: this.smokingDate,
      didSmokeToday: true,
      cigarettesSmoked: this.totalCigarettes,
      didSkip: false
    };

    this.uiUtils.showLoading();

    await this.dailyCapture.addDailyCaptureEvent(dailyCapture);
    this.uiUtils.hideLoading();

    this.returnToDashboard(true, false);
  }

  public onSkipTap() {
    this.returnToDashboard(true, false);
  }

  // Private
  private calculateAllowedCigarettes() {
    const startDate = this.userStore.user.startDate;

    const inFirstPeriod = moment(this.currentDate).isBetween(
      moment(startDate),
      moment(startDate).add(this.rtqFirstPeriod, 'days')
    );
    const inSecondPeriod = moment(this.currentDate).isBetween(
      moment(startDate).add(this.rtqFirstPeriod, 'days'),
      moment(startDate).add(this.rtqSecondPeriod, 'days')
    );
    const inThirdPeriod = moment(this.currentDate).isAfter(
      moment(startDate).add(this.rtqSecondPeriod, 'days')
    );
    // Reduce to Quit logic
    if (inFirstPeriod) {
      // User can select any amount (100)
      this.generateCigaretteList();
    }
    if (inSecondPeriod) {
      // User can only select 50% of their usual number smoked per day
      this.cigLimit = this.userStore.user.numberCigarettesSmoked * this.half;
      this.generateCigaretteList();
    }
    if (inThirdPeriod) {
      // User can only select 25% of their usual number smoked per day
      this.cigLimit = this.userStore.user.numberCigarettesSmoked * this.quart;
      this.generateCigaretteList();
    }
  }

  private generateCigaretteList() {
    this.cigarettes = [];
    for (let x = 0; x <= this.cigLimit; x++) {
      this.cigarettes.push({ cig: x });
    }
  }

  public selectNumberCigarretesText = this.translate.instant(
    'ERROR_MSG.F2_SELECT_SMOKE_CIGARETTES'
  );

  private returnToDashboard(dailyCapture, useDailyData){

    if(this.fromDashBoard){
      this.navCtrl.setRoot(DashboardPage,
        { fromDailyCapture: dailyCapture, dailyDataNo: useDailyData
        });
    } else
    {
      this.navCtrl.setRoot('TabsPage');
    }
  }
}
