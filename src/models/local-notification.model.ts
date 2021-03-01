import { observable } from 'mobx';

export interface LocalNotification {
  id: string;
  attributes: any;
  seen: boolean;
  sharedTime: string;
  notificationType: string;
  createBy?: string;
  createTime: string;
  eventType?: string;
  instance?: string;
  isActive?: boolean;
  lastModifiedTime?: string;
  modifiedBy?: string;
  deepLinkId?: string;
}

export class LocalNotification {
  public id: string;
  @observable public attributes: any;
  @observable public seen: boolean;
  @observable public sharedTime: string;
  @observable public notificationType: string;
  @observable public createBy?: string;
  @observable public createTime: string;
  @observable public eventType?: string;
  @observable public instance?: string;
  @observable public isActive?: boolean;
  @observable public lastModifiedTime?: string;
  @observable public modifiedBy?: string;
  @observable public deepLinkId?: string;
}

export enum LocalNotificationType {
  Achievement = 'achievement',
  Reaction = 'reaction',
  DailyDiary = 'dailyDiary',
  GPReminder = 'reminder',
  Profile = 'profile'
}

export enum LocalNotificationTimes {
  DailyDiaryAmStart = ' 09:00:00',
  DailyDiaryAmFinish = ' 09:30:00',
  DailyDiaryPmStart = ' 13:00:00',
  DailyDiaryPmFinish = ' 13:30:00',
  Monday = 1
}

  export interface pharmaReactionEvent {
    attributes: {
      eventId: string;
      patientId: string;
      recipientList: any;
    };
    createTime: string;
    createdBy: string;
    eventType: string;
    id: string;
    instance: string;
    isActive: boolean;
    janrainId: string;
    lastModifiedTime: string;
    modifiedBy: string;
    personId: string;
    resourceType: string;
  }
