import { AtmAuthenticationTypeModel } from './../../Models/AtmAuthenticationModel';
import { DeviceSetupPage } from './../device-setup-page/device-setup-page';
import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { DeviceModel, AtmQuestionTypeModel } from '../../Models/ExportModelClass';
import { BLE } from '@ionic-native/ble';
import { PCMChannelDataService } from '../../providers/pcm-channel-data-service'
import { Constants } from '../../shared/app.constant';
import { Storage } from '@ionic/storage';
import { Idle } from '@ng-idle/core';
import { LiveGraphPage } from './../live-graph-page/live-graph-page';
// import { Keepalive } from '@ng-idle/keepalive';

/**
 * Generated class for the DeviceMainPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-device-main-page',
  templateUrl: 'device-main-page.html',
})
export class DeviceMainPage {

  runValue;
  pointValue: number = 0;
  pressureValue: any = '-';
  swashAngleValue: any = '-';
  deviceObject: DeviceModel;
  firmwareVersion = '0.0.0';

  atmQuestionObjectList: Array<AtmQuestionTypeModel>;
  atmAuthenticationTypeObject: AtmAuthenticationTypeModel;
  countAtmQList = 0;
  isFlashing: boolean = false;
  custColor = Constants.values.green;
  deviceName: string;
  intervalId;
  operation;
  pressureSiValue;
  swashAngleSiValue: any = "%";
  flagOut = false;
  blinkToggleName = "Start Blink";
  blinkToggleFlag: boolean = false;
  pressureUnitVal;
  temperatureUnitVal;
  pressureFlag: boolean = false;
  swashAngleFlag: boolean = false;
  headerLabel = "Main page";
  /**
   * DeviceMainPage Constructor.
   * @constructor
   * @param navCtrl NavController for navigation
   * @param navParams NavParams paremters from previous component
   * @param ble BLE object injected for Bluetooth Low Energy 
   * @param pcmchanneldataservice PCMChannelDataService for UI 
   * @param changeDetect ChangeDetectorRef
   */
  constructor(public navCtrl: NavController, public navParams: NavParams, private ble: BLE, public pcmChannelDataservice: PCMChannelDataService,
    public changeDetect: ChangeDetectorRef, private storage: Storage, public pcmchanneldataservice: PCMChannelDataService, public alertCtrl: AlertController,
    private idle: Idle) {
    //this.deviceObject = navParams.get(Constants.values.deviceObject);
    this.deviceObject = this.pcmChannelDataservice.deviceObjectGlobal;
    this.deviceName = this.deviceObject.deviceName;
  }


  /** 
  * @event ionViewDidLoad PageLoad Event  
  */
  ionViewDidLoad() {
    //console.log('ionViewDidLoad DeviceMainPage');
    //this.readDeviceMainPageParameters();
    this.idle.watch();
  }

  /** 
  * @event ionViewDidEnter  
  */
  ionViewDidEnter() {

    this.getSavedDisplaySiValue();
    this.initializeStartNotify();
    this.readDeviceMainPageParameters();

    this.flagOut = false;
    this.setTimeoutForViewUpdate();
    this.startReadDeviceMainPageParameters();


  }
  /**
   * Runs when the page is about to leave and no longer be the active page.  
   * @event ionViewWillLeave 
  */
  ionViewWillLeave() {
    clearInterval(this.intervalId);
    this.flagOut = true;
    this.stopBlink();

  }
  /** 
    *This is to update the view 
    */
  setTimeoutForViewUpdate() {

    // workaround to update the view for asynchronous update / rareley it doesint update the view to make sure update works this will be called twice
    setTimeout(() => {
      this.changeDetect.detectChanges();
    }, 200);
    setTimeout(() => {
      this.changeDetect.detectChanges();
    }, 300);
    //  setTimeout(() => {
    //   this.cd.detectChanges();
    // },400);   
  }

  getSavedDisplaySiValue() {

    this.storage.get('pressure').then((val) => {
      if (val == null) {
        this.storage.set('pressure', Constants.values.BarUnitValue);
        val = Constants.values.BarUnitValue;
      }
      this.pressureUnitVal = val;
      console.log('pressure is', val);

      this.pcmchanneldataservice.pressureDisplayUnit = this.pressureUnitVal;

      if (Constants.values.BarUnitValue == this.pressureUnitVal) {
        this.pressureSiValue = 'Bar';
      } else if (Constants.values.MpaUnitValue == this.pressureUnitVal) {
        this.pressureSiValue = 'Mpa';
      } else if (Constants.values.PsiUnitValue == this.pressureUnitVal) {
        this.pressureSiValue = 'Psi';
      }
      console.log('getSavedDisplaySiValue name pressure is', this.pressureSiValue);
      this.changeDetect.detectChanges();
    });

    this.storage.get('temperature').then((val) => {
      if (val == null) {
        this.storage.set('temperature', Constants.values.CelsiusUnitValue);
        val = Constants.values.CelsiusUnitValue;
      }
      this.temperatureUnitVal = val;
      this.pcmchanneldataservice.temperatureDisplayUnit = this.temperatureUnitVal;
      console.log('getSavedDisplaySiValue val Temperature is', val);
    });


  }
  /** 
  * This is used to navigate to DeviceSetupPage
  */
  launchDeviceSetupPage() {
    this.navCtrl.push(DeviceSetupPage, { deviceObject: this.deviceObject });
  }

  /** 
 * This is used to navigate to Alarm Log page
 */
  navigateToAlarmLog() {
    this.navCtrl.push("AlarmLogPage", { deviceObject: this.deviceObject });

  }
  /**
 * On click of Nav bar settings button, navigate to Settings page
 */
  navigateToSettings() {
    this.navCtrl.push("SettingsPage", { deviceObject: this.deviceObject, firmwareVersion: this.firmwareVersion });
  }

  navigateToLiveGraph(){
    this.navCtrl.push("LiveGraphPage", { deviceObject: this.deviceObject });
  }


  readDeviceMainPageParameters() {
    this.operation = Constants.values.read;
    this.countAtmQList = 0;

    this.atmQuestionObjectList = [];
    let deviceParameterList = PCMChannelDataService.getInputDetailsDeviceMainPage();

    deviceParameterList.forEach(element => {
      var byteArray = new Uint8Array([element.rType, 0, element.channel, element.subchannel, 0, 0]);
      this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
    });
  }

  /** 
 * This is a workaround for start notifier first value not considered
 */
  initializeStartNotify() {
    this.startNotify(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId);
    // workaround for notifier
    var byteArray = new Uint8Array([0, 0, 0, 0, 0, 0]);
    this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
  }

  /** 
 * This is used to navigate to Alarm Log page
 */
  startReadDeviceMainPageParameters() {

    if (this.isFlashing) {
      this.stopBlink();
    }

    this.intervalId = setInterval(() => {
      this.readDeviceMainPageParameters();
      //console.log("readDeviceMainPageParameters");          
    }, 500);

  }

  /** 
 * This is used to navigate to Alarm Log page
 */
  stopReadDeviceMainPageParameters() {
    clearInterval(this.intervalId);
  }





  /** 
  * This is used to write value to device.
  * @param {string} deviceID - The device details
  * @param {string} serviceID - The device details
  * @param {string} characteristicID - The device details
  * @param {ArrayBuffer} value - The device details
  */
  write(deviceID, serviceID, characteristicID, value) {

    this.ble.writeWithoutResponse(deviceID, serviceID, characteristicID, value).then(
      result => {
      }).catch(error => {
        console.log(JSON.stringify(error));
      });
  }

  /** 
  * This is used for going back to the previous page
  */
  back() {
    this.disconnectBle(this.deviceObject.deviceId);
    this.navCtrl.pop();
  }

  /** 
  * This is used for disconnecting the ble
  */
  disconnectBle(deviceId) {
    this.ble.disconnect(deviceId).then(() => {
      console.log(deviceId + " disconnectBle method " + Constants.messages.disconnected);
    }).catch(error => {
      console.log(JSON.stringify(error));
    });
  }


  /** 
  * This is used to start the notify listener for the characteristic
  * @param {string} deviceID - The device details
  * @param {string} serviceID - The device details
  * @param {string} characteristicID - The device details  
  */
  startNotify(deviceId, serviceUUID, characteristic) {
    this.ble.startNotification(deviceId, serviceUUID, characteristic).subscribe(buffer => {

      if (this.operation == Constants.values.read) {
        this.atmQuestionObjectList.push(new AtmQuestionTypeModel(new Uint8Array(buffer)));
        this.countAtmQList++;
        //console.log("count : "+this.countAtmQList);
        if (this.countAtmQList == 7) {
          this.setParameterValuesToUI();

        }
      }
    }, error => {
      console.log(JSON.stringify(error));
    })
  }


  /** 
 * This is used to SetParameter  Values to the UI  
 */
  setParameterValuesToUI() {
    try {
      this.atmQuestionObjectList.forEach(element => {
        //console.log("setParameterValuesToUI called");

        if (element.channel == Constants.channels.standaloneSettingsChannel && element.subChannel == Constants.channels.firmwareVersion) {

          try {
            this.firmwareVersion = element.value32Bit1 + '.' + element.value32Bit2 + '.' + element.value32Bit3;
            console.log('firmwareVersion:' + this.firmwareVersion);
          } catch (error) {
            console.log('firmwareVersion error:' + error);
            this.firmwareVersion = element.value1.toString() + '.' + element.value2.toString() + '.' + element.value3.toString();
          }
          // this.firmwareVersion = element.value1.toString() + '.' + element.value2.toString() + '.' + element.value3.toString();

        } else if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.pressureRegSubChannel) {
          this.pressureFlag = (element.value32Bit1 == 1) ? true : false;
          console.log('pressureFlag:' + this.pressureFlag);
        } else if (element.channel == Constants.channels.standaloneSettingsChannel && element.subChannel == Constants.channels.sswashAngleSubChannel) {
          this.swashAngleFlag = (element.value32Bit1 == 1) ? true : false;
          console.log('swashAngleFlag:' + this.swashAngleFlag);
        }
        else if (element.channel == Constants.channels.standaloneSettingsChannel && element.subChannel == Constants.channels.setPointSubChannel) {
          this.pointValue = element.value32Bit1 / 100;
          console.log('setpointValue:' + this.pointValue);
        } else if (element.channel == Constants.channels.standaloneSettingsChannel && element.subChannel == Constants.channels.pressureSubChannel) {
          if (this.pcmchanneldataservice.pressureDisplayUnit == Constants.values.MpaUnitValue) {
            console.log('entered MpaUnitValue');
            this.pressureValue = ((element.value32Bit1 / 1000) * 0.1)
          }
          else if (this.pcmchanneldataservice.pressureDisplayUnit == Constants.values.PsiUnitValue) {
            console.log('entered PsiUnitValue');
            this.pressureValue = ((element.value32Bit1 / 1000) * 14.5038);
          } else {
            7
            this.pressureValue = element.value32Bit1 / 1000;
          }
          console.log('pressureValue:' + this.pressureValue);
        } else if (element.channel == Constants.channels.standaloneSettingsChannel && element.subChannel == Constants.channels.swashAngleSubChannel) {
          this.swashAngleValue = element.value32Bit1 / 100;
          console.log('swashAngleValue:' + this.swashAngleValue);
        }

        else if (element.channel == Constants.channels.standaloneSettingsChannel && element.subChannel == Constants.channels.runModeSubChannel) {
          let val = element.value32Bit1;
          if (val == 0) {
            this.runValue = Constants.values.stop;
          } else if (val == 1) {
            this.runValue = Constants.values.run;
          } else if (val == 2) {
            this.runValue = Constants.values.runService;
          } else if (val == 3) {
            this.runValue = Constants.values.alarm;
          } else if (val == 4) {
            this.runValue = Constants.values.quickstop;
          }
        }

      });
      this.changeDetect.detectChanges();

    } catch (error) {
      console.log('setParameterValuesToUI catch error', error)
    }

  }


  /**
   * TO toggle between blink and stop blink 
   */

  blinkToggle() {
    if (!this.blinkToggleFlag) {
      this.blinkToggleName = "Stop Blink"
      this.startBlink();
    }
    else {
      this.blinkToggleName = "Start Blink"
      this.stopBlink();
    }
    this.blinkToggleFlag = !this.blinkToggleFlag;
    this.changeDetect.detectChanges();
  }

  /** 
  * This is used to Start Blinking the device
  */
  startBlink() {
    this.countAtmQList = 0;
    this.isFlashing = true;
    this.operation = Constants.values.blink;

    this.stopReadDeviceMainPageParameters();

    this.atmQuestionObjectList = [];
    this.blink();
    // this will continue until the clearInterval called
    this.intervalId = setInterval(() => {
      console.log("blink thread");
      if (this.blink()) {
        clearInterval(this.intervalId);
      }

    }, 3000);
  }

  blink() {
    //Data for Flashing Led
    let channel = 44;
    let subChannel = 0;
    let wType = 3;
    var byteArray = new Uint8Array([wType, 0, channel, subChannel, 0, 0]);
    let isFinished = false;

    if (this.isFlashing) {
      this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
      console.log(this.isFlashing);
    } else {
      subChannel = 1;
      var byteArray = new Uint8Array([wType, 0, channel, subChannel, 0, 0]);
      this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
      isFinished = true;
    }

    return isFinished;
  }

  /** 
  *  This is used to Stop Blinking the device
  */
  stopBlink() {
    clearInterval(this.intervalId);
    this.isFlashing = false;
    let channel = 44;
    let subChannel = 1;
    let wType = 3;
    var byteArray = new Uint8Array([wType, 0, channel, subChannel, 0, 0]);
    this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);

    if (!this.flagOut) {
      this.startReadDeviceMainPageParameters();
    }
    console.log(this.isFlashing);
  }

  /** 
  *  This is used to Stop Blinking the device
  */
  swipeEvent($event) {
    this.disconnectBle(this.deviceObject.deviceId);
  }



}
