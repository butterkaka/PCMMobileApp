import { Constants } from './../../shared/app.constant';
import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { DeviceModel, AtmQuestionTypeModel } from '../../Models/ExportModelClass';
import { BLE } from '@ionic-native/ble';
import { PCMChannelDataService } from '../../providers/pcm-channel-data-service';
import { LiveTunePage } from './../live-tune-page/live-tune-page';
import { AtmAuthenticationTypeModel } from './../../Models/AtmAuthenticationModel';
/**
 * Generated class for the PressureRegulatorSetupPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-pressure-regulator-setup',
  templateUrl: 'pressure-regulator-setup.html',
})
export class PressureRegulatorSetupPage {

  pressureRegulator = 0;;
  pPart = 0;;
  iPart = 0;;
  dPart = 0;;
  invertFeedbackDirection = 0;;

  pPartGain = 0;
  dPartGain = 0;
  iPartTime = 0;
  feedforwardPercentage = 0;
  positiveOperationPercentage = 0;
  negativeOperationPercentage = 0;
  errorLimitPercentage = 0;

  deviceObject: DeviceModel;
  atmQuestionObjectList: Array<AtmQuestionTypeModel>;
  atmQuestionInputObjList: Array<AtmQuestionTypeModel>;
  countAtmQList: number = 0;

  operation: string;

  disabled: boolean = false;
  liveTuneCheck: boolean = false;

  pressureRegulatorSetupErrormessageList;

  items;

  writeData: string;
  atmAuthenticationTypeObject: AtmAuthenticationTypeModel;

  /**
 * SwashSetupSetupPage Constructor.
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
    private ble: BLE, private cd: ChangeDetectorRef, public loadingController: LoadingController, public pcmchanneldataservice: PCMChannelDataService) { //,public alertService:AlertServiceProvider
    //this.deviceObject = navParams.get(Constants.values.deviceObject);
    this.deviceObject = pcmchanneldataservice.deviceObjectGlobal;
    this.items = pcmchanneldataservice.pressureRegulatorSetupItems;
  }



  /** 
  * @event ionViewDidLoad PageLoad Event  
  */
  ionViewDidLoad() {
    console.log(Constants.messages.ionViewDidLoadPressureRegulatorSetupPage);
    //this.readRegualtorSetupParameters();
  }

  /** 
  * @event ionViewDidEnter  
  */
  ionViewDidEnter() {
    this.disabled = false;
    this.initializeStartNotify();
    this.readRegualtorSetupParameters();
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
* This is a workaround for start notifier first value not considered
*/
  initializeStartNotify() {
    this.startNotify(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId);
    // workaround for notifier
    var byteArray = new Uint8Array([0, 0, 0, 0, 0, 0]);
    this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
  }

  /** 
  * This is used to read the pressureRegulator setup paraemtrs from the device.  
  */
  readRegualtorSetupParameters() {
    this.operation = Constants.values.read;
    this.atmQuestionObjectList = [];
    // var pressureRegulatorSetupInputList = PCMChannelDataService.getPressureRegulatorsetupInputDetails();
    this.items.forEach(element => {
      var byteArray = new Uint8Array([element.rType, 0, element.channel, element.subchannel, 0, 0]);
      this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
    });
  }

  /** 
  * This is used to write the pressureRegulator setup paraemtrs to the device.  
  */
  writePressureRegulatorSetupParameters() {
    // To prevent write without password 
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
      // var pressureRegulatorSetupInputList = PCMChannelDataService.getPressureRegulatorsetupInputDetails();

      this.items.forEach(element => {
        value32 = 0;
        flag = 0;
        if (element.name == Constants.values.pressureRegulator) {
          value32 = this.pressureRegulator;
          flag = 1;
        } if (element.name == Constants.values.pPart) {
          value32 = this.pPart;
          flag = 1;
        } if (element.name == Constants.values.iPart) {
          value32 = this.iPart;
          flag = 1;
        } if (element.name == Constants.values.dPart) {
          value32 = this.dPart;
          flag = 1;
        } if (element.name == Constants.values.invertFeedbackDirection) {
          value32 = this.invertFeedbackDirection;
          flag = 1;
        } if (element.name == Constants.values.pPartGain) {
          value32 = this.pPartGain;
          flag = 1;
        } if (element.name == Constants.values.iPartTime) {
          value32 = this.iPartTime * 100;  // converting to centi seconds to sent to pcm device
          flag = 1;
        } if (element.name == Constants.values.dPartGain) {
          value32 = this.dPartGain;
          flag = 1;
        } if (element.name == Constants.values.feedforwardPercentage) {
          value32 = this.feedforwardPercentage;
          flag = 1;
        } if (element.name == Constants.values.positiveOperationPercentage) {
          value32 = this.positiveOperationPercentage;
          flag = 1;
        } if (element.name == Constants.values.negativeOperationPercentage) {
          value32 = this.negativeOperationPercentage;
          flag = 1;
        } if (element.name == Constants.values.errorLimitPercentage) {
          value32 = this.errorLimitPercentage;
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
    this.pressureRegulatorSetupErrormessageList = [];
    let saveFlag = 0;
    let errorMessage: string = Constants.messages.ulOpen;
    this.atmQuestionObjectList.forEach(element => {
      if (element.status != 0) {
        saveFlag = 1;
        if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.pressureRegSubChannel) {
          this.pressureRegulatorSetupErrormessageList.push(Constants.messages.pressureRegulatorTypeStatus + element.status)
        } if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.pPartPressureRegSubChannel) {
          this.pressureRegulatorSetupErrormessageList.push(Constants.messages.pPartTypeStatus + element.status)
        } if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.iPartPressureRegSubChannel) {
          this.pressureRegulatorSetupErrormessageList.push(Constants.messages.iPartTypeStatus + element.status)
        } if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.dPartPressureRegSubChannel) {
          this.pressureRegulatorSetupErrormessageList.push(Constants.messages.dPartTypeStatus + element.status)
        } if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.invertFeedbackDirectionPressureRegSubChannel) {
          this.pressureRegulatorSetupErrormessageList.push(Constants.messages.invertFeedbackDirectionPressureTypeStatus + element.status)
        } if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.pPartGainPressureRegSubChannel) {
          this.pressureRegulatorSetupErrormessageList.push(Constants.messages.pPartGainTypeStatus + element.status)
        } if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.iPartTimePressureRegSubChannel) {
          this.pressureRegulatorSetupErrormessageList.push(Constants.messages.iPartTimeStatus + element.status)
        } if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.dPartGainPressureRegSubChannel) {
          this.pressureRegulatorSetupErrormessageList.push(Constants.messages.dPartGainTypeStatus + element.status)
        } if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.feedForwardPressureRegSubChannel) {
          this.pressureRegulatorSetupErrormessageList.push(Constants.messages.feedforwardPercentageStatus + element.status)
        } if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.positiveOperationPressureRegSubChannel) {
          this.pressureRegulatorSetupErrormessageList.push(Constants.messages.positiveOperationStatus + element.status)
        } if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.negativeOperationPressureRegSubChannel) {
          this.pressureRegulatorSetupErrormessageList.push(Constants.messages.negativeOperationStatus + element.status)
        } if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.errorLimitPressureRegSubChannel) {
          this.pressureRegulatorSetupErrormessageList.push(Constants.messages.errorLimitPercentageStatus + element.status)
        }
      }
    });

    if (saveFlag == 0) {
      this.presentAlert(Constants.messages.saveParameters, Constants.messages.paramSavedSuccessfully);
    } else {
      this.pressureRegulatorSetupErrormessageList.forEach(element => {
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
        console.log(JSON.stringify(error));
      });
  }

  /** 
  * This is used to SetParameter  Values to the UI  
  */
  setParameterValuesToUI() {
    this.atmQuestionObjectList.forEach(element => {
      //Tp check if swash angle is on, if switched on disable live view
      if (element.channel == Constants.channels.standaloneSettingsChannel && element.subChannel == Constants.channels.sswashAngleSubChannel) {
        if (element.value32Bit1 == 1) {
          this.liveTuneCheck = true;
        }
      }
      if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.pressureRegSubChannel) {
        console.log('pressureRegulator:' + element.value32Bit1)
        this.pressureRegulator = element.value32Bit1;
      } if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.pPartPressureRegSubChannel) {
        console.log('pPart:' + element.value32Bit1)
        this.pPart = element.value32Bit1;
      } if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.iPartPressureRegSubChannel) {
        console.log('iPart:' + element.value32Bit1)
        this.iPart = element.value32Bit1;
      } if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.dPartPressureRegSubChannel) {
        console.log('dPart:' + element.value32Bit1)
        this.dPart = element.value32Bit1;
      } if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.invertFeedbackDirectionPressureRegSubChannel) {
        console.log('invertFeedbackDirection:' + element.value32Bit1)
        this.invertFeedbackDirection = element.value32Bit1;
      } if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.pPartGainPressureRegSubChannel) {
        this.pPartGain = element.value32Bit1;
      } if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.iPartTimePressureRegSubChannel) {
        this.iPartTime = element.value32Bit1 / 100; // getting value in centi seconds converting to seconds
      } if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.dPartGainPressureRegSubChannel) {
        this.dPartGain = element.value32Bit1;
      } if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.feedForwardPressureRegSubChannel) {
        this.feedforwardPercentage = element.value32Bit1;
      } if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.positiveOperationPressureRegSubChannel) {
        this.positiveOperationPercentage = element.value32Bit1;
      } if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.negativeOperationPressureRegSubChannel) {
        this.negativeOperationPercentage = element.value32Bit1;
      } if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.errorLimitPressureRegSubChannel) {
        this.errorLimitPercentage = element.value32Bit1;
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
      if (this.operation == Constants.values.read && this.countAtmQList > 10) {
        this.setParameterValuesToUI();
        this.setItemValuesToUI();
      } else if (this.operation == Constants.values.write && this.countAtmQList > 11) {
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
      *This is to navigate to Previous Page(
  */
  back() {
    this.navCtrl.pop();
  }


  /** 
  * This is used 
  * @param {JSON} item - selected item from UI  
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
  * This is used 
  * @param {JSON} item selected item from UI 
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
          }
        }]
    });
    this.pcmchanneldataservice.alert.present();
  }

  /** 
 * This is used to set item values read from PCM to the UI Controls 
 */
  setItemValuesToUI() {
    this.items.forEach(element => {

      if (element.name == Constants.values.pressureRegulator) {
        element.Value = this.pressureRegulator;
      }
      if (element.name == Constants.values.pPart) {
        element.Value = this.pPart;
      }
      if (element.name == Constants.values.iPart) {
        element.Value = this.iPart;
      }
      if (element.name == Constants.values.dPart) {
        element.Value = this.dPart;
      }
      if (element.name == Constants.values.invertFeedbackDirection) {
        element.Value = this.invertFeedbackDirection;
      }
      ////////////////////////////////////////////////////////////////////////////
      if (element.name == Constants.values.pPartGain) {
        element.Value = this.pPartGain;
      }
      if (element.name == Constants.values.iPartTime) {
        element.Value = this.iPartTime;
      }
      if (element.name == Constants.values.dPartGain) {
        element.Value = this.dPartGain;
      }
      if (element.name == Constants.values.feedforwardPercentage) {
        element.Value = this.feedforwardPercentage;
      }
      if (element.name == Constants.values.positiveOperationPercentage) {
        element.Value = this.positiveOperationPercentage;
      }
      if (element.name == Constants.values.negativeOperationPercentage) {
        element.Value = this.negativeOperationPercentage;
      }
      if (element.name == Constants.values.errorLimitPercentage) {
        element.Value = this.errorLimitPercentage;
      }
    });

    this.cd.detectChanges();
  }

  /** 
    * This is used to set the list values to their respective items
    * @param {JSON} item - 
    */
  setItemValuesToSys(item) {
    if (item.name == Constants.values.pressureRegulator) {
      this.pressureRegulator = item.Value;
    }
    if (item.name == Constants.values.pPart) {
      this.pPart = item.Value;
    }
    if (item.name == Constants.values.iPart) {
      this.iPart = item.Value;
    }
    if (item.name == Constants.values.dPart) {
      this.dPart = item.Value;
    }
    if (item.name == Constants.values.invertFeedbackDirection) {
      this.invertFeedbackDirection = item.Value;
    }
    ////////////////////////////////////////////////////////////////////////////
    if (item.name == Constants.values.pPartGain) {
      this.pPartGain = item.Value;
    }
    if (item.name == Constants.values.iPartTime) {
      this.iPartTime = item.Value;
    }
    if (item.name == Constants.values.dPartGain) {
      this.dPartGain = item.Value;
    }
    if (item.name == Constants.values.feedforwardPercentage) {
      this.feedforwardPercentage = item.Value;
    }
    if (item.name == Constants.values.positiveOperationPercentage) {
      this.positiveOperationPercentage = item.Value;
    } if (item.name == Constants.values.negativeOperationPercentage) {
      this.negativeOperationPercentage = item.Value;
    }
    if (item.name == Constants.values.errorLimitPercentage) {
      this.errorLimitPercentage = item.Value;
    }

  }

  /** 
 * This is used to navigate to DriveLogPage
 */
  navegateToLiveTune() {
    if (this.pcmchanneldataservice.passwordFlag) {
      if (this.liveTuneCheck) {
        this.presentSwashAngleOnAlert();
      }
      else {
        this.navCtrl.push(LiveTunePage, { deviceObject: this.deviceObject, liveTuneGraphType: 1 });
      }
      // this.navCtrl.push(LiveTunePage, { deviceObject: this.deviceObject, liveTuneGraphType: this.pressureRegulatorType });
    } else this.pcmchanneldataservice.presentAlert(Constants.messages.passwordAuthHeader, Constants.messages.noPasswordSubheader);
  }

  /**
   * This is a alert controller popup which helps the user set specific value
   * @param item - the item chosen from the list
   */
  valueChangePrompt(item) {
    if (this.pcmchanneldataservice.passwordFlag) {
      this.pcmchanneldataservice.alert = this.alertCtrl.create({
        title: item.name + ":",
        subTitle: Constants.messages.enterValueToBeSet,
        enableBackdropDismiss: false,

        inputs: [
          {
            name: Constants.messages.value,
            placeholder: Constants.messages.enter + item.name + ' ' + Constants.messages.value,
            type: 'number'
          }
        ],
        buttons: [
          {
            text: Constants.messages.apply,
            handler: data => {
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
   * This is a alert controller popup which warns the user that the Swash angle is ON
   * @param item - the item chosen from the list
   */
  presentSwashAngleOnAlert() {

    this.pcmchanneldataservice.alert = this.alertCtrl.create({
      title: Constants.messages.alert + ":",
      subTitle: Constants.messages.swashAngleOnAlert,
      enableBackdropDismiss: false,

      buttons: [
        {
          text: Constants.messages.proceed,
          handler: data => {
            this.navCtrl.push(LiveTunePage, { deviceObject: this.deviceObject, liveTuneGraphType: 1 });
          }
        },
        {
          text: Constants.messages.cancel
        }
      ]
    });
    this.pcmchanneldataservice.alert.present();

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
