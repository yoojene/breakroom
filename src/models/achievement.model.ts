
export interface Achievement {
  eventId?: string; // optional as it will come back from pharma once created
  janrainId?: string; // optional as it will come back from pharma once created
  name: string;
  lottieConfig: {
    path: string;
    autoplay: boolean;
    loop: boolean;
    animationData?: any;
  };
  toObtainUrl: string;
  reachedUrl: string;
  title: string;
  body: string;
  type: string;
  // Number of days to add to quit date for time based calculations (prog/heath)
  calcDays?: number;
  // Number of days to add to quit date for time based calculations for
  // Reduced to Quit (My Progress, My Health)
  rtqCalcDays?: number;
  // value (money / community achievements)
  value?: number;
  celebrated: boolean;
  numLikes?: number;
  numHighFives?: number;
  unlocked: boolean;
  unlockedDate?: string;
  deepLinkId?: string;
  order: number;
}

/**
 * Stored in pharma Person attributes and UserStore as
 *
 * unlockedProgressAchievements
 * unlockedHealthAchievements
 * unlockedMoneyAchievements
 * unlockedCommunityAchievements
**/
export interface AchievementEventMap {
  name: string;
  eventId?: string;
  janrainId?: string;
  deepLinkId?: string;
  celebrated: boolean;
  numLikes?: number;
  numHighFives?: number;
  unlockedDate?: string;
}

/**
 * pharma Event object returned from API
 */
export interface pharmaAchievementEvent {
  attributes: {
    achievementBodyText: string;
    achievementTitle: string;
    avatarUrl: string;
    username: string
  };
  createTime: string;
  createdBy: string;
  eventType: string;
  id: string;
  instance: string;
  isActive: boolean;
  janrainId: string;
  lastModifiedTime: string;
  modifiedBy: string;
  personId: string;
  resourceType: string;
}
