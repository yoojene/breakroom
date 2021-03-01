import { Component } from '@angular/core';
import { NavController, NavParams, IonicPage } from 'ionic-angular';
import {
  AchievementsProvider
} from '../../providers/achievements/achievements';
import { AuthProvider } from '../../providers/auth/auth';
import { TranslateService } from '@ngx-translate/core';
import { ReactionProvider } from '../../providers/reaction/reaction';
import { NotificationStore } from '../../stores/notification.store';
import { LocalNotification } from '../../models/local-notification.model';
import * as mobx from 'mobx';
import { UserStore } from '../../stores/user.store';
import { Logger } from '@pharma/pharma-component-utils';
import {
  NotificationProvider
 } from '../../providers/notification/notification.provider';
import {
  AnalyticsProvider,
  analyticsValues } from '../../providers/analytics/analytics';

@IonicPage()
@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html',
})
export class NotificationsPage {
  // Labels

  public thumbsUpText = this.translate.instant(
    'NOTIFICATION_PANEL.GAVE_YOU_THUMBS'
  );

  public congratsText = this.translate.instant('NOTIFICATION_PANEL.CONGRATS');
  public goalText = this.translate.instant('NOTIFICATION_PANEL.GOAL');
  public agoText = this.translate.instant('LOCAL_NOTIFICATIONS.AGO');

  public hiText = `${this.translate.instant('LOCAL_NOTIFICATIONS.HI')}
  ${this.userStore.user.firstName}.`;

  public noNewNotifications = this.translate.instant(
    'LOCAL_NOTIFICATIONS.NO_NEW_NOTIFICATIONS');

  public unlockedAchievements: any[];

  public loading = true;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private userStore: UserStore,
    public auth: AuthProvider,
    public reaction: ReactionProvider,
    public translate: TranslateService,
    public achieveProvider: AchievementsProvider,
    public nStore: NotificationStore,
    private notificationsProvider: NotificationProvider,
    public analyticsService: AnalyticsProvider,
    private logger: Logger
  ) {}

  // Lifecycle

  public async ionViewWillEnter() {
    this.analyticsService.trackStateAction({
      pagename: analyticsValues.PAGE_NOTIFICATIONS
    });
  }

  public async ionViewDidEnter() {
    //
  }

  public ionViewWillLeave() {
    //
  }

  public async onNotificationTap(notification: LocalNotification) {
    this.logger.log(notification);

    const notificationjs = mobx.toJS(notification);

    this.nStore.setNotificationSeen(true, notification.id);

    if (notification.notificationType === 'dailyDiary') {
      return this.navCtrl.push('DailyDataCapturePage');
    }

    if (notification.notificationType === 'reminder') {
      // Same nav as dosage deeplinks - Champix Info page
      return this.navCtrl.setRoot('TabsPage', { deepLink: true });
    }
    if (notification.notificationType === 'profile') {
      return this.navCtrl.push('EditProfilePage');
    }
    if (notification.deepLinkId) {
      return this.navCtrl.push('AchievementsDetailPage', {
        achievementLinkId: notificationjs.deepLinkId,
        redirectNewsFeed: false,
      });
    }
  }
}
