import {
  Component,
  Output,
  EventEmitter,
  Input,
  SimpleChanges,
  ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BreakroomConfig } from '../../app/app.config';
import {
   Achievement,
  AchievementEventMap } from '../../models/achievement.model';
import { UserStore } from '../../stores/user.store';
import { ModalController } from 'ionic-angular';
import { QuitMethods } from '../../constants/quit-method-constants';
import {
  MyMoneyModalComponent
 } from '../../pages/dashboard/my-money-modal/my-money-modal';

@Component({
  selector: 'achievements-pane',
  templateUrl: 'achievements-pane.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AchievementsPaneComponent {
  /**
   * unlocked achievements from UserStore
   */
  @Input()
  public unlockedAchievements: AchievementEventMap[];
  /**
   * HTML section title
   */
  @Input()
  public achievementTitle: any;
  /**
   * One of progress, health, money, community
   */
  @Input()
  public type: string;
  /**
   * Selected achievement emitted
   */
  @Output()
  public selectedAchievement = new EventEmitter();

  public displayAchievements: Achievement[];
  public animSize = 115;
  public headerClass = 'achievements-pane--header';

  private achievementsList: any = [];

  constructor(
    public translate: TranslateService,
    public config: BreakroomConfig,
    public userStore: UserStore,
    public modalCtrl: ModalController
  ) {}

  // Lifecycle

  public ngOnInit() {
    switch (this.type) {
      case 'progress':
        this.headerClass =
          ' achievements-pane--header achievements-pane--header--progress';
        break;
      case 'health':
        this.headerClass =
          'achievements-pane--header achievements-pane--header--health';
        break;
      case 'money':
        this.headerClass =
          'achievements-pane--header achievements-pane--header--money';
        break;
      case 'community':
        this.headerClass =
          'achievements-pane--header achievements-pane--header--community';
        break;
      default:
        this.headerClass = 'achievements-pane--header';
    }
  }
  public ngOnChanges(changes: SimpleChanges) {
    this.achievementsList = [];
    if (
      changes &&
      changes.unlockedAchievements &&
      changes.unlockedAchievements.currentValue
    ) {
      this.achievementsList = changes.unlockedAchievements.currentValue;

      switch (this.type) {
        case 'progress':
          if (this.userStore.user.quitMethod !== QuitMethods.REDUCE_QUIT){
            this.config.myProgressAchievements =
            this.config.myProgressAchievements.filter(prog =>
              prog.name !== 'sixteenWeeks' && prog.name !== 'twentyWeeks');
          }
          this.updateAchievementsToDisplay(this.config.myProgressAchievements);
          break;
        case 'health':
          this.updateAchievementsToDisplay(this.config.myHeathAchievements);
          break;
        case 'money':
          this.updateAchievementsToDisplay(this.config.myMoneyAchievements);
          break;
        case 'community':
          this.updateAchievementsToDisplay(this.config.communityAchievements);
          break;
        default:
      }
    }
  }

  // Public
  public onAchievementSelect(achievement: Achievement) {
    this.selectedAchievement.emit(achievement);
  }

  public onProjectedLifeSavingsProgressTap() {
    const projectModal = this.modalCtrl.create(
      MyMoneyModalComponent,
      {},
      { cssClass: 'settings-modal' }
    );
    projectModal.present();
  }

  /*
   * Check unlocked achievements against the full list from
   * BreakroomConfig and unlock  as required to change achievement badges
   */
  private updateAchievementsToDisplay(allAchievements: Achievement[]) {
    // Update the unlocked flag to true for all those achievements unlocked
    this.displayAchievements = allAchievements.map(ach => {
      // https://stackoverflow.com/a/50909930/5466366
      const checkAchName = achObj => achObj.name === ach.name;
      // .some() returns a boolean
      let returnAch = ach;
      if (Array.isArray(this.achievementsList)) {
        const res = this.achievementsList.some(checkAchName);
        if (res) {
          returnAch = { ...ach, unlocked: true };
        }
      } else {
        if (this.achievementsList.name === ach.name) {
          returnAch = { ...ach, unlocked: true };
        }
      }

      return returnAch;
    });

    // If no achievement unlocked, just use the passed list from config
    if (this.achievementsList.length === 0) {
      return (this.displayAchievements = allAchievements);
    }
  }
}
