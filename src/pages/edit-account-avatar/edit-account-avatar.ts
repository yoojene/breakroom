import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthProvider } from '../../providers/auth/auth';
import {
  UserInterfaceUtilsProvider
} from '../../providers/utils/user-interface-utils';
import { Logger } from '@pharma/pharma-component-utils';
import { UserStore } from '../../stores/user.store';
import {
  AchievementsProvider
 } from '../../providers/achievements/achievements';
import {
  AnalyticsProvider,
  analyticsValues } from '../../providers/analytics/analytics';
import { pharmaPerson } from '../../models/user.model';

@Component({
  selector: 'page-edit-account-avatar',
  templateUrl: 'edit-account-avatar.html',
})
export class EditAccountAvatarPage {
  // Text

  public editAccountTitle = this.translate.instant(
    'CREATE_ACCOUNT.C4_EDIT_TITLE');
  public editAccountBodyText = this.translate.instant(
    'CREATE_ACCOUNT.C7_BODYTEXT'
  );

  public avatar = this.translate.instant('CREATE_ACCOUNT.C7_AVATAR');
  public nextButtonText = this.translate.instant('CREATE_ACCOUNT.DONE_BUTTON');

  public nextDisabled = true;
  public selectedAvatar: string;

  // Avatars
  public avatars = [
    {
      avatarUrl: 'assets/imgs/j-avatar-1.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-1-f.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-2.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-2-f.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-3.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-3-f.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-4.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-4-f.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-5.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-5-f.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-6.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-6-f.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-7.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-7-f.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-8.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-8-f.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-9.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-9-f.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-10.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-10-f.svg',
      selected: false,
    },
  ];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    private auth: AuthProvider,
    private uiUtils: UserInterfaceUtilsProvider,
    private logger: Logger,
    public userStore: UserStore,
    public achieveProvider: AchievementsProvider,
    public analyticsService: AnalyticsProvider,
  ) {
    this.setSelectedAvatar();
  }

  public ngOnInit(){
    this.analyticsService.trackStateAction({
      pagename: analyticsValues.PAGE_EDIT_AVATAR
    });
  }
  // Public

  public setSelectedAvatar(){
    const previousSelectedAvatarUrl = this.userStore.user.avatarUrl;
    this.avatars.forEach((av, i) => {
      // tslint:disable-next-line:prefer-conditional-expression
      if (previousSelectedAvatarUrl === av.avatarUrl) {
        av.selected = !av.selected;
        this.selectedAvatar = av.avatarUrl;
        this.nextDisabled = !av.selected;
      }
    });
  }

  public async onNextTap() {
    // Update pharma Person here with attributes
    try {

      this.analyticsService.trackAction({
        pagename: `${analyticsValues.PAGE_EDIT_AVATAR}`,
        linkname: `New avatar url|${this.selectedAvatar}`,
      });

      const person: pharmaPerson = {
        id: this.userStore.user.id,
        firstName: this.userStore.user.firstName,
        lastName: this.userStore.user.lastName,
      };
      const personUpdates = {
        avatarUrl: this.selectedAvatar,
      };

      this.uiUtils.showLoading();
      this.auth.updatepharmaPerson(person, personUpdates).then(res => {
        this.uiUtils.hideLoading();
        this.userStore.updateAvatar(this.selectedAvatar);
        this.achieveProvider.updateSharedAchievement(
          {avatarUrl: this.selectedAvatar,
            username: this.userStore.user.username
          });
        this.navCtrl.popToRoot();
      })
      .catch(err => {
        this.logger.error(err);
        // TODO Handle error message
        this.uiUtils.hideLoading();

      });

      // Add to UserStore

     // this.uiUtils.hideLoading();
      /*this.navCtrl.push(PersonaliseEntryPage,
        {registeredPerson: this.registeredPerson});*/
    } catch (err) {
      this.uiUtils.hideLoading();
      this.logger.error(err);
    }

  }

  public onAvatarSelect(avatar, idx) {

    // this.nextDisabled = true;
    this.avatars.forEach((av, i) => {
      // tslint:disable-next-line:prefer-conditional-expression
      if (idx === i) {
        av.selected = !av.selected;
        this.selectedAvatar = av.avatarUrl;
        this.nextDisabled = !av.selected;
      } else {
        av.selected = false;
      }
    });

  }

}
