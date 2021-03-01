import { Component } from '@angular/core';
import { NavController, NavParams, Platform, IonicPage } from 'ionic-angular';
import * as moment from 'moment';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { UserStore } from '../../stores/user.store';
import {
  EditProfileChampixPage
} from '../edit-profile-champix/edit-profile-champix';
import { PostcodeProvider } from '../../providers/postcode/postcode';
import { UtilsProvider } from '../../providers/utils/utils';
import {
  UserInterfaceUtilsProvider
} from '../../providers/utils/user-interface-utils';
import { blacklistWordspharma } from '../../validators/blacklist-word-pharma.';
import { ContentProvider } from '../../providers/content/content';
import {
  AnalyticsProvider,
  analyticsValues } from '../../providers/analytics/analytics';

export enum Age {
  Eighteen = 18,
}

@IonicPage({
  defaultHistory: ['settings'],
})
@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html',
})
export class EditProfilePage {
  // Labels
  public editAccountTitle = this.translate.instant('EDIT_ACCOUNT.TITLE');
  public editAccountBodyText = this.translate.instant(
    'EDIT_ACCOUNT.E2A_BODY_TEXT'
  );
  public editAccountBodySubText = this.translate.instant(
    'EDIT_ACCOUNT.E2A_SUBBODY_TEXT'
  );

  public nextButtonText = this.translate.instant('CREATE_ACCOUNT.NEXT_BUTTON');
  public dateOfBirthText = this.translate.instant(
    'CREATE_ACCOUNT.C2_FIELD_DOB'
  );

  public firstNameErrReq = this.translate.instant(
    'ERROR_MSG.C2_FIRSTNAME_BLANK'
  );
  public firstNameErrInvalid = this.translate.instant(
    'ERROR_MSG.C2_FIRSTNAME_INVALID'
  );
  public lastNameErrReq = this.translate.instant('ERROR_MSG.C2_LASTNAME_BLANK');
  public lastNameErrInvalid = this.translate.instant(
    'ERROR_MSG.C2_LASTNAME_INVALID'
  );

  public postCodeErrInvalid = this.translate.instant(
    'ERROR_MSG.C2_POSTCODE_INVALID'
  );

  public genderText = this.translate.instant('CREATE_ACCOUNT.C2_FIELD_GENDER');

  public editFirstNameText = this.translate.instant(
    'CREATE_ACCOUNT.C4_EDIT_FIRST_NAME');
  public editLastNameText = this.translate.instant(
    'CREATE_ACCOUNT.C4_EDIT_LAST_NAME');
  public editGenderText = this.translate.instant(
    'CREATE_ACCOUNT.C4_EDIT_GENDER');
  public editPostCodeText = this.translate.instant(
    'CREATE_ACCOUNT.C4_EDIT_POST_CODE');

  public genderErrReq = this.translate.instant('ERROR_MSG.C2_GENDER_BLANK');
  public dobErrReq = this.translate.instant('ERROR_MSG.C2_DOB_BLANK');
  public dobErrInvalid = this.translate.instant('ERROR_MSG.C2_DOB_INVALID');
  public postCodeErrReq = this.translate.instant('ERROR_MSG.C2_POSTCODE_BLANK');
  public emailErrReq = this.translate.instant('ERROR_MSG.C3_EMAIL_BLANK');
  public emailErrInvalid = this.translate.instant('ERROR_MSG.C3_EMAIL_INVALID');

  public emailPlaceholder = this.translate.instant('BUTTONS.EMAIL');
  public passwordPlaceholder = this.translate.instant('BUTTONS.PASSWORD');

  public cancelButtonText = this.translate.instant('BUTTONS.CANCEL');
  public postCodePlaceholder = this.translate.instant(
    'GENERIC_MESSAGES.POSTCODE'
  );

  // Form validation

  public profileForm: FormGroup;

  public maxDate: string = moment()
    .subtract(Age.Eighteen, 'years')
    .format('YYYY-MM-DD');

  private minchars = 2;
  private maxchars = 50;
  private minNumberPost = 1000;

  public genders = [
    { abbr: 'M', gender: 'Male' },
    { abbr: 'F', gender: 'Female' },
    { abbr: 'O', gender: 'Prefer not to say' },
  ];

  // Postcode

  public postcodes: any = [];
  public postcode = '';

  private minPc = 3;
  private maxPc = 4;

  constructor(
    public navCtrl: NavController,
    public plt: Platform,
    public navParams: NavParams,
    public translate: TranslateService,
    public formBuilder: FormBuilder,
    private uiUtils: UserInterfaceUtilsProvider,
    public content: ContentProvider,
    public userStore: UserStore,
    public utils: UtilsProvider,
    public analyticsService: AnalyticsProvider,
    public postcodeProvider: PostcodeProvider
  ) {
    this.profileForm = formBuilder.group({
      firstName: [
        this.userStore.user.firstName,
        Validators.compose([
          Validators.required,
          Validators.minLength(this.minchars),
          Validators.maxLength(this.maxchars),
          Validators.pattern('^[a-zA-Z\\s]+$'),
        ]),
        blacklistWordspharma(this.content),
      ],
      email: [
        this.userStore.user.email,
        Validators.compose([]),
      ],

      username: [
        this.userStore.user.username,
        Validators.compose([]),
      ],
      lastName: [
        this.userStore.user.lastName,
        Validators.compose([
          Validators.required,
          Validators.minLength(this.minchars),
          Validators.maxLength(this.maxchars),
          Validators.pattern('^[a-zA-Z\\s]+$'),
        ]),
        blacklistWordspharma(this.content),
      ],
      gender: [this.userStore.user.gender, Validators.required],
      // dateOfBirth: [this.userStore.user.dateOfBirth, Validators.required],
      postCode: [
        this.userStore.user.postCode,
        Validators.compose([
          Validators.required,
          Validators.pattern(
            /^(?:(?:[2-8]\d|9[0-7]|0?[28]|0?9(?=09))(?:\d{2}))$/
          ),
          Validators.min(this.minNumberPost),
        ]),
      ],
    }) as FormGroup;
  }

 // Lifecycle
 public async ionViewWillEnter() {
  this.analyticsService.trackStateAction({
    pagename: analyticsValues.PAGE_EDIT_PROFILE_DETAILS
  });
}
  // Public

  public onCancelTap() {
    this.navCtrl.pop();
  }

  public onSubmit() {
    this.navCtrl.push(EditProfileChampixPage, {
      profileUpdates: this.profileForm.value,
    });
  }

  public onPostCodeEnter(e) {
    // console.log(e);
  }

  public onPostCodeFocusOut(e) {
    const term = this.profileForm.controls['postCode'].value;

    this.postcodes = [];

    // TODO: Move this logic to helper function
    if (
      term &&
      term.toString().length >= this.minPc &&
      term.toString().length !== this.maxPc &&
      this.plt.is('cordova')
    ) {
  // if (term && term.toString().length >= 3 && term.toString().length !== 4) {
  // Browser testing

      this.uiUtils.showLoading();
      this.postcodeProvider.getPostCode(term).then(res => {
        const ress = JSON.parse(res.data) as any;
        // const ress = res as any; // Browser testing

        this.uiUtils.hideLoading();

        const arr = Array.isArray(ress.localities.locality);
        // Account for single or multiple values
        if (arr) {
          ress.localities.locality.forEach(loc => {
            const locc = this.utils.titleCase(loc.location);

            this.postcodes.push({
              pcode: loc.postcode,
              location: locc
            });
          });
        } else {
          const locc = this.utils.titleCase(ress.localities.locality.location);
          this.postcodes.push({
            pcode: ress.localities.locality.postcode,
            location: locc,
          });
        }
      });
    }
  }

  public onPostCodeLookupTap(e) {
    this.profileForm.controls['postCode'].setValue(e, { emitEvent: false });
    this.postcodes = [];
  }
}
