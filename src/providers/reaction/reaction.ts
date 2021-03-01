import { Injectable } from '@angular/core';
import { pharmaProvider } from '@pharma/pharma-js-bindings-ng';
import { BreakroomConfig } from '../../app/app.config';
import { UserStore } from '../../stores/user.store';
import { IpharmaRequest, pharmaRequestMethod } from '@pharma/pharma-js-sdk';
import { pharmaReactionEvent } from '../../models/local-notification.model';
import { Logger } from '@pharma/pharma-component-utils';

@Injectable()
export class ReactionProvider {
  constructor(public pharmaProvider: pharmaProvider,
              public userStore: UserStore,
              public config: BreakroomConfig,
              private logger: Logger) {
  }

  /**
   * Get achievement events that have been reacted to (liked) for the
   * logged in user
   */
  public async checkReactionEvents() {

    const param = {
      eventType: this.config.reactionEventType,
      isActive: true,
    };

     const request: IpharmaRequest = {
       method: pharmaRequestMethod.GET,
       endpoint: `person/${this.userStore.user.id}/events`,
       params: param,
       headers: null,
       exemptRefresh: false,
     };

     try {
        const reactRes: any = await this.pharmaProvider.pharmaService.callApi(
          request
        );

        const reactions: pharmaReactionEvent[] = reactRes.results;

         return reactions;
     } catch(err) {
        this.logger.error(err);

        return Promise.reject(err);
     }
  }
  /**
   * Get achievement events that have been high fived to for the
   * logged in user
   */
  public async checkHighFiveEvents() {

    const param = {
      eventType: this.config.highFiveEventType,
      isActive: true,
    };

    const request: IpharmaRequest = {
       method: pharmaRequestMethod.GET,
       endpoint: `person/${this.userStore.user.id}/events`,
       params: param,
       headers: null,
       exemptRefresh: false,
     };
     try {
       const reactRes: any = await this.pharmaProvider.pharmaService.callApi(
         request
       );

       const reactions: pharmaReactionEvent[] = reactRes.results;

       return reactions;
     } catch (err) {
       this.logger.error(err);

       return Promise.reject(err);
     }
  }
}
