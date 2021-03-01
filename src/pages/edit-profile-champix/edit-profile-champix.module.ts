import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MobxAngularModule } from 'mobx-angular';
import { EditProfileChampixPage } from './edit-profile-champix';

@NgModule({
  declarations: [EditProfileChampixPage],
  imports: [
    IonicPageModule.forChild(EditProfileChampixPage),
    MobxAngularModule,
  ],
  entryComponents: [EditProfileChampixPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditProfileChampixPageModule {}
