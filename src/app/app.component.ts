import { Component, isDevMode, ViewChild } from '@angular/core';
import { Platform, ModalController, Nav, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { pharmaProvider } from '@pharma/pharma-js-bindings-ng';
import { Logger } from '@pharma/pharma-component-utils';
import { SplashPage } from '../pages/splash/splash';
import { TranslateService } from '@ngx-translate/core';
import { UserStore } from '../stores/user.store';
import { Deeplinks } from '@ionic-native/deeplinks';
import {
  AnalyticsProvider,
  analyticsValues } from '../providers/analytics/analytics';
import { NotificationStore } from '../stores/notification.store';
import { ContentProvider } from '../providers/content/content';
import {
  DailyCaptureProvider
 } from '../providers/daily-capture/daily-capture';

import { AuthProvider } from '../providers/auth/auth';
import {
  AchievementsDetailPage
 } from '../pages/achievements-detail/achievements-detail';
import {
  NotificationProvider
} from '../providers/notification/notification.provider';
import { NetworkProvider } from '../providers/network/network.provider';
import * as moment from 'moment';
@Component({
  templateUrl: 'app.html',
})
export class BreakroomApp {
  @ViewChild(Nav)
  private nav: Nav;
  public static hasBeenViewed = false;
  public isOffline: boolean;
  // public rootPage: any = LandingPage;

  constructor(
    protected logger: Logger,
    protected platform: Platform,
    protected statusBar: StatusBar,
    protected splashScreen: SplashScreen,
    protected pharma: pharmaProvider,
    protected modalCtrl: ModalController,
    protected translate: TranslateService,
    protected analytics: AnalyticsProvider,
    private dailyCapture: DailyCaptureProvider,
    public auth: AuthProvider,
    protected deeplinks: Deeplinks,
    public userStore: UserStore,
    public notificationStore: NotificationStore,
    public notification: NotificationProvider,
    public network: NetworkProvider,
    public events: Events,
    public contentProvider: ContentProvider,
  ) {
    platform
      .ready()
      .then(() => {
        analytics.analyticsWrapper.isADBInstalled();

        this.analytics.trackStateAction({
          pagename:  analyticsValues.PAGE_LANDING
        });

        if(this.userStore.user.username){
          this.analytics.trackAction({
            pagename: `${analyticsValues.PAGE_LANDING}`,
            linkname: `Sessions per user|${this.userStore.user.username}`,
          });

        }

        // console.log(analytics.analyticsWrapper.isADBInstalled());
        // This is it, just need to inject the provider.
        // setup logger class
        logger.setReleaseStatus(!isDevMode());
        network.initializeNetworkEvents();
        this.onNetworkChange();
        if(platform.is('ios')){
          statusBar.overlaysWebView(false);
          statusBar.backgroundColorByHexString('#51C4CD');
        }else if(platform.is('android')){
          statusBar.styleLightContent();
        }else{
          statusBar.styleDefault();
        }

        translate.setDefaultLang('en');
        translate.use('en').subscribe((data: object) => {
          const splash = modalCtrl.create(SplashPage);
          splash.present();
          splashScreen.hide();

          this.initStore().then(async () => {
            this.onResumeHydrateAuth();

            await this.defaultRouting();

            this.addDeeplinkListener();

              // Not sure we need this now
            this.deeplinks
              .routeWithNavController(this.nav, {
                '/tab-1/achievements-detail/:achievementLinkId':
                AchievementsDetailPage,
              })
              .subscribe(match => {
                // match.$route - the route we matched,
                // which is the matched entry from the arguments to route()
                // match.$args - the args passed in the link
                // match.$link - the full link data
                this.logger.log(`Successfully matched route ${match}`);

              }, nomatch => {
                // nomatch.$link - the full link data
                this.logger.error(`Deeplink that didn't match ${nomatch}`);

              });

          });
        });
      })
      .catch((error: any) => {
        this.logger.log(error);
      });
  }

  // Private

  private async defaultRouting(): Promise<any>{
    this.logger.log('default routing....');
    const showCaptureAfterThisTime = moment('08:00 pm', 'HH:mm a');

    const quitDate = moment(this.userStore.user.quitDate);

    if (this.userStore.user.authenticated) {
      // hook for daily cpture pop up
      const shouldPopUp = await this.dailyCapture.shouldPopUpDailyCapture();
      if(!this.userStore.user.onboardingComplete){
          const user = this.userStore.user;//
          user['janrainId'] = this.userStore.user.id;
          if(this.userStore.user['quitDate']){
            return this.nav.setRoot(
              'CreateAccountProfilePage', { registered: user });
          } else{
            return this.nav.setRoot(
              'PersonalisePage', { loggedInPerson: user });
          }
      } else if (shouldPopUp && moment().isBefore(quitDate) &&
       moment().isAfter(showCaptureAfterThisTime)) {

        this.nav.push('DailyDataCapturePage', {
          fromDashBoard: false,
        });

        return undefined;
      }
        this.nav.setRoot('TabsPage');

        return undefined;
    }
    this.nav.setRoot('LandingPage');

  }

  private async initStore(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Rehydrate Janrain token
      try{

          this.auth
            .hydrateAuth()
            .then((response) => {
              if( !this.userStore.user.authenticated){
                resolve();

                return undefined;
              }
              this.notificationStore.setUpStore();
                this.auth.checkUserHasAccess().then((hasAccess)=>{
                  if (!hasAccess ||
                    !this.userStore.user.latestUnlockedAchievement.reachedUrl) {
                    this.userStore.user.authenticated =false;
                  }

                  resolve();

                }).catch((error: any) => {
                  this.userStore.user.authenticated =false;
                  this.logger.log(error);
                  resolve();
                })
            .catch((error: any) => {
              this.userStore.user.authenticated = false;
              this.logger.log(error);
              resolve();
            });
        }).catch((error: any) => {
          this.userStore.user.authenticated = false;
          this.logger.log(error);
        });
      } catch (error) {
        this.userStore.user.authenticated = false;
        this.logger.log(error);
      }
      });
    }

  private addDeeplinkListener() {

    this.logger.log('about to add dl event listener - addDeeplinkListener');
    document.addEventListener('urbanairship.deep_link', event => {
    this.logger.log('deep_link');
    this.logger.log(event);

    const ev = event as any;

    switch (ev.deepLink) {
      case 'dosage':
        // Dosage / GP Reminders
        this.nav.setRoot('TabsPage', { deepLink: true });
        break;

      case 'daily_diary':
        // Daily Diary
        this.nav.push('DailyDataCapturePage', { fromDashBoard: false });
        break;

      case 'profile_incomplete':
        // Profile incomplete
        this.nav.push('EditProfilePage');
        break;

      default:
        // Achievements - there are different ev.deepLink values
        this.nav.push('AchievementsDetailPage', {
          achievementLinkId: ev.deepLink,
          redirectNewsFeed: false,
        });
    }
  }, false);

}

  // Public
  public onNetworkChange(): void{
    let rootClass; // used to add class to prevent app activity
    // Offline event
    this.events.subscribe('network:offline', () => {
      this.isOffline = true;
      rootClass = document.querySelector('#appNavRoot').classList;
      rootClass.add('offlineOverlay');
      this.network.displayNetworkError();
    });
    this.events.subscribe('network:online', () => {
      rootClass = document.querySelector('#appNavRoot').classList;
      this.isOffline = false;
      rootClass.remove('offlineOverlay');
      this.network.hideNetworkError();
    });
  }

  public onResumeHydrateAuth() {
    if (!BreakroomApp.hasBeenViewed) {
      document.addEventListener('resume',async () => {
        this.network.checkNetwork();
        try {
          BreakroomApp.hasBeenViewed = true;
          if(this.userStore.user.authenticated && this.userStore.user.id){

            this.auth.hydrateAuth();
            this.auth.checkUserHasAccess().then(async (hasAccess)=> {
              this.logger.log('Running Resume ');
              const timeout =  12000;
              const delay = async ms => new Promise(res => setTimeout(res, ms));
              await delay(timeout);
              this.network.checkNetwork();
               if(!hasAccess && !this.network.isOffline()){
                this.logger.log('Log it out ');
                this.auth.doLogOut(true);
               }
            });
          }
        } catch (e) {
          this.logger.log('app resume error');
          this.logger.error(e);
          // if(!hasAccess && !this.network.isOffline()){
          // this.auth.doLogOut(true);
          // }
        }
        false;
      });
    }
  }
}
