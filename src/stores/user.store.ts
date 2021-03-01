import { Injectable } from '@angular/core';
import * as mobx from 'mobx';
import { observable, action } from 'mobx-angular';
import { User, } from '../models/user.model';
import { Storage } from '@ionic/storage';
import { UserProvider } from '../providers/user/user';
import { Achievement, AchievementEventMap } from '../models/achievement.model';
import { Logger } from '@pharma/pharma-component-utils';

@Injectable()
export class UserStore {
  // @observable public users: User[] = [] as any;
  @observable
  // public user: User = {} as any; // Interface
  public user = new User(); // Class

  private STORAGE_KEY = 'USER';

  constructor(
    private ionicStorage: Storage,
    private userProvider: UserProvider,
    private logger: Logger
  ) {}

  public async setUpStore() {
    return this.getData().then(() => {
      this.createNewUser();

      mobx.autorun(() => this.saveData(), { delay: 500 });

      // this.refreshStore();
    });
  }

  @action
  public createNewUser(user?) {
    this.logger.log('creating new user');
    this.logger.log(user);
    this.logger.log(this.user);

    this.user = {
      ...this.user,
      ...user,
      // id: null,
      // firstName: null,
      // lastName: null,
      // dateOfBirth: null,
      // gender: null,
      // avatarUrl: null,
      // email: null,
      // username: null,
      // postCode: null,
      // quitMethod: null,
      // quitDate: null,
      // champixStartDate: null,
      // dosageNotification: false,
      // achievementNotification: false,
      // socialNotification: null,
      // authenticated: false,
    };
    this.logger.log(this.user);
    // }
  }

  // Save users object to database
  private saveData() {
    this.logger.log('Saving user to database...');
    this.ionicStorage.set(this.STORAGE_KEY, this.user).catch(() => {
      this.logger.log('Something went wrong, reloading data...');
      this.getData();
    });
  }

  // Get users object from database
  @action
  private async getData() {
    return this.ionicStorage.get(this.STORAGE_KEY).then(
      action(data => {
        this.user = data;
      })
    );
  }

  @action
  public updateLatestUnlockedAchievement(achievement: Achievement) {
    this.user.latestUnlockedAchievement = {
      ...this.user.latestUnlockedAchievement,
      ...achievement,
    };

    // this.saveData();
  }

  @action
  public updateLatestUnlockedAchievementCelebrated(cel: boolean) {
    this.user.latestUnlockedAchievement.celebrated = cel;
    // this.saveData();
  }

  @action
  public updateAvatar(avatar: string) {
    this.user.avatarUrl = avatar;
    // this.saveData();
  }

  @action
  public updateEnableNotification(enableNotification: boolean) {
    this.user.enableNotification = enableNotification;
    // this.saveData();
  }

  @action
  public addProgressAchievement(achievement: AchievementEventMap) {
    this.user.unlockedProgressAchievements = [
      ...this.user.unlockedProgressAchievements,
      achievement,
    ];
    if (this.user.progressAchievements) {
      const arr = this.user.progressAchievements.split(',');
      arr.push(achievement.name);
      this.user.progressAchievements = arr.join(',');
    } else {
      this.user.progressAchievements = achievement.name;
    }
  }

  @action
  public addHealthAchievement(achievement: AchievementEventMap) {
    this.user.unlockedHealthAchievements = [
      ...this.user.unlockedHealthAchievements,
      achievement,
    ];
    if (this.user.healthAchievements) {
      const arr = this.user.healthAchievements.split(',');
      arr.push(achievement.name);
      this.user.healthAchievements = arr.join(',');
    } else {
      this.user.healthAchievements = achievement.name;
    }
}

  @action
  public addMoneyAchievement(achievement: AchievementEventMap) {
    this.user.unlockedMoneyAchievements = [
      ...this.user.unlockedMoneyAchievements, achievement
    ];
    if (this.user.moneyAchievements) {
      const arr = this.user.moneyAchievements.split(',');
      arr.push(achievement.name);
      this.user.moneyAchievements = arr.join(',');
    } else {
      this.user.moneyAchievements = achievement.name;
    }
  }

  @action
  public addCommunityAchievement(achievement: AchievementEventMap) {
    this.user.unlockedCommunityAchievements = [
      ...this.user.unlockedCommunityAchievements,
      achievement,
    ];
    if (this.user.communityAchievements) {
      const arr = this.user.communityAchievements.split(',');
      arr.push(achievement.name);
      this.user.communityAchievements = arr.join(',');
    } else {
      this.user.communityAchievements = achievement.name;
    }
  }

  @action
  public updateCelebratedAchievement(
    achievement: AchievementEventMap,
    type: string
  ) {
    let match;
    let spread;
    switch (type) {
      case 'progress':
        match = mobx
          .toJS(this.user.unlockedProgressAchievements)
          .find(ach => ach.eventId === achievement.eventId);

        spread = { ...match, ...achievement };

        this.user.unlockedProgressAchievements = [
           ...spread,
          ...this.user.unlockedProgressAchievements
          ,
        ];
        break;
      case 'health':
        match = mobx.toJS(this.user.unlockedHealthAchievements).
        filter(ach => ach.eventId === achievement.eventId);

        spread = { ...match, ...achievement};

        this.user.unlockedHealthAchievements = [
          ...spread,
          ...this.user.unlockedHealthAchievements
        ];

        break;
      case 'money':
        match = mobx
          .toJS(this.user.unlockedMoneyAchievements)
          .find(ach => ach.eventId === achievement.eventId);

        spread = { ...match, ...achievement };

        this.user.unlockedMoneyAchievements = [
          ...spread,
          ...this.user.unlockedMoneyAchievements
        ];
        break;
      case 'community':

        match = mobx
          .toJS(this.user.unlockedCommunityAchievements)
          .find(ach => ach.eventId === achievement.eventId);

        spread = { ...match, ...achievement };

        this.user.unlockedCommunityAchievements = [
          ...spread,
          ...this.user.unlockedCommunityAchievements
        ];
        break;
      default:
    }
  }

  // @computed
  public filterProgressAchievementsByEvent(eventId: any) {
    let progressAchievementsMap;
    if (Array.isArray(this.user.unlockedProgressAchievements)) {
      [progressAchievementsMap] = this.user.unlockedProgressAchievements.filter(
        ach => {
          return ach.eventId === eventId;
        }
      );
    } else {
      progressAchievementsMap = this.user.unlockedProgressAchievements;
    }

    return progressAchievementsMap;

  }
  // @computed
  public filterHeathAchievementsByEvent(eventId: any) {
    let healthAchievementsMap;
    if (Array.isArray(this.user.unlockedHealthAchievements)) {
      [healthAchievementsMap] = this.user.unlockedHealthAchievements.filter(
        ach => {
          return ach.eventId === eventId;
        }
      );
    } else {
      healthAchievementsMap = this.user.unlockedHealthAchievements;
    }

    // this.saveData();

    return healthAchievementsMap;
  }
  // @computed
  public filterMoneyAchievementsByEvent(eventId: any) {
    let moneyAchievementsMap;
    if (Array.isArray(this.user.unlockedMoneyAchievements)) {
      [moneyAchievementsMap] = this.user.unlockedMoneyAchievements.filter(
        ach => {
        return ach.eventId === eventId;
      });
      } else {
      moneyAchievementsMap = this.user.unlockedMoneyAchievements;
      }

    // this.saveData();

    return moneyAchievementsMap;
  }
  // @computed
  public filterCommunityAchievementsByEvent(eventId: any) {
    let communityAchievementsMap;
    if (Array.isArray(this.user.unlockedCommunityAchievements)) {
      [communityAchievementsMap] = this.user.unlockedCommunityAchievements
      .filter(
        ach => {
          return ach.eventId === eventId;
        }
      );
    } else {
      communityAchievementsMap = this.user.unlockedCommunityAchievements;
    }

    // this.saveData();

    return communityAchievementsMap;
  }

  @action
  public async refreshStore(jannrainId) {
    this.logger.log('refreshStore');
    this.logger.log(this.user); // Always null at this point?

    // I'm sort of creating a new user here, called from login
    const res = await this.userProvider.getProfile(jannrainId);
    const [results] = res.results;

    this.logger.log(results);
    let person = {
      id: results.id,
      firstName: results.firstName,
      lastName: results.lastName,
      email: results.email,
      authenticated: true,
    };
    person = { ...person, ...results.attributes };
    this.updateUser(person);
  }

  @action
  public updateUser(userUpdates) {
    this.user = { ...this.user, ...userUpdates };

    // this.saveData();
  }

  public resetUser() {
    const resetUser = new User();
    resetUser.remembered = false;

    if (this.user.remembered === true) {
      resetUser.remembered = true;
      resetUser.email = this.user.email;
    }

    const latestUnlockedAchievement: Achievement= {
    eventId: '',
    janrainId:  '',
    name:  '',
    lottieConfig: {
      path:  '',
      autoplay: null,
      loop: null,
    },
    toObtainUrl:  '',
    reachedUrl:  '',
    title:  '',
    body:  '',
    type:  '',
    calcDays: null,
    rtqCalcDays: null,
    value: null,
    celebrated: null,
    numLikes: null,
    unlocked: null,
    unlockedDate:  '',
    deepLinkId:  '',
    order: null
  };
  resetUser.latestUnlockedAchievement = latestUnlockedAchievement;
  resetUser.authenticated = false;
  this.user = resetUser;
  }

}
