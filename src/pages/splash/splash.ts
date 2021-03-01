import { Component } from '@angular/core';
import {
  Platform,
  IonicPage,
  NavController,
  ViewController,
} from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';

@IonicPage()
@Component({
  selector: 'page-splash',
  templateUrl: 'splash.html',
})
export class SplashPage {

  private timeout = 4000;
  constructor(public navCtrl: NavController,
              public viewCtrl: ViewController,
              public plt: Platform,
              public splashScreen: SplashScreen) {}

  public ionViewDidEnter() {
     this.splashScreen.hide();

    setTimeout(() => {
      this.viewCtrl.dismiss();
    }, this.timeout);

  }
}
