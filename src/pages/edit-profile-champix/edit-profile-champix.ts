import { Component, ViewChildren, QueryList } from '@angular/core';
import { NavController, NavParams, App, IonicPage, Select} from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserStore } from '../../stores/user.store';
import { BreakroomConfig } from '../../app/app.config';
import { AuthProvider } from '../../providers/auth/auth';
import { Logger } from '@pharma/pharma-component-utils';
import { UtilsProvider } from '../../providers/utils/utils';
import {
  UserInterfaceUtilsProvider
} from '../../providers/utils/user-interface-utils';
import * as moment from 'moment';
import * as _ from 'lodash';
import { QuitMethods } from '../../constants/quit-method-constants';
import {
  AnalyticsProvider,
  analyticsValues } from '../../providers/analytics/analytics';
import OverlayScrollbars from 'overlayscrollbars';

@IonicPage()
@Component({
  selector: 'page-edit-profile-champix',
  templateUrl: 'edit-profile-champix.html',
})
export class EditProfileChampixPage {
  // tslint:disable-next-line:member-access
  @ViewChildren(Select) ionSelects: QueryList<Select>;
  // https://github.com/ionic-team/ionic/issues/8561#issuecomment-360856379

  // Labels

  public editAccountTitle = this.translate.instant('EDIT_ACCOUNT.TITLE');
  public editAccountBodyText = this.translate.instant(
    'EDIT_ACCOUNT.E2A_BODY_TEXT'
  );
  public editAccountBodySubText = this.translate.instant(
    'EDIT_ACCOUNT.E2A_SUBBODY_TEXT'
  );

  public champixStartDateText = this.translate.instant(
    'EDIT_ACCOUNT.E2B_STARTDATE'
  );
  public quitDateText = this.translate.instant('EDIT_ACCOUNT.E2B_QUITDATE');

  public startDateErrReq = this.translate.instant(
    'ERROR_MSG.C4_STARTDATE_BLANK'
  );
  public quitDateErrReq = this.translate.instant('ERROR_MSG.C4_QUITDATE_BLANK');

  public nextButtonText = this.translate.instant('EDIT_ACCOUNT.SAVE_BUTTON');
  public cancelButtonText = this.translate.instant('BUTTONS.CANCEL');
  public dateText = this.translate.instant('BUTTONS.DATE');
  public quitMethodTitle = this.translate.instant(
    'EDIT_ACCOUNT.E2B_REASON_FOR_QUITTING'
  );
  public reasonQuittingTitle = this.translate.instant(
    'PERSONALISE.REASON_QUIT_TITLE'
  );

  public getHealthier = this.translate.instant('PERSONALISE.REASON_QUIT_1');
  public tooExpensive = this.translate.instant('PERSONALISE.REASON_QUIT_2');
  public positiveExample = this.translate.instant('PERSONALISE.REASON_QUIT_3');
  public gettingMarried = this.translate.instant('PERSONALISE.REASON_QUIT_4');
  public family = this.translate.instant('PERSONALISE.REASON_QUIT_5');
  public social = this.translate.instant('PERSONALISE.REASON_QUIT_6');
  public dependant = this.translate.instant('PERSONALISE.REASON_QUIT_7');
  public healthScare = this.translate.instant('PERSONALISE.REASON_QUIT_8');
  public newJob = this.translate.instant('PERSONALISE.REASON_QUIT_9');
  public other = this.translate.instant('PERSONALISE.REASON_QUIT_10');

  public editProfileUpdates = {}; // Passed from EditProfilePage

  // Form validation

  public profileForm: FormGroup;

  // Dates

  public quitDateMin: string;
  public quitDateMax: string;
  public editedQuitDate = false;

  // quit method
  public currentQuitMethod;
  public quitMethods = this.config.quitMethods;

  public relativeDiffYears: number; // relative to DOB
  // Consts
  public invalidSmokingYearserrorText = this.translate.instant(
    'ERROR_MSG.D4_INVALID_SMOKING_YEARS'
  );
  public invalidSmokingYearsBlankText = this.translate.instant(
    'ERROR_MSG.D4_INVALID_SMOKING_YEARS_BLANK'
  );
  public invalidSmokingYearsLimitText = this.translate.instant(
    'ERROR_MSG.D4_INVALID_SMOKING_YEARS_100'
  );
  public invalidSmokingYearsAgeLimitText = this.translate.instant(
    'ERROR_MSG.D4_INVALID_SMOKING_YEARS_AGE'
  );
  public invalidQuitAttemptErrorText = this.translate.instant(
    'ERROR_MSG.D4_INVALID_QUIT_ATTEMPTS'
  );
  public invalidQuitAttemptLimitErrorText = this.translate.instant(
    'ERROR_MSG.D4_INVALID_QUIT_ATTEMPTS_100'
  );

  /// Mininum and maximums for Quit Date
  private minFix = 8;
  private minFlex = 8;
  private minRed = 1;

  private maxFix = 14;
  private maxFlex = 35;
  private maxRed = 84;

  /// Smoking Journey
  public startAndQuitDateMin = this.config.startAndQuitDateMin;
  public startAndQuitDateMax = this.config.startAndQuitDateMax;

  constructor(
    public app: App,
    public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public formBuilder: FormBuilder,
    public auth: AuthProvider,
    public userStore: UserStore,
    public config: BreakroomConfig,
    private uiUtils: UserInterfaceUtilsProvider,
    public logger: Logger,
    public analyticsService: AnalyticsProvider,
    public utils: UtilsProvider
  ) {
    this.logger.log('this.userStore.user');
    this.logger.log(this.userStore.user);
    this.currentQuitMethod = this.userStore.user.quitMethod;
    const quitMethod = this.methodName();
    this.profileForm = formBuilder.group({
      reasonQuitting: [this.userStore.user.reasonQuitting],
      numberYearsSmoked: [this.userStore.user.numberYearsSmoked],
      numberAttemptedQuits: [this.userStore.user.numberAttemptedQuits],
      timeNotSmoking: [this.userStore.user.numberAttemptedQuits],
      isTakenChampixBefore: [this.userStore.user.isTakenChampixBefore],
      // !!! PREVIOUS QUIT METHOD. NOT ACTUAL CURRENT QUIT METHOD
      previousQuitMethod: [this.userStore.user.previousQuitMethod],
      startDate: [this.userStore.user.startDate, Validators.required],
      quitDate: [this.userStore.user.quitDate, Validators.required],
      quitMethod: [quitMethod],
    });

    this.relativeDiffYears = moment().diff(
      this.userStore.user.dateOfBirth,
      'years'
    );
  }

  // Lifecycle

  public ionViewWillEnter() {
    this.editedQuitDate = false;
    this.analyticsService.trackStateAction({
      pagename: analyticsValues.PAGE_EDIT_PROFILE_DATES,
    });

    this.editProfileUpdates = this.navParams.get('profileUpdates');
    const startDate = moment(this.userStore.user.startDate);
    this.calcQuitDate(this.currentQuitMethod, startDate);
  }

  public ionViewDidEnter() {
    const startDate = moment(this.userStore.user.startDate);
    this.calcQuitDate(this.currentQuitMethod, startDate);
  }

  public ionViewDidLoad() {
    this.ionSelects.map(select => select._inputUpdated());
  }

  // Public
  public onQuitMethodChange() {
    this.editedQuitDate = true;
  }

  public onQuitMethodTouched() {
    const timeout = 100;

    setTimeout(() => {
    const osClass = document.getElementsByClassName('alert-radio-group')[0];

    const os = OverlayScrollbars(osClass, {
      className: 'os-theme-dark',
      resize: 'none',
      sizeAutoCapable: true,
      paddingAbsolute: true,
      scrollbars: {
        clickScrolling: true,
      },
      nativeScrollbarsOverlaid: {
        showNativeScrollbars: false,
        initialize: true,
      },
    });
    }, timeout);

  }

  public onStartDateChanged(e: any) {
    this.profileForm.controls['quitDate'].setValue('');
    this.logger.log('e', e);
    if (!_.isEmpty(e)) {
      this.logger.log('its not empty --  onStartDateChanged: ', e);
      const startDateFmt = this.utils.formatISODates(e);
      this.revalidateStartDate(startDateFmt);
      const startDate = moment(startDateFmt);

      this.calcQuitDate(this.currentQuitMethod, startDate);
    }
  }

  public onSubmit() {
    // Construct object to update pharma and UserStore
    let profileUpdates = {
      id: this.userStore.user.id,
      personTypes: [this.config.breakroomPersonType],
    };

    profileUpdates = {
      ...profileUpdates,
      ...this.profileForm.value,
      ...this.editProfileUpdates,
    };

    this.uiUtils.showLoading();
    this.auth
      .updatepharmaPersonProfile(profileUpdates)
      .then(res => {
        this.userStore.updateUser(profileUpdates);

        if (this.editedQuitDate) {
          this.analyticsService.trackAction({
            pagename: `${analyticsValues.PAGE_EDIT_PROFILE_DATES}`,
            linkname: `User edited quit date |${this.userStore.user.quitDate}`,
          });
        }
        this.uiUtils.hideLoading();
        this.navCtrl.popToRoot();
      })
      .catch(err => {
        this.logger.error(err);
        // TODO Handle error message
        this.uiUtils.hideLoading();
      });
  }

  public onCancelTap() {
    // Reset tab index to DashboardPage (BRK-293)
    /*
      const two = 2;
      this.app.getActiveNavs()[0].parent.select(two);
      //this.navCtrl.setRoot(TabsPage);
    */
    this.navCtrl.popToRoot();
  }

  // Private

  private methodName(): string {
    const quitMethod = this.userStore.user.quitMethod;
    if (quitMethod === QuitMethods.REDUCE_QUIT) {
      return 'Reduce To Quit';
    } else if (quitMethod === QuitMethods.FIXED) {
      return 'Fixed';
    } else {
      return 'Flexible';
    }
  }

  private calcQuitDate(quitMethod: string, startDate: moment.Moment) {
    switch (quitMethod) {
      case 'Fix':
        this.quitDateMin = moment(startDate)
          .startOf('day')
          .add(this.minFix, 'days')
          .format('YYYY-MM-DD');
        this.quitDateMax = moment(startDate)
          .startOf('day')
          .add(this.maxFix, 'days')
          .format('YYYY-MM-DD');
        this.logger.log(this.quitDateMin);
        this.logger.log(this.quitDateMax);
        break;
      case 'Flex':
        this.quitDateMin = moment(startDate)
          .startOf('day')
          .add(this.minFlex, 'days')
          .format('YYYY-MM-DD');
        this.quitDateMax = moment(startDate)
          .startOf('day')
          .add(this.maxFlex, 'days')
          .format('YYYY-MM-DD');
        this.logger.log(this.quitDateMin);
        this.logger.log(this.quitDateMax);
        break;
      case 'Reduced_quit':
        this.quitDateMin = moment(startDate)
          .startOf('day')
          .add(this.minRed, 'days')
          .format('YYYY-MM-DD');
        this.quitDateMax = moment(startDate)
          .startOf('day')
          .add(this.maxRed, 'days')
          .format('YYYY-MM-DD');
        this.logger.log(this.quitDateMin);
        this.logger.log(this.quitDateMax);
        break;
      default:
        this.logger.log('quitMethod', quitMethod);
        break;
    }
  }

  /**
   *  BRK-613
   * _Sometimes_ the ion-datetime [max] and [min] validations do not
   *  trigger quicky enough when changing the year, allowing invalid
   *  dates.  This is an extra check which clears any dates outside the range
   */
  private revalidateStartDate(fmtDate: string) {
    if (moment(fmtDate).isBefore(moment(this.startAndQuitDateMin))) {
      this.profileForm.controls['startDate'].setValue('');
    }
    if (moment(fmtDate).isAfter(moment(this.startAndQuitDateMax))) {
      this.profileForm.controls['startDate'].setValue('');
    }
  }
}
