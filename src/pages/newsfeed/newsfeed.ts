import { Component, AfterViewInit } from '@angular/core';
import { NavController, IonicPage } from 'ionic-angular';
import { BreakroomConfig } from '../../app/app.config';
import { TranslateService } from '@ngx-translate/core';
import {
  AchievementsProvider
 } from '../../providers/achievements/achievements';
import { Logger } from '@pharma/pharma-component-utils';
import { AuthProvider } from '../../providers/auth/auth';
import * as moment from 'moment';
import { ImageLoaderConfig } from 'ionic-image-loader';
import { HttpClient } from '@angular/common/http';
import { NotificationStore } from '../../stores/notification.store';
import { Achievement } from '../../models/achievement.model';
import {
  AnalyticsProvider,
  analyticsValues } from '../../providers/analytics/analytics';

@IonicPage()
@Component({
  selector: 'page-newsfeed',
  templateUrl: 'newsfeed.html',
})
export class NewsfeedPage implements AfterViewInit {
  public isInfiniteEnable = false;

  public newsfeedHeader = this.translate.instant('NEWSFEED.TITLE');
  public celebrateText = this.translate.instant('NEWSFEED.CELEBRATING');
  public agoText = this.translate.instant('GENERIC_MESSAGES.AGO');

  public communityNewsfeed: any[] = [];
  public progressAchievements: Achievement[] = [];
  public healthAchievements: Achievement[] = [];
  public moneyAchievements: Achievement[] = [];
  public communityAchievements: Achievement[] = [];
  public numberOfEvents = 6;
  public offset = 0;
  private oneWeekInDays = 7;
  private cacheImageSize = 10485760; // moreless 10 M
  private infiniteScroll: any;
  public isLoading: boolean;
  public hasNotification: boolean;

  public shouldTryTimes = 3;

  constructor(
    public navCtrl: NavController,
    public translate: TranslateService,
    public config: BreakroomConfig,
    public achieveProvider: AchievementsProvider,
    private logger: Logger,
    public nStore: NotificationStore,
    public auth: AuthProvider,
    private imageLoaderConfig: ImageLoaderConfig,
    public http: HttpClient,
    public analyticsService: AnalyticsProvider
  ) {}

  // Lifecycle
  public ngAfterViewInit() {
    this.moneyAchievements = this.config.myMoneyAchievements;
    this.loadAnimationDataMyHeathAchievementss();
    this.loadAnimationDataMyProgressAchievements();
    this.loadAnimationDataMyCommunityAchievementss();
    this.setImageCache();
  }

  private async loadAnimationDataMyHeathAchievementss() {
    for (const myHeathAchievement of this.config.myHeathAchievements) {
      const data = await this.http
        .get(myHeathAchievement.lottieConfig.path)
        .toPromise()
        .catch(error => this.logger.log(error));
      if (data) {
        myHeathAchievement.lottieConfig.animationData = data;
      }
      this.healthAchievements.push(myHeathAchievement);
    }
  }

  private async loadAnimationDataMyProgressAchievements() {
    for (const myProgressAchievement of this.config.myProgressAchievements) {
      const data = await this.http
        .get(myProgressAchievement.lottieConfig.path)
        .toPromise()
        .catch(error => this.logger.log(error));
      if (data) {
        myProgressAchievement.lottieConfig.animationData = data;
      }
      this.progressAchievements.push(myProgressAchievement);
    }
  }

  private async loadAnimationDataMyCommunityAchievementss() {
    for (const communityAchievement of this.config.communityAchievements) {
      const data = await this.http
        .get(communityAchievement.lottieConfig.path)
        .toPromise()
        .catch(error => this.logger.log(error));
      if (data) {
        communityAchievement.lottieConfig.animationData = data;
      }
      this.communityAchievements.push(communityAchievement);
    }
  }

  /**
   * Set configurations for image cache.
   */
  private setImageCache() {
    this.imageLoaderConfig.enableSpinner(true);
    this.imageLoaderConfig.setMaximumCacheSize(this.cacheImageSize);
    this.imageLoaderConfig.setImageReturnType('base64');
  }

  public async ionViewWillEnter() {
    this.analyticsService.trackStateAction({
      pagename: analyticsValues.PAGE_NEWSFEED,
    });

    this.hasNotification = this.nStore.isanyNotificationNotSeen();
    this.restartInfinite();
    this.isLoading = true;
    this.onImageLoad().then(() => {
      // load in sequence for avoid scrolling delay
      this.offset = this.offset + this.numberOfEvents;
      this.onImageLoad();
    });
  }

  public doInfinite(infiniteScroll) {
    this.offset = this.offset + this.numberOfEvents;
    this.setInfiniteScroll(infiniteScroll);
    new Promise(resolve => {
      this.onImageLoad()
        .then(disable => {
          this.getInfiniteScroll().complete();
          if (disable) {
            this.getInfiniteScroll().enable(false);
          }
          resolve();
        })
        .catch(() => {
          resolve();
        });
    });
  }

  public async onImageLoad(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const params = this.getShareAchievementPayload();
        this.achieveProvider
          .getSharedAchievements(params)
          .then(res => {

            const achResults = res.results;
            if (this.shouldReturnOnImageLoad(achResults)) {
              this.shouldTryTimes--;
              if (this.shouldTryTimes === 0) {
                resolve(true);
              } else {
                resolve(false);
              }
            }

            this.cleanArrayBeforeCreateNewsfeed(achResults);

            if (this.shouldReturnOnImageLoad(achResults)) {
              resolve(false);
            }

            this.createNewsfeedFormat(achResults)
              .then(() => {
                this.isLoading = false;
                resolve(false);
              })
              .catch(error => {
                resolve(false);
              });
          });
      } catch (error) {
        this.logger.error(error);
        resolve(false);
      }
    });
  }

  private shouldReturnOnImageLoad(communityNewsfeedResponse) {
    if (communityNewsfeedResponse.length === 0) {
      this.isLoading = false;

      return true;
    }

    return false;
  }

  private cleanArrayBeforeCreateNewsfeed(communityNewsfeedResponse) {
    let cleanedNewsfeedResponse = communityNewsfeedResponse;
    // avoid items without achievementTitle
    cleanedNewsfeedResponse = communityNewsfeedResponse.filter(
      item => item.attributes.achievementTitle
    );
    // avoid items without lastModifiedTime
    cleanedNewsfeedResponse = communityNewsfeedResponse.filter(
      item => item.lastModifiedTime
    );

    return cleanedNewsfeedResponse;
  }

  private getShareAchievementPayload() {
    // This returns all shared achievements with the community
    const sinceLastWeek = moment()
      .subtract(this.oneWeekInDays, 'days')
      .format();
    const params = {
      detailed: true,
      personReturns: 'attributes.username,attributes.avatarUrl',
      offset: this.offset,
      limit: this.numberOfEvents,
      order: 'desc',
      lastModifiedTime: sinceLastWeek,
    };

    return params;
  }

  /**
   * Get the achievementTitle from each config array and apply to
   * shared event, along with lottieConfig
   * and human readable timestamp
   */
  private async createNewsfeedFormat(communityNewsfeedResponse): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        communityNewsfeedResponse.map((nf, idx) => {

          const progress = this.progressAchievements.filter(ach => {
            return ach.title === nf.attributes.achievementTitle;
          });

          if (progress.length > 0) {
            communityNewsfeedResponse[idx].lottieConfig =
              progress[0].lottieConfig;
          }

          const health = this.healthAchievements.filter(ach => {
            return ach.title === nf.attributes.achievementTitle;
          });

          if (health.length > 0) {
            communityNewsfeedResponse[idx].lottieConfig =
              health[0].lottieConfig;
          }

          const money = this.moneyAchievements.filter(ach => {
            return ach.title === nf.attributes.achievementTitle;
          });

          if (money.length > 0) {
            communityNewsfeedResponse[idx].lottieConfig = money[0].lottieConfig;
          }

          const community = this.communityAchievements.filter(ach => {
            return ach.title === nf.attributes.achievementTitle;
          });

          if (community.length > 0) {
            communityNewsfeedResponse[idx].lottieConfig =
              community[0].lottieConfig;
          }

          communityNewsfeedResponse[
            idx
          ].sharedTime = this.calculateNewsfeedSharedTime(
            communityNewsfeedResponse[idx].lastModifiedTime
          );

          // add news feed
          if (
            communityNewsfeedResponse[idx].lottieConfig &&
            !this.communityNewsfeed.some(
              e => e.id === communityNewsfeedResponse[idx].id
            )
          ) {
            this.communityNewsfeed.push(communityNewsfeedResponse[idx]);
          }
        });

        resolve(communityNewsfeedResponse);
      } catch (error) {
        this.logger.error(error);
        resolve(communityNewsfeedResponse);
      }
    });
  }

  // Calculate humam-readable time
  private calculateNewsfeedSharedTime(lastModifiedTime) {
    const now = moment(new Date());
    const end = moment(lastModifiedTime);
    const duration = moment.duration(now.diff(end));

    return duration.humanize();
  }

  private setInfiniteScroll(infiniteScroll) {
    this.infiniteScroll = infiniteScroll;
  }
  private getInfiniteScroll() {
    return this.infiniteScroll;
  }

  private restartInfinite() {
    this.communityNewsfeed = [];
    this.offset = 0;
    // tslint:disable-next-line:no-magic-numbers
    this.shouldTryTimes = 3;
    if (this.getInfiniteScroll()) {
      this.getInfiniteScroll().enable(true);
    }
  }
}
