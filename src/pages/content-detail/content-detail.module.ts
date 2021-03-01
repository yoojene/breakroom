import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContentDetailPage } from './content-detail';
import { IonicImageViewerModule } from 'ionic-img-viewer';

@NgModule({
  declarations: [
    ContentDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(ContentDetailPage),
    IonicImageViewerModule
  ],
})
export class ContentDetailPageModule {}
