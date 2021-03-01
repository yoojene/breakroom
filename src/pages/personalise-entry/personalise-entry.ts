import { Component } from '@angular/core';
import { NavController, NavParams  } from 'ionic-angular';
import { PersonalisePage } from '../personalise/personalise';
import { UserStore } from '../../stores/user.store';
import { DomSanitizer } from '@angular/platform-browser';
import {
  AnalyticsProvider,
  analyticsValues } from '../../providers/analytics/analytics';

@Component({
  selector: 'page-personalise-entry',
  templateUrl: 'personalise-entry.html',
})
export class PersonaliseEntryPage {

  public registeredPerson: any;
  public avatar: any;

  constructor (
      public navCtrl: NavController,
      public navParams: NavParams,
      private sanitizer: DomSanitizer,
      private uStore: UserStore,
      public analyticsService: AnalyticsProvider,
  ) {}

  public ionViewDidEnter() {

    this.analyticsService.trackStateAction({
      pagename: analyticsValues.PAGE_PERSONALISE_LANDING
    });

    this.registeredPerson = this.navParams.get('registeredPerson');
    this.avatar = this.sanitizer.bypassSecurityTrustUrl(
      `${this.uStore.user.avatarUrl}`);
  }

  public onAskButtonTap(){
    this.navCtrl.push(PersonalisePage,{registeredPerson:this.registeredPerson});
  }

}
