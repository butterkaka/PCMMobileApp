import { Constants } from './../../shared/app.constant';
import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { DeviceModel, AtmQuestionTypeModel } from '../../Models/ExportModelClass';
import { BLE } from '@ionic-native/ble';
import { PCMChannelDataService } from '../../providers/pcm-channel-data-service';
import { AtmAuthenticationTypeModel } from './../../Models/AtmAuthenticationModel';
/**
 * Generated class for the RampSetupPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-ramp-setup',
  templateUrl: 'ramp-setup.html',
})
export class RampSetupPage {
  shutdownRamp = 0;
  positiveRampForwardDirection = 0;
  negativeRampForwardDirection = 0;
  positiveRampReverseDirection = 0;
  negativeRampReverseDirection = 0;

  deviceObject: DeviceModel;
  atmQuestionObjectList: Array<AtmQuestionTypeModel>;
  atmQuestionInputObjList: Array<AtmQuestionTypeModel>;
  countAtmQList: number = 0;

  operation: string;

  disabled: boolean = false;
  rampSetupErrormessageList;

  items;

  writeData: string;
  atmAuthenticationTypeObject: AtmAuthenticationTypeModel;
  /**
   * RampSetupPage Constructor.
   * @constructor
   * @param navCtrl NavController for navigation
   * @param navParams NavParams paremters from previous component
   * @param alertCtrl AlertController fro custom Alert 
   * @param ble BLE object injected for Bluetooth Low Energy 
   * @param cd ChangeDetectorRef for detecting the change and updating UI
   * @param loadingController LoadingController for UI
   * @param pcmchanneldataservice PCMChannelDataService for UI 
   */
  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController,
    private ble: BLE, private cd: ChangeDetectorRef, public loadingController: LoadingController, public pcmchanneldataservice: PCMChannelDataService) {
    this.deviceObject = navParams.get("deviceObject");

    this.items = JSON.parse(JSON.stringify(pcmchanneldataservice.rampSetupItems));
    // this.atmQuestionObjectList = navParams.get("atmQuestionObjectList");
    
  }

  /** 
  * @event ionViewDidLoad PageLoad Event  
  */
  ionViewDidLoad() {
    console.log('ionViewDidLoad RampSetup');

  }
  ionViewDidEnter() {
    this.disabled = false;
    // this.SetParameterValuesToUI();
    // this.setItemValuesToUI();
    this.readRampSetupParameters();
  }


  /** 
  * This is used to read the Ramp setup paraemtrs from the device.  
  */
  readRampSetupParameters() {
    this.operation = Constants.values.read;
    this.startNotify(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId);
    // workaround for notifier
    var byteArray = new Uint8Array([0, 0, 0, 0, 0, 0]);
    this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);

    this.atmQuestionObjectList = [];
    var rampSetupInputList = JSON.parse(JSON.stringify(this.items));
    rampSetupInputList.forEach(element => {
      var byteArray = new Uint8Array([element.rType, 0, element.channel, element.subchannel, 0, 0]);
      this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
    });

  }

  /** 
  * This is used to write the Ramp setup paraemtrs to the device.  
  */
  writeRampSetupParameters() {

    if (this.pcmchanneldataservice.passwordFlag) {
      this.operation = Constants.values.write;
      this.atmQuestionObjectList = [];
      this.countAtmQList = 0;
      let val1;
      let val2;
      let val3;
      let val4;
      let value32;
      let flag = 0;
      var rampSetupInputList = JSON.parse(JSON.stringify(this.items));;



      rampSetupInputList.forEach(element => {
        value32 = 0;
        flag = 0;
        if (element.Title == Constants.values.shutdownRamp) {
          value32 = this.shutdownRamp;
          console.log("this.shutdownRamp " + this.shutdownRamp);
          flag = 1;
        } if (element.Title == Constants.values.positiveRampForwardDirection) {
          value32 = this.positiveRampForwardDirection;
          console.log("this.positiveRampForwardDirection " + this.positiveRampForwardDirection);
          flag = 1;
        } if (element.Title == Constants.values.negativeRampForwardDirection) {
          value32 = this.negativeRampForwardDirection;
          console.log("this.negativeRampForwardDirection " + this.negativeRampForwardDirection);
          flag = 1;
        } if (element.Title == Constants.values.positiveRampReverseDirection) {
          value32 = this.positiveRampReverseDirection;
          console.log("this.positiveRampReverseDirection " + this.positiveRampReverseDirection);
          flag = 1;
        } if (element.Title == Constants.values.negativeRampReverseDirection) {
          value32 = this.negativeRampReverseDirection;
          console.log("this.negativeRampReverseDirection " + this.negativeRampReverseDirection);
          flag = 1;
        }

        if (flag == 1) {

          val4 = (value32 & 0xff000000) >> 24;
          val3 = (value32 & 0x00ff0000) >> 16;
          val2 = (value32 & 0x0000ff00) >> 8;
          val1 = (value32 & 0x000000ff);

          var byteArray = new Uint8Array([element.wType, 0, element.channel, element.subchannel, val1, val2, val3, val4]);
          this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
        }
      });
    } else this.enterPaswordPrompt();
  }

  /** 
  * This is used to check the write status of the parameters.  
  */
  checkWriteStatus() {
    //if (this.countAtmQList > 5) {
    this.rampSetupErrormessageList = [];
    let saveFlag = 0;
    let errorMessage: string = Constants.messages.ulOpen;
    this.atmQuestionObjectList.forEach(element => {
      if (element.status != 0) {
        saveFlag = 1;
        if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.shutdownRampSubChannel) {
          this.rampSetupErrormessageList.push(Constants.messages.shutdownRampStatus + element.status)
        } if (element.channel == Constants.channels.standaloneSettingsChannel && element.subChannel == Constants.channels.positiveRampForwardDirectionSubChannel) {
          this.rampSetupErrormessageList.push(Constants.messages.positiveRampForwardDirectionStatus + element.status)
        } if (element.channel == Constants.channels.standaloneSettingsChannel && element.subChannel == Constants.channels.negativeRampForwardDirectionSubChannel) {
          this.rampSetupErrormessageList.push(Constants.messages.negativeRampForwardDirectionStatus + element.status)
        } if (element.channel == Constants.channels.standaloneSettingsChannel && element.subChannel == Constants.channels.positiveRampReverseDirectionSubChannel) {
          this.rampSetupErrormessageList.push(Constants.messages.positiveRampReverseDirectionStatus + element.status)
        } if (element.channel == Constants.channels.standaloneSettingsChannel && element.subChannel == Constants.channels.negativeRampReverseDirectionSubChannel) {
          this.rampSetupErrormessageList.push(Constants.messages.negativeRampReverseDirectionStatus + element.status)
        }
      }
    });

    if (saveFlag == 0) {
      this.presentAlert(Constants.messages.saveParameters, Constants.messages.paramSavedSuccessfully);
    } else {
      this.rampSetupErrormessageList.forEach(element => {
        errorMessage = errorMessage + Constants.messages.liOpen + element + Constants.messages.liClose;
      });
      errorMessage = errorMessage + Constants.messages.ulClose;
      this.presentAlert(Constants.messages.Failed, errorMessage);
    }

    //}
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
        alert(JSON.stringify(error));
      });
  }

  /** 
  * This is used to SetParameter  Values to the UI  
  */
  SetParameterValuesToUI() {
    this.atmQuestionObjectList.forEach(element => {
      if (element.channel != 0) {
        console.log("SetParameterValuesToUI Entered");
        if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.shutdownRampSubChannel) {
          this.shutdownRamp = element.value32Bit1;
          console.log(this.shutdownRamp);
        } if (element.channel == Constants.channels.standaloneSettingsChannel && element.subChannel == Constants.channels.positiveRampForwardDirectionSubChannel) {
          this.positiveRampForwardDirection = element.value32Bit1;
          console.log(this.positiveRampForwardDirection);
        } if (element.channel == Constants.channels.standaloneSettingsChannel && element.subChannel == Constants.channels.negativeRampForwardDirectionSubChannel) {
          this.negativeRampForwardDirection = element.value32Bit1;
          console.log(this.negativeRampForwardDirection);
        } if (element.channel == Constants.channels.standaloneSettingsChannel && element.subChannel == Constants.channels.positiveRampReverseDirectionSubChannel) {
          this.positiveRampReverseDirection = element.value32Bit1;
          console.log(this.positiveRampReverseDirection);
        } if (element.channel == Constants.channels.standaloneSettingsChannel && element.subChannel == Constants.channels.negativeRampReverseDirectionSubChannel) {
          this.negativeRampReverseDirection = element.value32Bit1;
          console.log(this.negativeRampReverseDirection);
        }

        if (this.pcmchanneldataservice.passwordFlag) {
          this.writeData = Constants.messages.saveParameters;
        } if (!this.pcmchanneldataservice.passwordFlag) {
          this.writeData = Constants.messages.enableWrite;
        }

        
      }

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
      this.atmQuestionObjectList.push(new AtmQuestionTypeModel(new Uint8Array(buffer)));
      this.countAtmQList++;
      if (this.operation == Constants.values.read && this.countAtmQList > 3) {
        this.SetParameterValuesToUI();
        this.setItemValuesToUI();
      } else if (this.operation == Constants.values.write && this.countAtmQList > 4) {
        this.checkWriteStatus();
      } else if (this.operation == Constants.values.authenticate) {
        console.log("startNotify authenticate")
        this.atmAuthenticationTypeObject = (new AtmAuthenticationTypeModel(new Uint8Array(buffer)));

        if (this.atmAuthenticationTypeObject.status == 0) {
          console.log("Works");
          this.writeData = Constants.messages.saveParameters;
          this.pcmchanneldataservice.passwordFlag = true;

          this.pcmchanneldataservice.presentAlert(Constants.messages.passwordAuthHeader, Constants.messages.passwordAuthSubheaderSuccess);
        }
        else {
          console.log("Not Working");
          this.pcmchanneldataservice.presentAlert(Constants.messages.passwordAuthHeader, Constants.messages.passwordAuthSubheaderFailure);
        }
      }
    }, error => {
      console.log(JSON.stringify(error));
    })
  }

  /** 
   * This is used for going back to the previous page
   */
  back() {
    this.navCtrl.pop();
  }


  /** 
  * This is used for incrementing the value clicked
  * @param {JSON} item - selected item value from UI  
  */
  increment(item) {
    // console.log('Increment ' + item.Value);
    if (item.Max > item.Value && item.Max - item.Value < item.Steps) {
      item.Value = item.Max;
      this.setItemValuesToSys(item);
    }
    else if (item.Max > item.Value) {
      item.Value = item.Value + item.Steps;
      this.setItemValuesToSys(item);


    }
    else {
      this.presentAlert(Constants.messages.maximumLimit, Constants.messages.maximumLimitReached);
    }
    // console.log("MAX: " + item.Max);

    this.cd.detectChanges();
  }

  /** 
    * This is used for decrementing the value clicked
    * @param {JSON} item - selected item value from UI  
    */
  decrement(item) {

    //  console.log('Varsha Decrement ' + item.Value);
    //  console.log('Varsha Decrement:'+item.Min);
    if (item.Min < item.Value && item.Value - item.Min < item.Steps) {
      // item.Value = item.Value - item.Steps;
      item.Value = item.Min;
      this.setItemValuesToSys(item);
    }
    else if (item.Min < item.Value) {
      item.Value = item.Value - item.Steps;
      this.setItemValuesToSys(item);
    }
    else {
      this.presentAlert(Constants.messages.minimumLimit, Constants.messages.minimumLimitReached);
      // console.log("Min: " + item.Min);
    }
    this.cd.detectChanges();
  }
  /** 
  * This is used for incrementing the value clicked
  * @param {any} header - header value  
  * @param {any} subHeader - subHeader value  
  */
  presentAlert(header, subHeader) {
    this.pcmchanneldataservice.alert = this.alertCtrl.create({
      title: header,
      subTitle: subHeader,
      enableBackdropDismiss: false,
      buttons: [
        {
          text: Constants.messages.ok,
          handler: data => {
            this.disabled = false;
            this.pcmchanneldataservice.alert = null;
          }
        }]
    });
    this.pcmchanneldataservice.alert.present();
  }

  /** 
* This is used to set item values read from PCM to the UI Controls
* @param {JSON} item selected item from UI 
*/
  setItemValuesToUI() {


    this.items.forEach(element => {
      if (element.Title == Constants.values.shutdownRamp) {
        element.Value = this.shutdownRamp;
      }
      if (element.Title == Constants.values.positiveRampForwardDirection) {
        element.Value = this.positiveRampForwardDirection;
      }
      if (element.Title == Constants.values.negativeRampForwardDirection) {
        element.Value = this.negativeRampForwardDirection;
      }
      if (element.Title == Constants.values.positiveRampReverseDirection) {
        element.Value = this.positiveRampReverseDirection;
      }
      if (element.Title == Constants.values.negativeRampReverseDirection) {
        element.Value = this.negativeRampReverseDirection;
      }

    });

    this.cd.detectChanges();
  }

  /** 
    * This is used to set the list values to their respective items
    * @param {JSON} item - 
    */
  setItemValuesToSys(element) {

    if (element.Title == Constants.values.shutdownRamp) {
      this.shutdownRamp = element.Value;
    }
    if (element.Title == Constants.values.positiveRampForwardDirection) {
      this.positiveRampForwardDirection = element.Value;
    }
    if (element.Title == Constants.values.negativeRampForwardDirection) {
      this.negativeRampForwardDirection = element.Value;
    }
    if (element.Title == Constants.values.positiveRampReverseDirection) {
      this.positiveRampReverseDirection = element.Value;
    }
    if (element.Title == Constants.values.negativeRampReverseDirection) {
      this.negativeRampReverseDirection = element.Value;
    }

  }

  /**
   * This is a alert controller popup which helps the user set specific value
   * @param item - the item chosen from the list
   */
  valueChangePrompt(item) {
    if (this.pcmchanneldataservice.passwordFlag) {
      this.pcmchanneldataservice.alert = this.alertCtrl.create({
        title: item.Title + ":",
        subTitle: Constants.messages.enterValueToBeSet,
        enableBackdropDismiss: false,
        inputs: [
          {
            name: Constants.messages.value,
            placeholder: Constants.messages.enter + item.Title + ' ' + Constants.messages.value,
            type: 'number'
          }
        ],
        buttons: [
          {
            text: Constants.messages.apply,
            handler: data => {
              console.log('data val: ' + String(data.value));
              if (item.Min <= data.value && item.Max >= data.value) {
                item.Value = Number(data.value);
                this.setItemValuesToSys(item);
              }
              else {
                this.presentAlert(Constants.messages.limitIssue, Constants.messages.enterValueWithin + item.Min + Constants.messages.and + item.Max);
              }
              this.cd.detectChanges();
            }
          },
          {
            text: Constants.messages.cancel
          }
        ]
      });
      this.pcmchanneldataservice.alert.present();
    }
  }

  /**
  * On click of Nav bar settings button, navigate to Settings page
  */
  navigateToSettings() {
    this.navCtrl.push("SettingsPage", { deviceObject: this.deviceObject });
  }

  /**
     * This is a alert controller popup which helps the user set specific value
     * @param item - the item chosen from the list
     */
  enterPaswordPrompt() {
    this.pcmchanneldataservice.passwordDeviceSetupPageFlag = true;
    this.pcmchanneldataservice.alert = this.alertCtrl.create({
      title: Constants.messages.passwordTitle,
      subTitle: Constants.messages.passwordSubTitle,
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

            try {

            } catch (error) {
              console.log(JSON.stringify(error));
            }

          }

        }
      ]
    });
    this.pcmchanneldataservice.alert.present();
    this.disabled = false;
  }


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
}