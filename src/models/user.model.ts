import { observable } from 'mobx';
import { Achievement } from './achievement.model';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  avatarUrl: string;
  email: string;
  username: string;
  postCode: string;

  quitMethod: string;
  quitDate: string;
  startDate: string;

  remembered: boolean;

  // personalise 1
  numberCigarettesSmoked: number;
  pricePerPacket: number;
  cigarettesInPacket: number;
  // personalise 2
  reasonQuitting: string;
  // personalise 3
  numberYearsSmoked: number;
  numberAttemptedQuits: number;
  // personalise 4
  isTakenChampixBefore: boolean;
  previousQuitMethod: string;

  dosageNotification: boolean;
  achievementNotification: boolean;
  socialNotification: string;

  profileComplete: boolean;
  onboardingComplete: boolean;
  authenticated: boolean;
  locale: string;

  enableNotification: boolean;

  // For Email calculations

  likesHighFivesReceived: number;
  likesHighFivesMade: number;
  currentHealthAchievement: string;

  moneySaved: number;
  projectedLifetimeSaving: number;
  smokeFreeDays: number;
  cigarettesNotSmoked: number;
  timeNotSmoking: number;
  unlockedProgressAchievements: any[];
  unlockedMoneyAchievements: any[];
  unlockedHealthAchievements: any[];
  unlockedCommunityAchievements: any[];
  progressAchievements: string;
  moneyAchievements: string;
  healthAchievements: string;
  communityAchievements: string;

  halfNumberCigarettesSmoked: number;
  quarterNumberCigarettesSmoked: number;
  flexDaysUntilQuitDate: number;
}

export interface pharmaPerson {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

// User class - not in use yet
export class User {
  public id: string;
  @observable public firstName: string;
  @observable public lastName: string;
  @observable public dateOfBirth: string;
  @observable public gender: string;
  @observable public avatarUrl: string;
  @observable public email: string;
  @observable public username: string;
  @observable public postCode: string;

  @observable public quitMethod: string;
  @observable public quitDate: string;
  @observable public startDate: string;
  @observable public remembered: boolean;

  // personalise
  @observable public numberCigarettesSmoked: number;
  @observable public pricePerPacket: number;
  @observable public cigarettesInPacket: number;
  @observable public reasonQuitting: string;
  @observable public numberYearsSmoked: number;
  @observable public numberAttemptedQuits: number;
  @observable public isTakenChampixBefore: boolean;
  @observable public previousQuitMethod: string;

  @observable public dosageNotification: boolean;
  @observable public achievementNotification: boolean;
  @observable public socialNotification: string;

  @observable public profileComplete: boolean;
  @observable public onboardingComplete: boolean;
  @observable public authenticated: boolean;
  @observable public locale: string;

  // Email calculations & Dashboard

  @observable public likesHighFivesReceived: number;
  @observable public likesHighFivesMade: number;
  @observable public currentHealthAchievement: string;
  @observable public moneySaved: number;
  @observable public projectedLifetimeSaving: number;
  @observable public smokeFreeDays: number;
  @observable public cigarettesNotSmoked: number;
  @observable public timeNotSmoking: number;
  @observable public unlockedProgressAchievements: any[];
  @observable public unlockedMoneyAchievements: any[];
  @observable public unlockedHealthAchievements: any[];
  @observable public unlockedCommunityAchievements: any[];
  // Marketo
  @observable public progressAchievements: string;
  @observable public moneyAchievements: string;
  @observable public healthAchievements: string;
  @observable public communityAchievements: string;

  @observable public halfNumberCigarettesSmoked: number;
  @observable public quarterNumberCigarettesSmoked: number;
  @observable public flexDaysUntilQuitDate: number;

  @observable public latestUnlockedAchievement: Achievement;
}
