import { ScanDevicePage } from './../pages/scan-device-page/scan-device-page';
import { Component } from '@angular/core';
import { Nav, Platform, App, AlertController} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { PCMChannelDataService } from '../providers/pcm-channel-data-service'
import { BLE } from '@ionic-native/ble';
import { DeviceMainPage } from './../pages/device-main-page/device-main-page';
// import { IOSetupPage } from './../pages/io-setup-page/io-setup-page';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Constants } from "../shared/app.constant";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  //rootPage:any = HomePage;
  //@ViewChild('myNav') nav:NavController
  rootPage: any = ScanDevicePage;
  // rootPage:any = PumpSetupPage;
  // rootPage:any = "ConnectorSetupPage";  
  // rootpage:any= AlarmLogPage;

  showRoot = true;

  /**
 * ScanDevicePage Constructor.
 * @constructor
 * @param platform Platform
 * @param statusBar StatusBar
 * @param app App
 * @param ble BLE object injected for Bluetooth Low Energy  
 * @param pcmchanneldataservice PCMChannelDataService 
 */
  constructor(public platform: Platform, statusBar: StatusBar, public app: App, public ble: BLE, public pcmchannelservice: PCMChannelDataService,
    public alertCtrl: AlertController, public splashScreen: SplashScreen, public pcmChannelDataservice: PCMChannelDataService, private idle: Idle) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();

      //this.hideSplashScreen();
      splashScreen.hide();
      //this.initializeApp();

      this.app.getActiveNav().setRoot(ScanDevicePage);

      platform.pause.subscribe(() => {
        console.log('[INFO] App paused');
        if (!(this.app.getActiveNav().getActive().instance instanceof ScanDevicePage) ) {
          if(this.pcmChannelDataservice.appResetFlag)
          {
            this.idle.stop(); 
            // uncomment this to go to scan-page when returning from pause
            this.app.getActiveNav().popToRoot();
          }
        }
      });

      platform.resume.subscribe(() => {
        console.log('[INFO] App resumed');
        this.ble.isConnected(this.pcmChannelDataservice.deviceIdGlobal)
        .then(
          () => { 
            console.log("connected in resume");
            this.ble.disconnect(pcmchannelservice.deviceIdGlobal).then(() => {
              console.log("disconnecting...... from " + pcmchannelservice.deviceIdGlobal);
            });
          },
          () => { console.log("disconnected in resume")}
        );
        this.pcmChannelDataservice.appResetFlag=true;
      });

      this.idle.setIdle(8);
      this.idle.setTimeout(15*60); //15 minutes timeout
      this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

      this.idle.onIdleEnd.subscribe(() =>
        console.log('No longer idle.')
      );
      this.idle.onTimeout.subscribe(() => {
        console.log('Timed out!');
        //this.disconnectBle();
        this.app.getActiveNav().popToRoot();

      });
      
      this.idle.onIdleStart.subscribe(() =>
        console.log('You\'ve gone idle!'))
        ;
      this.idle.onTimeoutWarning.subscribe((countdown) =>
        console.log('You will time out in ' + countdown + ' seconds!')
      );

      platform.registerBackButtonAction(() => {


        const overlayView = this.app._appRoot._overlayPortal._views[0];
        if (overlayView && overlayView.dismiss) {
          overlayView.dismiss();
        }

        let nav = this.app.getActiveNav();
        let view = nav.getActive();

        if (view.instance instanceof DeviceMainPage) {
          this.ble.disconnect(pcmchannelservice.deviceIdGlobal).then(() => {
            console.log("Disconnected : " + pcmchannelservice.deviceIdGlobal);
          });
        }

        if (view.instance instanceof ScanDevicePage) {
          this.platform.exitApp();
        }

        // if (this.pcmchannelservice.alert != null) {
        //   this.pcmchannelservice.alert.dismiss();
        //   this.pcmchannelservice.alert = null;
        // }     

        //  if(window.cordova && window.cordova.plugins.Keyboard) {
        //   window.cordova.plugins.Keyboard.disableScroll(true);
        // }

        nav.pop();

        // if(this.nav.canGoBack()){
        //       //this.nav.pop();
        //     }
      });

    });


  }

  hideSplashScreen() {
    if (this.splashScreen) {
      setTimeout(() => {
        this.splashScreen.hide();
      }, 100);
    }
  }


  // private setRoot(newRootPage: any) {
  //   this.rootPage = newRootPage;
  // }

  disconnectBle() {
    this.ble.disconnect(this.pcmChannelDataservice.deviceIdGlobal).then(() => {
      console.log(this.pcmChannelDataservice.deviceIdGlobal + Constants.messages.disconnected)
    }).catch(error => {
      console.log(JSON.stringify(error));
    });
  }

  // initializeApp() {
  //   this.platform.ready().then(() => {
  //     // do whatever you need to do here.
  //     setTimeout(() => {
  //       this.splashScreen.hide();
  //     }, 100);
  //   });
  // }

}

