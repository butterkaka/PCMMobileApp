import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SwashAngleSetupPage } from './swash-angle-setup';

@NgModule({
  declarations: [
    SwashAngleSetupPage,
  ],
  imports: [
    IonicPageModule.forChild(SwashAngleSetupPage),
  ],
  exports: [
    SwashAngleSetupPage
  ]
})
export class SwashAngleSetupPageModule {}
