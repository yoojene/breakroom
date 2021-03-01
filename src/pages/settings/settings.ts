import { Component, ChangeDetectionStrategy} from '@angular/core';
import { NavController, NavParams, App, IonicPage } from 'ionic-angular';
import { TermsConditionsPage } from '../terms-conditions/terms-conditions';
import { AboutPage } from '../about/about';
import {
  NotificationsSettingsPage
} from '../notifications-settings/notifications-settings';
import { TranslateService } from '@ngx-translate/core';
import { UserStore } from '../../stores/user.store';
import {
  NotificationProvider
 } from '../../providers/notification/notification.provider';
import {
  EditAccountAvatarPage
} from '../edit-account-avatar/edit-account-avatar';
import { NotificationStore } from '../../stores/notification.store';
import { AuthProvider } from '../../providers/auth/auth';
import {
  AnalyticsProvider,
  analyticsValues } from '../../providers/analytics/analytics';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  public accountText = this.translate.instant('SETTINGS.ACCOUNT_SETTINGS');
  public editProfileText = this.translate.instant('SETTINGS.EDIT_PROFILE');
  public editProfileSubText = this.translate.instant(
    'SETTINGS.EDIT_PROFILE_SUBHEADER'
  );

  public notificationsText = this.translate.instant(
    'NOTIFICATION_PANEL.I1_TITLE'
  );
  public notificationsSubText = this.translate.instant(
    'NOTIFICATION_PANEL.I1_SUBTITLE'
  );

  public aboutText = this.translate.instant('SETTINGS.ABOUT');
  public termsText = this.translate.instant('SETTINGS.TERMS_OF_USE');
  public privacyText = this.translate.instant('SETTINGS.PRIVACY');
  public logOutText = this.translate.instant('SETTINGS.LOGOUT');
  public avatarText = this.translate.instant('SETTINGS.AVATAR');

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public authProvider: AuthProvider,
    public notificationsProvider: NotificationProvider,
    public userStore: UserStore,
    public notificationStore: NotificationStore,
    public analyticsService: AnalyticsProvider,
    public iab: InAppBrowser,
    public app: App
  ) {}

  public ionViewDidLoad() {
    this.analyticsService.trackStateAction({
      pagename: analyticsValues.PAGE_SETTINGS,
    });
  }

  public editProfile() {
    this.navCtrl.push('EditProfilePage');
  }

  public avatar() {
    this.navCtrl.push(EditAccountAvatarPage);
  }

  public notifications() {
    this.navCtrl.push(NotificationsSettingsPage);
  }

  public about() {
    this.navCtrl.push(AboutPage);
  }

  public termsOfUse() {
    this.navCtrl.push(TermsConditionsPage);

  }

  public openPrivacyPolicy() {
    this.iab.create(
      'https://privacycenter.pharma.com/en/app/breakroom-australia',
      '_system'
    );
  }

  public async doLogOut() {
    await this.authProvider.doLogOut();
  }
}
