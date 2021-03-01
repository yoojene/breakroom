import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'my-money-modal',
  templateUrl: 'my-money-modal.html',
})
export class MyMoneyModalComponent {
  // Text
  public quitDateTitle = this.translate.instant(
    'DASHBOARD.MY_MONEY_MODAL_TITLE'
  );
  public quitDateText = this.translate.instant(
    'DASHBOARD.MY_MONEY_MODAL_TEXT'
  );

  public okButton = this.translate.instant('BUTTONS.OK');

  constructor(
    public viewCtrl: ViewController,
    public translate: TranslateService
  ) {}

  public onOkTap() {
    this.viewCtrl.dismiss();
  }
}
