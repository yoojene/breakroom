import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MobxAngularModule } from 'mobx-angular';
import { DailyDataCapturePage } from './daily-data-capture';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [DailyDataCapturePage],
  imports: [
    IonicPageModule.forChild(DailyDataCapturePage),
    MobxAngularModule,
    ComponentsModule],
  entryComponents: [DailyDataCapturePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DailyDataCaptureModule {}
