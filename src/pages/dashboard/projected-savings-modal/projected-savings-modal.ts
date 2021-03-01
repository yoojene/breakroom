import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'projected-savings-modal',
  templateUrl: 'projected-savings-modal.html',
})
export class ProjectedSavingsModalComponent {
  // Text
  public quitDateTitle = this.translate.instant(
    'DASHBOARD.PROJECTED_LIFE_SAVINGS_MODAL_TITLE'
  );
  public quitDateText = this.translate.instant(
    'DASHBOARD.PROJECTED_LIFE_SAVINGS_MODAL_TEXT'
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
