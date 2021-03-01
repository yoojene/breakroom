import { Injectable } from '@angular/core';
import { LocalNotification } from '../models/local-notification.model';
import { Storage } from '@ionic/storage';
import { Logger } from '@pharma/pharma-component-utils';
import * as mobx from 'mobx';
import { action } from 'mobx';
import { observable } from 'mobx-angular';

@Injectable()
export class NotificationStore {
  @observable
  public notification: LocalNotification[] = [] as any;

  private STORAGE_KEY = 'NOTIFICATION';

  constructor(private ionicStorage: Storage, private logger: Logger) {}

  public isanyNotificationNotSeen(){
    if(this.notification && this.notification.length > 0){
      for (const notifi of this.notification) {
        if(!notifi.seen){

          return true;
        }
      }
    }

    return false;
  }

  public async setUpStore() {
    return this.getData().then(() => {
      this.setupNewNotificationStore();

      mobx.autorun(() => this.saveData(), { delay: 500 });

      // this.refreshStore();
    });
  }

  public setupNewNotificationStore() {
    if (!this.notification) {
      this.logger.log('Initalizing new notification...');
      this.notification = [];
    }
  }

  // Get store from database
  @action
  private async getData() {
    return this.ionicStorage.get(this.STORAGE_KEY).then(
      action((data: any) => {
        this.notification = data;
      })
    );
  }

  // Save notification object to database
  private saveData() {
    this.logger.log('Saving user to database...');
    this.ionicStorage.set(this.STORAGE_KEY, this.notification).catch(() => {
      this.logger.log('Something went wrong, reloading data...');
      this.getData();
    });
  }

  @action
  public checkNotificationExist(currentNotification) {
    this.logger.log('checkNotificationExists');

    currentNotification.map(not => {
      this.notification = this.notification.filter(fil => {
        return not.id !== fil.id;
      });
    });

    return mobx.toJS(this.notification);
  }

  @action
  public getAllUnseenNotifications() {
    this.notification = this.notification.filter(fil => {
      return fil.seen === false;
    });

    return this.notification;
  }

  @action
  public setNotificationSeen(seen: boolean, eventId: any) {
    this.notification.map(not => {
      if (not.id === eventId) {
        return not.seen = seen;
      }
    });
  }

  @action
  public updateNotification(updates) {
    this.notification = [...updates, ...this.notification];
  }
  @action
  public addNotifications(updates) {
    this.notification = updates;

  }

  @action
  public addNewNotification(notification) {
    this.notification.push(notification);
  }

  @action
  public clearStore() {
    this.notification = [];
  }
}
