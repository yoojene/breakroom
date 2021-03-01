import { Injectable } from '@angular/core';
import { Logger } from '@pharma/pharma-component-utils';
import { TranslateService } from '@ngx-translate/core';
import { UserStore } from '../../stores/user.store';
import * as moment from 'moment';
import * as mobx from 'mobx';
import { DailyCaptureProvider } from '../daily-capture/daily-capture';
import { AchievementsProvider } from '../achievements/achievements';
import { BreakroomConfig } from '../../app/app.config';
import { CommunityProvider } from '../community/community';
import * as Constants from '../../constants/quit-method-constants';

@Injectable()
export class DashboardLogicProvider {
  public projectedLifetimeSavings: number;
  // public savingsCalculated = 0;
  public cigarettesNotSmoked: number;
  public timeSavedByNotSmoking: number;
  public daysSmokeFree: number;
  public isNextGoalsVisible = true;
  private readonly maxPercentage = 100;
  private readonly daysInYear = 365;

  constructor(
    public logger: Logger,
    private config: BreakroomConfig,
    private achieveProvider: AchievementsProvider,
    private community: CommunityProvider,
    public translate: TranslateService,
    public dailyCapture: DailyCaptureProvider,
    private userStore: UserStore
  ) { }

  /** This is the value entered during profile setup */
  public getCigarettesSmokedPerDay(): number {
    this.log(
      `getCigarettesSmokedPerDay - ${this.getValidNumber(
        this.userStore.user.numberCigarettesSmoked
      )}`
    );

    return this.getValidNumber(this.userStore.user.numberCigarettesSmoked);
  }

  public isPostQuit(): boolean {
    const quitDate = moment(this.userStore.user.quitDate);

    return moment().startOf('day').isAfter(quitDate);

  }
  public getCostPerCigarette(): number {
    const price = this.getValidNumber(this.userStore.user.pricePerPacket);
    const cigarettes = this.getValidNumber(
      this.userStore.user.cigarettesInPacket
    );

    this.log(`getCostPerCigarette. ${this.getValidNumber(price / cigarettes)}`);

    return this.getValidNumber(price / cigarettes);
  }

  public getUsualCostPerDay(): number {
    this.logger.log(
      `usualCostPerDay ${this.getCigarettesSmokedPerDay() *
        this.getCostPerCigarette()}`
    );

    return this.getCigarettesSmokedPerDay() * this.getCostPerCigarette();
  }

  public getCostPerYear(): number {
    this.log(
      `getCostPerYear ${this.getUsualCostPerDay() * this.config.daysPerYear}`);

    return this.getUsualCostPerDay() * this.config.daysPerYear;
  }

  /**
   * Pre Quit - 2A
   * Savings: Up to quit date
   *
   * Usual cost per day -
   * (Cost per cigarette x
   * D2 Step 1:cigarettes smoked per day captured from daily diary data)
   * repeated each day between start and quit date
   *
   */
  public getSavingsUpToQuitDate(): number {
    const usualCostPerDay = this.getUsualCostPerDay();
    const costPerCigarette = this.getCostPerCigarette();
    const startDate = moment(this.userStore.user.startDate);
    const quitDate= moment(this.userStore.user.quitDate);
    const days = quitDate.diff(startDate, 'days');
    let savings = 0;

    for (let i = 0; i < days; i++) {
      const day = moment
        .unix(moment().unix())
        .subtract(i, 'day')
        .format('YYYY-MM-DD');

      if (!moment(day).isBefore(startDate)) {
        const cigarettesSmokedOnGivenDayObject =
        this.dailyCapture.getCigarettesEnteredForDay(
          day,
          this.getCigarettesSmokedPerDay()
          );
        if (
          cigarettesSmokedOnGivenDayObject.validDate &&
           cigarettesSmokedOnGivenDayObject.dataEntered) {
          const cigarettesSmoked =
          cigarettesSmokedOnGivenDayObject.cigarettesSmoked;
          savings += usualCostPerDay - (costPerCigarette * cigarettesSmoked);
        }

      }
    }

    // Savings are zeroed if return a -ve number
    if (Math.sign(savings) === -1) {
      savings = 0;
    }

    this.logger.log(`savingsToQuitDate ${savings}`);

    return savings;

  }

  public getTotalSavings(): number {
    const quitDate = moment(this.userStore.user.quitDate);
    const daysSinceQuitDate = moment().diff(quitDate, 'days');
    let totalSavings;
    totalSavings = this.getSavingsUpToQuitDate() + (
      this.getUsualCostPerDay() * daysSinceQuitDate
      );

    this.logger.log(`getTotalSavings', ${totalSavings} `);

    return totalSavings;
  }

  public getRemainingLifeExpectancy(): number {

    const gender = this.userStore.user.gender;

    let averageLifespan: number;

    switch (gender) {
      case 'Male':
        averageLifespan = this.config.averageMaleLife * this.daysInYear;
      break;
      case 'Female':
        averageLifespan = this.config.averageFemaleLife * this.daysInYear;
      break;
      default:
        averageLifespan = this.config.averageOtherLife * this.daysInYear;
    }

    const birthday = moment(this.userStore.user.dateOfBirth);
    const age = moment().diff(birthday, 'days');
    // TODO: what happens if we are 90 years old??

    this.log(`getRemainingLifeExpectancy  ${age} ${averageLifespan - age}`);

    return averageLifespan - age;
  }

  public getProjectedLifetimeSavings(): string {
    let projectedSavings;
    projectedSavings =
      this.getRemainingLifeExpectancy() * this.getUsualCostPerDay() +
      this.getSavingsUpToQuitDate();
    projectedSavings = projectedSavings.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });

    this.log(`getProjectedLifetimeSavings ${projectedSavings}`);

    return projectedSavings;
  }

  // My Progress

  /**
   * Cigarettes Not Smoked
   */
  public getCigarettesNotSmoked(): number {
    const champixStart = moment(this.userStore.user.startDate);
    const days = moment().diff(champixStart, 'days') + 1;

    const totalCigarettesSmoked = this.getCigarettesSmokedPerDay() * days;
    const totalDaily = this.dailyCapture.getCigarettesSmoked();

    this.log(`getCigarettesNotSmoked ${days},
     ${totalCigarettesSmoked}, ${totalDaily},
      ${totalCigarettesSmoked - totalDaily}`);

    return totalCigarettesSmoked - totalDaily;
  }

  /**
   * Time saved not smoking
   */
  public getTimeSavedNotSmoking(): string {
    const cigsSmokedPerDay = this.getCigarettesSmokedPerDay();
    const days = this.getDaysSmokeFree();

    const minutesSaved = (
      cigsSmokedPerDay * this.config.averageTimeSmokeCigarette)  * days;

    const minutesPerHour = 60;
    let hoursSaved = minutesSaved/minutesPerHour;

    this.log(
      `getTimeSavedNotSmoking minutes ${hoursSaved},
      ${this.getCigarettesSmokedPerDay()},
      ${this.config.averageTimeSmokeCigarette}
      days}`
    );
    const twoDecimals = 2;
    // this convoluted stuff here handles floating point rounding errors

    let hoursSavedTotal;
    // tslint:disable-next-line:no-magic-numbers
    const multiplicator = Math.pow(10, 2);
    hoursSaved = parseFloat((hoursSaved * multiplicator).toFixed(twoDecimals));
    hoursSaved =(Math.round(hoursSaved) / multiplicator);
    hoursSavedTotal =  +(hoursSaved.toFixed(twoDecimals));

    return hoursSavedTotal;
  }

  // Day Indicator

  /**
   * Pre Quit
   */
  public getDaysUntilQuitDate(): number {
    const remainingDays = moment(this.userStore.user.quitDate).diff(
      moment().startOf('day'),
      'days'
    );

    return remainingDays;
  }
  /**
   *
   * Post Quit
   * Also used for My Progress section
   */
  public getDaysSmokeFree(): number {
    const smokeFreeDays = moment().startOf('day').diff(
      moment(this.userStore.user.quitDate),
      'days'
    );

    return smokeFreeDays;
  }
  /**
   * Pre and Post Quit
   * Day of Champix Journey
   */
  public getChampixJourneyDay(): number {
    let journeyDay = moment()
      .startOf('day')
      .diff(moment(this.userStore.user.startDate), 'days');

    // BRK-631 - If journeyDay is a negative, then reset it to 0 to show
    // CHAMPIX start date has not passed.
    journeyDay < 0 ? journeyDay = 0 : journeyDay += 1;// Day 0 is actually Day 1

    return journeyDay;
  }
  /**
   * Generate My Next Goals
   */
  public async calculateNextGoals(): Promise<any[]> {
    const currentDate = moment().startOf('day');
    const progress = await this.achieveProvider
    .getNextGoalsProgress(currentDate);
    let money = await this.achieveProvider.getNextGoalsMoney();

    const unlockedMoney = [
      ...mobx.toJS(this.userStore.user.unlockedMoneyAchievements),
    ];
    if(!money || money.length === 0){
      money = this.determineMoneyIfNotAchieved();
    }
    if(unlockedMoney.length === this.config.myMoneyAchievements.length ){
      // if we unlocked all (compared against the config of all available
      // achievements), don't return anything
      money = [];
    }

    const healthAchievements = [...this.config.myHeathAchievements];
    const unlockedHealth = [
      ...mobx.toJS(this.userStore.user.unlockedHealthAchievements),
    ];

    let health;

    if(unlockedHealth.length === this.config.myHeathAchievements.length ){
      // if we unlocked all (compared against the config of all available
      // achievements), don't return anything
      health = [];
    } else{
      health = this.achieveProvider.getAllRemainingUnlocked(
        healthAchievements,
        unlockedHealth
      );
    }

    if(progress.length === 0 && progress.length === 0 && money.length === 0){
      this.isNextGoalsVisible = false;
    }

    return [progress, money, health];
  }

  public determineMoneyIfNotAchieved(){
    let moneyCurrentSaved;
    let i;
    // tslint:disable-next-line:prefer-conditional-expression
    if(this.isPostQuit()){
      moneyCurrentSaved = this.getTotalSavings();
    } else{
      moneyCurrentSaved = this.getSavingsUpToQuitDate();
    }

    let allMoneyAchievements = this.config.myMoneyAchievements
    .map(x => Object.assign({}, x));
    const moneyAchSize = allMoneyAchievements.length;

    allMoneyAchievements.every((ach, index)=>{
      if(moneyCurrentSaved < ach.value){
        i = index;

        return false;
      } else{
        return true;
      }

    });

    allMoneyAchievements = allMoneyAchievements.slice(i, moneyAchSize);

    return allMoneyAchievements;
  }

  // Community
  /**
   * 1.) New members this month
   *   "Figure is based on the number of users who received a 'First step'
   *    achievement for the month"
   * 2.) Total current members
   *   "Figure is based on the number of users who received a 'First step'
   *   achievement since the launch of the app"
   * 3.) No. Achievements celebrated this week
   *   "Figure is based on the total acheivements fulfilled by all community
   *   members for the week."
   *
   */
  public async getCommunityStats() {
    const newMembersThisMonth = await this.community
    .getCommunityMembersThisMonth();
    const members = await this.community.getCommunityMembers();

    return {
      newMembersThisMonth: newMembersThisMonth.totalUsers,
      totalMembers: members.totalUsers,
    };

  }

  public async getAchievementsCelebrated() {
    // No. Achievements celebrated this week

    let commAchievements = await this.community.getCommunityAchievements();

    [commAchievements] = commAchievements;

    return {
      achievementsCelebrated: commAchievements.eventsCount,
    };
  }

  public getChampixPostJourneyDays(): number {
    let journeyDay = moment().diff(
      moment(this.userStore.user.quitDate),
      'days'
    );

    journeyDay += 1; // Day 0 is actually Day 1

    return journeyDay;
  }

  public getChampixFromStartDayToQuiteDate(): number {
    let journeyDay = moment(this.userStore.user.quitDate).diff(
      moment(this.userStore.user.startDate),
      'days'
    );

    journeyDay += 1; // Day 0 is actually Day 1

    return journeyDay;
  }

  public postSmokeCircularProgressCalc() {
    const journeyDays = this.getDaysSmokeFree();
    const diffStartToQuit = this.getChampixFromStartDayToQuiteDate();

    if (this.userStore.user.quitMethod === Constants.REDUCE_TO_QUIT) {
      return (journeyDays * this.maxPercentage)
        / (Constants.REDUCE_TO_QUIT_JOURNEY_DAYS - diffStartToQuit);

    } else if (this.userStore.user.quitMethod === Constants.FIXED) {
      return (journeyDays * this.maxPercentage)
        / (Constants.FIXED_JOURNEY_DAYS - diffStartToQuit);

    } else {
      return (journeyDays * this.maxPercentage)
        / (Constants.FLEXIBLE_JOURNEY_DAYS - diffStartToQuit);
    }
  }

  public preSmokeCircularProgressCalc() {
    const journeyDays = this.getChampixJourneyDay();
    const remainingDays = this.getDaysUntilQuitDate();

    return (journeyDays * this.maxPercentage) / ((remainingDays) + journeyDays);
  }

  // Private
  private getValidNumber(n: number): number {
    if (typeof n === 'undefined' || isNaN(n)) {
      // tslint:disable-next-line:number-literal-format
      return 0.0;
    }

    return n;
  }

  private log(s: any) {
    this.logger.log(s);
  }
}
