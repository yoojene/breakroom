import { Component } from '@angular/core';
import {
  NavController, App, Config, NavParams, ModalController, IonicPage
} from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { UserProvider } from '../../providers/user/user';
import { UserStore } from '../../stores/user.store';
import {
  NotificationProvider
} from '../../providers/notification/notification.provider';
import {
  DashboardLogicProvider
} from '../../providers/dashboard/dashboard-logic';
import {
  DashboardChartsProvider
} from '../../providers/dashboard/dashboard-charts';
import * as moment from 'moment';
import { BreakroomConfig } from '../../app/app.config';
import {
  AchievementsProvider
} from '../../providers/achievements/achievements';
import {
  DailyCaptureProvider
} from '../../providers/daily-capture/daily-capture';
import { AuthProvider } from '../../providers/auth/auth';
import { Logger } from '@pharma/pharma-component-utils';
import { Achievement } from '../../models/achievement.model';
import {
  ProjectedSavingsModalComponent
} from './projected-savings-modal/projected-savings-modal';

import {
  ProjectedSavingsModalProgressComponent
} from './projected-savings-progress-modal/projected-savings-progress-modal';
import {
  MyProgressModalComponent
} from './my-progress-modal/my-progress-modal';

import { NotificationStore } from '../../stores/notification.store';
import { UserInterfaceUtilsProvider } from '../../providers/utils/user-interface-utils';
import {
  AnalyticsProvider,
  analyticsValues } from '../../providers/analytics/analytics';
import { pharmaPerson } from '../../models/user.model';

@IonicPage()
@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  // Labels
  public dashboardHeader = this.translate.instant('DASHBOARD.TITLE');

  public dayHeader = this.translate.instant('DASHBOARD.DAY');
  public daysText = this.translate.instant('DASHBOARD.DAYS');
  public untilYourQuitDateText = this.translate.instant(
    'DASHBOARD.UNTIL_YOUR_QUIT_DATE'
  );
  public smokeFreeText = this.translate.instant('DASHBOARD.SMOKE_FREE_WOHOO');

  public savedText = this.translate.instant('DASHBOARD.SAVED_KERCHING');
  public projectedText = this.translate.instant('DASHBOARD.PROJ_LIFE_SAVINGS');
  public dailyDiaryText = this.translate.instant(
    'DASHBOARD.DAILY_SMOKING_DIARY'
  );
  public cigsPerDayText = this.translate.instant('DASHBOARD.CIGS_PER_DAY');

  public myProgressText = this.translate.instant('DASHBOARD.MY_PROGRESS');
  public daysSmokeFreeText = this.translate.instant(
    'DASHBOARD.DAYS_SMOKE_FREE'
  );
  public cigsNotSmokedText = this.translate.instant(
    'DASHBOARD.CIGS_NOT_SMOKED'
  );
  public timeNotSmokedText = this.translate.instant(
    'DASHBOARD.TIME_NOT_SMOKED'
  );

  public myGoalsHeader = this.translate.instant('DASHBOARD.MY_GOALS');
  public lastAchievementHeader = this.translate.instant(
    'DASHBOARD.LAST_ACHIEVEMENT'
  );
  public myNextGoalsHeader = this.translate.instant('DASHBOARD.NEXT_GOALS');

  public communityHeader = this.translate.instant('DASHBOARD.COMMUNITY');
  public newMembersText = this.translate.instant('DASHBOARD.NEW_MEMBERS');
  public currMembersText = this.translate.instant('DASHBOARD.CURR_MEMBERS');
  public achCelebratedText = this.translate.instant('DASHBOARD.ACH_CELEBRATED');

  public newsFeedButtonText = this.translate.instant('BUTTONS.HEAD_NEWSFEED');
  public cigsPerDayHeight = 50;
  public isMembersLoading = true;
  public isNextGoalsVisible = true;
  public isAchCelebratedLoading = true;
  public view: any = null; // we reconstruct the chart upon entry
  public chart: any = null; // we reconstruct the chart upon entry
  public datasets;

  /* separate the following or read from user object */
  public projectedLifeSavings: string;
  public smokePerDay: number;
  public timeNotSpentNotSmoking: string;
  public cigarettesNotSmoked: number;
  public daysSmokeFree: number;
  public isPostQuit: boolean;
  public isGoalsLoading = true;
  public savedDollars: string;
  public savedCents: string;

  public journeyDays: number;
  public remainingDays: number;

  public circularProgressBarHeader = [];
  public circularProgressBarHPercentage = 0;
  public circularProgressOuterStrokeColor = '#9ECA54';
  public circularProgressInnerStrokeColor = '#a8a7a7';
  public circularTitleColor = '#a8a7a7';

  // Loader / Skeleton Screen

  public hasLoaded = false;

  // Achievement calculations

  public currentDate = moment().startOf('day');

  // Next Goals

  public nextProgressAchievement: Achievement;
  public nextMoneyAchievement: Achievement;
  public nextHealthAchievement: Achievement;

  // Community

  public communityCurrent: number;
  public newMembers: number;
  public achCelebrated: number;
  public hasNotification: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    private app: App,
    public config: Config,
    public appConfig: BreakroomConfig,
    public dashboardCharts: DashboardChartsProvider,
    public notificationsProvider: NotificationProvider,
    public userProvider: UserProvider,
    public auth: AuthProvider,
    private logger: Logger,
    public userStore: UserStore,
    public translate: TranslateService,
    public achieveProvider: AchievementsProvider,
    public dashboardLogic: DashboardLogicProvider,
    public nStore: NotificationStore,
    private dailyCapture: DailyCaptureProvider,
    public uiUtils: UserInterfaceUtilsProvider,
    public analyticsService: AnalyticsProvider
  ) {}

  // Lifecycle
  protected async ionViewWillEnter() {
    this.sendAdobeAnalitics();
    // console.log('IVWE Dashboard');
    // console.log(this.navParams.get('fromDailyCapture'));

    this.hasNotification = this.nStore.isanyNotificationNotSeen();

    // this.setbarCanvasheight();
    // Regenerate when returning from DDC
    if (this.navParams.get('fromDailyCapture')) {
      // Pass flag to set todays smoking value to 0 if No is selected
      await this.generateDashboardContent(this.navParams.get('dailyDataNo'));
    } else {
      await this.generateDashboardContent();
    }
  }

  private sendAdobeAnalitics() {
    this.analyticsService.trackStateAction({
      pagename: analyticsValues.PAGE_DASHBOARD,
    });

    this.analyticsService.trackAction({
      pagename: `${analyticsValues.PAGE_DASHBOARD}`,
      linkname: `Active member|${this.userStore.user.username}`,
    });

    const isafter = moment().isAfter(this.userStore.user.quitDate);
    if (isafter) {
      this.analyticsService.trackAction({
        pagename: `${analyticsValues.PAGE_DASHBOARD}`,
        linkname: `Members converted to quit date|
        ${this.userStore.user.username}`,
      });
    }
  }
  public ionViewDidEnter() {
    if (!this.hasLoaded) {
      this.uiUtils.showLoading();
    }
  }

  public setbarCanvasheight() {
    this.smokePerDay = this.dashboardLogic.getCigarettesSmokedPerDay();
    const cigsPerDayLowerBounds = 10;
    const minimumPerDayHeight = 80;
    if (
      this.dashboardLogic.getCigarettesSmokedPerDay() <= cigsPerDayLowerBounds
    ) {
      this.cigsPerDayHeight = minimumPerDayHeight;
    }
  }

  // Public
  /**
   *
   * Open Daily Data Capture
   */
  public capture() {
    // this.config.set('tabsHideOnSubPages', true);
    this.navCtrl.push('DailyDataCapturePage', { fromDashBoard: true });
  }

  public async calculateNextGoals() {
    this.isGoalsLoading = true;
    const calcgoals = await this.dashboardLogic.calculateNextGoals();
    // Destructures goals into local achievement variables

    const goals = calcgoals.map(g => g[0]);
    this.isGoalsLoading = false;

    [
      this.nextProgressAchievement,
      this.nextMoneyAchievement,
      this.nextHealthAchievement,
    ] = [...goals];

    this.isNextGoalsVisible = this.dashboardLogic.isNextGoalsVisible;
  }

  /**
   *
   * Switch tab to Newsfeed
   */
  public goToNewsFeed() {
    this.app.getActiveNavs()[0].parent.select(0);
  }

  public onProjectedLifeSavingsTap() {
    const projectModal = this.modalCtrl.create(
      ProjectedSavingsModalComponent,
      {},
      { cssClass: 'settings-modal' }
    );
    projectModal.present();
  }

  public onProjectedLifeSavingsProgressTap() {
    const projectModal = this.modalCtrl.create(
      ProjectedSavingsModalProgressComponent,
      {},
      { cssClass: 'settings-modal' }
    );
    projectModal.present();
  }

  public onMyProgressTap() {
    const progressModal = this.modalCtrl.create(
      MyProgressModalComponent,
      {},
      { cssClass: 'settings-modal' }
    );
    progressModal.present();
  }
  /**
   * Sets up data on dashboard
   *
   */
  private async generateDashboardContent(dailyDataNo?: boolean) {
    if (!this.achCelebrated) {
      this.isAchCelebratedLoading = true;
    }
    if (!this.newMembers) {
      this.isMembersLoading = true;
    }

    this.dashboardLogic.getCommunityStats().then(community => {
      this.communityCurrent = community.totalMembers;
      this.newMembers = community.newMembersThisMonth;
      this.isMembersLoading = false;
    });

    this.dashboardLogic.getAchievementsCelebrated().then(community => {
      this.isAchCelebratedLoading = false;
      this.achCelebrated = community.achievementsCelebrated;
    });
    // separate chart functions out of dashboard.ts
    this.isPostQuit = this.dashboardLogic.isPostQuit();

    await this.dailyCapture.getDailyEvents();

    this.cigarettesNotSmoked = this.dashboardLogic.getCigarettesNotSmoked();
    this.timeNotSpentNotSmoking = this.dashboardLogic.getTimeSavedNotSmoking();
    this.projectedLifeSavings = this.dashboardLogic.getProjectedLifetimeSavings();

    let totalSaved;
    if (this.isPostQuit) {
      // G3 - Total Money Saved - Post Quit
      this.logger.log('Post Quit - Total Money Saved');

      // Day indicator
      this.remainingDays = this.dashboardLogic.getDaysSmokeFree();
      this.journeyDays = this.dashboardLogic.getChampixJourneyDay();

      totalSaved = this.dashboardLogic.getTotalSavings();
      this.userStore.updateUser({ moneySaved: totalSaved });

      // Money saved - format for display
      this.savedDollars = totalSaved
        .toLocaleString(this.appConfig.locale, {
          style: 'currency',
          currency: this.appConfig.currency,
        })
        .split('.')[0];

      this.savedCents = totalSaved
        .toLocaleString(this.appConfig.locale, {
          style: 'currency',
          currency: this.appConfig.currency,
        })
        .split('.')[1];

      // My Progress section
      this.daysSmokeFree = this.dashboardLogic.getDaysSmokeFree();

      // circular progress
      this.circularProgressInnerStrokeColor = '#4ac4ce';
      this.circularTitleColor = '#4ac4ce';
      this.circularProgressBarHPercentage = this.dashboardLogic.postSmokeCircularProgressCalc();
    } else {
      // G2 2A - Savings up until Quit Date - Pre Quit

      this.logger.log('Pre Quit - Savings until Quit Date');
      this.remainingDays = this.dashboardLogic.getDaysUntilQuitDate();
      this.journeyDays = this.dashboardLogic.getChampixJourneyDay();

      totalSaved = this.dashboardLogic.getSavingsUpToQuitDate();

      // Format for display
      this.savedDollars = totalSaved
        .toLocaleString(this.appConfig.locale, {
          style: 'currency',
          currency: this.appConfig.currency,
        })
        .split('.')[0];

      this.savedCents = totalSaved
        .toLocaleString(this.appConfig.locale, {
          style: 'currency',
          currency: this.appConfig.currency,
        })
        .split('.')[1];

      this.dashboardCharts.makeChart(dailyDataNo);

      // circular progress
      this.circularProgressBarHPercentage = this.dashboardLogic.preSmokeCircularProgressCalc();
    }
    this.hasLoaded = true;
    this.uiUtils.hideLoading();

    this.circularProgressBarHeader = [this.dayHeader, this.journeyDays];

    // set right label if there is only one day remaining
    this.daysText =
      this.remainingDays === 1
        ? this.translate.instant('DASHBOARD.DAY')
        : this.translate.instant('DASHBOARD.DAYS');

    this.dashboardCharts.makeLineChart();

    // Update pharma
    const person: pharmaPerson = {
      id: this.userStore.user.id,
      firstName: this.userStore.user.firstName,
      lastName: this.userStore.user.lastName,
    };

    await this.auth.updatepharmaPerson(person, {
      moneySaved: totalSaved,
      cigarettesNotSmoked: this.cigarettesNotSmoked,
      smokeFreeDays: this.daysSmokeFree,
      projectedLifetimeSaving: this.projectedLifeSavings,
      timeNotSmoking: this.timeNotSpentNotSmoking,
    });

    // this.isPostQuit = true; // testing
    // this.dashboardLogic.setProjectedLifeTimeInYears();
    await this.achieveProvider.checkLatestAchievements(this.currentDate);

    this.calculateNextGoals();

    await this.notificationsProvider.getLocationNotificationsFeed();

    this.hasNotification = this.nStore.isanyNotificationNotSeen();
  }
}
