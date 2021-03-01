import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { UserStore } from '../../stores/user.store';
import { AchievementsProvider } from '../../providers/achievements/achievements';
import { AchievementEventMap } from '../../models/achievement.model';
import { AuthProvider } from '../../providers/auth/auth';
import { Logger } from '@pharma/pharma-component-utils';
import { DailyDataCapturePage } from '../../pages/daily-data-capture/daily-data-capture';
import { DashboardLogicProvider } from '../../providers/dashboard/dashboard-logic';
import { pharmaPerson } from '../../models/user.model';

@IonicPage()
@Component({
  selector: 'page-personalise-complete',
  templateUrl: 'personalise-complete.html',
})
export class PersonaliseCompletePage {

  public achievement: any;
  public showSpinner = false;
  public redirectToDashBoard = false;

  // Labels
  public personalCompleteHeader = this.translate.instant(
    'PERSONALISE.COMPLETE_HEADER'
  );
  public skip = this.translate.instant('PERSONALISE.SKIP');

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public userStore: UserStore,
    public achieveProvider: AchievementsProvider,
    public dashboardLogic: DashboardLogicProvider,
    public logger: Logger,
    public auth: AuthProvider
  ) {}

  // Lifecycle

  public ionViewWillEnter() {
    this.showSpinner=false;
    this.redirectToDashBoard=true;
  }

  public ionViewDidLoad() {

    // this.achievement = this.userStore.user.latestUnlockedAchievement;
  }

  public ionViewWillLeave() {
    this.redirectToDashBoard=false;
  }

  // Public

  public onCelebrateAchievementTap(e) {

    this.showSpinner=true;
    this.userStore.updateLatestUnlockedAchievementCelebrated(true);
    this.achieveProvider
      .shareAchievement(
        this.userStore.user.latestUnlockedAchievement
      )
      .then(async res => {
        this.logger.log(res);

        this.achievement = res;

        this.userStore.updateLatestUnlockedAchievementCelebrated(true);

        const type = this.userStore.user.latestUnlockedAchievement.type;
        const name = this.userStore.user.latestUnlockedAchievement.name;

        const achieveEvent: AchievementEventMap = {
          name,
          eventId: this.achievement.id,
          celebrated: true,
        };

        this.userStore.updateCelebratedAchievement(achieveEvent, type);

        // Update pharma
        const person: pharmaPerson = {
          id: this.userStore.user.id,
          firstName: this.userStore.user.firstName,
          lastName: this.userStore.user.lastName,
          email: this.userStore.user.email,
        };

        const personUpdates = {
          latestUnlockedAchievement: this.userStore.user
            .latestUnlockedAchievement
        };

        this.auth.updatepharmaPerson(person, personUpdates);

        if( this.redirectToDashBoard){

            this.showSpinner=false;
            this.onDoneTap();
        }
      })
      .catch(err => {
        this.showSpinner=false;
        this.userStore.updateLatestUnlockedAchievementCelebrated(false);
        this.logger.error(err);
      });

  }

  // public onHighFiveTap() {
  //   //
  // }

  public onDoneTap() {
    if(!this.dashboardLogic.isPostQuit()){
      this.navCtrl.push(DailyDataCapturePage, { fromDashBoard: false });
    } else{
      this.navCtrl.setRoot('TabsPage');
    }
  }
}
