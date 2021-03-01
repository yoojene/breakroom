import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContentPage } from './content';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [ContentPage],
  imports: [IonicPageModule.forChild(ContentPage),
           ComponentsModule],
  exports: [ContentPage],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class ContentPageModule {}
