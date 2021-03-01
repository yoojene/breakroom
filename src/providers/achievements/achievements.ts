import { Injectable } from '@angular/core';
import { pharmaProvider } from '@pharma/pharma-js-bindings-ng';
import { EventService, IEvent, pharmaResult, IpharmaRequest, pharmaRequestMethod } from '@pharma/pharma-js-sdk';
import { BreakroomConfig } from '../../app/app.config';
import { UserStore } from '../../stores/user.store';
import {
  Achievement,
  AchievementEventMap,
  pharmaAchievementEvent} from '../../models/achievement.model';
import { Logger } from '@pharma/pharma-component-utils';
import * as moment from 'moment';
import { AuthProvider } from '../auth/auth';
import { CommunityProvider } from '../community/community';
import * as mobx from 'mobx';
import { pharmaPerson } from '../../models/user.model';

@Injectable()
export class AchievementsProvider {
  private moneyAchievements: any;
  private communityAchievements: any;

  constructor(
    public pharmaProvider: pharmaProvider,
    public auth: AuthProvider,
    public config: BreakroomConfig,
    public userStore: UserStore,
    private community: CommunityProvider,
    private logger: Logger
  ) {}
  /**
   *
   * Add an Achievement Event to pharma
   */
  public async addAchievementEvent(achievement: Achievement): Promise<any> {
    const event = this.pharmaProvider.pharmaService.service(
      'event'
    ) as EventService;

    const achievementEvent: IEvent = {
      eventType: this.config.achievementEventType,
      attributes: {
        achievementTitle: achievement.title,
        achievementBodyText: achievement.body,
        avatarUrl: this.userStore.user.avatarUrl,
        username: this.userStore.user.username,
      },
      isActive: true,
      janrainId: this.userStore.user.id,
    };

    try {
      const res: any = await event.update(
        achievementEvent,
        this.userStore.user.id
      );

      const [eventRes]: pharmaAchievementEvent[] = res.results;

      return eventRes;
    } catch (err) {
      this.logger.error(err);
    }
  }

  /**
   * Share achievement to Breakroom community (pharma instance).
   * To be displayed on Newsfeed
   */
  public async shareAchievement(achievement: Achievement): Promise<any> {
    const params = {
      attributes: {
        recipientList: [
          {
            recipientId: this.pharmaProvider.pharmaConfig.instanceId,
            recipientType: 'instance',
          },
        ],
        avatarUrl: this.userStore.user.avatarUrl,
        username: this.userStore.user.username,
      },
    };

    const request: IpharmaRequest = {
     method: pharmaRequestMethod.PATCH,
     endpoint:  `persons/${this.userStore.user.id}/events/${achievement.eventId}`,
     params,
     headers: null,
     exemptRefresh: false
    };

    return this.pharmaProvider.pharmaService.callApi(
     request
    );
  }

    /**
   * Share achievement to Breakroom community (pharma instance).
   * To be displayed on Newsfeed
   */
  public async updateSharedAchievement(attributes): Promise<any> {
    this.getSharedAchievements().then((ach: any) => {
      const results = ach.results;

      for(const achievement of results){
        achievement.eventId = achievement.id;
        this.shareAchievement(achievement)
          .then(_ => this.logger.log('done'))
          .catch(_ => false);
      }
    });
  }

  /**
   *
   * Get shared Achievements (Newsfeed default query)
   */
  public async getSharedAchievements(params = {}): Promise<any>{

    const request: IpharmaRequest = {
      method: pharmaRequestMethod.GET,
      endpoint: `persons/${this.userStore.user.id}/events/as/recipient`,
      params,
      headers: null,
      exemptRefresh: false,
    };

    return this.pharmaProvider.pharmaService.callApi(request);
  }

/**
 * Calculate latest achievements
 *
 */
  public async checkLatestAchievements(currentDate) {

    this.logger.log('checkLatestAchievements - Ach provider');

    const commAchievements = await this.
      checkCommunityAchievements();

    if (commAchievements.length > 0) {
      await this.addLikeHighFiveMadeReceived(commAchievements);
    }

    let combinedAchievements: Achievement[];
    if (
      moment(currentDate).isAfter(moment(this.userStore.user.quitDate))
    ) {
      const moneyAchievements = await this.checkMoneyAchievements();
      const timeAchievements = await this.checkTimeBasedAchievements(
          currentDate
        );

      combinedAchievements = commAchievements
        .concat(moneyAchievements)
        .concat(timeAchievements);
    } else {
      combinedAchievements = commAchievements;
    }

    await this.sortAchievementsAndUpdate(combinedAchievements);

    this.logger.log('Achievements check done!');

  }

/**
 *
 * Get my unlocked achievements (in app Notification page query)
 * Last 7 required
 */
public async getMyUnlockedAchievements(): Promise<pharmaResult>{

  const params = {
     eventType: this.config.achievementEventType,
     limit: 7
    };

  const request: IpharmaRequest = {
    method: pharmaRequestMethod.GET,
    endpoint: `person/${this.userStore.user.id}/events`,
    params,
    headers: null,
    exemptRefresh: false,
  };

  const acheiveRes: any = await this.pharmaProvider.pharmaService.callApi(
    request
  );

  return acheiveRes.results;
  }

  public async getAchievement(eventId: any, personId: any): Promise<any> {
    const event = this.pharmaProvider.pharmaService.service(
      'event'
    ) as EventService;

    try {
      const eventRes: any = await event.getOne(eventId, personId);

      const [results] = eventRes.results;

      return results;
    } catch (err) {
      this.logger.error(err);

      return Promise.reject(err);
    }
  }

  /**
   * Query reaction events for the logged in user
   */
  public async checkCommunityAchievements(): Promise<Achievement[]>{
    const reactions = await this.community.checkCommunityEvents();

    const communityAchievements = [...mobx.toJS(
      this.config.communityAchievements)
    ];

    const unlockedAchievements = [
      ...mobx.toJS(this.userStore.user.unlockedCommunityAchievements)
    ];

    const remainingAchievements = this.getAllRemainingUnlocked(
      communityAchievements,
      unlockedAchievements
    ).filter(ach => {
      return ach.value <= reactions;
    });

    // Create an AchievementMap object for each achievement
    // setting the unlockedDate
    // filter out those with the same date as now as due
    const dueAchievements = remainingAchievements.map(
      (ach): AchievementEventMap => {
        return {
          unlockedDate: moment().format('YYYY-MM-DD'),
          name: ach.name,
          celebrated: false,
          deepLinkId: ach.deepLinkId,
        };
      });

    this.communityAchievements = this.getDueAchievementDetail(
      remainingAchievements,
      dueAchievements
    );

    return Promise.resolve(this.communityAchievements);

  }

  /**
   * This function only returns a list of Next z. These are not unlocked.
   */
public async getNextGoalsProgress(currentDate): Promise<Achievement[]> {

  const timedAchievements = [
    ...this.config.myProgressAchievements  ];

  const unlockedAchievements = [
    ...mobx.toJS(this.userStore.user.unlockedProgressAchievements)  ];

  const quitMethod = this.userStore.user.quitMethod;

  const remainingAchievements = this.getAllRemainingUnlocked(
     timedAchievements,
     unlockedAchievements);

  // Create an AchievementMap object for each achievement
  // setting the unlockedDate
  // filter out those with the same date as now as due
  const dueAchievements = remainingAchievements.map(
    (ach): AchievementEventMap => {

      if (quitMethod === 'Reduced_Quit' && ach.rtqCalcDays) {
        return {
          unlockedDate: moment(this.userStore.user.quitDate)
            .add(ach.rtqCalcDays, 'days')
            .format('YYYY-MM-DD'),
          name: ach.name,
          celebrated: false,
          deepLinkId: ach.deepLinkId,
        };
      }

      if (ach.calcDays) {
        return {
          unlockedDate: moment(this.userStore.user.quitDate)
            .add(ach.calcDays, 'days')
            .format('YYYY-MM-DD'),
             name: ach.name,
             celebrated: false,
             deepLinkId: ach.deepLinkId,
            } ;
      }
    }
  ).filter(d => {
    if (d && moment(currentDate).isBefore(d.unlockedDate)) {
        return d;
      }
    });

    const dueAchievementDetail = this.getDueAchievementDetail(
      remainingAchievements,
      dueAchievements);

    return dueAchievementDetail;

    }

  /**
   * This function only returns a list of Next z. These are not unlocked.
   */
  public async getNextGoalsHealth(currentDate): Promise<Achievement[]> {

    const healthAchievements = [
      ...this.config.myHeathAchievements  ];

    const unlockedAchievements = [
      ...mobx.toJS(this.userStore.user.unlockedHealthAchievements)  ];
    const quitMethod = this.userStore.user.quitMethod;

    const remainingAchievements = this.getAllRemainingUnlocked(
       healthAchievements,
       unlockedAchievements);

    // Create an AchievementMap object for each achievement
    // setting the unlockedDate
    // filter out those with the same date as now as due
    const dueAchievements = remainingAchievements.map(
      (ach): AchievementEventMap => {

        if (quitMethod === 'Reduced_Quit' && ach.rtqCalcDays) {
          return {
            unlockedDate: moment(this.userStore.user.quitDate)
              .add(ach.rtqCalcDays, 'days')
              .format('YYYY-MM-DD'),
            name: ach.name,
            celebrated: false,
            deepLinkId: ach.deepLinkId,
          };
        }
        if (ach.calcDays) {
          return {
            unlockedDate: moment(this.userStore.user.quitDate)
              .add(ach.calcDays, 'days')
              .format('YYYY-MM-DD'),
               name: ach.name,
               celebrated: false,
               deepLinkId: ach.deepLinkId,
              } ;
        }
      }
    ).filter(d => {
      if (d && moment(currentDate).isBefore(d.unlockedDate)) {
          return d;
        }
      });

    const dueAchievementDetail = this.getDueAchievementDetail(
      remainingAchievements,
      dueAchievements);

    return dueAchievementDetail;
  }

  /**
   * This function only returns a list of Next Goals. These are not unlocked.
   */
  public async getNextGoalsMoney(): Promise<Achievement[]> {

    const moneySaved = this.userStore.user.moneySaved;
    const unlockedAchievements = [
      ...mobx.toJS(this.userStore.user.unlockedMoneyAchievements)
    ];

    let moneyAchievements = this.config.myMoneyAchievements;

    const remainingAchievements = this.getAllRemainingUnlocked(
      moneyAchievements,
      unlockedAchievements).filter(ach => {
        return ach.value > moneySaved;
      });

    // After creating a new account first time, remainingAchievments returns []
    // and results in blank icon, return the config value in this case
    if (remainingAchievements.length > 0) {
      return remainingAchievements;
    } else {
      moneyAchievements = moneyAchievements.filter(moneyAch =>{
        moneyAch.value > moneySaved;
      });

      return moneyAchievements;
    }
}

/**
 *
 * Checks which achievements are still to be unlocked
 */
public getAllRemainingUnlocked(
    allAchieves: Achievement[],
    unlockedAchieves: Achievement[]): Achievement[] {

    let remainingAchievements = unlockedAchieves.map((unlock): any => {
        return allAchieves.filter((timed): any => {
            return unlock.name !== timed.name;
          });
      });

    [remainingAchievements] = remainingAchievements;

    if (!remainingAchievements) {
      return allAchieves;
    }

    return remainingAchievements;

  }

  // Private
  /**
 * Sorts Achievements by unlocked date and order
 * Adds latestUnlockedAchievement
 * Updates User Store and pharma
 */
  private async sortAchievementsAndUpdate(achievements: Achievement[]) {
    let achsToSort = achievements;
    achsToSort = this.getOnlyUnsavedAchievements(achievements);
    achsToSort.sort((a, b) => {
      return a.order - b.order ||
       moment(a.unlockedDate).valueOf() - moment(b.unlockedDate).valueOf();
    });

    const achievementEvent = await this.addAchievementsTopharmaAndStore(
      achsToSort);

    const indexOfLastAddedAchievement = achievementEvent.length-1;
    const latestUnlockedAchievement =
    achievementEvent[indexOfLastAddedAchievement];

    this.userStore.updateLatestUnlockedAchievement(latestUnlockedAchievement);

    // Update pharma
    const person: pharmaPerson = {
      id: this.userStore.user.id,
      firstName: this.userStore.user.firstName,
      lastName: this.userStore.user.lastName,
    };

    const personUpdates = {
      progressAchievements: this.userStore.user.progressAchievements,
      healthAchievements: this.userStore.user.healthAchievements,
      moneyAchievements: this.userStore.user.moneyAchievements,
      communityAchievements: this.userStore.user.communityAchievements,
      unlockedProgressAchievements: this.userStore.user.
      unlockedProgressAchievements,
      unlockedHealthAchievements: this.userStore.user.
      unlockedHealthAchievements,
      unlockedMoneyAchievements: this.userStore.user.unlockedMoneyAchievements,
      unlockedCommunityAchievements: this.userStore.user.
      unlockedCommunityAchievements,
      // tslint:disable-next-line:object-literal-shorthand
      latestUnlockedAchievement: latestUnlockedAchievement,
    };

    await this.auth.updatepharmaPerson(person, personUpdates);

  }

  public getOnlyUnsavedAchievements(achievements): Achievement[] {
    // check the user store for all achievements that have not been saved
    const savedAchievements = [
      ...this.userStore.user.unlockedCommunityAchievements,
    ...this.userStore.user.unlockedHealthAchievements,
    ...this.userStore.user.unlockedMoneyAchievements,
    ...this.userStore.user.unlockedProgressAchievements];

    const unsavedAchievements = [];
    let i = 0;
    for (i = 0; i < achievements.length; i++) {
      let j = 0;
      let isMatchExistingAchievement = false;

      for (j = 0; j < savedAchievements.length; j++) {
        if (achievements[i].name === savedAchievements[j].name) {
          isMatchExistingAchievement = true;
          break;
        }
      }
      if (isMatchExistingAchievement === false) {
        unsavedAchievements.push(achievements[i]);
      }
    }

    return unsavedAchievements;
  }

  private async checkTimeBasedAchievements(currentDate):
  Promise < Achievement[] > {

    const timedAchievements = [
      ...this.config.myProgressAchievements,
      ...this.config.myHeathAchievements,
    ];

    const unlockedAchievements = [
      ...mobx.toJS(this.userStore.user.unlockedProgressAchievements),
      ...mobx.toJS(this.userStore.user.unlockedHealthAchievements)
    ];

    const quitMethod = this.userStore.user.quitMethod;

    const remainingAchievements = this.getAllRemainingUnlocked(
      timedAchievements,
      unlockedAchievements);

    // Create an AchievementMap object for each achievement
    // setting the unlockedDate
    // filter out those with the same date as now as due

    const dueAchievements = remainingAchievements.map(
      (ach): AchievementEventMap => {

        if (quitMethod === 'Reduced_Quit' && ach.rtqCalcDays) {
          return {
            unlockedDate: moment(this.userStore.user.quitDate)
              .add(ach.rtqCalcDays, 'days')
              .format('YYYY-MM-DD'),
            name: ach.name,
            celebrated: false,
            deepLinkId: ach.deepLinkId,
          };
        }

        if (ach.calcDays) {
          return {
            unlockedDate: moment(this.userStore.user.quitDate)
              .add(ach.calcDays, 'days')
              .format('YYYY-MM-DD'),
            name: ach.name,
            celebrated: false,
            deepLinkId: ach.deepLinkId,
          };
        }
      }
    ).filter(d => {
      if (d && moment(currentDate).isSameOrAfter(d.unlockedDate)) {
        return d;
      }
    });

    const dueAchievementDetail = this.getDueAchievementDetail(
      remainingAchievements,
      dueAchievements);

    return Promise.resolve(dueAchievementDetail);

  }

  /**
   * See what Money Achievements have been unlocked.
   * Moneyy Achieve ments are all post Quit Date
   */
  private async checkMoneyAchievements(): Promise<Achievement[]> {

      const moneySaved = this.userStore.user.moneySaved;
      const unlockedAchievements = [
         ...mobx.toJS(this.userStore.user.unlockedMoneyAchievements)
      ];

      const moneyAchievements = [...mobx.toJS(this.config.myMoneyAchievements)];

      const remainingAchievements = this.getAllRemainingUnlocked(
        moneyAchievements,
          unlockedAchievements).filter(ach => {
            return ach.value <= moneySaved;
          });

    // Create an AchievementMap object for each achievement
    // setting the unlockedDate
    // filter out those with the same date as now as due
      const dueAchievements = remainingAchievements.map(
        (ach): AchievementEventMap => {
        return {
        unlockedDate: moment().format('YYYY-MM-DD'),
        name: ach.name,
          celebrated: false,
            deepLinkId: ach.deepLinkId,
          };
        });

      this.moneyAchievements = this.getDueAchievementDetail(
        remainingAchievements,
        dueAchievements
        );

      return Promise.resolve(this.moneyAchievements);

  }
/**
 *
 * Sets unlockedDate and flag on all unlocked Achievements.
 * DO NOT EVER ADD MOBX CODE TO SAVE AN ACH. DIRECETLY IN THIS FUNCTION! :)
 */
private getDueAchievementDetail(remainingAchievements, dueAchievements) {
    const achievementDetails = remainingAchievements
      .map(ach => {
        const checkAchName = achObj => achObj.name === ach.name;
        const res = dueAchievements.some(checkAchName);
        // .some() returns a boolean
        let returnAch = ach;
        if (res) {

          dueAchievements.map(due => {
            if(due.name === ach.name){
              return (returnAch = {
                ...ach,
                unlocked: true,
                unlockedDate: due.unlockedDate,
              });
            }
          });
        }

        return returnAch;
      })
      .filter(filach => {
        return filach.unlocked === true;
      });

      return achievementDetails;

  }

/**
 *
 * Adds Achievement Event to pharma and UserStore for each type
 */
private async addAchievementsTopharmaAndStore(
  combinedAchievements: Achievement[]
  ): Promise<Achievement[]>{

    const res =  await combinedAchievements.map(async lastAch => {
      const achRes = await this.addAchievementEvent(lastAch);
      lastAch.eventId = achRes.id;
      switch (lastAch.type) {
        case 'progress':
          this.userStore.addProgressAchievement({
            name: lastAch.name,
            janrainId: lastAch.janrainId,
            eventId: lastAch.eventId,
            deepLinkId: lastAch.deepLinkId,
            celebrated: lastAch.celebrated,
            unlockedDate: lastAch.unlockedDate,
          });

          return lastAch;
        case 'health':
          this.userStore.addHealthAchievement({
            name: lastAch.name,
            janrainId: lastAch.janrainId,
            eventId: lastAch.eventId,
            deepLinkId: lastAch.deepLinkId,
            celebrated: lastAch.celebrated,
            unlockedDate: lastAch.unlockedDate,
          });

          return lastAch;
        case 'money':
          this.userStore.addMoneyAchievement({
            name: lastAch.name,
            janrainId: lastAch.janrainId,
            eventId: lastAch.eventId,
            deepLinkId: lastAch.deepLinkId,
            celebrated: lastAch.celebrated,
            unlockedDate: lastAch.unlockedDate,
          });

          return lastAch;
        case 'community':
          this.userStore.addCommunityAchievement({
            name: lastAch.name,
            janrainId: lastAch.janrainId,
            eventId: lastAch.eventId,
            deepLinkId: lastAch.deepLinkId,
            celebrated: lastAch.celebrated,
            unlockedDate: lastAch.unlockedDate,
          });

          return lastAch;
        default:
          this.logger.log('default');
      }
    });

    return Promise.all(res);
  }

/**
 *
 * Adds count of likes / high fives to likesHighFiveReceived
 * and likesHighFivesMade when the relavent achievement is unlocked
 * For PN generation
 */
private async addLikeHighFiveMadeReceived(commAchieves: Achievement[]) {

    const firstLikeCelebrations = commAchieves
    .filter(ach => ach.name === 'firstLike');

    const twentyCelebratations = commAchieves
    .filter(ach => ach.name === '20celebrations');

    const fiftyCelebratations = commAchieves
    .filter(ach => ach.name === '50celebrations');

    if (firstLikeCelebrations.length > 0 ) {

        const updates = {
          likesHighFivesReceieved: '1',
        };

      await this.updatepharma(updates);

      await this.userStore.updateUser(updates);

    }
    if (twentyCelebratations.length > 0 ) {

        const updates = { likesHighFivesMade: '20' };

        await this.updatepharma(updates);

        await this.userStore.updateUser(updates);
    }
    if (fiftyCelebratations.length > 0 ) {
      const updates = { likesHighFivesMade: '50' };

      await this.updatepharma(updates);

      await this.userStore.updateUser(updates);
    }
  }

  /**
 * Update pharma Person profile
 */
  private async updatepharma(updates: any) {
    const person: pharmaPerson = {
      id: this.userStore.user.id,
      firstName: this.userStore.user.firstName,
      lastName: this.userStore.user.lastName,
    };

    await this.auth.updatepharmaPerson(person, updates);
  }
}
