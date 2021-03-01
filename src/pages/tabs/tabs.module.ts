import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TabsPage } from './tabs';
import { DashboardPageModule } from '../dashboard/dashboard.module';
import { AchievementsPageModule } from '../achievements/achievements.module';
import { ChampixInfoPageModule } from '../champix-info/champix-info.module';
import { ContentPageModule } from '../content/content.module';
import { NewsfeedPageModule } from '../newsfeed/newsfeed.module';
import { SettingsPageModule } from '../settings/settings.module';
import { NotificationsPageModule } from '../notifications/notifications.module';
@NgModule({
  declarations: [TabsPage],
  imports: [IonicPageModule.forChild(TabsPage),
    NotificationsPageModule,
    NewsfeedPageModule,
    DashboardPageModule,
    AchievementsPageModule,
    ChampixInfoPageModule,
    ContentPageModule,
    SettingsPageModule
  ],
  exports: [TabsPage],
})
export class TabsPageModule {}
