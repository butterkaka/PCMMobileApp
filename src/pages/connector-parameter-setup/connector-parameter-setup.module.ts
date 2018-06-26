import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConnectorParameterSetupPage } from './connector-parameter-setup';

@NgModule({
  declarations: [
    ConnectorParameterSetupPage,
  ],
  imports: [
    IonicPageModule.forChild(ConnectorParameterSetupPage),
  ],
  exports: [
    ConnectorParameterSetupPage
  ]
})
export class ConnectorParameterSetupPageModule {}
