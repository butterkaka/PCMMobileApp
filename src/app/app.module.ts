
import { PumpSetupPage } from './../pages/pump-setup-page/pump-setup-page';
import { DeviceSetupPage } from './../pages/device-setup-page/device-setup-page';
import { DeviceMainPage } from './../pages/device-main-page/device-main-page';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';
import{ ScanDevicePage } from '../pages/scan-device-page/scan-device-page'

import { MyApp } from './app.component';
import{ RegulatorSetupPage } from '../pages/regulator-setup-page/regulator-setup-page'
import { BLE } from '@ionic-native/ble';
import { PCMChannelDataService } from '../providers/pcm-channel-data-service'
import{ DriveLogPage } from '../pages/drive-log-page/drive-log-page'
import{ LiveTunePage } from '../pages/live-tune-page/live-tune-page'
import{ IOSetupPage } from '../pages/io-setup-page/io-setup-page'
import '../../node_modules/chart.js/dist/Chart.bundle.min.js';  
import {ChartsModule} from 'ng2-charts/charts/charts';
import { ImgMapComponent } from '../components/ng2-img-map-master/ng2-img-map'
import { File } from '@ionic-native/file';
import { PcmParameterDataSaveServiceProvider } from '../providers/pcm-parameter-data-save-service'
import { EmailComposer } from "@ionic-native/email-composer";
import { DatePipe } from '@angular/common'
import { FileOpener } from '@ionic-native/file-opener'
import {IonicStorageModule} from '@ionic/storage'
// For Android only comment this both for IOS
import { FileChooser } from '@ionic-native/file-chooser';
//new
import { SplashScreen } from '@ionic-native/splash-screen';

import { NgIdleModule } from '@ng-idle/core';
import { HttpModule } from '@angular/http';

import { LicensePage } from './../pages/license/license';


@NgModule({
  declarations: [
    MyApp,    
    ScanDevicePage,
    RegulatorSetupPage,
    DeviceMainPage,
    DeviceSetupPage,
    PumpSetupPage,
    DriveLogPage,
    LiveTunePage,
    IOSetupPage,  
    ImgMapComponent
     
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    ChartsModule,
    NgIdleModule.forRoot(),
    IonicStorageModule.forRoot()
    
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ScanDevicePage,
    RegulatorSetupPage,
    DeviceMainPage,
    DeviceSetupPage,
    PumpSetupPage,
    DriveLogPage,
    LiveTunePage,
    IOSetupPage
    //ImgMapComponent     
  ],
  providers: [
    StatusBar,
    BLE,
    PCMChannelDataService,
    File,   
    FileChooser,    
    EmailComposer,
    DatePipe,
    FileOpener,
    SplashScreen,
    {provide: ErrorHandler,useClass: IonicErrorHandler}, PcmParameterDataSaveServiceProvider, 
  ]
})
export class AppModule {}
