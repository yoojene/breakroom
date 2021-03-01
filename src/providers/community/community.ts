import { Injectable } from '@angular/core';
import { pharmaProvider } from '@pharma/pharma-js-bindings-ng';
import { BreakroomConfig } from '../../app/app.config';
import { EventService, MetricsService, IEvent, IpharmaRequest, pharmaRequestMethod } from '@pharma/pharma-js-sdk';
import { UserStore } from '../../stores/user.store';
import { Logger } from '@pharma/pharma-component-utils';
import * as moment from 'moment';

@Injectable()
export class CommunityProvider {
  constructor(
    public pharmaProvider: pharmaProvider,
    public config: BreakroomConfig,
    public userStore: UserStore,
    public logger: Logger
  ) {}
  /**
   * eventId - eventId being Liked
   * eventPersonId - JanrainId belonging to the person whose event is being liked
   */
  public async addLikeEvent(
    eventId: string,
    eventPersonId: string
  ) {
    const event = this.pharmaProvider.pharmaService.service(
      'event'
    ) as EventService;

    const likeEvent: IEvent = {
      eventType: this.config.reactionEventType,
      attributes: {
        patientId: eventPersonId,
        eventId,
        recipientList: [
          {
            recipientId: eventPersonId,
            recipientType: 'person',
          },
        ],
      },
      isActive: true,
      personId: this.userStore.user.id,
    };

    try {
      const eventRes = await event.update(likeEvent, this.userStore.user.id);

      return eventRes;
    } catch (err) {
      this.logger.error(err);
    }
  }

  /**
   * Like a piece of content (asset)
   */
  public async addContentLike(assetId: any) {
    const event = this.pharmaProvider.pharmaService.service(
      'event'
    ) as EventService;

    const contentLikeEvent: IEvent = {
      eventType: this.config.reactionContentEventType,
      attributes: {
        resourceId: assetId,
      },
      isActive: true,
      personId: this.userStore.user.id,
    };

    try {
      const eventRes = await event.update(
        contentLikeEvent,
        this.userStore.user.id
      );

      return eventRes;
    } catch (err) {
      this.logger.error(err);
    }
  }

  /**
   * Add High Five event to pharma
   *
   * eventId - eventId being high fived
   * eventPersonId - JanrainId belonging to the person whose event is being high fived
   *
   */
  public async addHighFive(eventId: any, eventPersonId: any) {
    const event = this.pharmaProvider.pharmaService.service(
      'event'
    ) as EventService;

    const highFiveEvent: IEvent = {
      eventType: this.config.highFiveEventType,
      attributes: {
        eventId,
        eventOwner: eventPersonId,
        recipientList: [
          {
            recipientId: eventPersonId,
            recipientType: 'person',
          },
        ],
      },
      isActive: true,
      personId: this.userStore.user.id,
    };

    try {
      const eventRes = await event.update(highFiveEvent, this.userStore.user.id);

      return eventRes;
    } catch (err) {
      this.logger.error(err);
    }
  }
  /**
   * Get the count of event that have been reacted to (Liked) for the
   * logged in user
   */
  public async checkCommunityEvents() {
    const likeReactions = await this.checkCommunityLikeEvents();

    const hiFiveReactions = await this.checkCommunityHiFiveEvents();

    const reactions = likeReactions + hiFiveReactions;

    return reactions;
  }

  /**
   * Get the count of event that have been reacted to (Liked) for the
   * logged in user
   */
  public async checkCommunityLikeEvents(): Promise<number> {
    const param = {
      eventType: this.config.reactionEventType,
      limit: 500,
    };
    const request: IpharmaRequest = {
      method: pharmaRequestMethod.GET,
      endpoint: `person/${this.userStore.user.id}/events`,
      params: param,
      headers: null,
      exemptRefresh: false,
    };
    const reactions: any = await this.pharmaProvider.pharmaService.callApi(
      request
    );

    const likes: number = reactions.results.length;

    return likes;
  }
  /**
   * Get the count of event that have been reacted to (Liked) for the
   * logged in user
   */
  public async checkCommunityHiFiveEvents(): Promise<number> {
    const param = {
      eventType: this.config.highFiveEventType,
      limit: 500,
    };

    const request: IpharmaRequest = {
      method: pharmaRequestMethod.GET,
      endpoint: `person/${this.userStore.user.id}/events`,
      params: param,
      headers: null,
      exemptRefresh: false,
    };

    const reactions: any = await this.pharmaProvider.pharmaService.callApi(
      request
    );
    const highFives: number = reactions.results.length;

    return highFives;
  }
  /**
   *
   * Returns total user count in month from /metrics API
   */
  public async getCommunityMembersThisMonth() {
    const end = moment().toISOString();
    const start = moment(end)
      .startOf('month')
      .toISOString();

    const mService = this.pharmaProvider.pharmaService.service(
      'metrics'
    ) as MetricsService;

    const membersRes = await mService.get({
      instance: this.pharmaProvider.pharmaConfig.instanceId,
      fromCreateTime: start,
      toCreateTime: end,
    });

    const [members] = membersRes.results;

    return members;
  }
  /**
   *
   * Returns total user count from /metrics API
   */
  public async getCommunityMembers() {
    const mService = this.pharmaProvider.pharmaService.service(
      'metrics'
    ) as MetricsService;

    const membersRes = await mService.get({
      instance: this.pharmaProvider.pharmaConfig.instanceId,
    });

    const [members] = membersRes.results;

    return members;
  }
  /**
   *
   * Returns achievements event type count from /metrics API
   */
  public async getCommunityAchievements() {
    const end = moment().toISOString();
    const start = moment(end)
      .startOf('week')
      .toISOString();

    const mService = this.pharmaProvider.pharmaService.service(
      'metrics'
    ) as MetricsService;

    const membersRes = await mService.get({
      instance: this.pharmaProvider.pharmaConfig.instanceId,
      fromCreateTime: start,
      toCreateTime: end,
    });

    const [metrics] = membersRes.results;

    const commAchieves = metrics.instances[0].events.filter(events => {
      return events.eventTypeId === this.config.achievementEventType;
    });

    return commAchieves;
  }
}
