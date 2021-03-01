import { Injectable } from '@angular/core';
import {
  AdobeAnalyticsWrapperService,
  Logger,
} from '@pharma/pharma-component-utils';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';

export const analyticsValues = {
  // Global
  TRACK_CONTENT_PREFIX: 'pcc.content.',
  APP_NAME: 'AU PCC Dev Breakroom App',
  COUNTRY: 'AU',
  LANGUAGE: 'en',

  // Page Titles
  PAGE_LANDING: 'Landing',
  PAGE_BARCODE: 'Bar Code Entry C1',
  PAGE_CREATE_PERSON: 'Create Account C2',
  PAGE_CREATE_EMAIL: 'Create Account Email C3',
  PAGE_CREATE_PROFILE: 'Create Account Profile C4',
  PAGE_CREATE_AVATAR: 'Create Account Avatar C7',
  PAGE_PERSONALISE_LANDING: 'Peronalise D1',
  PAGE_PERSONALISE_CIGARETTES: 'Personalise Cigarettes D2',
  PAGE_PERSONALISE_REASON: 'Personalise Quit Reason D3',
  PAGE_PERSONALISE_SMOKETIME: 'Personalise Time Smoked D4',
  PAGE_PERSONALISE_USED_BEFORE: 'Personalise Used Champix D5',
  PAGE_PERSONALISE_COMPLETE: 'Personalise Complete D6',

  PAGE_LOGIN: 'Login',
  PAGE_DASHBOARD: 'Dashboard',
  PAGE_NEWSFEED: 'Newsfeed',
  PAGE_ACHIEVEMENTS: 'Achievements',
  PAGE_CHAMPIX_INFO: 'CHAMPIX Info',
  PAGE_CONTENT: 'Content',

  PAGE_DAILY_DIARY_SMOKE: 'Daily Diary Smoke F1',
  PAGE_DAILY_DIARY_CIGARETTES: 'Daily Diary Cigarettes F2',

  PAGE_SETTINGS: 'Settings',
  PAGE_NOTIFICATIONS: 'Notifications',

  PAGE_EDIT_PROFILE_DETAILS: 'Edit Profile 1',
  PAGE_EDIT_PROFILE_DATES: 'Edit Profile 2',
  PAGE_EDIT_AVATAR: 'Edit Avatar',

  PAGE_ACHIEVEMENT_DETAILS: 'Achievement Detail',

  PAGE_ABOUT_APP: 'About app',
  PAGE_PRIVACY_POLICY: 'Privacy policy',
  PAGE_TERMS_AND_CONDITION: 'Terms and condition',

};

@Injectable()
export class AnalyticsProvider {

  constructor(public logger: Logger,
              public platform: Platform,
              public translate: TranslateService,
              public analyticsWrapper: AdobeAnalyticsWrapperService) {

    const installed = this.analyticsWrapper.isADBInstalled();
    this.logger.log(`isADBInstalled ${installed}`);

    this.analyticsWrapper.setDebugLogging(true).then(res => {
      this.logger.log(`set analytics logging to ${res}`);
    });
  }

  public async trackStateAction(payload: object) {
    payload['appname'] = analyticsValues.APP_NAME;
    payload['country'] = analyticsValues.COUNTRY;
    payload['language'] = analyticsValues.LANGUAGE;
    payload['pagename'] = this.prepareStatePageName(payload);
    payload['platform'] = this.platform.platforms().join(',');

    const result = this.prepareTrackFormat(payload,
      analyticsValues.TRACK_CONTENT_PREFIX
      );
    const name = result[Object.keys(result).find(
      k => k.indexOf('pagename') >= 0
      )];

    this.logger.log('==========trackStateAction=================');
    this.logger.log('tracking.state:');
    this.logger.log(name);
    this.logger.log('tracking.result:');
    this.logger.log(result);
    this.logger.log('=========================================');

    if (!this.platform.is('cordova')) {
      return Promise.resolve();
    }

    return this.analyticsWrapper.trackState(name, result).catch(
      error => this.logger.error(error)
      );

  }

   // Reports non-state actions to analytics
   public trackAction(payload: object) {
    if (!this.platform.is('cordova')) {
      return Promise.resolve();
    }

    payload['linktype'] = payload['linktype'] === undefined ? 'internal'
    : payload['linktype'];
    const result = this.prepareTrackFormat(
      payload, analyticsValues.TRACK_CONTENT_PREFIX);
    const name = result[Object.keys(result)
      .find(k => k.indexOf('linkname') >= 0)];

    return this.analyticsWrapper.trackAction(name, result);
  }

  // Format analytics event
  private prepareTrackFormat(values: object = {}, prefix): object {
    return Object.keys(values).reduce((acc, key) => {
      acc[`${prefix}${key}`] = values[key];

      return acc;
    }, {});
  }

  // Format page view events
  private prepareStatePageName(payload): string {
    let pageName = `${analyticsValues.APP_NAME}  > `;
    if (payload['sitesection']) {
      pageName += `${payload['sitesection']}  > `;
    }
    if (payload['subsection']) {
      pageName += `${payload['subsection']}  > `;
    }
    if (payload['subsectionlevel2']) {
      pageName += `${payload['subsectionlevel2']}  > `;
    }
    if (payload['subsectionlevel3']) {
      pageName += `${payload['subsectionlevel3']}  > `;
    }
    pageName += payload['pagename'];

    return pageName;
  }

}
