import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AchievementsDetailPage } from './achievements-detail';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [AchievementsDetailPage],
  imports: [IonicPageModule.forChild(AchievementsDetailPage), ComponentsModule],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class AchievementsDetailPageModule {}
