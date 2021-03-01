import { Component, EventEmitter, Output, Input, SimpleChanges
} from '@angular/core';
import { Achievement
} from '../../models/achievement.model';
import { UserStore } from '../../stores/user.store';
import { CommunityProvider } from '../../providers/community/community';
import { AchievementsProvider
} from '../../providers/achievements/achievements';
import { ContentProvider } from '../../providers/content/content';
import { Logger } from '@pharma/pharma-component-utils';
import { AuthProvider } from '../../providers/auth/auth';
import { Observable, Subscription } from 'rxjs';
import { pharmaPerson } from '../../models/user.model';
import { pharmaContentAsset } from '../../models/content.model';

@Component({
  selector: 'reaction',
  templateUrl: 'reaction.html',
})
export class ReactionComponent {
  public likeCount: number;
  public highFiveCount: number;

  @Input()
  public showLike: boolean;
  @Input()
  public showHighFive: boolean;
  @Input()
  public achievement: Achievement;
  @Input()
  public achievementEventId: string;
  @Input()
  public achievementPersonId: string;
  @Input()
  public isLatestAchievement: boolean;
  @Input()
  public isOnNewsfeed: boolean;
  @Input()
  public isOnContent: boolean;
  @Input()
  public contentId: any;
  @Input()
  public avoidTap: boolean;
  @Output()
  public onLike = new EventEmitter();
  @Output()
  public onHighFive = new EventEmitter();

  private eventId: any;
  private timer$: Subscription;
  private time = 2000;
  public alreadyLiked = false;
  public alreadyHighFived = false;

  constructor(
    public community: CommunityProvider,
    public achieveProvider: AchievementsProvider,
    public contentProvider: ContentProvider,
    public auth: AuthProvider,
    private logger: Logger,
    private userStore: UserStore
  ) {}

  // Lifecycle
  public ngOnChanges(changes: SimpleChanges) {
    // AchievementPage / AchievementDetailPage\
    if (changes && changes.achievement && changes.achievement.currentValue) {
      this.likeCount = changes.achievement.currentValue.numLikes;
    }

    if (
      changes &&
      changes.achievementEventId &&
      changes.achievementEventId.currentValue
    ) {
      // NewsfeedPage
      this.achieveProvider
        .getAchievement(
          changes.achievementEventId.currentValue,
          this.userStore.user.id
        )
        .then(async results => {
          if (results.attributes.likeList) {
            this.likeCount = results.attributes.likeList.length;

            this.checkIfUserAlreadyLikedIt(results);
          }
          if (results.attributes.hi5List) {
            this.highFiveCount = results.attributes.hi5List.length;

            this.checkIfUserAlreadyHighFivedIt(results);
          }
        })
        .catch(err => {
          this.logger.log(err);
        });
    }

    this.checkEventId();

    if (changes && changes.contentId && changes.contentId.currentValue) {
      this.contentProvider.getContentById(this.contentId).then(likedRes => {

        const [likedContent]: pharmaContentAsset[] = likedRes.results;

        if (likedContent.attributes.endorsements) {
          this.likeCount = likedContent.attributes.endorsements[0];
        }
      });
    }
  }

  public ngDestroy() {
    this.timer$.unsubscribe();
  }

  // Public
  public async onLikeTap() {
    if (this.alreadyLiked || this.avoidTap) {
      return;
    }
    this.alreadyLiked = true;

    // Add like in advance and case it fail we remove the like
    this.likeCount = this.likeCount ? this.likeCount + 1 : 1;

    if (!this.isOnContent) {
      await this.addEventLike();
    } else {
      await this.addContentLike();
    }
  }

  public async onHighFiveTap() {
    if (this.alreadyHighFived || this.avoidTap) {
      return;
    }
    this.alreadyHighFived = true;
    // Add high 5 in advance and case it fail we remove the like
    this.highFiveCount = this.highFiveCount ? this.highFiveCount + 1 : 1;

    await this.addHighFiveEvent();
  }

  // Private
  /**
   * Add Achievement like event
   *
   */
  private async addEventLike() {

    const ownerId = this.getEventOwnerId();

    try {
      await this.community.addLikeEvent(
        this.eventId,
        this.achievementPersonId
      );

      this.timer$ = Observable.timer(this.time).subscribe(async () => {
        this.logger.log('delay 2s to allow chained action to complete');
        // Get the latestAchievement just liked
        const likeEvent = await this.achieveProvider
          .getAchievement(this.eventId, ownerId)
          .catch(error => {
            this.logger.log(error);
            this.likeCount--;
          });

        if (this.isOnNewsfeed) {
          this.likeCount = likeEvent.attributes.likeList.length;

          return;
        }

        if (this.isLatestAchievement) {
          this.userStore.user.latestUnlockedAchievement.numLikes=this.likeCount;

          const unlockedUpdates = {
            latestUnlockedAchievement: this.userStore.user
              .latestUnlockedAchievement,
          };

          await this.updatepharma(unlockedUpdates);

          this.userStore.updateUser(unlockedUpdates);
        }
      });
    } catch (e) {
      this.likeCount--;
      this.logger.error(e);
    }
  }
  /**
   * Add Content like event
   */
  private async addContentLike() {
    try {
      const res = await this.community.addContentLike(this.contentId);
      this.logger.log(res);

      this.timer$ = Observable.timer(this.time).subscribe(async () => {
        this.logger.log('content like delayed 2s to allow chained action to complete');
        const likedRes = await this.contentProvider.getContentById(
          this.contentId
        );

        const [likedContent]: pharmaContentAsset[] = likedRes.results;

        this.likeCount = likedContent.attributes.endorsements[0];
      });
    } catch (e) {
      this.likeCount--;
      this.logger.error(e);
    }
  }

  /**
   * Check if user has liked event already to restrict double tap
   */
  private checkIfUserAlreadyLikedIt(list) {
    if (list.attributes.likeList) {
      list.attributes.likeList.map(async likeUserId => {
        if (this.userStore.user.id === likeUserId) {

          this.alreadyLiked = true;

          return;
        }
      });
    }
  }
  /**
   * Check if user has high fived event already to restrict double tap
   */
  private checkIfUserAlreadyHighFivedIt(list) {
    if (list.attributes.hi5List) {
      list.attributes.hi5List.map(async likeUserId => {
        if (this.userStore.user.id === likeUserId) {

          this.alreadyHighFived = true;

          return;
        }
      });
    }
  }
  /**
   *  Add Achievement high five event
   */
  private async addHighFiveEvent() {

     const ownerId = this.getEventOwnerId();
    try {
      await this.community.addHighFive(
        this.eventId,
        this.achievementPersonId
      );
      this.timer$ = Observable.timer(this.time).subscribe(async () => {
        this.logger.log(
          'High 5 - delay 2s to allow chained action to complete'
        );
        // Get the latestAchievement just liked
        const highFiveEvent = await this.achieveProvider
          .getAchievement(this.eventId, ownerId)
          .catch(error => {
            this.logger.log(error);
            this.highFiveCount--;
          });

        this.logger.log(highFiveEvent);

        if (this.isOnNewsfeed) {
          this.highFiveCount = highFiveEvent.attributes.hi5List.length;

          return;
        }

        if (this.isLatestAchievement) {
          this.userStore.user.latestUnlockedAchievement.numHighFives
          = this.highFiveCount;

          const unlockedUpdates = {
            latestUnlockedAchievement: this.userStore.user
              .latestUnlockedAchievement,
          };

          await this.updatepharma(unlockedUpdates);

          this.userStore.updateUser(unlockedUpdates);
        }
      });
    } catch (e) {
      this.highFiveCount--;
      this.logger.error(e);
    }
  }

  /**
   * Check if achievememt or achievementEventId is passed
   */
  private checkEventId() {
    this.eventId = this.achievementEventId;

    if (this.achievement) {
      this.eventId = this.achievement.eventId;
    }
  }
  /**
   * Check if Event Owner id is the logged in user or someone else
   * This is passed to the Achievements GET call
   */
  private getEventOwnerId(): string {

    let ownerId: string;

    this.userStore.user.id === this.achievementPersonId
      ? (ownerId = this.userStore.user.id)
      : (ownerId = this.achievementPersonId);

      return ownerId;


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
