import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'quit-method-modal',
  templateUrl: 'quit-method-modal.html',
})
export class QuitMethodModalComponent {

  // Text
  public quitDateTitle = this.translate.instant(
    'CREATE_ACCOUNT.C4_QUITMETHOD_INFO_TITLE'
  );
  public quitDateText = this.translate.instant(
    'CREATE_ACCOUNT.C4_QUITMETHOD_INFO_BODY'
  );

  public okButton = this.translate.instant('BUTTONS.OK');

  constructor(
    public viewCtrl: ViewController,
    public translate: TranslateService
  ) {
  }

  public onOkTap() {
    this.viewCtrl.dismiss();
  }
}
