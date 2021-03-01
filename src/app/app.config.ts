// tslint:disable:max-line-length
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Achievement } from '../models/achievement.model';
import { UserStore } from '../stores/user.store';

@Injectable()
export class BreakroomConfig {
  constructor(private userStore: UserStore) {}
  // Language

  public locale = 'en-AU';
  public currency = 'AUD';

  // pharma Assets

  public activationAssetType = '4e443951-1112-477a-9929-15198ae7b273';
  public champixInfoAssetType = '72cc0d8a-1c88-4517-92b4-b29da0dc808b';
  public contentAssetType = '25b56187-c9e5-4cda-849b-4edebf51eacc';
  public bannedWordsAssetType = '8758410b-e4ea-4228-8ab7-dc42ff1c719b';
  public termsPrivacyAssetType = '69bd883f-d0db-4a85-9b24-3876cdfdc1f7';

  // pharma Events

  public achievementEventType = '15659019-7135-4863-ba73-22f352fd7259';
  public reactionEventType = '31392409-4a22-4f99-bb21-777ca694183e';
  public reactionContentEventType = '233dea37-4fcf-420d-a924-e5bcead45066';
  public highFiveEventType = '037fc8fa-ae85-4ce4-8a0a-c41dda0b055e';
  public dailyCaptureEventType = '0465ff02-6c44-4cdb-b4b6-d3817b3fbef1';
  public registrationEventType = '308baec9-54e9-4d1f-afed-80d98d700cb3';

  // pharma Person Types
  public breakroomPersonType = '424d518f-cfc3-48d6-9dbb-19470ab5c334';

  // Postcode API

  public ausPostApiURL =
    'https://digitalapi.auspost.com.au/postcode/search.json?';

  // Dashboard

  public averageTimeSmokeCigarette = 6; // Minutes
  public averageMaleLife = 81;
  public averageFemaleLife = 85;
  public averageOtherLife = 83;
  public daysPerYear = 365;

  /// Smoking Journey

  private minStartDays = 30;
  private maxStartDays = 14;

  public startAndQuitDateMin: string = moment()
    .startOf('day')
    .subtract(this.minStartDays, 'days')
    .format('YYYY-MM-DD');
  public startAndQuitDateMax: string = moment()
    .startOf('day')
    .add(this.maxStartDays, 'days')
    .format('YYYY-MM-DD');

  /// Quit Methods

  public quitMethods = [{
    name: 'Fixed',
    value: 'Fix'
  }, {
    name: 'Flexible',
    value: 'Flex'
  }, {
    name: 'Reduce To Quit',
    value: 'Reduced_quit'
  }, {
    name: 'Not Sure',
    value: 'not_sure'
  }];

  // Avatars
  public avatars = [
    {
      avatarUrl: 'assets/imgs/j-avatar-1.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-1-f.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-2.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-2-f.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-3.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-3-f.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-4.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-4-f.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-5.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-5-f.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-6.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-6-f.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-7.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-7-f.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-8.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-8-f.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-9.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-9-f.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-10.svg',
      selected: false,
    },
    {
      avatarUrl: 'assets/imgs/j-avatar-10-f.svg',
      selected: false,
    },
  ];

  /// Achievements

  // My Progress

  public myProgressAchievements: Achievement[] = [
    {
      name: 'firstStep',
      lottieConfig: {
        path: 'assets/animations/PF_MP_21.json',
        autoplay: true,
        loop: false
      },
      toObtainUrl: 'assets/imgs/achievements/progress/first_step.svg',
      reachedUrl: 'assets/imgs/achievements/progress/first_step_complete.svg',
      title: 'First step',
      body:
        'Congratulations, you’ve taken your first step on the Breakroom journey and towards a smoke-free life.Why not let the community know?',
      type: 'progress',
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_01',
      order: 1,
    },
    {
      name: 'oneDay',
      lottieConfig: {
        path: 'assets/animations/PF_MP_22.json',
        autoplay: true,
        loop: false
      },
      toObtainUrl: 'assets/imgs/achievements/progress/day_1.svg',
      reachedUrl: 'assets/imgs/achievements/progress/day_1_complete.svg',
      title: '1 day <br> smoke-free',
      body: `Well done ${
        this.userStore.user.firstName
      }! First day smoke-free - keep it up.`,
      type: 'progress',
      calcDays: 1,
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_06',
      order: 2,
    },
    {
      name: 'oneWeek',
      lottieConfig: {
        path: 'assets/animations/PF_MP_23.json',
        autoplay: true,
        loop: false

      },
      toObtainUrl: 'assets/imgs/achievements/progress/1_week.svg',
      reachedUrl: 'assets/imgs/achievements/progress/1_week_complete.svg',
      title: '1 week <br> smoke-free',
      body: `Well done ${
        this.userStore.user.firstName
      }! First week smoke-free - keep it up.`,
      type: 'progress',
      calcDays: 7,
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_07',
      order: 3,
    },
    {
      name: 'twoWeeks',
      lottieConfig: {
        path: 'assets/animations/PF_MP_24.json',
        autoplay: true,
        loop: false
      },
      toObtainUrl: 'assets/imgs/achievements/progress/2_weeks.svg',
      reachedUrl: 'assets/imgs/achievements/progress/2_weeks_complete.svg',
      title: '2 weeks <br> smoke-free',
      body:
        "Congratulations! You've gone 2 weeks without smoking.  Hope you're feeling great.",
      type: 'progress',
      calcDays: 14,
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_08',
      order: 4,
    },
    {
      name: 'threeWeeks',
      lottieConfig: {
        path: 'assets/animations/PF_MP_25.json',
        autoplay: true,
        loop: false
      },
      toObtainUrl: 'assets/imgs/achievements/progress/3_weeks.svg',
      reachedUrl: 'assets/imgs/achievements/progress/3_weeks_complete.svg',
      title: '3 weeks <br> smoke-free',
      body: '3 weeks smoke-free! That’s a great effort, keep going!',
      type: 'progress',
      calcDays: 21,
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_09',
      order: 5,
    },
    {
      name: 'fourWeeks',
      lottieConfig: {
        path: 'assets/animations/pharma_06_Achievements_4WeeksDone_V1.json',
        autoplay: true,
        loop: false
      },
      toObtainUrl: 'assets/imgs/achievements/progress/4_weeks_done.svg',
      reachedUrl: 'assets/imgs/achievements/progress/4_weeks_done_complete.svg',
      title: '4 weeks in',
      body: 'Fantastic effort! 4 weeks in and counting.',
      type: 'progress',
      calcDays: 28,
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_02',
      order: 6,
    },
    {
      name: 'thirtyDays',
      lottieConfig: {
        path: 'assets/animations/PF_MP_26.json',
        autoplay: true,
        loop: false
      },
      toObtainUrl: 'assets/imgs/achievements/progress/30_days.svg',
      reachedUrl: 'assets/imgs/achievements/progress/30_days_complete.svg',
      title: '30 days <br> smoke-free',
      body:
        'Amazing effort, one month down. Treat yourself today - you deserve it!',
      type: 'progress',
      calcDays: 30,
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_10',
      order: 7,
    },
    {
      name: '1000Hours',
      lottieConfig: {
        path: 'assets/animations/PF_MP_27.json',
        autoplay: true,
        loop: false
      },
      reachedUrl: 'assets/imgs/achievements/progress/1000_hours_complete.svg',
      toObtainUrl: 'assets/imgs/achievements/progress/1000_hours.svg',
      title: '1000 hours <br> smoke-free',
      body:
        'It’s been 1000 hours since your last cigarette. Congratulations on hitting such a big milestone!',
      type: 'progress',
      calcDays: 41.6,
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_11',
      order: 8,
    },
    {
      name: 'halfWay',
      lottieConfig: {
        path: 'assets/animations/PF_MP_28.json',
        autoplay: true,
        loop: false
      },
      reachedUrl: 'assets/imgs/achievements/progress/half_way_complete.svg',
      toObtainUrl: 'assets/imgs/achievements/progress/half_way.svg',
      title: 'Halfway to smoke-free',
      body: 'Go you! Half way there to being smoke-free!',
      type: 'progress',
      calcDays: 43,
      rtqCalcDays: 85,
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_12',
      order: 9,
    },
    {
      name: 'eightWeeks',
      lottieConfig: {
        path: 'assets/animations/pharma_07_Achievements_8WeeksDone_V1.json',
        autoplay: true,
        loop: false
      },
      reachedUrl: 'assets/imgs/achievements/progress/8_weeks_done_complete.svg',
      toObtainUrl: 'assets/imgs/achievements/progress/8_weeks_done.svg',
      title: '8 weeks in',
      body: 'Amazing! You’ve just passed your 8-week mark – keep going strong.',
      type: 'progress',
      calcDays: 56,
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_03',
      order: 10,
    },
    {
      name: 'sixtyDays',
      lottieConfig: {
        path: 'assets/animations/PF_MP_29.json',
        autoplay: true,
        loop: false
      },
      reachedUrl: 'assets/imgs/achievements/progress/60_days_complete.svg',
      toObtainUrl: 'assets/imgs/achievements/progress/60_days.svg',
      title: '60 days <br> smoke-free',
      body: 'It’s the two month mark! What an effort!',
      type: 'progress',
      calcDays: 60,
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_13',
      order: 11,
    },
    {
      name: 'sixteenWeeks', // RTQ only
      lottieConfig: {
        path: 'assets/animations/pharma_08_Achievements_16WeeksDone_V1.json',
        autoplay: true,
        loop: false
      },
      reachedUrl:
        'assets/imgs/achievements/progress/16_weeks_done_complete.svg',
      toObtainUrl: 'assets/imgs/achievements/progress/16_weeks_done.svg',
      title: '16 weeks in',
      body: '4 months down…let’s keep going. Go you!',
      type: 'progress',
      calcDays: 112,
      rtqCalcDays: 112,
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_04',
      order: 12,
    },
    {
      name: 'twentyWeeks', // RTQ only
      lottieConfig: {
        path: 'assets/animations/pharma_09_Achievements_20WeeksDone_V1.json',
        autoplay: true,
        loop: false
      },
      reachedUrl:
        'assets/imgs/achievements/progress/20_weeks_done_complete.svg',
      toObtainUrl: 'assets/imgs/achievements/progress/20_weeks_done.svg',
      title: '20 weeks in',
      body: '20 weeks of awesome progress – that’s really worth celebrating.',
      type: 'progress',
      calcDays: 140,
      rtqCalcDays: 140,
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_05',
      order: 13,
    },
    {
      name: 'programComplete',
      lottieConfig: {
        path:
          'assets/animations/pharma_10_Achievements_ProgramComplete_V1.json',
        autoplay: true,
        loop: false
      },
      reachedUrl:
        'assets/imgs/achievements/progress/complete_icon_complete.svg',
      toObtainUrl: 'assets/imgs/achievements/progress/complete_icon.svg',
      title: 'Program complete',
      body:
        'Congratulations on making it through your CHAMPIX® journey! Proud of you - keep up the great work.',
      type: 'progress',
      calcDays: 84,
      rtqCalcDays: 288,
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_14',
      order: 14,
    },
  ];

  // My Health Achievements

  public myHeathAchievements: Achievement[] = [
    {
      name: 'healthyHeart',
      title: 'Healthier <br> Heart',
      body:
        'We heart this! In as little as 6 hours after going smoke-free, your heart rate is returning to normal.⁴',
      lottieConfig: {
        path: 'assets/animations/PF_MH_13.json',
        autoplay: true,
        loop: false
      },
      calcDays: 0.5,
      type: 'health',
      toObtainUrl: 'assets/imgs/achievements/health/healthier_heart.svg',
      reachedUrl:
        'assets/imgs/achievements/health/healthier_heart_complete.svg',
      celebrated: false,
      unlocked: false,
      deepLinkId: 'TBA',
      order: 1,
    },
    {
      name: 'moreOxygen',
      title: 'More <br> oxygen',
      body:
        '24 hours smoke free & oxygen is reaching your heart and muscles more easily.⁴',
      lottieConfig: {
        path: 'assets/animations/PF_MH_12.json',
        autoplay: true,
        loop: false
      },
      calcDays: 1,
      type: 'health',
      toObtainUrl: 'assets/imgs/achievements/health/more_oxygen.svg',
      reachedUrl: 'assets/imgs/achievements/health/more_oxygen_complete.svg',
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_15',
      order: 2,
    },
    {
      name: 'nicotineFree',
      title: 'Nicotine <br> free',
      body: 'Congratulations on deciding to be nicotine free!³',
      lottieConfig: {
        path: 'assets/animations/PF_MH_11.json',
        autoplay: true,
        loop: false
      },
      calcDays: 3,
      type: 'health',
      toObtainUrl: 'assets/imgs/achievements/health/nicotine_free.svg',
      reachedUrl: 'assets/imgs/achievements/health/nicotine_free_complete.svg',
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_16',
      order: 3,
    },
    {
      name: 'smellTaste',
      title: 'Smell & <br>taste',
      body:
        'Have you noticed your sense of smell and taste have improved after just one week?!.⁴',
      lottieConfig: {
        path: 'assets/animations/PF_MH_14.json',
        autoplay: true,
        loop: false
      },
      calcDays: 7,
      type: 'health',
      toObtainUrl: 'assets/imgs/achievements/health/smell_taste.svg',
      reachedUrl: 'assets/imgs/achievements/health/smell_taste_complete.svg',
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_17',
      order: 4,
    },
    {
      name: 'breathEasier',
      title: 'Breathe <br> easier',
      body: 'Your lungs are starting to clear now.⁴',
      lottieConfig: {
        path: 'assets/animations/PF_MH_15.json',
        autoplay: true,
        loop: false
      },
      calcDays: 28,
      type: 'health',
      toObtainUrl: 'assets/imgs/achievements/health/breathe_easier.svg',
      reachedUrl: 'assets/imgs/achievements/health/breathe_easier_complete.svg',
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_18',
      order: 5,
    },
    {
      name: 'circulation',
      title: 'Circulation',
      body:
        '6 weeks down! Your circulation has improved, this may make exercise easier!⁵',
      lottieConfig: {
        path: 'assets/animations/PF_MH_17.json',
        autoplay: true,
        loop: false
      },
      calcDays: 42,
      type: 'health',
      toObtainUrl: 'assets/imgs/achievements/health/circulation.svg',
      reachedUrl: 'assets/imgs/achievements/health/circulation_complete.svg',
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_20',
      order: 6,
    },
    {
      name: 'lungCapacity',
      title: 'Lung capacity <br> (airways opening up)',
      body:
        "Climbing stairs more easily? That's because your lung capacity is improving.⁵",
      lottieConfig: {
        path: 'assets/animations/PF_MH_16.json',
        autoplay: true,
        loop: false
      },
      calcDays: 49,
      type: 'health',
      toObtainUrl: 'assets/imgs/achievements/health/lung_capacity.svg',
      reachedUrl: 'assets/imgs/achievements/health/lung_capacity_complete.svg',
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_19',
      order: 7,
    },
    {
      name: 'lessCough',
      title: 'Coughing <br> less',
      body: '2 months in and you may find you’re coughing and wheezing less.⁴',
      lottieConfig: {
        path: 'assets/animations/PF_MH_18.json',
        autoplay: true,
        loop: false
      },
      calcDays: 58,
      type: 'health',
      toObtainUrl: 'assets/imgs/achievements/health/coughing_less.svg',
      reachedUrl: 'assets/imgs/achievements/health/coughing_less_complete.svg',
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_21',
      order: 8,
    },
    // {
    //   name: 'vitaminC',
    //   title: 'Vitamin C', // Not in final copy
    //   body: 'You have more Vitamin C in your body', // Not in final copy
    //   lottieConfig: {
    //     path: 'assets/animations/PF_MH_20.json',
    //     autoplay: true,
    //     loop: false         animationData:null
    //   },
    //   calcDays: 63,
    //   type: 'health',
    //   toObtainUrl: 'assets/imgs/achievements/health/vitamin_c.svg',
    //   reachedUrl: 'assets/imgs/achievements/health/vitamin_c_complete.svg',
    //   celebrated: false,
    //   unlocked: false,
    // },
    {
      name: 'immune',
      title: 'Immune <br> system',
      body:
        'After just 2 months, your immune system is now more robust. Stay strong!⁴',
      lottieConfig: {
        path: 'assets/animations/PF_MH_19.json',
        autoplay: true,
        loop: false
      },
      calcDays: 70,
      type: 'health',
      toObtainUrl: 'assets/imgs/achievements/health/immune_system.svg',
      reachedUrl: 'assets/imgs/achievements/health/immune_system_complete.svg',
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_22',
      order: 9,
    },
  ];

  // My Money Achievements

  public myMoneyAchievements: Achievement[] = [
    {
      name: '50saved',
      title: '$50 saved',
      body: "Congratulations - you've just saved $50.",
      lottieConfig: {
        path: 'assets/animations/PF_MI_04.json',
        autoplay: true,
        loop: false
      },
      type: 'money',
      value: 50,
      toObtainUrl: 'assets/imgs/achievements/money/$50_saved.svg',
      reachedUrl: 'assets/imgs/achievements/money/$50_saved_complete.svg',
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_23',
      order: 1,
    },
    {
      name: '100saved',
      title: '$100 saved',
      body: "Well done! You've now saved $100.",
      lottieConfig: {
        path: 'assets/animations/PF_MI_05.json',
        autoplay: true,
        loop: false
      },
      type: 'money',
      value: 100,
      toObtainUrl: 'assets/imgs/achievements/money/$100_saved.svg',
      reachedUrl: 'assets/imgs/achievements/money/$100_saved_complete.svg',
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_24',
      order: 2,
    },
    {
      name: '250saved',
      title: '$250 saved',
      body: 'You’ve saved $250 and you’ve improved your health. Good effort.',
      lottieConfig: {
        path: 'assets/animations/PF_MI_06.json',
        autoplay: true,
        loop: false
      },
      type: 'money',
      value: 250,
      toObtainUrl: 'assets/imgs/achievements/money/$250_saved.svg',
      reachedUrl: 'assets/imgs/achievements/money/$250_saved_complete.svg',
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_25',
      order: 3,
    },
    {
      name: '500saved',
      title: '$500 saved',
      body: "$500 saved already. Think about what you'll do with it.",
      lottieConfig: {
        path: 'assets/animations/PF_MI_07.json',
        autoplay: true,
        loop: false
      },
      type: 'money',
      value: 500,
      toObtainUrl: 'assets/imgs/achievements/money/$500_saved.svg',
      reachedUrl: 'assets/imgs/achievements/money/$500_saved_complete.svg',
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_26',
      order: 4,
    },
    {
      name: '1000saved',
      title: '$1000 saved',
      body: "You've saved $1000 by not smoking.  Time for a nice weekend away?",
      lottieConfig: {
        path: 'assets/animations/PF_MI_08.json',
        autoplay: true,
        loop: false
      },
      type: 'money',
      value: 1000,
      toObtainUrl: 'assets/imgs/achievements/money/$1000_saved.svg',
      reachedUrl: 'assets/imgs/achievements/money/$1000_saved_complete.svg',
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_27',
      order: 5,
    },
    {
      name: '2000saved',
      title: '$2000 saved',
      body: 'Smoke-free and $2000 extra in your pocket! HUGE congratulations.',
      lottieConfig: {
        path: 'assets/animations/pharma_03_Money_2000_V1.json',
        autoplay: true,
        loop: false
      },
      type: 'money',
      value: 2000,
      toObtainUrl: 'assets/imgs/achievements/money/$2000_saved.svg',
      reachedUrl: 'assets/imgs/achievements/money/$2000_saved_complete.svg',
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_28',
      order: 6,
    },
    {
      name: '3000saved',
      title: '$3000 saved',
      body: 'You’ve now saved $3000 and you’re smoke free. Well done.',
      lottieConfig: {
        path: 'assets/animations/pharma_04_Money_3000_V1.json',
        autoplay: true,
        loop: false
      },
      type: 'money',
      value: 3000,
      toObtainUrl: 'assets/imgs/achievements/money/$3000_saved.svg',
      reachedUrl: 'assets/imgs/achievements/money/$3000_saved_complete.svg',
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_29',
      order: 7,
    },
    {
      name: '4000saved',
      title: '$4000 saved',
      body: 'Four thousand great reasons to celebrate going smoke free.',
      lottieConfig: {
        path: 'assets/animations/pharma_05_Money_4000_V1.json',
        autoplay: true,
        loop: false
      },
      type: 'money',
      value: 4000,
      toObtainUrl: 'assets/imgs/achievements/money/$4000_saved.svg',
      reachedUrl: 'assets/imgs/achievements/money/$4000_saved_complete.svg',
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_30',
      order: 8,
    },
    {
      name: '5000saved',
      title: '$5000 saved',
      body: '$5000 saved! Why not put it towards a well-earned holiday?',
      lottieConfig: {
        path: 'assets/animations/PF_MI_10.json',
        autoplay: true,
        loop: false
      },
      type: 'money',
      value: 5000,
      toObtainUrl: 'assets/imgs/achievements/money/$5000_saved.svg',
      reachedUrl: 'assets/imgs/achievements/money/$5000_saved_complete.svg',
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_31',
      order: 9,
    },
  ];

  // Community Spirit

  public communityAchievements: Achievement[] = [
    {
      name: 'firstLike',
      title: 'First celebration',
      body:
        'Your first post has been celebrated! Go to your newsfeed to see who’s supporting you',
      lottieConfig: {
        path: 'assets/animations/PF_SA_01.json',
        autoplay: true,
        loop: false
      },
      type: 'community',
      value: 1,
      toObtainUrl: 'assets/imgs/achievements/social/1st_like.svg',
      reachedUrl: 'assets/imgs/achievements/social/1st_like_complete.svg',
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_32',
      order: 1,
    },
    {
      name: '20celebrations',
      title: '20 <br> celebrations',
      body: 'You’ve celebrated 20 posts. Keep it up!',
      lottieConfig: {
        path: 'assets/animations/PF_SA_02.json',
        autoplay: true,
        loop: false
      },
      type: 'community',
      value: 20,
      toObtainUrl: 'assets/imgs/achievements/social/20_likes.svg',
      reachedUrl: 'assets/imgs/achievements/social/20_likes_complete.svg',
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_33',
      order: 2,
    },
    {
      name: '50celebrations',
      title: '50 <br> celebrations',
      body: "Congrats - you've celebrated 50 posts. That's a lot to like!",
      lottieConfig: {
        path: 'assets/animations/PF_SA_03.json',
        autoplay: true,
        loop: false
      },
      type: 'community',
      value: 50,
      toObtainUrl: 'assets/imgs/achievements/social/50_likes.svg',
      reachedUrl: 'assets/imgs/achievements/social/50_likes_complete.svg',
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_34',
      order: 3,
    },
    {
      name: '100celebrations',
      title: '100 <br> celebrations',
      body: 'Thumbs up for celebrating 100 posts.',
      lottieConfig: {
        path: 'assets/animations/pharma_01_Social_100_V1.json',
        autoplay: true,
        loop: false
      },
      type: 'community',
      value: 100,
      toObtainUrl: 'assets/imgs/achievements/social/100_likes_icon.svg',
      reachedUrl: 'assets/imgs/achievements/social/100_likes_icon_complete.svg',
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_35',
      order: 4,
    },
    {
      name: '200celebrations',
      title: '200 <br> celebrations',
      body: 'Thanks for celebrating 200 posts!',
      lottieConfig: {
        path: 'assets/animations/pharma_02_Social_200_V1.json',
        autoplay: true,
        loop: false
      },
      type: 'community',
      value: 200,
      toObtainUrl: 'assets/imgs/achievements/social/200_likes_icon.svg',
      reachedUrl: 'assets/imgs/achievements/social/200_likes_icon_complete.svg',
      celebrated: false,
      unlocked: false,
      deepLinkId: 'achievement_36',
      order: 5,
    },
  ];
}
