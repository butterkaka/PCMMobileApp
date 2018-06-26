import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LicenseInfoPage } from './license-info';

@NgModule({
  declarations: [
    LicenseInfoPage,
  ],
  imports: [
    IonicPageModule.forChild(LicenseInfoPage),
  ],
  exports: [
    LicenseInfoPage
  ]
})
export class LicenseInfoPageModule {}
