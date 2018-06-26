import { DeviceMainPage } from './../device-main-page/device-main-page';
import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, List } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { DeviceModel, AtmQuestionTypeModel } from '../../Models/ExportModelClass';
import { PCMChannelDataService } from '../../providers/pcm-channel-data-service';
import { Constants } from '../../shared/app.constant';
import { IOSetupPage } from '../io-setup-page/io-setup-page'
import { Idle } from '@ng-idle/core';
import { AtmAuthenticationTypeModel } from '../../Models/AtmAuthenticationModel';
/**
 * Generated class for the ScanDevicePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 * created by jkm5kor 05-05-2017
 */
@Component({
  selector: 'page-scan-device-page',
  templateUrl: 'scan-device-page.html',
})
export class ScanDevicePage {

  devices;
  splash = false; //Make true if you want to recreate the new splash screen and uncomment in HTML
  isScanning;
  scanError;
  deviceObject: DeviceModel;
  characteristics;
  characteristicIDToUse = Constants.values.characteristicIDToUse;
  serviceUUID;
  characteristicId_;
  isChracteristicExist_v;

  //test 
  value32test;
  testValArra;

  atmQuestionObjectList: Array<AtmQuestionTypeModel>;
  countAtmQList = 0;
  operation;



  /**
 * ScanDevicePage Constructor.
 * @constructor
 * @param navCtrl NavController for navigation
 * @param navParams NavParams paremters from previous component
 * @param ble BLE object injected for Bluetooth Low Energy 
 * @param loadingController LoadingController for UI
 * @param pcmchanneldataservice PCMChannelDataService
 */
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private ble: BLE, public loadingController: LoadingController, public pcmchanneldataservice: PCMChannelDataService, public alertCtrl: AlertController,
    private idle: Idle) {
    this.devices = [
      { "name": "PCM device 1" },
      { "name": "PCM device 1" },
      { "name": "PCM device 1" }
    ];

  }

  /** 
  * This is the enable the bluwtooth - works only in Android
  */
  enableBluetooth() {
    this.ble.enable().then(() => {
      console.log("Enabled bluetooth for Android devices")
    }).catch(error => {
      console.log(JSON.stringify(error));
    });
  }

  /** 
  * @event ionViewDidLoad event for ScanDevicePage
  */
  ionViewDidLoad() {
    //  this.enableBluetooth();
    //     setTimeout(() => {
    //       this.splash = false;
    //       this.scanDevices();
    //     }, 1000);

  }

  ionViewDidLeave() {
    this.devices = [];
  }

  stopIdleTimer() {
    if (this.idle.isRunning()) {
      this.idle.onIdleEnd.unsubscribe();
      this.idle.onTimeout.unsubscribe();
      this.idle.onIdleStart.unsubscribe();
      this.idle.onTimeoutWarning.unsubscribe();
      this.idle.clearInterrupts
      this.idle.stop();
    }
  }

  ionViewDidEnter() {
    // this.stopIdleTimer();
    this.devices = [];
    this.enableBluetooth();
    // setTimeout(() => {
    //   this.splash = false;
    //   this.scanDevices();
    // }, 3000);
    this.scanDevices();
    this.pcmchanneldataservice.passwordDeviceSetupPageFlag = false;
    this.pcmchanneldataservice.passwordFlag = false;
    this.pcmchanneldataservice.mockData = false;
    this.pcmchanneldataservice.passwordString = "";
  }
  /** 
* This is a workaround for start notifier first value not considered
*/
  initializeStartNotify() {
    this.operation = Constants.values.initializeStartNotify;
    this.startNotify(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId);
    // workaround for notifier
    this.atmQuestionObjectList = []
    var byteArray = new Uint8Array([0, 0, 0, 0, 0, 0]);
    this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
  }


  /*
  used when refresher is triggered
  */
  doRefreshScan(refresher){
    this.scanDevices();
    refresher.complete();
  }

  /** 
   * This is used to scan the near by devices. 
   */
  scanDevices() {
    this.checkBluetoothEnabled();

    this.isScanning = true;
    console.log(Constants.messages.scaningStarted);
    this.devices = [];

    // this.ble.startScan([]).subscribe(device => {
    //   this.devices.push(device);
    // }, error => {
    //   this.scanError = JSON.stringify(error);
    //   alert(this.scanError);
    // });

    this.ble.scan([],5).subscribe(
      device => { this.deviceFound(device) }, 
      error => {
        this.scanError = JSON.stringify(error);
        alert(this.scanError);

      }
    );



    setTimeout(() => {
      this.ble.stopScan().then(() => {
        console.log(Constants.messages.scanningStopped);
        //console.log(JSON.stringify(this.devices));
        this.devices.forEach(element => {
          if(element.name !== undefined){
            //var advertisedServiceUUIDs = device.advertisementData.kCBAdvDataServiceUUIDs
          //console.log(element.name);
          //console.log(element.advertising);
          }
        });

        this.isScanning = false;

      });
    }, 3000);

    // // Test Data For working with Browser
    // this.devices = [
    //   {"name":"PCM Device 1"},
    //   {"name":"TCM Device 2"},
    //   {"name":"PCM Device 3"},
    //   {"name":""},
    //   {"name":"PCM Device 4"}
    // ];     

    // setTimeout(() => {
    //   this.isScanning = false;
    // }, 3000);
  }

  deviceFound(device){
      if(device.name !== undefined){
        console.log("Found " + JSON.stringify(device,null,2));
        var adData = new Uint8Array(device.advertising);
        console.log("advert data:" + adData);
        console.log("length:" + adData.length);
        //console.log("advert data:" + JSON.stringify(device.advertising));

        var SERVICE_DATA_KEY = '0x02';
        var advertisingData = this.parseAdvertisingData(device.advertising);
        var serviceData = advertisingData[SERVICE_DATA_KEY];
        //console.log("advert content:" + serviceData);

        console.log(this.bytesToString(serviceData));
        
        this.devices.push(device);
    }
  }

  bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}
  

  parseAdvertisingData(buffer) {
    var length, type, data, i = 0, advertisementData = {};
    var bytes = new Uint8Array(buffer);

    while (length !== 0) {
        length = bytes[i] & 0xFF;
        i++;
        // decode type constants from https://www.bluetooth.org/en-us/specification/assigned-numbers/generic-access-profile
        type = bytes[i] & 0xFF;
        i++;
        data = bytes.slice(i, i + length - 1).buffer; // length includes type byte, but not length byte
        i += length - 2;  // move to end of data
        i++;
        advertisementData[this.asHexString(type)] = data;
    }

    return advertisementData;
}

asHexString(i) {
  var hex;

  hex = i.toString(16);

  // zero padding
  if (hex.length === 1) {
      hex = "0" + hex;
  }

  return "0x" + hex;
}

  /** 
 * This is used tocheck if the bluetooth is enabled or not
 */
  checkBluetoothEnabled() {
    this.ble.isEnabled().then(data => {
      console.log(JSON.stringify(data));
    }).catch(error => {
      console.log(JSON.stringify(error));
      // this.showAlert("checkBluetoothEnabled", JSON.stringify(error));
    });
  }

  /** 
  * This is used for custom alert controller
  * @param {JSON} header - Title
  * @param {JSON} subHeader - Subtitle 
  */
  showAlert(title_, subTitle_) {
    let alert = this.alertCtrl.create({
      title: title_,
      subTitle: subTitle_,
      buttons: [
        {
          text: Constants.messages.ok,
          handler: data => {
            alert = null;
            this.enableBluetooth();
          }
        }]
    });
    alert.present();
  }

  /** 
  * This is used to scan the near by devices.
  * @param {JSON} device - The device object has the device details
  */
  connectToDevice(device) {
    this.enableBluetooth();
    let loader = this.loadingController.create({
      content: Constants.messages.connecting
    });
    loader.present();

    this.ble.connect(device.id).subscribe(deviceData => {
      // if (this.ble.isConnected(device.id)) 

      // working with one characteristic - check if the characteristic exist in this device
      this.characteristics = deviceData.characteristics;
      this.isChracteristicExist_v = this.isCharacteristicExist();
      if (!this.isChracteristicExist_v) {
        console.log(Constants.messages.characteristicNotFound);
        loader.dismiss();
      }
      else {
        this.deviceObject = new DeviceModel(deviceData.name, deviceData.id, this.serviceUUID, deviceData.rssi, this.characteristicIDToUse);
        this.pcmchanneldataservice.deviceIdGlobal = this.deviceObject.deviceId;
        this.pcmchanneldataservice.deviceObjectGlobal = this.deviceObject;
        loader.dismiss();
        this.initializeStartNotify();

        this.gotoDevicePage();
      }


    },
      error => {
        console.log(Constants.messages.errorConnect);
        loader.dismiss();
        // this.presentBleConnectionAlert(Constants.messages.bluetoothConnection, Constants.messages.bluetoothConnectionMessage);
        this.scanDevices();

      });

    setTimeout(() => {
      if (!this.ble.isConnected) {
        this.ble.disconnect(device.id);
      }
      loader.dismiss();
      this.scanDevices();

    }, 10000);


    //Test Data For UI Testing

    // let loader = this.loadingController.create({
    //   content: "Connecting"
    // });
    // loader.present();

    //  setTimeout(() => {
    //    loader.dismiss();
    // }, 3)

    // this.deviceObject = new DeviceModel("PCM 1234567", "my id", "service ID", "rssi", " characteristicId_");  
    // this.pcmchanneldataservice.deviceObjectGlobal = this.deviceObject;
    // this.gotoDevicePage();
  }



  /** 
   * This is used to navigate to the DevicePage. 
   */
  gotoDevicePage() {
    // this.atmQuestionObjectList.forEach(element => {
    // console.log('gotoDevicePage entered' );
    // if (element.channel == Constants.channels.authenticationChannel && element.subChannel == Constants.channels.authenticationsubchannel) {
    //   console.log('element val:' + element.value16Bit);
    //   //Set for test. When channel and subchannel set remove it
    //   element.value16Bit = 0;
    //   if (element.value16Bit == 0) {
    this.pcmchanneldataservice.isIOOverViewMock = false;
    this.navCtrl.push(DeviceMainPage)

    //   }

    //   else {
    //     this.pcmchanneldataservice.presentAlert(Constants.messages.authenticationFailureTitle, Constants.messages.authenticationFailureSubtitle);
    //   }
    //   this.pcmchanneldataservice.alert.dismiss();
    // }
    // });

    // //onky for testing purposes
    //     this.pcmchanneldataservice.isIOOverViewMock = false;
    //       this.navCtrl.push(DeviceMainPage)
    //////////////////////////////////////////////////
  }


  /** 
    *This is used to check if the characteristic exist in the BLE device and also to get the serviceUUID.
    *@returns isExist true if characteristic exist also assign serviceUUID
  */
  isCharacteristicExist() {
    var isExist = false;
    this.characteristics.forEach(element => {
      if (element.characteristic.toUpperCase() == this.characteristicIDToUse.toUpperCase()) {
        this.serviceUUID = element.service;
        isExist = true;
      }
    });
    return isExist;
  }

  /** 
    *This is used to presentBleConnectionAlert
    *@param {string} header
    *@param {string} subHeader  
  */
  presentBleConnectionAlert(header, subHeader) {
    this.pcmchanneldataservice.alert = this.alertCtrl.create({
      title: header,
      subTitle: subHeader,
      enableBackdropDismiss: false,
      buttons: [
        {
          text: Constants.messages.ok,
          handler: data => {
            this.pcmchanneldataservice.alert = null;
            if (this.navCtrl.getActive().name != "ScanDevicePage") {
              this.navCtrl.popToRoot();
              console.log("not ScanDevicePage")
            }

          }
        }]
    });
    this.pcmchanneldataservice.alert.present();
  }


  // Test(){
  //   this.value32test =17;
  //   let i=0;
  //   let val;
  //   this.testValArra = [];
  //   for(i=0;i<32;i++){
  //       val = this.value32test & Math.pow(2,i);
  //       if(val!=0){
  //       this.testValArra.push(i+1);
  //       }
  //   }
  // }

  /** 
   *This is used to provide mock data for IOOverview   
 */
  IOOverviewMokDataConnect() {

    this.pcmchanneldataservice.isIOOverViewMock = true;

    this.pcmchanneldataservice.passwordDeviceSetupPageFlag = true;
    this.pcmchanneldataservice.passwordFlag = true;
    this.pcmchanneldataservice.mockData = true;
    this.pcmchanneldataservice.passwordString = "";
    this.pcmchanneldataservice.temperatureDisplayUnit = Constants.values.CelsiusUnitValue;
    this.pcmchanneldataservice.pressureDisplayUnit = Constants.values.BarUnitValue;


    this.deviceObject = new DeviceModel(Constants.messages.PCMMockName, Constants.messages.PCMMockID, Constants.messages.PCMMockServiceID,
      Constants.messages.PCMMockrssi, Constants.messages.PCMMockCharacteristicId);
    this.pcmchanneldataservice.deviceObjectGlobal = this.deviceObject;
    this.gotoIOSetupPageMock();

  }

  /** 
   *This is used to provide mock data for IOOverview   
  */
  gotoIOSetupPageMock() {
    this.navCtrl.push(IOSetupPage, { deviceObject: this.deviceObject, ioSetupHeader: Constants.values.ioOverview });
  }



  /** 
  * This is used to write value to device.
  * @param {string} deviceID - The device details
  * @param {string} serviceID - The device details
  * @param {string} characteristicID - The device details
  * @param {ArrayBuffer} value - The device details
  */
  write(deviceID, serviceID, characteristicID, value) {
    // this.gotoDevicePage();
    console.log(value);
    this.ble.writeWithoutResponse(deviceID, serviceID, characteristicID, value).then(
      result => {
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

    try {
      this.ble.startNotification(deviceId, serviceUUID, characteristic).subscribe(buffer => {
        console.log("Test");
      }, error => {
        console.log(JSON.stringify(error));
      });

    } catch (error) {
      console.log(error)
    }
  }

}
