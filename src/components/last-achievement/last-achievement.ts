import { Component,
  Input,
  EventEmitter,
  Output,
  SimpleChanges,
  OnInit,
  OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BreakroomConfig } from '../../app/app.config';
import {
  AnalyticsProvider,
  analyticsValues } from '../../providers/analytics/analytics';

@Component({
  selector: 'last-achievement',
  templateUrl: 'last-achievement.html',
})
export class LastAchievementComponent implements OnInit, OnChanges {
  @Input()
  public achievementUrl: any;
  @Input()
  public animOptions: any;
  @Input()
  public achievementBodyText: string;
  @Input()
  public achievementTitle: string;
  @Input()
  public width: number;
  @Input()
  public waitToRender: boolean;
  @Input()
  public height: number;
  @Input()
  public showAnimation: boolean;
  @Input()
  public showImage: boolean;
  @Input()
  public showHeader: boolean;
  @Input()
  public showCelebrate: boolean;
  @Input()
  public showAchievementTitle: boolean;
  @Input()
  public showAchievementText: boolean;
  @Input()
  public showSpinner: boolean;

  @Output()
  public celebrateAchievement = new EventEmitter();
  @Output()
  public animationEvent = new EventEmitter();

  // Text
  public shareButtonText = this.translate.instant('BUTTONS.COMMUNITY_SHARE');
  public smokeFreeText = this.translate.instant('ACHIEVEMENTS.SMOKE_FREE');
  public lastAchievementHeader = this.translate.instant(
    'ACHIEVEMENTS.LAST_ACHIEVEMENT'
  );

  // Separate passed @Input animOptions object into another
  // to send down into LottieViewComponent
  public lottieOptions = this.animOptions;

  private anim: any;
  private timeToAnimate = 1000;

  constructor(
    public translate: TranslateService,
    public config: BreakroomConfig,
    public analyticsService: AnalyticsProvider,
  ) {}

  public ngOnInit(){
    this.analyticsService.trackStateAction({
      pagename: analyticsValues.PAGE_ACHIEVEMENT_DETAILS
    });

    if(this.animOptions){
      if(this.waitToRender && this.animOptions.autoplay){
          this.animOptions.autoplay = false;

          this.lottieOptions = this.animOptions;
        }
      }else{
        this.showAnimation = false;
      }
  }

  public ngOnChanges(changes: SimpleChanges){

    if (changes && changes.animOptions && (!changes.firstChange)) {
      this.lottieOptions = changes.animOptions.currentValue;
    }

  }

  // Public
  public onShareTap() {

  this.analyticsService.trackAction({
    pagename: `${analyticsValues.PAGE_ACHIEVEMENT_DETAILS}`,
    linkname: `Achievement shared|${this.achievementTitle}`,
  });

    this.celebrateAchievement.emit({ celebrate: true });
  }

  public handleAnimation(anim: any) {

    this.anim = Object.getPrototypeOf(anim);
    if(this.waitToRender){
        setTimeout( () => {
          anim.play();
      }, this.timeToAnimate);
    } else {
      anim.play();
    }

    this.animationEvent.emit(this.anim);

  }
}
