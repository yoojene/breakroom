import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DashboardPage } from './dashboard';
import { ComponentsModule } from '../../components/components.module';

import { NgCircleProgressModule } from 'ng-circle-progress';
import { ProjectedSavingsModalComponent } from './projected-savings-modal/projected-savings-modal';
import { ProjectedSavingsModalProgressComponent } from './projected-savings-progress-modal/projected-savings-progress-modal';
import { MyProgressModalComponent } from './my-progress-modal/my-progress-modal';
import { MobxAngularModule } from 'mobx-angular';
import { MyMoneyModalComponent } from './my-money-modal/my-money-modal';

@NgModule({
  declarations: [
    DashboardPage,
    ProjectedSavingsModalComponent,
    MyMoneyModalComponent,
    ProjectedSavingsModalProgressComponent,
    MyProgressModalComponent,
  ],
  imports: [
    IonicPageModule.forChild(DashboardPage),
    MobxAngularModule,
    ComponentsModule,
    NgCircleProgressModule,
  ],
  exports: [DashboardPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents: [
    ProjectedSavingsModalComponent,
    MyMoneyModalComponent,
    ProjectedSavingsModalProgressComponent,
    MyProgressModalComponent]
})
export class DashboardPageModule {}
