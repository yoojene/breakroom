import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';
@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html'
})
export class ResetPasswordPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public inApp: InAppBrowser
  ) {}

  public ionViewWillEnter() {
//
  }

  public onSendLinkButtonTap() {
    const options: InAppBrowserOptions = {
      zoom: 'no',
      hideurlbar: 'yes',
      closebuttoncaption: 'Done',
      closebuttoncolor: '#4DBCC6',
      toolbar:'yes',
      hidenavigationbuttons: 'no',
      presentationstyle: 'pagesheet'
    };
    // Authorization: Basic c2l0ZWd1YXJkOlJlcm91dGUyUmVtYWlu
    // Opening a URL and returning an InAppBrowserObject
    this.inApp.create(
      'https://pharma.pharma.com/password-reset',
      '_self',
      options
    );
  }
}
