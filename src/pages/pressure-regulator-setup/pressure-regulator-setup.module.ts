import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PressureRegulatorSetupPage } from './pressure-regulator-setup';

@NgModule({
  declarations: [
    PressureRegulatorSetupPage,
  ],
  imports: [
    IonicPageModule.forChild(PressureRegulatorSetupPage),
  ],
  exports: [
    PressureRegulatorSetupPage
  ]
})
export class PressureRegulatorSetupPageModule {}
