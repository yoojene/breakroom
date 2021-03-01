import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LandingPage } from './landing';
import { ComponentsModule } from '../../components/components.module';
import { CreateAccountActivationPageModule } from '../create-account-activation/create-account-activation.module';
import { CreateAccountAvatarPageModule } from '../create-account-avatar/create-account-avatar.module';
import { CreateAccountEmailPageModule } from '../create-account-email/create-account-email.module';
import { CreateAccountPersonPageModule } from '../create-account-person/create-account-person.module';
import { CreateAccountProfilePageModule } from '../create-account-profile/create-account-profile.module';

@NgModule({
  declarations: [
    LandingPage,
  ],
  imports: [
    IonicPageModule.forChild(LandingPage),
    CreateAccountActivationPageModule,
    CreateAccountAvatarPageModule,
    CreateAccountEmailPageModule,
    CreateAccountPersonPageModule,
    CreateAccountProfilePageModule,
    ComponentsModule,
  ]
})
export class LandingPageModule {}
