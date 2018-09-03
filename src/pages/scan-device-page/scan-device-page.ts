import { DeviceMainPage } from './../device-main-page/device-main-page';
import { LicensePage} from './../license/license';
import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, List } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { DeviceModel, AtmQuestionTypeModel } from '../../Models/ExportModelClass';
import { PCMChannelDataService } from '../../providers/pcm-channel-data-service';
import { Constants } from '../../shared/app.constant';
import { IOSetupPage } from '../io-setup-page/io-setup-page'
import { Idle } from '@ng-idle/core';
import { AtmAuthenticationTypeModel } from '../../Models/AtmAuthenticationModel';
import { Storage } from '@ionic/storage';
import { registerModuleFactory } from '@angular/core/src/linker/ng_module_factory_loader';
import { TimeoutDebouncer } from 'ionic-angular/umd/util/debouncer';

import { UtilsService } from '../../shared/utilsService';
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
  providers: [UtilsService]
})
export class ScanDevicePage {
  favorites = [];

  appVersion = Constants.values["app-version"];
  devices;
  splash = this.isSplashShown() ? false : true; //Make true if you want to recreate the new splash screen and uncomment in HTML
  isScanning;
  scanError;
  deviceObject: DeviceModel;
  characteristics;
  characteristicIDToUse = Constants.values.characteristicIDToUse;
  serviceUUID;
  characteristicId_;
  isChracteristicExist_v;
  intervalId;

  //test 
  value32test;
  testValArra;

  atmQuestionObjectList: Array<AtmQuestionTypeModel>;
  countAtmQList = 0;
  operation;

  atmAuthenticationTypeObject: AtmAuthenticationTypeModel;



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
    private ble: BLE, 
    public pcmchanneldataservice: PCMChannelDataService, 
    public alertCtrl: AlertController,
    public utilsService: UtilsService,
    private idle: Idle, private storage: Storage) {
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
    setTimeout(() => {
      this.scanDevices();
      this.splash = false;
    }, 4000);
  }

    /**
   * 
   * @event ionViewWillLeave - Event triggered when the page is about to leave to next page.  
  */
  ionViewWillLeave() {
    clearInterval(this.intervalId);
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
    //this.favorites = this.storage.get("favorites");
    this.favorites = []
    this.storage.get("favorites").then((result)=>{
      console.log("favorites contains:" + result);
      this.favorites = result;
    });

    this.devices = [];
    this.checkBluetoothEnabled();
    this.enableBluetooth();

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


  isSplashShown() {
    this.storage.get("isSplashShown").then((result)=>{
        if(result){
          return true;
        }
        else{
          this.storage.set("isSplashShown", true);
          return false;
        }
      });
  }


  /*
  used when refresher is triggered
  */
  doRefreshScan(refresher){
    this.scanDevices();
    refresher.complete();
  }

  /** 
   * This is used to scan the nearby devices. 
   */
  scanDevices() {
    //this.checkBluetoothEnabled();
    //this.enableBluetooth();

    this.isScanning = true;
    console.log(Constants.messages.scaningStarted);
    this.devices = [];

    this.ble.isConnected(this.pcmchanneldataservice.deviceIdGlobal)
    .then(
      () => { 
        console.log("connected in scan method");
        this.disconnectBle(this.pcmchanneldataservice.deviceIdGlobal);
      },
      () => { console.log("disconnected in scan method")}
    );

    // if (this.ble.isConnected) {
    //   this.disconnectBle();
    // }


    // this.ble.startScan([]).subscribe(device => {
    //   this.devices.push(device);
    // }, error => {
    //   this.scanError = JSON.stringify(error);
    //   alert(this.scanError);
    // });


    this.ble.scan([Constants.values.scandata],5).subscribe(
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
  }

  deviceFound(device){
      if(device.name !== undefined){
        //console.log("Found " + JSON.stringify(device,null,2));
        //var adData = new Uint8Array(device.advertising);
        //console.log("advert data:" + adData);
        //console.log("length:" + adData.length);

        //console.log("advert data:" + JSON.stringify(device.advertising));

        //var SERVICE_DATA_KEY = '0x02';
        var advertisingData = this.parseAdvertisingData(device.advertising);
        //var serviceData = advertisingData[SERVICE_DATA_KEY];
        //console.log("advert content:" + serviceData);

        console.log("### " + device.name + " ###");
        console.log(advertisingData);
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

  isConnected(deviceId){
    this.ble.isConnected(deviceId)
    .then(
      () => { console.log(deviceId + " connected!"); return true;},
      () => { console.log(deviceId + " disconnected!"); return false;}
    );
  }

  disconnectBle(deviceId) {
    this.enableBluetooth();
    this.ble.disconnect(deviceId).then(() => {
      console.log(deviceId + " disconnectBle method " + Constants.messages.disconnected);
    }).catch(error => {
      console.log(JSON.stringify(error));
    });
  }

  showDialog(message){
    alert(message);
  }

  /** 
  * Add device to bluetooth favorite list
  * @param {JSON} device - The device object has the device details
  */
  addToFavorites(device){
    var exists  = false;
    if(this.favorites != null){
      this.favorites.forEach(element => {
        if(element.name == device.name)
          exists = true;
      });
    }
    else 
      this.favorites = [];

    if(!exists){
      this.favorites.push(device);
      this.storage.set("favorites", this.favorites);
    }
  }

    /** 
  * remove device from bluetooth favorite list
  * @param {JSON} device - The device object has the device details
  */
  removeFromFavorites(device){
    this.favorites.splice(this.favorites.indexOf(device),1);
    this.storage.set("favorites", this.favorites);
  }

  startReadWithInterval(count:number = 0){
    count = Math.abs(count);
    let infinite = count == 0 ? true : false;


  }

  /** 
  * This is used to scan the near by devices.
  * @param {JSON} device - The device object has the device details
  */
  connectToDevice(device) {
    setTimeout(() => {
    this.ble.stopScan().then(() => {
      console.log(Constants.messages.scanningStopped);
      });
      this.isScanning = false;

    }, 100);

    //this.enableBluetooth();
    this.ble.isConnected(device.id)
    .then(
      () => { 
        console.log("# connected before connection try, disconnecting #");
        this.disconnectBle(device.id);
      },
      () => { console.log("# GOOD! you're disconnected before connection try #")}
    );

    this.utilsService.presentLoading(Constants.messages.connecting);

    console.log("trying to connect in connectToDevice: " + device.id);

    //setTimeout(()=>{
    //this.intervalId = setInterval(()=>{

    this.ble.connect(device.id).subscribe(deviceData => {
      clearInterval(this.intervalId);
      
      console.log("!!!!connected!!!!");
      // working with one characteristic - check if the characteristic exist in this device
      this.characteristics = deviceData.characteristics;

      console.log("characteristics: " + this.characteristics);
      this.isChracteristicExist_v = this.isCharacteristicExist();
      if (!this.isChracteristicExist_v) {
        console.log(Constants.messages.characteristicNotFound);
        this.utilsService.hideLoading();
        this.disconnectBle(device.id);
      }
      else {
        this.deviceObject = new DeviceModel(deviceData.name, deviceData.id, this.serviceUUID, deviceData.rssi, this.characteristicIDToUse);
        this.pcmchanneldataservice.deviceIdGlobal = this.deviceObject.deviceId;
        this.pcmchanneldataservice.deviceObjectGlobal = this.deviceObject;
        this.utilsService.hideLoading();
        // setTimeout(()=>{
        //   this.enterPasswordPrompt();
        // },100);
        this.initializeStartNotify();
        this.enterPasswordPrompt();
        
      }
    },
    error => {
      console.log(Constants.messages.errorConnect);
      this.utilsService.hideLoading();
      this.presentBleConnectionAlert(Constants.messages.bluetoothConnection, Constants.messages.bluetoothConnectionMessage);
      this.disconnectBle(device.id);
      //this.scanDevices();
    });
  //},1000);


    setTimeout(() => {
      this.ble.isConnected(device.id)
      .then(
        () => { 
          console.log("connected in connectToDevice method");
            if(!this.pcmchanneldataservice.passwordFlag && !this.pcmchanneldataservice.passwordPromt){
              console.log("pcmchanneldataservice.passwordPromt:" + this.pcmchanneldataservice.passwordPromt)
              this.disconnectBle(device.id);
          }
        },
        () => { console.log("disconnected in connectToDevice method")}
      );

      console.log("connect timeout");
      clearInterval(this.intervalId);
      this.utilsService.hideLoading();
    }, 4000);


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
   * This is a alert controller popup which helps the user set specific value
   * @param item - the item chosen from the list
   */
  enterPasswordPrompt() {
    this.pcmchanneldataservice.passwordDeviceSetupPageFlag = true;
    this.pcmchanneldataservice.passwordPromt = true;
    this.pcmchanneldataservice.alert = this.alertCtrl.create({
      title: Constants.messages.passwordTitle,
      subTitle: Constants.messages.passwordConnectSubTitle,
      enableBackdropDismiss: false,

      inputs: [
        {
          name: Constants.messages.value,
          placeholder: Constants.messages.passwordPlaceholder,
          type: 'password'
        }
      ],
      buttons: [
        {
          text: Constants.messages.apply,
          handler: data => {
            this.pcmchanneldataservice.passwordPromt = false;
            try {
              this.authenticatePassword(data.value);
            } catch (error) {
              console.log(JSON.stringify(error));
            } 

          }
        },
        {
          text: Constants.messages.cancel,
          handler: data => {
            this.pcmchanneldataservice.passwordPromt = false;
        
            clearInterval(this.intervalId);

            try {
              this.disconnectBle(this.pcmchanneldataservice.deviceIdGlobal);
            } catch (error) {
              console.log(JSON.stringify(error));
            }

          }

        }
      ]
    });
    this.pcmchanneldataservice.alert.present();

  }

    /**
 * In this method , the password is authenticated by sending it to PCM and getting the status (0 - true, 1 - false)
 * @param password - The password entered by the user
 */
  authenticatePassword(password) {
    //Data for authenticating password
    try {
      this.operation = Constants.values.authenticate;
      this.countAtmQList = 0;

      this.pcmchanneldataservice.passwordString = password;

      var arr = [];
      var byteArray = new Uint8Array(20);
      byteArray[0] = 8;
      byteArray[1] = 0;
      for (var i = 0; i < password.length; i++) {
        arr.push(password.charCodeAt(i));
        console.log(arr[i]);
        byteArray[i + 2] = arr[i]
      }

      // var byteArray = new Uint8Array([8, 0, 84, 104, 105, 115, 32, 105, 115, 32, 097, 32, 116, 101, 115, 116]);
      this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
      console.log(byteArray.buffer);
    } catch (error) {
      // only till we get the channels setup
      console.log(JSON.stringify(error));
    }

  }

  gotoLicensePage(){
    this.navCtrl.push(LicensePage);
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
    this.navCtrl.push(DeviceMainPage);

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
        console.log("isCharacteristicExist serviceUUID " + this.serviceUUID);
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


  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
        if (this.operation == Constants.values.authenticate) {
          console.log("startNotify authenticate")
          this.atmAuthenticationTypeObject = (new AtmAuthenticationTypeModel(new Uint8Array(buffer)));
  
          if (this.atmAuthenticationTypeObject.status == 0) {
            console.log("Works");
            this.pcmchanneldataservice.passwordFlag = true;
            this.pcmchanneldataservice.presentAlert(Constants.messages.passwordAuthHeader, Constants.messages.passwordAuthSubheaderSuccess);
            this.gotoDevicePage();
          }
          else {
            console.log("Not Working");
            this.pcmchanneldataservice.presentAlert(Constants.messages.passwordAuthHeader, Constants.messages.passwordAuthSubheaderFailure);
            this.disconnectBle(deviceId);
          }
        }


      }, error => {
        console.log(JSON.stringify(error));
      });

    } catch (error) {
      console.log(error)
    }
  }

}
