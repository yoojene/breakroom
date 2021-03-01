import { Component, ViewChild } from '@angular/core';
import { NavParams, IonicPage, Tabs } from 'ionic-angular';

@IonicPage()
@Component({
  templateUrl: 'tabs.html',
})
export class TabsPage {
  @ViewChild('myTabs') public tabRef: Tabs;

  public params: any;
  public authUser: any;

  public tab1Root = 'NewsfeedPage';
  public tab2Root = 'achievement-list';
  public tab3Root = 'DashboardPage';
  public tab4Root = 'ChampixInfoPage';
  public tab5Root = 'ContentPage';

  constructor(params: NavParams) {
    this.params = params;
    // Params from LoginPage passed as rootParam to Dashboard
    this.authUser = this.params.data.authUser;
  }

  public ionViewWillEnter() {
    if (this.params.data.deepLink) {
      // tslint:disable-next-line:no-magic-numbers
      this.tabRef.select(3);
    }
  }
}
