import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NavController } from 'ionic-angular';
import { UserStore } from '../../stores/user.store';

@Component({
  selector: 'tabs-header',
  templateUrl: 'tabs-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsHeaderComponent {

  @Input() public headerTitle: string;

  @Input() public avatarUrl: string;

  @Input() public hideBackButton: boolean;

  @Input() public hasNotification: boolean;

  constructor(public navCtrl: NavController,
              public userStore: UserStore) {
  }

  public onSettingsTap() {
    this.navCtrl.push('SettingsPage');
  }
  public onNotificationsTap() {
    this.navCtrl.push('NotificationsPage');
  }
}
