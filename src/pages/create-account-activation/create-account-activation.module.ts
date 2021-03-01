import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateAccountActivationPage } from './create-account-activation';

@NgModule({
  declarations: [CreateAccountActivationPage],
  imports: [
    IonicPageModule.forChild(CreateAccountActivationPage),
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class CreateAccountActivationPageModule {}
