import { NgModule , CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChampixInfoPage } from './champix-info';
import { ComponentsModule } from '../../components/components.module';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { IonicImageViewerModule } from 'ionic-img-viewer';

@NgModule({
  declarations: [ChampixInfoPage],
  imports: [IonicPageModule.forChild(ChampixInfoPage),
           ComponentsModule,
           IonicImageViewerModule],
  exports: [ChampixInfoPage],
  providers: [InAppBrowser],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class ChampixInfoPageModule {}
