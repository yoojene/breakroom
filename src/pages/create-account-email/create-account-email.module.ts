import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateAccountEmailPage } from './create-account-email';

@NgModule({
  declarations: [
    CreateAccountEmailPage,
  ],
  imports: [
    IonicPageModule.forChild(CreateAccountEmailPage),
  ],
})
export class CreateAccountEmailPageModule {}
