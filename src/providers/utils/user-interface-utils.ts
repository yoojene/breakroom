import { Injectable } from '@angular/core';
import { LoadingController } from 'ionic-angular';

@Injectable()
export class UserInterfaceUtilsProvider {
  protected loader: any;

  constructor(public loadingCtrl: LoadingController) {
  }

  public showLoading() {
    this.loader = this.loadingCtrl.create();
    this.loader.present();
  }

  public hideLoading() {
    this.loader.dismissAll();
  }
}
