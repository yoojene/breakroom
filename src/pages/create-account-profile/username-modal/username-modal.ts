import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'username-modal',
  templateUrl: 'username-modal.html',
})
export class UsernameModalComponent {
  // Text
  public usernameTitle = this.translate.instant(
    'CREATE_ACCOUNT.C4_USERNAME_INFO_TITLE'
  );
  public usernameText = this.translate.instant(
    'CREATE_ACCOUNT.C4_USERNAME_INFO_BODY'
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
