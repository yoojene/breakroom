import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditProfilePage } from './edit-profile';
import { MobxAngularModule } from 'mobx-angular';

@NgModule({
  declarations: [EditProfilePage],
  imports: [IonicPageModule.forChild(EditProfilePage), MobxAngularModule],
  entryComponents: [EditProfilePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditProfilePageModule {}
