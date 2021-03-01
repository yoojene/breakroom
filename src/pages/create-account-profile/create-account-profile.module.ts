import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateAccountProfilePage } from './create-account-profile';
import { QuitMethodModalComponent } from './quit-method-modal/quit-method-modal';
import { UsernameModalComponent } from './username-modal/username-modal';
import { DisableControlDirective } from '../../directives/disable-control';

@NgModule({
  declarations: [
    CreateAccountProfilePage,
    QuitMethodModalComponent,
    UsernameModalComponent,
    DisableControlDirective,
  ],
  imports: [IonicPageModule.forChild(CreateAccountProfilePage)],
  entryComponents: [QuitMethodModalComponent, UsernameModalComponent],
})
export class CreateAccountProfilePageModule {}
