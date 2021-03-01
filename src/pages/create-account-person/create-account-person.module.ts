import {
  NgModule
 } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateAccountPersonPage } from './create-account-person';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [CreateAccountPersonPage],
  imports: [
    IonicPageModule.forChild(CreateAccountPersonPage),
    ReactiveFormsModule,
  ],
})
export class CreateAccountPersonPageModule {}
