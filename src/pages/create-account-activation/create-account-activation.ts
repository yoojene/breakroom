import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController
} from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { ActivationProvider } from '../../providers/activation/activation';
import { IAsset } from '../../../node_modules/@pharma/pharma-js-sdk';
import {
  AnalyticsProvider,
  analyticsValues
} from '../../providers/analytics/analytics';
import {
   UserInterfaceUtilsProvider
  } from '../../providers/utils/user-interface-utils';
import { Logger } from '@pharma/pharma-component-utils';

@IonicPage()
@Component({
  selector: 'page-create-account-activation',
  templateUrl: 'create-account-activation.html',
})
export class CreateAccountActivationPage {
  public createAccountTitle = this.translate.instant('CREATE_ACCOUNT.TITLE');
  public createAccountBodyText = this.translate.instant(
    'CREATE_ACCOUNT.C1_BODYTEXT'
  );
  public nextButtonText = this.translate.instant('CREATE_ACCOUNT.NEXT_BUTTON');

  public inputType = 'number';

  public inputPlaceholder = this.translate.instant(
    'CREATE_ACCOUNT.C1_INPUT_PLACEHOLDER'
  );
  public invalidaNetwork = this.translate.instant(
    'ERROR_MSG.C1_INVALID_NETWORK'
  );

  public submitDisabled = true;
  public error = false;
  public errorText = this.translate.instant('ERROR_MSG.C1_INVALID');

  public isIncorrectNetworkError = false;
  private codeLength = 4;
  private codes;

  constructor(
    public navCtrl: NavController,
    public analyticsService: AnalyticsProvider,
    public navParams: NavParams,
    public translate: TranslateService,
    public alertCtrl: AlertController,
    private act: ActivationProvider,
    private logger: Logger,
    private uiUtils: UserInterfaceUtilsProvider
  ) {}

  // Lifecycle

  protected ionViewDidEnter() {
    // Report page view to analytics
    this.analyticsService.trackStateAction({
      pagename: analyticsValues.PAGE_BARCODE
    });
  }
  public ionViewDidLoad() {

    try {
      this.isIncorrectNetworkError=false;
      this.getActivationCodes();
    } catch (err) {
      this.uiUtils.hideLoading();
      this.logger.log(err);
    }
  }

  public onCodeSubmit(e) {
    this.navCtrl.push('CreateAccountPersonPage');
  }

  public onInputChanged(e) {
    this.error = false;
    this.submitDisabled = true;

    if (e.detail.length >0) {
      document.getElementsByClassName(
        'helix--input')[0]['style'].backgroundImage = 'none';
    } else if (e.detail.length === 0){
      document.getElementsByClassName('helix--input')[0]['style'] = {};
    }
    if (
      e.detail.length >= this.codeLength &&
      this.codes.indexOf(e.detail) === -1
    ) {
      this.error = true;
    }
    if (
      e.detail.length >= this.codeLength &&
      this.codes.indexOf(e.detail) > -1
    ) {
      this.submitDisabled = false;
    }
  }

  private  getActivationCodes() {
    let codeArr: IAsset[];
    this.uiUtils.showLoading();
    this.act.getActivationCodes().then((result) => {
      codeArr = result.results;
      this.codes = codeArr.map(c => {
        return c.name;
      });
      this.uiUtils.hideLoading();
    }).catch(error => {
      if((error.toString()).search('Network')){
        this.isIncorrectNetworkError=true;
      }
      this.uiUtils.hideLoading();
    });
  }
}
