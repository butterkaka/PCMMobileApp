import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RampSetupPage } from './ramp-setup';

@NgModule({
  declarations: [
    RampSetupPage,
  ],
  imports: [
    IonicPageModule.forChild(RampSetupPage),
  ],
  exports: [
    RampSetupPage
  ]
})
export class RampSetupPageModule {}
