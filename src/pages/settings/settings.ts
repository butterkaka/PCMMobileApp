import { LicensePage} from './../license/license';
import { Component, ChangeDetectorRef } from '@angular/core';
import { Constants } from './../../shared/app.constant';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { PCMChannelDataService } from '../../providers/pcm-channel-data-service';
import { DeviceModel } from '../../Models/ExportModelClass';
import { Storage } from '@ionic/storage';
import { AtmAuthenticationTypeModel } from './../../Models/AtmAuthenticationModel';
import { BLE } from '@ionic-native/ble';

/**
 * Generated class for the SettingsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  temperature = "1";
  pressure = "3";
  rotationalSpeed = "6";
  volume = "7";
  flow = "8";
  temperatureDropdownList;
  pressureDropdownList;
  rotationalSpeedDropdownList;
  volumeUnitDropdownList;
  flowDropdownList;
  swashAngleDropdownList;

  writeStatus;
  deviceName = "";
  appVersion = "";
  deviceObject: DeviceModel;

  operation = "";
  atmAuthenticationTypeObject: AtmAuthenticationTypeModel;

  constructor(public navCtrl: NavController, public navParams: NavParams, public pcmchanneldataservice: PCMChannelDataService, private ble: BLE,
    public alertCtrl: AlertController, public pcmChannelDataservice: PCMChannelDataService, private storage: Storage, private cd: ChangeDetectorRef) {
    // this.firmwareVersion = navParams.get("firmwareVersion");
    this.deviceObject = this.pcmChannelDataservice.deviceObjectGlobal;
    this.deviceName = this.deviceObject.deviceName;
    this.appVersion = "2.11";
    this.writeStatus = this.pcmchanneldataservice.passwordFlag;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

  ionViewDidEnter() {
    this.initializeStartNotify();
    this.temperatureDropdownList = PCMChannelDataService.getAnalogDisplayUnitDropdownList(Constants.values.CelsiusUnitValue);
    this.pressureDropdownList = PCMChannelDataService.getAnalogDisplayUnitDropdownList(Constants.values.BarUnitValue);
    this.rotationalSpeedDropdownList = PCMChannelDataService.getAnalogDisplayUnitDropdownList(Constants.values.RpmUnitValue);
    this.volumeUnitDropdownList = PCMChannelDataService.getAnalogDisplayUnitDropdownList(Constants.values.LUnitValue);
    this.flowDropdownList = PCMChannelDataService.getAnalogDisplayUnitDropdownList(Constants.values.LPerMinUnitValue);
    this.storage.get('temperature').then((val) => {
      if (val == null) {
        this.storage.set('temperature', Constants.values.CelsiusUnitValue);
        val = Constants.values.CelsiusUnitValue;
      }
      this.temperature = val;
      console.log('ionViewDidEnter Temperature is', val);

    });

    this.storage.get('pressure').then((val) => {
      if (val == null) {
        this.storage.set('pressure', Constants.values.BarUnitValue);
        val = Constants.values.BarUnitValue;
      }
      this.pressure = val;
      console.log('ionViewDidEnter pressure is', val);

    });

  }

  /**
   * This is a alert controller popup which helps the user change password
   */
  passwordChangePrompt() {
    if (this.pcmchanneldataservice.passwordFlag) {
      this.pcmchanneldataservice.alert = this.alertCtrl.create({
        title: Constants.messages.newPasswordTitle,
        subTitle: Constants.messages.newPasswordSubTitle,
        inputs: [
          {
            name: 'oldPassword',
            placeholder: Constants.messages.passwordPlaceholder,
            type: 'password'
          }, {
            name: 'newPassword',
            placeholder: Constants.messages.newPasswordPlaceholder,
            type: 'password'
          }, {
            name: 'newPasswordCheck',
            placeholder: Constants.messages.newPasswordConfirmationPlaceholder,
            type: 'password'
          }
        ],
        buttons: [
          {
            text: Constants.messages.apply,
            handler: data => {

              try {
                this.newPasswordCheck(data.oldPassword, data.newPassword, data.newPasswordCheck);
                // this.pcmchanneldataservice.presentAlert(Constants.messages.saveParameters, Constants.messages.paramSavedSuccessfully)
              } catch (error) {
                console.log(JSON.stringify(error));
              }

            }
          },
          {
            text: Constants.messages.cancel,

          }
        ]
      });
      this.pcmchanneldataservice.alert.present();
    } else this.pcmchanneldataservice.presentAlert(Constants.messages.passwordAuthHeader, Constants.messages.noPasswordSubheader);
  }


  saveDisplaySettings() {
    this.storage.set('temperature', this.temperature);
    this.storage.set('pressure', this.pressure);
    this.pcmchanneldataservice.pressureDisplayUnit = this.pressure;
    this.pcmchanneldataservice.temperatureDisplayUnit = this.temperature;
    console.log('saveDisplaySettings ', 'temperature:', this.temperature, ' pressure:', this.pressure)
    this.pcmchanneldataservice.presentAlert(Constants.messages.saveParameters, Constants.messages.paramSavedSuccessfully)
  }


  /** 
       *This is to navigate to Previous Page
   */
  back() {
    this.navCtrl.pop();
  }


  /** 
* This is a workaround for start notifier first value not considered
*/
  initializeStartNotify() {
    this.operation = Constants.values.initializeStartNotify;
    this.startNotify(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId);
    // workaround for notifier
    var byteArray = new Uint8Array([0, 0, 0, 0, 0, 0]);
    this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
  }

  /** 
  * This is used to start the notify listener for the characteristic
  * @param {string} deviceID - The device details
  * @param {string} serviceID - The device details
  * @param {string} characteristicID - The device details  
  */
  startNotify(deviceId, serviceUUID, characteristic) {
    this.ble.startNotification(deviceId, serviceUUID, characteristic).subscribe(buffer => {

      if (this.operation == Constants.values.initializeStartNotify) {
        console.log("startNotify initialized");

      }
      else if (this.operation == Constants.values.authenticate) {
        console.log("startNotify authenticate")
        this.atmAuthenticationTypeObject = (new AtmAuthenticationTypeModel(new Uint8Array(buffer)));

        if (this.atmAuthenticationTypeObject.status == 0) {
          console.log("authenticate Works");
          this.pcmchanneldataservice.passwordFlag = true;
          this.writeStatus = true;
          this.cd.detectChanges();
          this.pcmchanneldataservice.presentAlert(Constants.messages.passwordAuthHeader, Constants.messages.passwordAuthSubheaderSuccess);
        }

        else {
          console.log("authenticate Not Working");
          this.pcmchanneldataservice.presentAlert(Constants.messages.passwordAuthHeader, Constants.messages.passwordAuthSubheaderFailure);
        }
      }
      else if (this.operation == Constants.values.newPassword) {
        console.log("startNotify newPassword")
        this.atmAuthenticationTypeObject = (new AtmAuthenticationTypeModel(new Uint8Array(buffer)));

        if (this.atmAuthenticationTypeObject.status == 0) {
          console.log("newPassword Works");
          this.cd.detectChanges();
          this.pcmchanneldataservice.presentAlert(Constants.messages.passwordAuthHeader, Constants.messages.newPasswordSubheaderSuccess);
        }
        else {
          console.log("newPassword Not Working");
          this.pcmchanneldataservice.presentAlert(Constants.messages.passwordAuthHeader, Constants.messages.newPasswordSubheaderFailure);
        }
      } else if (this.operation == Constants.values.deAuthenticate) {
        console.log("startNotify deAuthenticate")
        this.atmAuthenticationTypeObject = (new AtmAuthenticationTypeModel(new Uint8Array(buffer)));

        if (this.atmAuthenticationTypeObject.status == 0) {
          console.log("deAuthenticate Works");
          this.pcmchanneldataservice.passwordFlag = false;
          this.writeStatus = false;
          this.pcmchanneldataservice.passwordString = "";
          this.cd.detectChanges();
          this.pcmchanneldataservice.presentAlert(Constants.messages.passwordAuthHeader, Constants.messages.passworddeauthSubheaderSuccess); // Anu
        }
        else {
          console.log("deAuthenticate Not Working");
          this.pcmchanneldataservice.presentAlert(Constants.messages.passwordAuthHeader, Constants.messages.passworddeuthSubheaderFailure); // Anu
        }
      } else if (this.operation == Constants.values.numberChangePCM) {
        console.log("startNotify number Change PCM");
        this.atmAuthenticationTypeObject = (new AtmAuthenticationTypeModel(new Uint8Array(buffer)));

        if (this.atmAuthenticationTypeObject.status == 0) {
          console.log("numberChangePCM Works");
          this.cd.detectChanges();
          this.pcmchanneldataservice.presentAlert(Constants.messages.numberChangeHeader, Constants.messages.numberChangeSubheaderSuccess);
        }
        else {
          console.log("numberChangePCM Not Working");
          this.pcmchanneldataservice.presentAlert(Constants.messages.numberChangeHeader, Constants.messages.numberChangeSubheaderFailure);
        }
      }


    }, error => {
      console.log(JSON.stringify(error));
    })
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


  checkForWriteAccess() {
    if (!this.pcmchanneldataservice.passwordFlag)
      this.enterPaswordPrompt();
    else
      this.removeWriteAccessPrompt();
  }

  removeWriteAccessPrompt() {
    this.pcmchanneldataservice.alert = this.alertCtrl.create({
      title: Constants.messages.passwordTitle,
      subTitle: Constants.messages.removePasswordSubTitle,

      buttons: [
        {
          text: Constants.messages.apply,
          handler: data => {
            try {

              this.blePasswordTRelatedCalls(this.pcmchanneldataservice.passwordString, Constants.values.deAuthenticate, 10);
            } catch (error) {
              console.log(JSON.stringify(error));
            }

          }
        },
        {
          text: Constants.messages.cancel,
          handler: data => {
            try {
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
       * This is a alert controller popup which helps the user set specific value
       * @param item - the item chosen from the list
       */
  enterPaswordPrompt() {

    this.pcmchanneldataservice.alert = this.alertCtrl.create({
      title: Constants.messages.passwordTitle,
      subTitle: Constants.messages.passwordSubTitle,
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
            try {
              this.blePasswordTRelatedCalls(data.value, Constants.values.authenticate, 8);
              this.pcmchanneldataservice.passwordString = data.value;
            } catch (error) {
              console.log(JSON.stringify(error));
            }

          }
        },
        {
          text: Constants.messages.cancel,
          handler: data => {

            try {

            } catch (error) {
              console.log(JSON.stringify(error));
            }

          }

        }
      ]
    });
    this.pcmchanneldataservice.alert.present();

  }


  blePasswordTRelatedCalls(password, operation, questionType) {
    //Data for authenticating password
    try {
      this.operation = operation;
      var arr = [];
      var byteArray = new Uint8Array(20);
      byteArray[0] = questionType;
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

  newPasswordCheck(oldPassword, newPassword, newPasswordCheck) {
    if (newPassword === newPasswordCheck) {
      if (oldPassword === this.pcmchanneldataservice.passwordString) {
        this.blePasswordTRelatedCalls(newPassword, Constants.values.newPassword, 9);
      }
      else {
        this.pcmchanneldataservice.presentAlert(Constants.messages.newPasswordTitle, Constants.messages.oldPasswordNotMatching);
      }
    }
    else {
      this.pcmchanneldataservice.presentAlert(Constants.messages.newPasswordTitle, Constants.messages.newPasswordNotMatching);
    }
  }

  numberChangePrompt() {
    if (this.pcmchanneldataservice.passwordFlag) {
      this.pcmchanneldataservice.alert = this.alertCtrl.create({
        title: Constants.messages.newPcmNumberTitle,
        subTitle: Constants.messages.newPcmNumberSubTitle,
        inputs: [
          {
            name: 'newNumber',
            placeholder: Constants.messages.newNumberPlaceholder,
            type: 'number'
          }
        ],
        buttons: [
          {
            text: Constants.messages.apply,
            handler: data => {
              try {
                this.newNumberWrite(data.newNumber);
                // this.pcmchanneldataservice.presentAlert(Constants.messages.saveParameters, Constants.messages.paramSavedSuccessfully)
              } catch (error) {
                console.log(JSON.stringify(error));
              }

            }
          },
          {
            text: Constants.messages.cancel,

          }
        ]
      });
      this.pcmchanneldataservice.alert.present();
    } else this.pcmchanneldataservice.presentAlert(Constants.messages.passwordAuthHeader, Constants.messages.noPasswordSubheader);
  }

  newNumberWrite(newNumber) {
    this.operation = Constants.values.numberChangePCM;
    let channel = 40;
    let subChannel = 1;
    let wType = 3;
    let val1;
    let val2;
    let val3;
    let val4;
    val4 = (newNumber & 0xff000000) >> 24;
    val3 = (newNumber & 0x00ff0000) >> 16;
    val2 = (newNumber & 0x0000ff00) >> 8;
    val1 = (newNumber & 0x000000ff);
    var byteArray = new Uint8Array([wType, 0, channel, subChannel, val1, val2, val3, val4]);
    this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
  }

  showLicensePage(){
    this.navCtrl.push(LicensePage);
  }

}
