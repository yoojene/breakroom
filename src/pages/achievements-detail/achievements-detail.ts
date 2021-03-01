import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Navbar, App } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import {
  AchievementsProvider
 } from '../../providers/achievements/achievements';
import { Logger } from '@pharma/pharma-component-utils';
import {
  AchievementEventMap, Achievement
 } from '../../models/achievement.model';
import { UserStore } from '../../stores/user.store';
import { AuthProvider } from '../../providers/auth/auth';
import * as mobx from 'mobx';
import { BreakroomConfig } from '../../app/app.config';
import { pharmaPerson } from '../../models/user.model';

@IonicPage({
  segment: 'achievements-detail/:achievementLinkId',
  defaultHistory: ['achievement-list'],
})
@Component({
  selector: 'page-achievements-detail',
  templateUrl: 'achievements-detail.html',
})

export class AchievementsDetailPage {

  @ViewChild(Navbar) public navBar: Navbar;

  // Labels
  public achievementsHeader = this.translate.instant('ACHIEVEMENTS.TITLE');

  public lottieConfig = {};

  private deepLinkId: any;
  private redirectNewsFeed = false;
  private showSpinner = false;

  private achievementAnim: any;
  private achievements: any;
  public achievement: Achievement;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public achieveProvider: AchievementsProvider,
    public userStore: UserStore,
    public auth: AuthProvider,
    private logger: Logger,
    private config: BreakroomConfig,
    private app: App
  ) {}

  // Lifecycle

  public ngOnInit() {
    this.redirectNewsFeed = this.navParams.get('redirectNewsFeed');
    this.setShowSpinner(false);
    this.renderAchievementDetail();
    this.setBackButton();
  }

  public ionViewWillEnter() {
    this.redirectNewsFeed = this.navParams.get('redirectNewsFeed');
    this.setShowSpinner(false);
    this.renderAchievementDetail();
    this.setBackButton();
  }

  public ionViewWillLeave() {
    this.achievementAnim.destroy();
  }

  public onAnimationEventEmitted(e) {
    this.achievementAnim = e;
  }

  public setBackButton(){
    this.navBar.backButtonClick = () => {
      this.redirectNewsFeed = false;
       this.navCtrl.pop();

    };
  }
  // Public

/**
 * Share achievement with community
 */
public onCelebrateAchievementTap(e) {
    this.achievement.celebrated = true;
    this.setShowSpinner(true);

    this.achieveProvider
      .shareAchievement(this.achievement)
      .then(async res => {
        this.logger.log(res);

        this.achievement.celebrated = true;
        this.achievement.janrainId = res.janrainId;

        const achieveEvent: AchievementEventMap = {
          name: this.achievement.name,
          eventId: this.achievement.eventId,
          celebrated: true,
          deepLinkId: this.achievement.deepLinkId,
          janrainId: this.achievement.janrainId
        };

        this.userStore.updateCelebratedAchievement(
          achieveEvent,
          this.achievement.type
        );

        // if it is the last achievement celebrate it
        this.caseUnlockedSetAchievementCelebrated();

        // Update pharma
        const person: pharmaPerson = {
          id: this.userStore.user.id,
          firstName: this.userStore.user.firstName,
          lastName: this.userStore.user.lastName,
        };

        const personUpdates = {
          progressAchievements: this.userStore.user.progressAchievements,
          healthAchievements: this.userStore.user.healthAchievements,
          moneyAchievements: this.userStore.user.moneyAchievements,
          communityAchievements: this.userStore.user.communityAchievements,
          unlockedProgressAchievements: this.userStore.user
            .unlockedProgressAchievements,
          unlockedHealthAchievements: this.userStore.user
              .unlockedHealthAchievements,
            unlockedMoneyAchievements: this.userStore.user
              .unlockedMoneyAchievements,
            unlockedCommunityAchievements: this.userStore.user
            .unlockedCommunityAchievements,
        };

        await this.auth.updatepharmaPerson(person, personUpdates);

        this.goToNewsFeed();

      })
      .catch(err => {
        this.setShowSpinner(false);
        this.achievement.celebrated = false;
        this.logger.error(err);
      });
  }

  // Private
  private caseUnlockedSetAchievementCelebrated(){
    // if it is the last achievement celebrate it
    if (this.achievement.name ===
      this.userStore.user.latestUnlockedAchievement.name) {
      this.userStore.updateLatestUnlockedAchievementCelebrated(true);
    }
  }

  private goToNewsFeed(){
    // go to newsfeed
    if( this.redirectNewsFeed){
      this.setShowSpinner(false);
      this.navCtrl.pop();
      this.app.getActiveNavs()[0].parent.select(0);
    }
  }
  private setShowSpinner(spinnerValue){
    if( this.redirectNewsFeed){
      this.showSpinner = spinnerValue;
    }
  }
/**
 * Render achievement detail and animation from UserStore
 */
private renderAchievementDetail() {
    this.deepLinkId = this.navParams.get('achievementLinkId');

    let unlocked;
    let configAchievementsList;
    const achievementStoreList = mobx
      .toJS(this.userStore.user.unlockedProgressAchievements)
      .concat(mobx.toJS(this.userStore.user.unlockedHealthAchievements))
      .concat(mobx.toJS(this.userStore.user.unlockedMoneyAchievements))
      .concat(mobx.toJS(this.userStore.user.unlockedCommunityAchievements));

    configAchievementsList = this.config.myProgressAchievements
       .concat(this.config.myHeathAchievements)
       .concat(this.config.myMoneyAchievements)
       .concat(this.config.communityAchievements);

    if (Array.isArray(achievementStoreList)) {
      unlocked = achievementStoreList.filter(ach => {
        return ach.deepLinkId === this.deepLinkId;
      });
      [unlocked] = unlocked;
    } else {
      unlocked = achievementStoreList;
    }
    this.achievements = configAchievementsList.filter(ach => {
      return this.deepLinkId === ach.deepLinkId;
    });
    [this.achievement] = this.achievements;

    this.achievement.eventId = unlocked.eventId;
    this.achievement.celebrated = unlocked.celebrated;
    this.achievement.numLikes = unlocked.numLikes;
    this.achievement.janrainId = unlocked.janrainId;

    this.lottieConfig = this.achievement.lottieConfig;
  }
}
