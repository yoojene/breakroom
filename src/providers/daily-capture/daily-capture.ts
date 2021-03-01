import { Injectable } from '@angular/core';
import { pharmaProvider } from '@pharma/pharma-js-bindings-ng';
import { EventService, IEvent, pharmaRequestMethod, IpharmaRequest } from '@pharma/pharma-js-sdk';
import { BreakroomConfig } from '../../app/app.config';
import { UserStore } from '../../stores/user.store';
import { Logger } from '@pharma/pharma-component-utils';
import { DailyCapture, pharmaDailyCaptureEvent } from '../../models/daily.capture.model';
import * as moment from 'moment';
import { Storage } from '@ionic/storage';

@Injectable()
export class DailyCaptureProvider {
  public enteredDays: pharmaDailyCaptureEvent[] = [];
  public events: pharmaDailyCaptureEvent[];
  private STORAGE_TODAY_CAPTURE_KEY = 'TODAY-CAPTURE';

  constructor(
    public pharmaProvider: pharmaProvider,
    public config: BreakroomConfig,
    public userStore: UserStore,
    protected ionicStorage: Storage,
    private logger: Logger
  ) {}

  /**
   * Add an Daily Data Capture Event to pharma
   */
  public async addDailyCaptureEvent(
    dailyCaptureAttributes: DailyCapture
  ): Promise<any> {
    const event = this.pharmaProvider.pharmaService.service(
      'event'
    ) as EventService;

    const dailyCaptureEvent: IEvent = {
      eventType: this.config.dailyCaptureEventType,
      attributes: dailyCaptureAttributes,
      isActive: true,
      janrainId: this.userStore.user.id,
    };

    try {
      const eventRes = await event.update(
        dailyCaptureEvent,
        this.userStore.user.id
      );

      return eventRes;
    } catch (err) {
      this.logger.error(err);
    }
  }

  /**
   * Get all daily capture events, filtered by DDC eventType
   */
  public async getDailyEvents() {
    // clean it case dailyEvent Fail
    this.enteredDays = [];

    const param = {
      eventType: this.config.dailyCaptureEventType,
    };

    const request: IpharmaRequest = {
      method: pharmaRequestMethod.GET,
      endpoint: `persons/${this.userStore.user.id}/events`,
      params: param,
      headers: null,
      exemptRefresh: false,
    };

    const eventRes: any = await this.pharmaProvider.pharmaService.callApi(
      request
    );

    const events: pharmaDailyCaptureEvent[] = eventRes.results;

    this.enteredDays = events;
    this.events = events;

    return events;
  }

  public isDayAlreadyEntered(date): boolean {
    // the "days " already inputted is calculated earlier in this.enteredDays
    if (!this.enteredDays) {
      return false;
    }
    for (const day of this.enteredDays) {
      if (moment(day.attributes.date).isSame(moment(date), 'day')) {
        if (day.attributes.didSkip === true) {
          return false; // if we skipped the data entry, its actually false
        } else {
          return true;
        }
      }
    }

    return false;
  }
  /**
   *
   * Used for Cigarettes Smoked Per Day graph and Savings up until
   * Quit Date (Pre Quit Dashboard)
   */
  public getCigarettesEnteredForDay(
    date: string,
    cigarettesPerDay: number
  ): any {
    if (moment(date).isBefore(moment(this.userStore.user.startDate))) {
      return { validDate: false, cigarettesSmoked: 0, dataEntered: false };
    }

    for (const event of this.events) {
      if (date === event['attributes']['date']) {
        return {
          validDate: true,
          cigarettesSmoked: event['attributes']['cigarettesSmoked'],
          dataEntered: true,
        };
      }
    }

    return {
      validDate: true,
      cigarettesSmoked: this.userStore.user.numberCigarettesSmoked,
      dataEntered: false,
    };
  }

  public getCigarettesSmoked(): number {
    // get all cigarttes smoked or not smoked, in total
    let smoked = 0;
    for (const event of this.events) {
      if (event['attributes']['cigarettesSmoked']) {
        smoked += event['attributes']['cigarettesSmoked'];
      }
    }

    return smoked;
  }

  public async shouldPopUpDailyCapture(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const today = this.getToday();

      const param = {
        eventType: this.config.dailyCaptureEventType,
      };
      const request: IpharmaRequest = {
        method: pharmaRequestMethod.GET,
        endpoint: `persons/${this.userStore.user.id}/events`,
        params: param,
        headers: null,
        exemptRefresh: false,
      };

      this.pharmaProvider.pharmaService
        .callApi(request)
        .then((eventRes: any) => {
          const events: pharmaDailyCaptureEvent[] = eventRes.results;
          this.enteredDays = events;
          this.events = events;

          const isDayAlreadyEntered = this.isDayAlreadyEntered(
            moment().format(today)
          );

          if (!isDayAlreadyEntered) {
            this.ionicStorage
              .get(this.STORAGE_TODAY_CAPTURE_KEY)
              .then(todayAlreadyTry => {
                if (todayAlreadyTry === today) {
                  resolve(false);
                }
                this.setTodayCaptureKeyAsTrue(today);
                resolve(true);
              });
          } else {
            resolve(false);
          }
        })
        .catch((error: any) => {
          resolve(false);
        });
    });
  }

  private getToday() {
    return moment.unix(moment().unix()).format('YYYY-MM-DD');
  }

  private setTodayCaptureKeyAsTrue(today) {
    this.ionicStorage.set(this.STORAGE_TODAY_CAPTURE_KEY, today);
  }

  /* need clean this provider case user logout*/
  public cleanLogOut() {
    this.enteredDays = [];
    this.events = [];
  }
}
