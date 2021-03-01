import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthProvider } from '../../providers/auth/auth';
import { PersonaliseEntryPage } from '../personalise-entry/personalise-entry';
import {
  UserInterfaceUtilsProvider
} from '../../providers/utils/user-interface-utils';
import { Logger } from '@pharma/pharma-component-utils';
import { UserStore } from '../../stores/user.store';
import {
  NotificationProvider
 } from '../../providers/notification/notification.provider';
import { BreakroomConfig } from '../../app/app.config';
import {
  AnalyticsProvider,
  analyticsValues } from '../../providers/analytics/analytics';

@IonicPage()
@Component({
  selector: 'page-create-account-avatar',
  templateUrl: 'create-account-avatar.html',
})
export class CreateAccountAvatarPage {
  // Text

  public createAccountTitle = this.translate.instant('CREATE_ACCOUNT.C4_TITLE');
  public createAccountBodyText = this.translate.instant(
    'CREATE_ACCOUNT.C7_BODYTEXT'
  );

  public avatar = this.translate.instant('CREATE_ACCOUNT.C7_AVATAR');
  public nextButtonText = this.translate.instant('CREATE_ACCOUNT.NEXT_BUTTON');

  public nextDisabled = true;
  public selectedAvatar: string;

  // Passed ProfileForm and registeredPerson
  public profileForm: any;
  public registeredPerson: any;

  public avatars = this.config.avatars;
  public reloadAvatar= true;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public config: BreakroomConfig,
    private auth: AuthProvider,
    private uiUtils: UserInterfaceUtilsProvider,
    private logger: Logger,
    public userStore: UserStore,
    private notification: NotificationProvider,
    public analyticsService: AnalyticsProvider
  ) {}

  public ionViewWillEnter() {
    // Report page view to analytics
    this.analyticsService.trackStateAction({
      pagename: analyticsValues.PAGE_CREATE_AVATAR
    });

    this.reloadAvatar = this.navParams.get('reloadAvatar');

   if(this.reloadAvatar){
    this.resetSelectAvatar();
   }
   this.reloadAvatar = true;
  }

  public ionViewDidEnter() {
    this.profileForm = this.navParams.get('profileForm');
    this.registeredPerson = this.navParams.get('registeredPerson');
  }

  // Public

  public resetSelectAvatar(){
    this.selectedAvatar =null;
    this.nextDisabled = true;
    this.avatars.forEach((av, i) => {
      av.selected = false;
    });
  }

  public async onNextTap() {
    // Update pharma Person here with attributes
    this.profileForm.avatarUrl = this.selectedAvatar;
    this.profileForm.enableNotification = true;
    try {
      this.uiUtils.showLoading();
      const personRes = await this.auth.updatepharmaPerson(
        this.registeredPerson,
        this.profileForm);

      // Add to UserStore
      this.userStore.createNewUser({
        id: personRes.id,
        onboardingComplete: false,
        firstName: personRes.firstName,
        lastName: personRes.lastName,
        dateOfBirth: personRes.attributes.dateOfBirth,
        enableNotification: true,
        gender: personRes.attributes.gender,
        avatarUrl: personRes.attributes.avatarUrl,
        email: personRes.email,
        username: personRes.attributes.username,
        postCode: personRes.attributes.postCode,
        quitMethod: personRes.attributes.quitMethod,
        quitDate: personRes.attributes.quitDate,
        startDate: personRes.attributes.startDate,
        authenticated: true,
      });

      // Add Registraton event

      await this.auth.addRegistrationEvent();

      // Set JanrainId as UA tags
      this.notification.registerTags(personRes.id);

      this.notification.checkAndSetTags();

      this.uiUtils.hideLoading();
      this.navCtrl.push(PersonaliseEntryPage,
        {registeredPerson: this.registeredPerson});

      // send to adobe Analaitics
      this.analyticsService.trackAction({
        pagename: `${analyticsValues.PAGE_CREATE_AVATAR}`,
        linkname: `Create avatar|${this.userStore.user.avatarUrl}|
        ${this.userStore.user.username}`,
      });

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
