import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ComponentsModule } from '../../components/components.module';
import { NotificationsPage } from './notifications';
import { MobxAngularModule } from 'mobx-angular';

@NgModule({
  declarations: [NotificationsPage],
  imports: [
    IonicPageModule.forChild(NotificationsPage),
    MobxAngularModule,
    ComponentsModule],
  exports: [NotificationsPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NotificationsPageModule {}
