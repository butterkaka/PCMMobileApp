import { DeviceMainPage } from './../device-main-page/device-main-page';
import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { DeviceModel, AtmQuestionTypeModel } from '../../Models/ExportModelClass';
import { PCMChannelDataService } from '../../providers/pcm-channel-data-service';
import { Constants } from '../../shared/app.constant';
import { IOSetupPage } from '../io-setup-page/io-setup-page'

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
  connectedDevices = [];
  splash = true;
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
    private ble: BLE, public loadingController: LoadingController, public pcmchanneldataservice: PCMChannelDataService, public alertCtrl: AlertController) {
    this.devices = [
      { "name": "PCM device 1" },
      { "name": "PCM device 1" },
      { "name": "PCM device 1" }
    ];

    this.connectedDevices = [
      {name: "PCM beta: 934", id: "A0:E6:F8:C5:81:86", rssi: -51}
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

  ionViewDidEnter() {
    this.deviceObject = null;
     this.devices = [];
    this.enableBluetooth();
    setTimeout(() => {
      this.splash = false;
      this.scanDevices();
    }, 1000);
    this.pcmchanneldataservice.passwordDeviceSetupPageFlag = false;
     this.pcmchanneldataservice.passwordFlag = false;
     this.pcmchanneldataservice.mockData= false;
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

  /** 
   * This is used to scan the near by devices. 
   */
  scanDevices() {
    this.checkBluetoothEnabled();
    this.enableBluetooth();

    this.ble.isConnected(this.pcmchanneldataservice.deviceIdGlobal)
    .then(
      () => { console.log("connected in scan method")},
      () => { console.log("disconnected in scan method")}
    );

    this.isScanning = true;
    console.log(Constants.messages.scaningStarted);
    this.devices = [];


    this.ble.startScanWithOptions([], {reportDuplicates: false} ).subscribe(device => {
      this.connectedDevices.forEach(element => {
        this.disconnectBle(element.id);
      });
      this.devices.push(device);
      console.log(device);
    }, error => {
      this.scanError = JSON.stringify(error);
      alert(this.scanError);
    });

    setTimeout(() => {
      this.ble.stopScan().then(() => {
        console.log(Constants.messages.scanningStopped);
        //console.log(JSON.stringify(this.devices))
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

  disconnectBle(deviceId) {
    this.ble.disconnect(deviceId).then(() => {
      console.log(deviceId + " disconnectBle method " + Constants.messages.disconnected)
    }).catch(error => {
      console.log(JSON.stringify(error));
    });
  }


  isConnected(deviceId){
    this.ble.isConnected(deviceId)
    .then(
      () => { console.log(deviceId + " connected!"); return true;},
      () => { console.log(deviceId + " disconnected!"); return false;}
    );
  }

  /** 
  * This is used to scan the near by devices.
  * @param {JSON} device - The device object has the device details
  */
  connectToDevice(device) { 
    // setTimeout(() => {
    //   this.ble.stopScan().then(() => {
    //     console.log(Constants.messages.scanningStopped);
    //     this.isScanning = false;

    //   });
    // }, 500);

    this.enableBluetooth();
    let loader = this.loadingController.create({
      content: Constants.messages.connecting
    });

    console.log("trying to connect to: " + device.id);
    if(!this.isConnected(device.id)){
      // this.connectedDevices = [];
      // this.connectedDevices.push(device);
      loader.present();
      this.ble.connect(device.id).subscribe(deviceData => {
        console.log("!!!!connected!!!!");
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
          //this.presentBleConnectionAlert(Constants.messages.bluetoothConnection, Constants.messages.bluetoothConnectionMessage);
          loader.dismiss();
          this.disconnectBle(device.id);


          //New Anu test
          //this.navCtrl.pop();
          //this.navCtrl.push(ScanDevicePage);
          //this.pcmchanneldataservice.loaderGlobal.dismiss();
        });

      setTimeout(()=>{

        //this.disconnectBle(device.id);
        loader.dismiss();
        if(this.isConnected(device.id))
          this.disconnectBle(device.id);
        //this.scanDevices();
      },3000);
    }
    else
      this.disconnectBle(device.id);
    
    
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
            this.navCtrl.popTo(this.navCtrl.getByIndex(0));
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
    this.navCtrl.push(IOSetupPage,{ deviceObject: this.deviceObject ,ioSetupHeader:Constants.values.ioOverview});
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
