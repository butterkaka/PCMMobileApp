import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AlarmLogPage } from './alarm-log-page';

@NgModule({
  declarations: [
    AlarmLogPage,
  ],
  imports: [
    IonicPageModule.forChild(AlarmLogPage),
  ],
  exports: [
    AlarmLogPage
  ]
})
export class AlarmLogPageModule {}
