import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Platform } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { UtilsProvider } from '../../providers/utils/utils';
import { CreateAccountAvatarPage } from '../create-account-avatar/create-account-avatar';
import { BreakroomConfig } from '../../app/app.config';
import { QuitMethodModalComponent } from './quit-method-modal/quit-method-modal';
import { UsernameModalComponent } from './username-modal/username-modal';
import { Logger } from '@pharma/pharma-component-utils';
import { UserProvider } from '../../providers/user/user';
import { UserInterfaceUtilsProvider } from '../../providers/utils/user-interface-utils';
import { blacklistWordspharma } from '../../validators/blacklist-word-pharma.';
import { ContentProvider } from '../../providers/content/content';
import * as _ from 'lodash';
import {
  AnalyticsProvider,
  analyticsValues } from '../../providers/analytics/analytics';
import * as emojiStrip from 'emoji-strip';

@IonicPage()
@Component({
  selector: 'page-create-account-profile',
  templateUrl: 'create-account-profile.html',
})
export class CreateAccountProfilePage implements AfterViewInit {
  @ViewChild('quitMethod', { read: ElementRef })
  public quitMethod: ElementRef;
  // Text

  public createAccountTitle = this.translate.instant('CREATE_ACCOUNT.C4_TITLE');
  public createAccountBodyText = this.translate.instant(
    'CREATE_ACCOUNT.C4_BODYTEXT'
  );
  public nextButtonText = this.translate.instant('CREATE_ACCOUNT.NEXT_BUTTON');

  public quitMethodText = this.translate.instant(
    'CREATE_ACCOUNT.C4_QUITMETHOD'
  );
  public startDateText = this.translate.instant('CREATE_ACCOUNT.C4_STARTDATE');
  public quitDateText = this.translate.instant('CREATE_ACCOUNT.C4_QUITDATE');
  public userNameText = this.translate.instant('CREATE_ACCOUNT.C4_USERNAME');

  public needUserNameText = this.translate.instant(
    'CREATE_ACCOUNT.C4_NEED_USERNAME'
  );
  public dateText = this.translate.instant('BUTTONS.DATE');
  public quitMethodPlaceholder = this.translate.instant('BUTTONS.QUIT_METHOD');

  public reviewMessage = this.translate.instant('GENERIC_MESSAGES.REVIEW');

  // Errors

  public quitMethodErrReq = this.translate.instant(
    'ERROR_MSG.C4_QUITMETHOD_BLANK'
  );
  public startDateErrReq = this.translate.instant(
    'ERROR_MSG.C4_STARTDATE_BLANK'
  );
  public quitDateErrReq = this.translate.instant('ERROR_MSG.C4_QUITDATE_BLANK');
  public userNameErrReq = this.translate.instant('ERROR_MSG.C4_USERNAME_BLANK');
  public userNameErrInvalidSwear = this.translate.instant(
    'ERROR_MSG.C4_USERNAME_INVALID_SWEAR'
  );
  public userNameErrInvalid = this.translate.instant(
    'ERROR_MSG.C4_USERNAME_INVALID'
  );
  public userNameErrTaken = this.translate.instant(
    'ERROR_MSG.C4_USERNAME_TAKEN'
  );

  // Form
  public profileForm: FormGroup;
  public profileEnableForm = false;

  private unregisterBackButtonAction: any;

  public quitMethods = [
    {
      abbr: 'Fix',
      name: this.translate.instant('CREATE_ACCOUNT.C4_QUITMETHOD_FIX'),
    },
    {
      abbr: 'Flex',
      name: this.translate.instant('CREATE_ACCOUNT.C4_QUITMETHOD_FLEX'),
    },
    {
      abbr: 'Reduced_quit',
      name: this.translate.instant('CREATE_ACCOUNT.C4_QUITMETHOD_RED'),
    },
  ];

  public startAndQuitDateMin = this.config.startAndQuitDateMin;
  public startAndQuitDateMax = this.config.startAndQuitDateMax;

  public quitDateMin: string;
  public quitDateMax: string;

  public timeout: any = null;

  public maxchars = 12;

  // Successful response object from registering Janrain/pharma Person
  public registeredPerson: any;

  // Consts

  /// Mininum and maximums for Quit Date
  private minFix = 8;
  private minFlex = 8;
  private minRed = 1;

  private maxFix = 14;
  private maxFlex = 35;
  private maxRed = 84;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public translate: TranslateService,
    private utils: UtilsProvider,
    private config: BreakroomConfig,
    private content: ContentProvider,
    private modalCtrl: ModalController,
    private logger: Logger,
    public userProvider: UserProvider,
    public platform: Platform,
    private uiUtils: UserInterfaceUtilsProvider,
    public analyticsService: AnalyticsProvider
  ) {
    this.profileForm = formBuilder.group({
      quitMethod: ['', Validators.required],
      startDate: ['', Validators.required],
      quitDate: ['', Validators.required],
      username: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(this.maxchars),
        ]),
        blacklistWordspharma(this.content),
      ],
    }) as FormGroup;
  }

  // Lifecycle
  public ionViewDidLoad() {
    this.analyticsService.trackStateAction({
      pagename: analyticsValues.PAGE_CREATE_PROFILE,
    });

    // Disable the back button on Android for this page.
    this.unregisterBackButtonAction = this.platform.registerBackButtonAction(
      () => {
        return false;
      }
    );
  }

  public ionViewDidEnter() {
    this.registeredPerson = this.navParams.get('registered');
  }

  public ionViewWillLeave() {
    this.unregisterBackButtonAction && this.unregisterBackButtonAction();
  }

  public ngAfterViewInit() {
    this.profileForm.controls['quitMethod'].valueChanges.subscribe(res => {
      this.quitMethod.nativeElement.children[1].hidden = false;
      // Hide the select placeholder icon on the Quit Method when populated
      if (res) {
        this.quitMethod.nativeElement.children[1].hidden = true;
      }
    });
  }

  // Public

  public onStartDateChanged(e: any) {
    this.profileForm.controls['quitDate'].setValue('');
    if (!_.isEmpty(e)) {
      const startDateFmt = this.utils.formatISODates(e);

      this.revalidateStartDate(startDateFmt);

      const startDate = moment(startDateFmt);
      this.calcQuitDate(
        this.profileForm.controls['quitMethod'].value,
        startDate
      );
    }
  }

  public onQuitMethodInfoTap() {
    const quitAlertModal = this.modalCtrl.create(
      QuitMethodModalComponent,
      {},
      { cssClass: 'settings-modal' }
    );
    quitAlertModal.present();
  }

  public onNeedUserNameTap() {
    const userAlertModal = this.modalCtrl.create(
      UsernameModalComponent,
      {},
      { cssClass: 'settings-modal' }
    );
    userAlertModal.present();
  }

  public onQuitMethodChange() {
    this.profileForm.controls['quitDate'].setValue('');
    this.profileForm.controls['startDate'].setValue('');
  }

  /**
   * Prevent enter key submitting form on username field skipping
   * validation.  (iOS)
   *
   */
  public onKeyDown(e) {
    const enterKeyCode = 13;
    if (e.keyCode === enterKeyCode) {
      e.preventDefault();
    }
    this.profileEnableForm = false;
  }

  public onUserNameUnfocused(e) {
    if (this.profileForm.controls['username'].value) {
      this.checkUserNameForEmojis().then(res => {
        if (res) {
          this.verifyUserNameIsAvailable();
        }
      });
    }
  }

  private async checkUserNameForEmojis() {
    const stripped = emojiStrip(this.profileForm.controls['username'].value);
    if (
      this.profileForm.controls['username'].value.length !== stripped.length
    ) {
      this.profileForm.controls['username'].setErrors({ blacklistWords: true });

      return Promise.resolve(false);
    } else {
      return Promise.resolve(true);
    }
  }

  private async verifyUserNameIsAvailable() {
    this.uiUtils.showLoading();
    try {
      await this.userProvider.checkUsernameExists(
        this.profileForm.controls['username'].value
      );

      this.profileForm.controls['username'].setErrors({
        duplicate: true,
      });

      this.uiUtils.hideLoading();
    } catch (err) {
      this.uiUtils.hideLoading();
      this.logger.error(err);
      this.profileEnableForm = true;
      this.profileForm.controls['username'].setErrors(
        this.profileForm.controls['username'].errors
      );
    }
  }

  /**
   *
   * Pass registedPerson and profile form.
   * Update takes place in CreateAccountAvatar
   */
  public onSubmit() {
    this.navCtrl.push(CreateAccountAvatarPage, {
      registeredPerson: this.registeredPerson,
      profileForm: this.profileForm.value,
      reloadAvatar: true,
    });
  }

  // Private

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
