import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PersonaliseCompletePage } from './personalise-complete';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    PersonaliseCompletePage,
  ],
  imports: [
    IonicPageModule.forChild(PersonaliseCompletePage),
    ComponentsModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class PersonaliseCompletePageModule {}
