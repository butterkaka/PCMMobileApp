import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConnectorSetupPage } from './connector-setup-page';

@NgModule({
  declarations: [
    ConnectorSetupPage,
  ],
  imports: [
    IonicPageModule.forChild(ConnectorSetupPage),
  ],
  exports: [
    ConnectorSetupPage
  ]
})
export class ConnectorSetupPageModule {}
