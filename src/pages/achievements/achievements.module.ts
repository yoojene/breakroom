import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AchievementsPage } from './achievements';
import { ComponentsModule } from '../../components/components.module';
import { AchievementsDetailPageModule } from '../achievements-detail/achievements-detail.module';
import { MobxAngularModule } from 'mobx-angular';

@NgModule({
  declarations: [AchievementsPage],
  imports: [IonicPageModule.forChild(AchievementsPage),
            AchievementsDetailPageModule,
            MobxAngularModule,
            ComponentsModule],
  exports: [AchievementsPage],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class AchievementsPageModule {}
