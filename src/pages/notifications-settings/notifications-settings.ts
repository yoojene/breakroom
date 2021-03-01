import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { UserStore } from '../../stores/user.store';
import { AuthProvider } from '../../providers/auth/auth';
import {
  UserInterfaceUtilsProvider
} from '../../providers/utils/user-interface-utils';
import { Logger } from '@pharma/pharma-component-utils';
import {
  NotificationProvider
 } from '../../providers/notification/notification.provider';
import { pharmaPerson } from '../../models/user.model';

@Component({
  selector: 'page-notifications-settings',
  templateUrl: 'notifications-settings.html',
})
export class NotificationsSettingsPage {

  public enableNotification = true;

  constructor(
    public navCtrl: NavController,
    private userStore: UserStore,
    private auth: AuthProvider,
    private logger: Logger,
    public notificationsProvider: NotificationProvider,
    private uiUtils: UserInterfaceUtilsProvider,
    ) {
      this.enableNotification = userStore.user.enableNotification;
  }

  // Public

/**
 * Notification toggle
 */
public onChangeEnableNotification(){
      try {
        const person: pharmaPerson = {
          id: this.userStore.user.id,
          firstName: this.userStore.user.firstName,
          lastName: this.userStore.user.lastName,
        };
        const personUpdates = {
          enableNotification: this.enableNotification,
        };

        this.uiUtils.showLoading();
        this.auth.updatepharmaPerson(person, personUpdates).then(res => {
          this.uiUtils.hideLoading();
          this.userStore.updateEnableNotification(this.enableNotification);
          this.notificationsProvider.enableNotifications(
            this.enableNotification
            );
        }).then(() => {
          // Add listeners again
          this.notificationsProvider.checkUAPluginNotificationPermission();
        })
        .catch(err => {
          this.logger.error(err);
          // TODO Handle error message
          this.uiUtils.hideLoading();
        });
    } catch (err) {
      this.uiUtils.hideLoading();
      this.logger.error(err);
    }
  }

/**
 * Set system push notification permission, opens system settings
 */
public onPushNotificationTap() {
    this.notificationsProvider.requestSystemNotificationPermissions();
  }
}
