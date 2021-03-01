import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '../../../node_modules/@ngx-translate/core';
import * as moment from 'moment';
import { PostcodeProvider } from '../../providers/postcode/postcode';
import {
  CreateAccountEmailPage
 } from '../create-account-email/create-account-email';
import { UtilsProvider } from '../../providers/utils/utils';
import {
  UserInterfaceUtilsProvider
} from '../../providers/utils/user-interface-utils';
import { ContentProvider } from '../../providers/content/content';
import { blacklistWordspharma } from '../../validators/blacklist-word-pharma.';
import { UserStore } from '../../stores/user.store';
import {
  AnalyticsProvider,
  analyticsValues } from '../../providers/analytics/analytics';

@IonicPage()
@Component({
  selector: 'page-create-account-person',
  templateUrl: 'create-account-person.html',
})
export class CreateAccountPersonPage implements AfterViewInit {
  @ViewChild('gender', { read: ElementRef })
  public gender: ElementRef;
  // Text
  public createAccountTitle = this.translate.instant('CREATE_ACCOUNT.TITLE');
  public createAccountBodyText = this.translate.instant(
    'CREATE_ACCOUNT.C2_BODYTEXT'
  );

  public nextButtonText = this.translate.instant('CREATE_ACCOUNT.NEXT_BUTTON');
  public dateOfBirthText = this.translate.instant(
    'CREATE_ACCOUNT.C2_FIELD_DOB'
  );
  public genderText = this.translate.instant('CREATE_ACCOUNT.C2_FIELD_GENDER');

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

  public dobErrReq = this.translate.instant('ERROR_MSG.C2_DOB_BLANK');
  public dobErrInvalid = this.translate.instant('ERROR_MSG.C2_DOB_INVALID');
  public genderErrReq = this.translate.instant('ERROR_MSG.C2_GENDER_BLANK');
  public postCodeErrReq = this.translate.instant('ERROR_MSG.C2_POSTCODE_BLANK');

  public reviewMessage = this.translate.instant('GENERIC_MESSAGES.REVIEW');
  public postCodePlaceholder = this.translate.instant(
    'GENERIC_MESSAGES.POSTCODE');

  // Form validation

  public personForm: FormGroup;
  public timeout: any = null;
  private expireTimeOut = 1000;

  public genders = [
    { abbr: 'M', gender: 'Male' },
    { abbr: 'F', gender: 'Female' },
    { abbr: 'O', gender: 'Prefer not to say' },
  ];

  private smokingAge = 18;

  public maxDate: string = moment()
    .subtract(this.smokingAge, 'years')
    .format('YYYY-MM-DD');

  private minchars = 2;
  private maxchars = 50;
  private minNumberPost = 1000;

  public bannedWords;
  public finishedCheckPostCode = true;

  // Postcode

  public postcodes: any = [];
  public postcode = '';

  private minPc = 3;
  private maxPc = 4;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public postcodeProvider: PostcodeProvider,
    private formBuilder: FormBuilder,
    private plt: Platform,
    public utils: UtilsProvider,
    public content: ContentProvider,
    private uiUtils: UserInterfaceUtilsProvider,
    private userStore: UserStore,
    public analyticsService: AnalyticsProvider,
  ) {

    this.personForm = this.formBuilder.group({
      firstName: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(this.minchars),
          Validators.maxLength(this.maxchars),
          Validators.pattern('^[a-zA-Z\\s]+$'),
        ]),
        blacklistWordspharma(this.content),
      ],
      lastName: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(this.minchars),
          Validators.maxLength(this.maxchars),
          Validators.pattern('^[a-zA-Z\\s]+$'),
        ]),
        blacklistWordspharma(this.content),
      ],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      postCode: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(
            /^(?:(?:[1-8]\d|9[0-7]|0?[28]|0?9(?=09))(?:\d{2}))$/
          ),
          Validators.min(this.minNumberPost)
        ]),
      ],
    }) as FormGroup;
  }

  // Lifecycle

  public ionViewWillEnter() {
    // clean any dirty data
    this.userStore.resetUser();

    this.analyticsService.trackStateAction({
      pagename: analyticsValues.PAGE_CREATE_PERSON
    });
  }

  public ngAfterViewInit() {
    this.personForm.controls['gender'].valueChanges.subscribe(res => {
      // Hide the select placeholder icon on the Gender when populated
      this.gender.nativeElement.children[1].hidden = false;
      if (res) {
        this.gender.nativeElement.children[1].hidden = true;
      }
    });
  }

  public shouldCheckPostCode(e) {
    const term = this.personForm.controls['postCode'].value;

    if (term && (term.toString().length >= this.minPc
    || term.toString().length === this.maxPc) && this.plt.is('cordova')) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout( () => {
          this.onPostCodeFocusOut();
    }, this.expireTimeOut);

    }
  }

  public onPostCodeFocusOut() {
    const term = this.personForm.controls['postCode'].value;

    this.postcodes = [];

    if (term && (term.toString().length >= this.minPc
    || term.toString().length === this.maxPc) && this.plt.is('cordova')) {
  // if (term && term.toString().length >= 3 && term.toString().length !== 4) {
      // Browser testing
      this.finishedCheckPostCode = false;

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
          this.finishedCheckPostCode = true;
          const locc = this.utils.titleCase(ress.localities.locality.location);
          this.postcodes.push({
            pcode: ress.localities.locality.postcode,
            location: locc,
          });
        }
      });
    }
  }

  public onSubmit() {
    this.navCtrl.push(CreateAccountEmailPage, { form: this.personForm.value });
  }

  public onPostCodeLookupTap(e) {
    this.personForm.controls['postCode'].setValue(e, { emitEvent: false });
    this.postcodes = [];
    this.finishedCheckPostCode = true;

  }
}
