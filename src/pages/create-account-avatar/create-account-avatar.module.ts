import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateAccountAvatarPage } from './create-account-avatar';

@NgModule({
  declarations: [
    CreateAccountAvatarPage,
  ],
  imports: [
    IonicPageModule.forChild(CreateAccountAvatarPage),
  ],
})
export class CreateAccountAvatarPageModule {}
