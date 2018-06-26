import { Constants } from './../../shared/app.constant';
import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { DeviceModel, AtmQuestionTypeModel } from '../../Models/ExportModelClass';
import { BLE } from '@ionic-native/ble';
import { PCMChannelDataService } from '../../providers/pcm-channel-data-service'
import { AtmAuthenticationTypeModel } from './../../Models/AtmAuthenticationModel';

/**
 * Generated class for the PumpSetupPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-pump-setup-page',
  templateUrl: 'pump-setup-page.html',
})
export class PumpSetupPage {

  forwardMinCurrent = 0;
  forwardMaxCurrent = 0;
  reverseMinCurrent = 0;
  reverseMaxCurrent = 0;
  coilResistance = 0;
  ditherAmplitude = 0;
  ditherFrequency = 0;
  maxCurrentError = 0;
  limpHomeRampTime = 0;

  deviceObject: DeviceModel;
  atmQuestionObjectList: Array<AtmQuestionTypeModel>;
  atmQuestionInputObjList: Array<AtmQuestionTypeModel>;
  countAtmQList: number = 0;

  operation: string;

  disabled: boolean = false;
  pumpSetupErrormessageList;

  items;
  writeData: string;

  atmAuthenticationTypeObject: AtmAuthenticationTypeModel;

  /**
   * PumpSetupPage Constructor.
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

    this.items = JSON.parse(JSON.stringify(pcmchanneldataservice.pumpSetupItems));
  }

  /** 
  * @event ionViewDidLoad PageLoad Event  
  */
  ionViewDidLoad() {
    console.log('ionViewDidLoad PumpSetup');

  }

  ionViewDidEnter() {
    this.disabled = false;
    this.readPumpSetupParameters();
    this.setTimeoutForViewUpdate();
  }

  /** 
      *This is to update the view 
      */
  setTimeoutForViewUpdate() {

    // workaround to update the view for asynchronous update / rareley it doesint update the view to make sure update works this will be called twice
    setTimeout(() => {
      this.cd.detectChanges();
    }, 200);
    setTimeout(() => {
      this.cd.detectChanges();
    }, 300);
    //  setTimeout(() => {
    //   this.cd.detectChanges();
    // },400);   
  }

  /** 
  * This is used to read the pump setup paraemtrs from the device.  
  */
  readPumpSetupParameters() {
    this.operation = Constants.values.read;
    this.startNotify(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId);
    // workaround for notifier
    var byteArray = new Uint8Array([0, 0, 0, 0, 0, 0]);
    this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);

    this.atmQuestionObjectList = [];
    var pumpSetupInputList = JSON.parse(JSON.stringify(this.items));
    pumpSetupInputList.forEach(element => {
      var byteArray = new Uint8Array([element.rType, 0, element.channel, element.subchannel, 0, 0]);
      this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
    });

  }

  /** 
  * This is used to write the pump setup paraemtrs to the device.  
  */
  writepumpSetupParameters() {

    // this.disabled=true;
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
      var pumpSetupInputList = JSON.parse(JSON.stringify(this.items));;



      pumpSetupInputList.forEach(element => {
        value32 = 0;
        flag = 0;
        if (element.Title == Constants.values.forwardMinCurrent) {
          value32 = this.forwardMinCurrent;
          console.log("this.forwardMinCurrent " + this.forwardMinCurrent);
          flag = 1;
        } if (element.Title == Constants.values.forwardMaxCurrent) {
          value32 = this.forwardMaxCurrent;
          console.log("this.ForwardMaxCurrent " + this.forwardMaxCurrent);
          flag = 1;
        } if (element.Title == Constants.values.reverseMinCurrent) {
          value32 = this.reverseMinCurrent;
          console.log("this.reverseMinCurrent " + this.reverseMinCurrent);
          flag = 1;
        } if (element.Title == Constants.values.reverseMaxCurrent) {
          value32 = this.reverseMaxCurrent;
          console.log("this.reverseMaxCurrent " + this.reverseMaxCurrent);
          flag = 1;
        } if (element.Title == Constants.values.coilResistance) {
          value32 = this.coilResistance;
          console.log("this.coilResistance " + this.coilResistance);
          flag = 1;
        } if (element.Title == Constants.values.ditherAmplitude) {
          value32 = this.ditherAmplitude;
          console.log("this.ditherAmplithude " + this.ditherAmplitude);
          flag = 1;
        } if (element.Title == Constants.values.ditherFrequency) {
          value32 = this.ditherFrequency;
          console.log("this.ditherFrequency " + this.ditherFrequency);
          flag = 1;
        } if (element.Title == Constants.values.maxCurrentError) {
          value32 = this.maxCurrentError;
          console.log("this.maxCurrentError " + this.maxCurrentError);
          flag = 1;
        } if (element.Title == Constants.values.limpHomeRampTime) {
          value32 = this.limpHomeRampTime;
          console.log("this.limpHomeRampTime " + this.limpHomeRampTime);
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
    this.pumpSetupErrormessageList = [];
    let saveFlag = 0;
    let errorMessage: string = Constants.messages.ulOpen;
    this.atmQuestionObjectList.forEach(element => {
      if (element.status != 0) {
        saveFlag = 1;
        debugger
        if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.forwardMinCurrentSubChannel) {
          this.pumpSetupErrormessageList.push(Constants.messages.forwardMinCurrentStatus + element.status)
        } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.forwardMaxCurrentSubChannel) {
          this.pumpSetupErrormessageList.push(Constants.messages.forwardMaxCurrentStatus + element.status)
        } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.reverseMinCurrentSubChannel) {
          this.pumpSetupErrormessageList.push(Constants.messages.reverseMinCurrentStatus + element.status)
        } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.reverseMaxCurrentSubChannel) {
          this.pumpSetupErrormessageList.push(Constants.messages.reverseMaxCurrentStatus + element.status)
        } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.coilResistanceSubChannel) {
          //alert("Integration Time failed with status " + element.status);
          this.pumpSetupErrormessageList.push(Constants.messages.coilResistanceStatus + element.status)

        } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.ditherAmplitudeSubChannel) {

          this.pumpSetupErrormessageList.push(Constants.messages.ditherAmplitudeStatus + element.status)
        }
        if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.ditherFrequencySubChannel) {
          this.pumpSetupErrormessageList.push(Constants.messages.ditherFrequencyStatus + element.status)
        } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.maxCurrentErrorSubChannel) {
          this.pumpSetupErrormessageList.push(Constants.messages.maxCurrentErrorStatus + element.status)
        }
        if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.limpHomeRampTimeSubChannel) {
          this.pumpSetupErrormessageList.push(Constants.messages.limpHomeRampTimeStatus + element.status)

        }
      }
    });

    if (saveFlag == 0) {
      this.presentAlert(Constants.messages.saveParameters, Constants.messages.paramSavedSuccessfully);
    } else {
      this.pumpSetupErrormessageList.forEach(element => {
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

      console.log("SetParameterValuesToUI Entered");
      if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.forwardMinCurrentSubChannel) {
        this.forwardMinCurrent = element.value32Bit1;
        console.log(this.forwardMinCurrent);
      } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.forwardMaxCurrentSubChannel) {
        this.forwardMaxCurrent = element.value32Bit1;
        console.log(this.forwardMaxCurrent);
      } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.reverseMinCurrentSubChannel) {
        this.reverseMinCurrent = element.value32Bit1;
        console.log(this.reverseMinCurrent);
      } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.reverseMaxCurrentSubChannel) {
        this.reverseMaxCurrent = element.value32Bit1;
        console.log(this.reverseMaxCurrent);
      } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.coilResistanceSubChannel) {
        this.coilResistance = element.value32Bit1;
      } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.ditherAmplitudeSubChannel) {
        this.ditherAmplitude = element.value32Bit1;
      } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.ditherFrequencySubChannel) {
        this.ditherFrequency = element.value32Bit1;
      } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.maxCurrentErrorSubChannel) {
        this.maxCurrentError = element.value32Bit1;
      } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.limpHomeRampTimeSubChannel) {
        this.limpHomeRampTime = element.value32Bit1;
      }

      if (this.pcmchanneldataservice.passwordFlag) {
        this.writeData = Constants.messages.saveParameters;
      } else {
        this.writeData = Constants.messages.enableWrite;
      }

      this.cd.detectChanges();
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
      if (this.operation == Constants.values.read && this.countAtmQList > 6) {
        this.SetParameterValuesToUI();
        this.setItemValuesToUI();
      } else if (this.operation == Constants.values.write && this.countAtmQList > 7) {
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
      if (element.Title == Constants.values.forwardMinCurrent) {
        element.Value = this.forwardMinCurrent;
      }
      if (element.Title == Constants.values.forwardMaxCurrent) {
        element.Value = this.forwardMaxCurrent;
      }
      if (element.Title == Constants.values.reverseMinCurrent) {
        element.Value = this.reverseMinCurrent;
      }
      if (element.Title == Constants.values.reverseMaxCurrent) {
        element.Value = this.reverseMaxCurrent;
      }
      if (element.Title == Constants.values.coilResistance) {
        element.Value = this.coilResistance;
      }
      if (element.Title == Constants.values.ditherAmplitude) {
        element.Value = this.ditherAmplitude;
      }
      if (element.Title == Constants.values.ditherFrequency) {
        element.Value = this.ditherFrequency;
      }
      if (element.Title == Constants.values.maxCurrentError) {
        element.Value = this.maxCurrentError;
      }
      if (element.Title == Constants.values.limpHomeRampTime) {
        element.Value = this.limpHomeRampTime;
      }
    });

    this.cd.detectChanges();
  }

  /** 
    * This is used to set the list values to their respective items
    * @param {JSON} item - 
    */
  setItemValuesToSys(element) {

    if (element.Title == Constants.values.forwardMinCurrent) {
      this.forwardMinCurrent = element.Value;
    }
    if (element.Title == Constants.values.forwardMaxCurrent) {
      this.forwardMaxCurrent = element.Value;
    }
    if (element.Title == Constants.values.reverseMinCurrent) {
      this.reverseMinCurrent = element.Value;
    }
    if (element.Title == Constants.values.reverseMaxCurrent) {
      this.reverseMaxCurrent = element.Value;
    }
    if (element.Title == Constants.values.coilResistance) {
      this.coilResistance = element.Value;
    }
    if (element.Title == Constants.values.ditherAmplitude) {
      this.ditherAmplitude = element.Value;
    }
    if (element.Title == Constants.values.ditherFrequency) {
      this.ditherFrequency = element.Value;
    }
    if (element.Title == Constants.values.maxCurrentError) {
      this.maxCurrentError = element.Value;
    }
    if (element.Title == Constants.values.limpHomeRampTime) {
      this.limpHomeRampTime = element.Value;
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
  // backButtonAction() {
  //   // checks if alertCtrl is open 
  //   if (this.alertCtrl) {
  //     /* closes modal */
  //     this.alert.dismiss();
  //     this.alert = null;
  //   }
  // }

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