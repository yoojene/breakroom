import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { ResetPasswordPage } from '../reset-password/reset-password';
import { UserStore } from '../../stores/user.store';
import {
  UserInterfaceUtilsProvider
} from '../../providers/utils/user-interface-utils';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Logger } from '@pharma/pharma-component-utils';
import {
  AnalyticsProvider,
  analyticsValues,
} from '../../providers/analytics/analytics';
import {
  DailyCaptureProvider
 } from '../../providers/daily-capture/daily-capture';

import {
  NotificationProvider
 } from '../../providers/notification/notification.provider';
import {
   DailyDataCapturePage
   } from '../../pages/daily-data-capture/daily-data-capture';
import {
   CreateAccountProfilePage
  } from '../create-account-profile/create-account-profile';
import { PersonalisePage } from '../personalise/personalise';
import {
   DashboardLogicProvider
  } from '../../providers/dashboard/dashboard-logic';
import * as moment from 'moment';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  // Login Error
  public isIncorrectUserError = false;
  public isIncorrectNetworkError = false;

  // Form
  public loginForm: FormGroup;
  private min = 8;
  public emailAddress = this.userStore.user.email || '';

  public remembered = this.userStore.user.remembered;

  constructor(
    public navCtrl: NavController,
    public analyticsService: AnalyticsProvider,
    public authProvider: AuthProvider,
    public navParams: NavParams,
    private uiUtils: UserInterfaceUtilsProvider,
    public userStore: UserStore,
    private logger: Logger,
    private dailyCapture: DailyCaptureProvider,
    public formBuilder: FormBuilder,
    public dashboardLogic: DashboardLogicProvider,
    private notification: NotificationProvider
  ) {
    this.loginForm = formBuilder.group({
      email: new FormControl(
          this.emailAddress,
          {
            validators: [
              Validators.required,
              Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,3}$/),
            ],
          }
        ), password: new FormControl('', [
          Validators.required,
          Validators.minLength(this.min),
          Validators.pattern(
    '(?=^.{8,}$)(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s)[0-9a-zA-Z!@#$%^&*()]*$'
          ),
        ]),
        remember: new FormControl(this.remembered) },
        { updateOn: 'blur' });
  }

  // Lifecycle
  protected ionViewWillEnter() {

    this.loginForm.controls['remember'].valueChanges.subscribe(res => {
      if (this.loginForm.controls['remember'].value) {
        this.userStore.updateUser({
          email: this.loginForm.controls['email'].value,
          remembered: this.loginForm.controls['remember'].value
        });
      } else {
        this.userStore.updateUser({
          email: '',
          remembered: this.loginForm.controls['remember'].value,
        });

      }
    });
  }

  protected ionViewDidEnter() {
    // Report page view to analytics
    this.analyticsService.trackStateAction({
      pagename: analyticsValues.PAGE_LOGIN
    });
  }

  public async login() {
    this.uiUtils.showLoading();
    this.authProvider
      .authenticateAccount(
        this.loginForm.controls['email'].value,
        this.loginForm.controls['password'].value
      )
      .then((personRes: any) => {

          const [results] = personRes.results;

          this.isIncorrectUserError = false;
          this.isIncorrectNetworkError=false;
          const showCaptureAfterThisTime = moment('08:00 pm', 'HH:mm a');
          // Set JanrainId as UA tags
          // this.notification.setTags(personRes.id);
          this.notification.registerTags(results.id);

          this.notification.checkAndSetTags();

          // User will be in pharma so I am refreshing the,
          // at present empty Store here
          this.userStore.refreshStore(results.id).then(() => {
            this.dailyCapture.shouldPopUpDailyCapture().then(shouldPopUp => {
              this.uiUtils.hideLoading();

              if (!this.userStore.user.onboardingComplete) {
                if (!results.attributes['quitDate']) {
                  // if they don't have a quit date,
                  // take to revlevant screen to continue setting up profile
                  return this.navCtrl.setRoot(CreateAccountProfilePage, {
                    registered: results,
                  });
                } else {
                  // ensure mandatory data is entered (cigarette info)
                  return this.navCtrl.setRoot(PersonalisePage, {
                    registeredPerson: results,
                  });
                }
              } else if (
                shouldPopUp &&
                !this.dashboardLogic.isPostQuit() &&
                moment().isAfter(showCaptureAfterThisTime)
              ) {
                return this.navCtrl.setRoot(DailyDataCapturePage, {
                  fromDashBoard: false,
                });
              } else {
                return this.navCtrl.setRoot('TabsPage', {
                  authUser: personRes,
                });
              }
            });
          });

      })
      .catch((error: any) => {
        if(error.stat){
          this.isIncorrectUserError = true;
        } else if((error.toString()).search('Network')){
            this.isIncorrectNetworkError=true;
        }
        this.uiUtils.hideLoading();
        this.logger.error(error);
      });
  }

  public resetPassword() {
    this.navCtrl.push(ResetPasswordPage);
  }

  public onInputClearError(ev, formControl?) {
    if (formControl && !(ev.target as HTMLInputElement).value) {
      formControl.touched = false;
    }

    this.isIncorrectUserError = false;
  }
}
