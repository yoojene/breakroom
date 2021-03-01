import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
/*
  Generated class for the UtilsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class UtilsProvider {
  constructor(public http: HttpClient) {
  }

  /**
   * ion-datetime component returns an object with day/month/year as numbers
   * ```
   *  {day: 13, month: 8, year: 2018}
   * ```
   * This parses the day and month for single digits and appends an
   * initial 0 where required to conform to RFC2822 or ISO format correcly
   * http://momentjs.com/guides/#/warnings/js-date/
   *
   */
  public formatISODates(date: any) {
    let month = date.month.toString();
    let day = date.day.toString();

    if (month.length === 1) {
      month = `0${month}`;
    }
    if (day.length === 1) {
      day = `0${day}`;
    }
    const startDateFmt = `${date.year}-${month}-${day}`;

    return startDateFmt;
  }
  /**
   * Format string to Title Case
   * https://medium.freecodecamp.org/three-ways-to-title-case-a-sentence-in-
   * javascript-676a9175eb27
   */
  public titleCase(str: string) {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => {
        return word.replace(word[0], word[0].toUpperCase());
      })
      .join(' ');
  }

  // Calculate humam-readable time, Newsfeed and Notificatins

  public calculateDisplaySharedTime(lastModifiedTime) {
    const now = moment(new Date());
    const end = moment(lastModifiedTime);
    const duration = moment.duration(now.diff(end));

    return duration.humanize();
  }

  /**
   * Get todays' date
   */
  public getToday() {
    return moment
      .unix(moment().unix())
      .format('YYYY-MM-DD');
  }
}
