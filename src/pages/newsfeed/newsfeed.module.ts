import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewsfeedPage } from './newsfeed';
import { ComponentsModule } from '../../components/components.module';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [NewsfeedPage],
  imports: [IonicPageModule.forChild(NewsfeedPage),
    ComponentsModule,
    IonicImageLoader],
  exports: [NewsfeedPage],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class NewsfeedPageModule { }
