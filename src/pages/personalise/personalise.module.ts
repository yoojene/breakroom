import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MobxAngularModule } from 'mobx-angular';
import { PersonalisePage } from './personalise';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [PersonalisePage],
  imports: [
    IonicPageModule.forChild(PersonalisePage),
    MobxAngularModule,
    TranslateModule,
  ],
  entryComponents: [PersonalisePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PersonalisePageModule {}
