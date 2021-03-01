import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import {
  CreateAccountProfilePage
} from '../create-account-profile/create-account-profile';
import { AuthProvider } from '../../providers/auth/auth';
import {
  UserInterfaceUtilsProvider
} from '../../providers/utils/user-interface-utils';
import {
  AnalyticsProvider,
  analyticsValues } from '../../providers/analytics/analytics';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { TermsConditionsPage } from '../terms-conditions/terms-conditions';

@IonicPage()
@Component({
  selector: 'page-create-account-email',
  templateUrl: 'create-account-email.html',
})
export class CreateAccountEmailPage {
  // Text
  public createAccountTitle = this.translate.instant('CREATE_ACCOUNT.TITLE');
  public createAccountBodyText = this.translate.instant(
    'CREATE_ACCOUNT.C3_BODYTEXT'
  );

  public nextButtonText = this.translate.instant('CREATE_ACCOUNT.TITLE');

  public emailErrReq = this.translate.instant('ERROR_MSG.C3_EMAIL_BLANK');
  public emailErrInvalid = this.translate.instant('ERROR_MSG.C3_EMAIL_INVALID');
  public emailErrAlreadyRegistered = this.translate.instant(
    'ERROR_MSG.C3_EMAIL_ALREADY_REGISTERED'
  );
  public passwordErrReq = this.translate.instant('ERROR_MSG.C3_PASSWORD_BLANK');
  public passwordErrInvalid = this.translate.instant(
    'ERROR_MSG.C3_PASSWORD_INVALID'
  );
  public confPasswordErrReq = this.translate.instant(
    'ERROR_MSG.C3_CONFPASSWORD_BLANK'
  );
  public confPasswordErrInvalid = this.translate.instant(
    'ERROR_MSG.C3_CONFPASSWORD_INVALID'
  );
  public confPasswordErrMismatch = this.translate.instant(
    'ERROR_MSG.C3_CONFPASSWORD_MISMATCH'
  );

  public quitMethodPlacehold = this.translate.instant('BUTTONS.QUIT_METHOD');
  public emailPlacehold = this.translate.instant('BUTTONS.EMAIL');
  public passwordPlaceh = this.translate.instant('BUTTONS.PASSWORD');
  public confPasswordPlaceh = this.translate.instant('BUTTONS.CONF_PASSWORD');

  public termsBody = this.translate.instant('CREATE_ACCOUNT.C3_TANDCTEXT');
  public termsName = this.translate.instant('CREATE_ACCOUNT.C3_TANDCNAME');
  public privacyName = this.translate.instant('CREATE_ACCOUNT.C3_PPNAME');
  public privacyBody = this.translate.instant('CREATE_ACCOUNT.C3_PRIVACYTEXT');
  public privacyRelated = this.translate.instant(
    'CREATE_ACCOUNT.C3_PRIVACYTEXT_RELATED'
  );

  // Param

  public personForm: any;

  // Form
  private min = 8;
  // private max = 16;
  public emailForm: FormGroup;

  public formError: any;

  constructor(
    public navCtrl: NavController,
    public iab: InAppBrowser,
    public navParams: NavParams,
    public translate: TranslateService,
    public formBuilder: FormBuilder,
    public auth: AuthProvider,
    private uiUtils: UserInterfaceUtilsProvider,
    public analyticsService: AnalyticsProvider
  ) {
    this.emailForm = formBuilder.group({
      email: ['', Validators.compose([
            Validators.required,
            Validators.pattern(
              /^[\a-z0-9_\.]+@((?!pharma.com)[\a-z0-9_]+\.)+[\a-z0-9_]{2,3}$/
            ),
          ])], password: ['', Validators.compose([
            Validators.required,
            Validators.minLength(this.min),
            Validators.pattern(
              '(?=^.{8,}$)(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s)[0-9a-zA-Z!@#$%^&*()]*$'
            ),
          ])], confPassword: ['', Validators.compose([
            Validators.required,
            Validators.minLength(this.min),
            Validators.pattern(
              '(?=^.{8,}$)(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s)[0-9a-zA-Z!@#$%^&*()]*$'
            ),
          ])], accTCs: [false, Validators.requiredTrue] }, { validator: this.pwdMatchValidator }) as FormGroup;
  }

  // Lifecycle

  public ionViewDidEnter() {
    this.analyticsService.trackStateAction({
      pagename: analyticsValues.PAGE_CREATE_EMAIL,
    });

    this.personForm = this.navParams.get('form');
    this.formError = null;
  }

  // Public

  public async onSubmit() {
    // Combine form passed from Person page and this
    const personF = this.personForm;
    const combinedForms = { ...this.emailForm.value, ...personF };
    try {
      this.uiUtils.showLoading();
      const regAcc = await this.auth.registerAccount(
        this.emailForm.controls['email'].value,
        this.emailForm.controls['password'].value,
        combinedForms
      );

      const [registeredPerson] = regAcc.results;

      this.uiUtils.hideLoading();
      this.navCtrl.push(CreateAccountProfilePage, {
        registered: registeredPerson,
      });
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.log('onSubmit', err);
      // NOTE: What happens if account reg fails?  Throw error and retry?
      this.uiUtils.hideLoading();

      this.formError = err;
    }
  }

  public termsOfUse() {
    this.navCtrl.push(TermsConditionsPage);
  }

  public privacyPolicy() {
    this.iab.create(
      'https://privacycenter.pharma.com/en/app/breakroom-australia', '_system'
      );
  }

  public onChangeEmail() {
    this.formError = false;
  }

  protected pwdMatchValidator(frm: FormGroup): Validators {
    return frm.controls['password'].value === frm.controls['confPassword'].value
      ? null
      : { mismatch: true };
  }
}
