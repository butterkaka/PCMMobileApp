import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LiveGraphPage } from './live-graph-page';

@NgModule({
  declarations: [
    LiveGraphPage,
  ],
  imports: [
    IonicPageModule.forChild(LiveGraphPage),
  ],
  exports: [
    LiveGraphPage
  ]
})
export class LiveGraphPageModule {}
