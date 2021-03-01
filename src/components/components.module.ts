import { NgModule } from '@angular/core';
import { LoadingAnimationComponent } from './loading-animation/loading-animation';
import { LottieAnimationViewModule } from '@pharma/angular-lottie';
import { LastAchievementComponent } from './last-achievement/last-achievement';
import { IonicModule } from 'ionic-angular';
import { AchievementsPaneComponent } from './achievements-pane/achievements-pane';
import { TabsHeaderComponent } from './tabs-header/tabs-header';
import { MobxAngularModule } from 'mobx-angular';
import { ReactionComponent } from './reaction/reaction';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { SkeletonDashboardComponent } from './skeleton-dashboard/skeleton-dashboard';

@NgModule({
  declarations: [
    LoadingAnimationComponent,
    LastAchievementComponent,
    AchievementsPaneComponent,
    TabsHeaderComponent,
    ReactionComponent,
    SkeletonDashboardComponent,
  ],
  imports: [
    IonicModule,
    LottieAnimationViewModule.forRoot(),
    MobxAngularModule,
    NgCircleProgressModule,

  ],
  exports: [
    LoadingAnimationComponent,
    LastAchievementComponent,
    AchievementsPaneComponent,
    TabsHeaderComponent,
    ReactionComponent,
    SkeletonDashboardComponent,
  ],
})
export class ComponentsModule {}
