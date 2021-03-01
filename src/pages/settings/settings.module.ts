import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingsPage } from './settings';
import { EditProfilePageModule } from '../edit-profile/edit-profile.module';
import { EditAccountAvatarPageModule } from '../edit-account-avatar/edit-account-avatar.module';

@NgModule({
  declarations: [SettingsPage],
  imports: [IonicPageModule.forChild(SettingsPage),
            EditProfilePageModule, EditAccountAvatarPageModule],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class SettingsPageModule {}
