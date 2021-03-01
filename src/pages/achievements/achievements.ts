import { Component } from '@angular/core';
import { NavController, App, IonicPage } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { BreakroomConfig } from '../../app/app.config';
import { AchievementsProvider
} from '../../providers/achievements/achievements';
import { UserStore } from '../../stores/user.store';
import { Logger } from '@pharma/pharma-component-utils';
import { AchievementEventMap } from '../../models/achievement.model';
import { AuthProvider } from '../../providers/auth/auth';
import { CommunityProvider } from '../../providers/community/community';
import * as mobx from 'mobx';
import { NotificationStore } from '../../stores/notification.store';
import * as moment from 'moment';
import {
  AnalyticsProvider,
  analyticsValues } from '../../providers/analytics/analytics';
import { HttpClient } from '@angular/common/http';
import { pharmaPerson } from '../../models/user.model';

@IonicPage({
  name: 'achievement-list',
})
@Component({
  selector: 'page-achievements',
  templateUrl: 'achievements.html',
})
export class AchievementsPage {
  // Labels
  public achievementsHeader = this.translate.instant('ACHIEVEMENTS.TITLE');
  public progressHeader = this.translate.instant('ACHIEVEMENTS.MY_PROGRESS');
  public heathHeader = this.translate.instant('ACHIEVEMENTS.MY_HEALTH');
  public moneyHeader = this.translate.instant('ACHIEVEMENTS.MY_MONEY');
  public communityHeader = this.translate.instant(
    'ACHIEVEMENTS.COMMUNITY_SPIRIT'
  );

  public progressAchievements: any;
  public healthAchievements: any;
  public moneyAchievements: any;
  public communityAchievements: any;

  public unlockedProgressAchievements: any;
  public unlockedHealthAchievements: any;
  public unlockedMoneyAchievements: any;
  public unlockedCommunityAchievements: any;

  public unlocked: any;

  public achievementsList: any;

  private achievements: any;
  private achievement: any;

  private achievementAnim: any;

  public likeCount: any;
  public hasNotification: boolean;

  public redirectToNewsFeed = false;
  public showSpinner = false;

  public animOptions = {};

  constructor(
    public navCtrl: NavController,
    public http: HttpClient,
    public translate: TranslateService,
    public config: BreakroomConfig,
    public achieveProvider: AchievementsProvider,
    public userStore: UserStore,
    private logger: Logger,
    public auth: AuthProvider,
    public nStore: NotificationStore,
    public community: CommunityProvider,
    private app: App,
    public analyticsService: AnalyticsProvider,
  ) {}

  public async ngOnInit() {
    this.animOptions = {
      autoplay: true,
      loop: false,
      path: this.getAnimationPath(),
    };

  }

  // Lifecycle

  public async ionViewWillEnter() {

    // Clear animOptions to ensure we get the a new updated animation
    // when an acheivement is unlocked (latestUnlockedAchievement)
    this.animOptions = null;

    this.analyticsService.trackStateAction({
      pagename: analyticsValues.PAGE_ACHIEVEMENTS
    });

    this.redirectToNewsFeed = true;
    this.showSpinner = false;
    this.likeCount = this.userStore.user.latestUnlockedAchievement.numLikes;
    this.hasNotification = this.nStore.isanyNotificationNotSeen();

    const currentDate = moment().startOf('day');

    // Get latest achievements
    await this.achieveProvider.checkLatestAchievements(currentDate);

    // Update animOptions
    this.animOptions = {
      autoplay: true,
      loop: false,
      path: this.getAnimationPath(),
    };

    this.unlockedProgressAchievements = mobx.toJS(
      this.userStore.user.unlockedProgressAchievements);
    this.unlockedMoneyAchievements = mobx.toJS(
      this.userStore.user.unlockedMoneyAchievements);
    this.unlockedHealthAchievements = mobx.toJS(
      this.userStore.user.unlockedHealthAchievements);
    this.unlockedCommunityAchievements = mobx.toJS(
      this.userStore.user.unlockedCommunityAchievements);

  }

  public ionViewWillLeave() {
    this.redirectToNewsFeed = false;
    if (this.achievementAnim) {
      this.achievementAnim.destroy();
    }
  }

  // Public

  private getAnimationPath(){
    const lottie = this.userStore.user.latestUnlockedAchievement.lottieConfig;
    if(lottie){
      return lottie.path;
    } else{
      return '';
    }
  }

  public onAnimationEventEmitted(e) {
    this.achievementAnim = e;
  }

  public onAchievementSelected(ev, type) {
    let unlocked;
    let achievementStoreList;
    let configAchievementsList;

    switch (type) {
      case 'progress':
        achievementStoreList = mobx.toJS(
          this.userStore.user.unlockedProgressAchievements
        );
        configAchievementsList = this.config.myProgressAchievements;
        break;
      case 'health':
        achievementStoreList = mobx.toJS(
          this.userStore.user.unlockedHealthAchievements
        );
        configAchievementsList = this.config.myHeathAchievements;
        break;
      case 'money':
        achievementStoreList = mobx.toJS(
          this.userStore.user.unlockedMoneyAchievements
        );
        configAchievementsList = this.config.myMoneyAchievements;
        break;
      case 'community':
        achievementStoreList = mobx.toJS(
          this.userStore.user.unlockedCommunityAchievements
        );
        configAchievementsList = this.config.communityAchievements;
        break;
      default:
    }

    if (Array.isArray(achievementStoreList)) {
      unlocked = achievementStoreList.filter(ach => {
        return ach.name === ev.name;
      });
      [unlocked] = unlocked;
    } else {
      unlocked = achievementStoreList;
    }

    this.achievements = configAchievementsList.filter(ach => {
      return ev.name === ach.name;
    });
    [this.achievement] = this.achievements;
    this.achievement.eventId = unlocked.eventId;
    this.achievement.celebrated = unlocked.celebrated;
    this.achievement.numLikes = unlocked.numLikes;

    this.navCtrl.push('AchievementsDetailPage', {
      // achievement: this.achievement,
      // tslint:disable-next-line:object-literal-key-quotes
      achievementLinkId: this.achievement.deepLinkId,
      redirectNewsFeed: true,
    });
  }

  public onCelebrateAchievementTap(e) {
    this.userStore.updateLatestUnlockedAchievementCelebrated(true);

    this.showSpinner = true;
    this.achieveProvider
      .shareAchievement(this.userStore.user.latestUnlockedAchievement)
      .then(async res => {
        this.goToNewsFeed();
        this.achievement = res;

        const type = this.userStore.user.latestUnlockedAchievement.type;
        const name = this.userStore.user.latestUnlockedAchievement.name;

        this.userStore.updateLatestUnlockedAchievementCelebrated(true);

        const achieveEvent: AchievementEventMap = {
          // tslint:disable-next-line:object-literal-shorthand
          name: name,
          eventId: this.achievement.id,
          celebrated: true,
        };

        this.userStore.updateCelebratedAchievement(achieveEvent, type);

        // Update pharma
        const person: pharmaPerson = {
          id: this.userStore.user.id,
          firstName: this.userStore.user.firstName,
          lastName: this.userStore.user.lastName,
        };

        // Update all the achievements arrays and the latestUnlocked
        // since the latest could be any of them
        const personUpdates = {
          unlockedProgressAchievements: this.userStore.user
            .unlockedProgressAchievements,
          unlockedHealthAchievements: this.userStore.user
            .unlockedHealthAchievements,
          unlockedMoneyAchievements: this.userStore.user
            .unlockedMoneyAchievements,
          unlockedCommunityAchievements: this.userStore.user
            .unlockedCommunityAchievements,
          latestUnlockedAchievement: this.userStore.user
            .latestUnlockedAchievement,
        };

        await this.auth.updatepharmaPerson(person, personUpdates);
      })
      .catch(err => {
        this.showSpinner = false;
        this.userStore.updateLatestUnlockedAchievementCelebrated(false);
        this.logger.error(err);
      });
  }

  private goToNewsFeed() {
    // go to newsfeed
    if (this.redirectToNewsFeed) {
      this.showSpinner = false;
      this.app.getActiveNavs()[0].parent.select(0);
    }
  }

}
