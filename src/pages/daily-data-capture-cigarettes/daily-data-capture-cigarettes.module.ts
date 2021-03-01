import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MobxAngularModule } from 'mobx-angular';
import { DailyDataCaptureCigarettesPage } from './daily-data-capture-cigarettes';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [DailyDataCaptureCigarettesPage],
  imports: [
    IonicPageModule.forChild(DailyDataCaptureCigarettesPage),
    MobxAngularModule,
    ComponentsModule,
  ],
  entryComponents: [DailyDataCaptureCigarettesPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DailyDataCaptureCigarettesModule {}
