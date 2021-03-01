import { Injectable, Inject } from '@angular/core';
import { UANotification, Logger } from '@pharma/pharma-component-utils';
import { TranslateService } from '@ngx-translate/core';
import { UserStore } from '../../stores/user.store';
import { AchievementsProvider } from '../achievements/achievements';
import { UtilsProvider } from '../utils/utils';
import { AuthProvider } from '../auth/auth';
import { NotificationStore } from '../../stores/notification.store';
import { Diagnostic } from '@ionic-native/diagnostic';
import * as mobx from 'mobx';
import { ReactionProvider } from '../reaction/reaction';
import { BreakroomConfig } from '../../app/app.config';
import { Platform } from 'ionic-angular';
import { DOCUMENT } from '@angular/common';
import {
  LocalNotificationType,
  LocalNotificationTimes,
  LocalNotification,
} from '../../models/local-notification.model';
import * as moment from 'moment';
import { DashboardLogicProvider } from '../dashboard/dashboard-logic';
import { DailyCaptureProvider } from '../daily-capture/daily-capture';

declare const cordova: any;
declare const UAirship: any;

export type UAMethodName =
  | 'setUserNotificationsEnabled'
  | 'isUserNotificationsEnabled'
  | 'getChannelID'
  | 'resetBadge'
  | 'setTags'
  | 'getTags';

export enum UAEventType {
  OnPushReceived = 'urbanairship.push',
  OnNotificationOpened = 'urbanairship.notification_opened',
  OnRegistration = 'urbanairship.registration',
  OnDeepLink = 'urbanairship.deep_link'
}

@Injectable()
export class NotificationProvider {
  public isDosageNotificationsEnabled: boolean;
  public isAchievementsNotificationsEnabled: boolean;
  public isSocialNotificationsEnabled: boolean;
  public isDeviceNotificationsEnabled: boolean;

  private pluginAvailable = false;

  constructor(
    @Inject(DOCUMENT) public document: Document,
    public logger: Logger,
    public config: BreakroomConfig,
    public translate: TranslateService,
    public diagnostic: Diagnostic,
    public platform: Platform,
    public achieveProvider: AchievementsProvider,
    public dashboardLogic: DashboardLogicProvider,
    public dailyCapture: DailyCaptureProvider,
    public auth: AuthProvider,
    public utils: UtilsProvider,
    public userStore: UserStore,
    public notificationStore: NotificationStore,
    public reaction: ReactionProvider
  ) {
    this.platform.ready().then(() => {
      this.checkSystemNotificationPermissions();
      this.enableNotifications().then(res => {
        this.logger.log(res);
        this.checkUAPluginNotificationPermission();
      });
    });
  }

  // Public - Push Notifications / UA setup

  /**
 * Register JanrainId as UA tag
 */
  public registerTags(id?: any) {
    const tags = [id];
    if (typeof cordova !== 'undefined') {
      UAirship.setTags(tags, x => {
        this.logger.log(`Registered tags:  ${x}`);
      });
    } else {
      this.logger.log('ionic serve is enabled, not registering notifications');
    }
  }
/**
 * Check tags registered with UA
 */
public checkAndSetTags(): void {
    let tags;
    if (typeof cordova !== 'undefined') {
      UAirship.getTags(_tags => {
        // tslint:disable-next-line:prefer-conditional-expression
        // this.logger.log('tags registered currently are:', _tags);
        this.logger.log(`tags registered currently are: ${_tags}`);
        tags = _tags;
      });
    } else {
      this.logger.log('ionic serve is enabled, not registering notifications');
    }
  }

  public registerDeeplink() {
    document.addEventListener(
      'urbanairship.notification_opened',
      event => {
        // tslint:disable-next-line:no-console
        this.logger.log(`opened: ${event}`);
      },
      false
    );
    document.addEventListener(
      'urbanairship.deep_link',
      event => {
        // tslint:disable-next-line:no-console
        this.logger.log(`opened: ${event}`);
      },
      false
    );
  }

  // *** 6th Nov, EC *** //
  // Below taken and adapted from LWH PushProvider

  public checkUAPluginNotificationPermission() {
    if (typeof UAirship === 'undefined') {
      this.pluginAvailable = false;

      return undefined;
    }

    this.addAllListeners();
  }

  /**
   * Set UA tags, and show them
   */
  public async setTags(tags: string[]) {
    return this.callUA('setTags', tags);
  }

  /**
   * Change UA notification permission
   */
  public async enableNotifications(toState = true): Promise<any> {
    return this.callUA('setUserNotificationsEnabled', toState);
  }
  /**
   * Check device system notification permission
   */
  public checkSystemNotificationPermissions() {
    if (!this.platform.is('cordova')) {
      return;
    }
    this.diagnostic
      .isRemoteNotificationsEnabled()
      .then(res => {
        this.logger.log(`** PN System Permissions are enabled? ${res}`);
      })
      .catch(err => this.logger.error(`** PN System Permissions error ${err}`));
  }

  public async requestSystemNotificationPermissions(): Promise<any> {
    return this.diagnostic.switchToSettings();
  }

  // Private

  /**
   * Add UA listeners to document
   */
  private addAllListeners() {
    this.document.addEventListener(UAEventType.OnPushReceived, event => {
      this.onPushReceived(event);
    });
    this.document.addEventListener(UAEventType.OnRegistration, event => {
      this.onRegistration(event);
    });
    this.document.addEventListener(UAEventType.OnNotificationOpened, event => {
      this.onNotificationOpened(event);
    });
  }

  /**
   * Result functions from listeners
   */
  private onPushReceived(event) {
    const notification = new UANotification(event);
    this.logger.log(notification.toString());
  }
  private onRegistration(event) {
    const notification = new UANotification(event);
    this.logger.log(notification.toString());
  }
  private onNotificationOpened(event) {
    const notification = new UANotification(event);
    this.logger.log(notification.toString());
  }

  /**
   * Maps UA callbacks to Promises
   */
  private async callUA(methodName: UAMethodName, params?: any) {
    this.logger.log(`Calling UA Method ${methodName} with ${params}`);

    return new Promise((resolve, reject) => {
      if (!this.pluginAvailable) {
        return resolve(params);
      }

      if (typeof params === 'undefined') {
        UAirship[methodName](
          result => this.onUAOperationComplete(resolve, result),
          error => this.onUAOperationComplete(reject, error)
        );
      } else {
        UAirship[methodName](
          params,
          result => this.onUAOperationComplete(resolve, result),
          error => this.onUAOperationComplete(reject, error)
        );
      }
    });
  }

  private onUAOperationComplete(resolver, result): void {
    resolver(result);
  }

  // *** In App Notifications logic (I) ** //

  /**
   *
   *  Feed of all events relating to logged in user
   * - Reactions to my Achievements
   * - My Achievements being unlocked
   * - Daily Diary Reminders
   * - GP Notification
   * - Profile incomplete
   */
  public async getLocationNotificationsFeed(): Promise<boolean> {

    let loading = true;
    this.logger.log('getLocalNotificationsFeed...');

    this.logger.log(mobx.toJS(this.notificationStore.notification));

    const currentNotification = mobx.toJS(this.notificationStore.notification);

    const unlockedAchievements = await this.achieveProvider.
    getMyUnlockedAchievements() as any;

    const progressUnlocked = mobx.toJS(
      this.userStore.user.unlockedProgressAchievements
    );
    const healthUnlocked = mobx.toJS(
      this.userStore.user.unlockedHealthAchievements
    );
    const moneyUnlocked = mobx.toJS(
      this.userStore.user.unlockedMoneyAchievements
    );
    const commUnlocked = mobx.toJS(
      this.userStore.user.unlockedCommunityAchievements
    );

    // All current unlocked achievements from store
    const allUnlocked = [
      ...progressUnlocked,
      ...healthUnlocked,
      ...moneyUnlocked,
      ...commUnlocked,
    ];

    // Constructs the object Local Notification feed
    let reactions;
    let highFiveReactions;
    await Promise.all(
      unlockedAchievements.map(async (not, idx) => {
        // Get the deepLinkId from allUnlocked
        // tslint:disable-next-line:prefer-const
        let deepLinkId = allUnlocked
          .map(all => {
            if (all.eventId === not.id) {
              return all.deepLinkId;
            }
          })
          .filter(ev => {
            return ev !== undefined;
          });

        [deepLinkId] = deepLinkId;
        unlockedAchievements[idx].deepLinkId = deepLinkId;

        unlockedAchievements[
          idx
        ].sharedTime = this.utils.calculateDisplaySharedTime(
          unlockedAchievements[idx].createTime
        );
        unlockedAchievements[idx].seen = false;

        unlockedAchievements[idx].notificationType =
          LocalNotificationType.Achievement;

        // If a likeList array exists, then we build a LocalNotification
        // for the reaction event
        if (unlockedAchievements[idx].attributes.likeList) {

          await Promise.all(
            unlockedAchievements[idx].attributes.likeList.map(
              async (like, ldx) => {
                const reactionres = await this.reaction.checkReactionEvents() as any;

                  // Start to build the LocalNotification
                  reactions = await Promise.all(
                  reactionres.map(async react => {
                    if (
                      react.attributes.eventId === unlockedAchievements[idx].id
                    ) {
                      const reactor = await this.auth.getPersonById(
                        react.personId
                      );
                      const a = {
                        attributes: {
                          achievementBodyText: `${this.translate.instant(
                            'NOTIFICATION_PANEL.GAVE_YOU'
                          )} <span class="like-icon"></span>
                    ${this.translate.instant(
                      'NOTIFICATION_PANEL.FOR'
                    )} <span> ${
                            unlockedAchievements[idx].attributes
                              .achievementTitle
                          } </span>`,
                          achievementTitle:
                            unlockedAchievements[idx].attributes
                              .achievementTitle,
                          id: unlockedAchievements[idx].id,
                          avatarUrl: reactor.attributes.avatarUrl,
                          username: reactor.attributes.username
                        },
                        deepLinkId: unlockedAchievements[idx].deepLinkId,
                        notificationType: LocalNotificationType.Reaction,
                        createTime: react.createTime,
                        createdBy: react.createdBy,
                        eventType: react.eventType,
                        id: react.id,
                        instance: react.instance,
                        isActive: react.isActive,
                        lastModifiedTime: react.lastModifiedTime,
                        modifiedBy: react.modifiedBy,
                        sharedTime: this.utils.calculateDisplaySharedTime(
                          react.createTime
                        ),
                        seen: false,
                      };

                      return a;
                    } else {
                      // This will be filtered out
                      return {
                        notificationType: 'none'
                      };
                    }
                  })
                );

                return reactions;
              }
            )
          );
        }
        if (unlockedAchievements[idx].attributes.hi5List) {

          await Promise.all(unlockedAchievements[idx].attributes.hi5List.map(
              async (like, ldx) => {
                const reactionres = await this.reaction.checkHighFiveEvents() as any;

                // Start to build the LocalNotification
              highFiveReactions = await Promise.all(
                  reactionres.map(async react => {
                    if (
                      react.attributes.eventId ===
                      unlockedAchievements[idx].id
                    ) {
                      const reactor = await this.auth.getPersonById(
                        react.personId
                      );
                      const a = {
                        attributes: {
                          achievementBodyText: `${this.translate.instant(
                            'NOTIFICATION_PANEL.GAVE_YOU'
                          )} <span class="high-five-icon"></span>
                    ${this.translate.instant(
                      'NOTIFICATION_PANEL.FOR'
                    )} <span> ${
                            unlockedAchievements[idx].attributes
                              .achievementTitle
                          } </span>`,
                          achievementTitle:
                            unlockedAchievements[idx].attributes
                              .achievementTitle,
                          id: unlockedAchievements[idx].id,
                          avatarUrl: reactor.attributes.avatarUrl,
                          username: reactor.attributes.username,
                        },
                        deepLinkId:
                          unlockedAchievements[idx].deepLinkId,
                        notificationType:
                          LocalNotificationType.Reaction,
                        createTime: react.createTime,
                        createdBy: react.createdBy,
                        eventType: react.eventType,
                        id: react.id,
                        instance: react.instance,
                        isActive: react.isActive,
                        lastModifiedTime: react.lastModifiedTime,
                        modifiedBy: react.modifiedBy,
                        sharedTime: this.utils.calculateDisplaySharedTime(
                          react.createTime
                        ),
                        seen: false,
                      };

                      return a;
                    } else {
                      // This will be filtered out
                      return {
                        notificationType: 'none',
                      };
                    }
                  })
                );

              return highFiveReactions;
              }
            ));
        }

        return highFiveReactions;
      })
    );

    let notificationEvents = unlockedAchievements;

    // Join the achievement and like reaction events arrays if they exist
    if (reactions) {
      notificationEvents = unlockedAchievements.concat(
        reactions.filter(fil => fil.notificationType !== 'none')
        );
      }
    // Join the achievement and high 5 reaction events arrays if they exist
    if (highFiveReactions) {
      notificationEvents = notificationEvents.concat(
        highFiveReactions.filter(fil => fil.notificationType !== 'none')
        );
      }

    // Other notifications

    const dailyDiaryNotifications = await this
    .generateDailyDiaryNotifications();
    const gpNotification = await this.generateGPNotifications();
    const profileNotification = await this.generateProfileNotification();

    notificationEvents = [
      ...dailyDiaryNotifications,
      ...gpNotification,
      ...profileNotification,
      ...notificationEvents];

    // Filter undefined deeplinks, these are the reaction type events
    // themselves which we do not want to show
    notificationEvents = notificationEvents.filter(fil =>
       fil.deepLinkId !== undefined);

    this.logger.log(notificationEvents);

    // Sort by date
    notificationEvents.sort((a, b) => {
      return (
        new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
      );
    });

    // Update the notificationStore
    if (mobx.toJS(currentNotification).length > 0) {
      this.logger.log('currentNotifications - from mobx');
      this.logger.log(currentNotification);
      this.logger.log('returnUnlockedAchievements - from API');
      this.logger.log(notificationEvents);

      const inStoreDiff = this.notificationStore
      .checkNotificationExist(notificationEvents);

      this.logger.log(inStoreDiff);

      if (inStoreDiff.length === 0) {
        this.logger.log('use existing from store');

        this.notificationStore.updateNotification(currentNotification);
        loading = false;

        return loading;
      }
      this.logger.log('update new from API');

      this.notificationStore.updateNotification(notificationEvents);
      loading = false;

      return loading;

      // return this.notificationStore.addNewNotification(inStoreDiff);
    }
    this.logger.log('adding');

    this.notificationStore.addNotifications(notificationEvents);
    loading = false;

    return  loading;

  }

  /**
   *
   * Returns the daily diary notifications between the alloted time windows
   * or empty array if not due
   * Pre Quit Only
   * Frequency
   *  DAILY_DIARY_1 = "9am - every morning until quit date"
   *  DAILY_DIARY_2 = "1pm - everyday until quit date
   *  Only triggered if user hasn’t filled in the diary on that day."
   */
  private async generateDailyDiaryNotifications(): Promise<
    LocalNotification[] | any[]
  > {
    if (!this.dashboardLogic.isPostQuit()) {
      const today = this.utils.getToday();

      const isDayEntered = await this.dailyCapture.isDayAlreadyEntered(today);

      const amStart = `${today}${LocalNotificationTimes.DailyDiaryAmStart}`;
      const amFinish = `${today}${LocalNotificationTimes.DailyDiaryAmFinish}`;

      if (moment().isBetween(amStart, amFinish, null, '[]')) {
        this.logger.log('Daily Diary 1');

        const diaryOne: LocalNotification[] = [
          {
            id: 'dailyDiary1',
            attributes: {
              notificationTitle: this.translate.instant(
                'LOCAL_NOTIFICATIONS.DAILY_DIARY_1'
              ),
              avatarUrl: this.userStore.user.avatarUrl,
              username: this.userStore.user.username,
            },
            deepLinkId: 'dailyDiary1',
            notificationType: LocalNotificationType.DailyDiary,
            seen: false,
            createTime: moment().toISOString(),
            sharedTime: this.utils.calculateDisplaySharedTime(
              moment().toISOString()
            ),
          },
        ];

        return diaryOne;
      }

      const pmStart = `${today}${LocalNotificationTimes.DailyDiaryPmStart}`;
      const pmFinish = `${today}${LocalNotificationTimes.DailyDiaryPmFinish}`;

      if (moment().isBetween(pmStart, pmFinish, null, '[]') && isDayEntered) {
        this.logger.log('Daily Diary 2');

        const diaryTwo: LocalNotification[] = [
          {
            id: 'dailyDiary2',
            attributes: {
              notificationTitle: this.translate.instant(
                'LOCAL_NOTIFICATIONS.DAILY_DIARY_2'
              ),
              avatarUrl: this.userStore.user.avatarUrl,
              username: this.userStore.user.username,
            },
            deepLinkId: 'dailyDiary2',
            notificationType: LocalNotificationType.DailyDiary,
            seen: false,
            createTime: moment().toISOString(),
            sharedTime: this.utils.calculateDisplaySharedTime(
              moment().toISOString()
            ),
          },
        ];

        return diaryTwo;
      }

      return [];
    }

    return [];
  }
  /**
   * Returns the GP reminder notifications on the days required
   * or empty array if not due
   *
   * Frequency
   * GP_1 = "Day 8 – after Champix start date"
   * GP_2 = "Week three (Day 21) after Champix start date"
   * GP_3 = "Week four (Day 28) after Champix start date"
   * GP_4 = "Week 12 (Day 83) after Champix start date (Fix & Flexible only)"
   **/

  private async generateGPNotifications(): Promise<
    LocalNotification[] | any[]
  > {
    const gpNotification: LocalNotification = {
      id: '',
      attributes: {
        notificationTitle: '',
        avatarUrl: this.userStore.user.avatarUrl,
        username: this.userStore.user.username,
      },
      deepLinkId: '',
      notificationType: LocalNotificationType.GPReminder,
      seen: false,
      createTime: moment().toISOString(),
      sharedTime: this.utils.calculateDisplaySharedTime(
        moment().toISOString()),
    };

    const startDate = this.userStore.user.startDate;

    const eightPastChampix = 8;
    const twentyOnePastChampix = 21;
    const twentyEightChampix = 28;
    const eightyThreeChampix = 83;

    if (
      moment().isSame(
        moment(startDate).add(eightPastChampix, 'days'),
        'day'
      )
    ) {
      this.logger.log('Day 8 after Champix Start Date');

      gpNotification.id = 'gp1';
      gpNotification.deepLinkId = 'gp1';
      gpNotification.attributes.notificationTitle = this.translate.instant(
        'LOCAL_NOTIFICATIONS.GP_1'
      );

      return [gpNotification];
    }

    if (
      moment().isSame(
        moment(startDate).add(twentyOnePastChampix, 'days'),
        'day'
      )
    ) {
      this.logger.log('Day 21 after Champix Start Date');

      gpNotification.id = 'gp2';
      gpNotification.deepLinkId = 'gp2';
      gpNotification.attributes.notificationTitle = this.translate.instant(
        'LOCAL_NOTIFICATIONS.GP_2'
      );

      return [gpNotification];
    }

    if (
      moment().isSame(
        moment(startDate).add(twentyEightChampix, 'days'),
        'day'
      )
    ) {
      this.logger.log('Day 28 after Champix Start Date');

      gpNotification.id = 'gp3';
      gpNotification.deepLinkId = 'gp3';
      gpNotification.attributes.notificationTitle = this.translate.instant(
        'LOCAL_NOTIFICATIONS.GP_3'
      );

      return [gpNotification];
    }
    if (
      moment().isSame(
        moment(startDate).add(eightyThreeChampix, 'days'),
        'day'
      )
    ) {
      this.logger.log('Day 83 after Champix Start Date');

      gpNotification.id = 'gp4';
      gpNotification.deepLinkId = 'gp4';
      gpNotification.attributes.notificationTitle = this.translate.instant(
        'LOCAL_NOTIFICATIONS.GP_4'
      );

      return [gpNotification];
    }

    return [];
  }

  /**
   * Return profile incomplete notification
   * Frequency - "Once a week until profile complete"
   * Notification will be generated every Monday until profile completed
   */
  private async generateProfileNotification(): Promise<
    LocalNotification[] | any[]
  > {

    const today = this.utils.getToday();

    const isMonday = moment(today).day(LocalNotificationTimes.Monday)
    .isSame(moment(today));

    if (!this.userStore.user.profileComplete && isMonday) {
      const profileNotification: LocalNotification[] = [{
      id: 'profile1',
      attributes: {
        notificationTitle: this.translate.instant(
          'LOCAL_NOTIFICATIONS.PROFILE'
        ),
        avatarUrl: this.userStore.user.avatarUrl,
        username: this.userStore.user.username
      },
      deepLinkId: 'profile1',
      notificationType: LocalNotificationType.Profile,
      seen: false,
      createTime: moment().toISOString(),
      sharedTime: this.utils.calculateDisplaySharedTime(
        moment().toISOString()),
    }];

       return profileNotification;
    }

    return [];
  }
}
