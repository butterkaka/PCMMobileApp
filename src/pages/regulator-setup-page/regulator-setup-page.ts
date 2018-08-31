import { Constants } from './../../shared/app.constant';
import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { DeviceModel, AtmQuestionTypeModel } from '../../Models/ExportModelClass';
import { BLE } from '@ionic-native/ble';
import { PCMChannelDataService } from '../../providers/pcm-channel-data-service';
import { LiveTunePage } from './../live-tune-page/live-tune-page';


/**
 * Generated class for the RegulatorSetupPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 * created by jkm5kor 05-05-2017
 */
@Component({
  selector: 'page-regulator-setup-page',
  templateUrl: 'regulator-setup-page.html',
})
export class RegulatorSetupPage {
  headerLabel = "Regulator Setup";
  regulatorType;
  feedForward = 0;
  propotionalReg;
  integrationReg;
  propotionalGain = 0;
  integrationTime = 0;
  maxFeedbackDeviation = 0;

  deviceObject: DeviceModel;
  atmQuestionObjectList: Array<AtmQuestionTypeModel>;
  atmQuestionInputObjList: Array<AtmQuestionTypeModel>;
  countAtmQList: number = 0;

  operation: string;

  disabled: boolean = false;
  regulatorTypeCheck: boolean = false;
  regualtorErrormessageList;

  items;




  /**
 * RegularSetupPage Constructor.
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
    this.items = pcmchanneldataservice.regulatorSetupItems;
  }



  /** 
  * @event ionViewDidLoad PageLoad Event  
  */
  ionViewDidLoad() {
    console.log(Constants.messages.ionViewDidLoadRegulatorSetupPage);
    //this.readRegualtorSetupParameters();
  }

  /** 
  * @event ionViewDidEnter  
  */
  ionViewDidEnter() {
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
  * This is used to read the regulator setup paraemtrs from the device.  
  */
  readRegualtorSetupParameters() {
    this.operation = Constants.values.read;
    this.atmQuestionObjectList = [];
    var regulatorSetupInputList = PCMChannelDataService.getInputDetails();
    regulatorSetupInputList.forEach(element => {
      var byteArray = new Uint8Array([element.rType, 0, element.channel, element.subchannel, 0, 0]);
      this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
    });
  }

  /** 
  * This is used to write the regulator setup paraemtrs to the device.  
  */
  writeRegulatorSetupParameters() {
    this.operation = Constants.values.write;
    this.atmQuestionObjectList = [];
    this.countAtmQList = 0;
    let val1;
    let val2;
    let val3;
      let val4;
      let value32;
    let flag = 0;
    var regulatorSetupInputList = PCMChannelDataService.getInputDetails();

    regulatorSetupInputList.forEach(element => {
      value32 = 0;
      flag = 0;
      if (element.name == Constants.values.regulatorType) {
        value32 = this.regulatorType;
        if (this.regulatorType == "1") { this.regulatorTypeCheck = true; }
        else { this.regulatorTypeCheck = false; }

        flag = 1;
      } if (element.name == Constants.values.feedForward) {
        value32 = this.feedForward;
        flag = 1;
      } if (element.name == Constants.values.propotionalReg) {
        value32 = this.propotionalReg;
        flag = 1;
      } if (element.name == Constants.values.integrationReg) {
        value32 = this.integrationReg;
        flag = 1;
      } if (element.name == Constants.values.propotionalGain) {
        value32 = this.propotionalGain;
        flag = 1;
      } if (element.name == Constants.values.integrationTime) {
        value32 = this.integrationTime * 100;  // converting to centi seconds to sent to pcm device
        flag = 1;
      } if (element.name == Constants.values.maxFeedbackDeviation) {
        value32 = this.maxFeedbackDeviation;
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
  }

  /** 
  * This is used to check the write status of the parameters.  
  */
  checkWriteStatus() {
    //if (this.countAtmQList > 5) {
    this.regualtorErrormessageList = [];
    let saveFlag = 0;
    let errorMessage: string = Constants.messages.ulOpen;
    this.atmQuestionObjectList.forEach(element => {
      if (element.status != 0) {
        saveFlag = 1;
        if (element.channel == Constants.channels.standaloneSettingsChannel && element.subChannel == Constants.channels.regTypeSubchannel) {
          this.regualtorErrormessageList.push(Constants.messages.regulatorTypeStatus + element.status)
        } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.feedForwardSubchannel) {
          this.regualtorErrormessageList.push(Constants.messages.feedForwardTypeStatus + element.status)
        } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.propotionalRegSubchannel) {
          this.regualtorErrormessageList.push(Constants.messages.propotionalRegStatus + element.status)
        } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.integrationRegSubchannel) {
          this.regualtorErrormessageList.push(Constants.messages.integrationRegStatus + element.status)
        } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.propotionalGainSubchannel) {
          this.regualtorErrormessageList.push(Constants.messages.propotionalGainStatus + element.status)
        } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.integrationTimeSubchannel) {
          this.regualtorErrormessageList.push(Constants.messages.integrationTimeStatus + element.status)
        } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.maxFeedbackDeviationSubchannel) {
          this.regualtorErrormessageList.push(Constants.messages.maxFeedbackDeviationStatus + element.status)
        }
      }
    });

    if (saveFlag == 0) {
      this.presentAlert(Constants.messages.saveParameters, Constants.messages.paramSavedSuccessfully);
    } else {
      this.regualtorErrormessageList.forEach(element => {
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

      if (element.channel == Constants.channels.standaloneSettingsChannel && element.subChannel == Constants.channels.regTypeSubchannel) {
        this.regulatorType = element.value32Bit1;
        if (this.regulatorType == "1") { 
          this.regulatorTypeCheck = true; 
        }
        else { this.regulatorTypeCheck = false; }
      }
      if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.feedForwardSubchannel) {
        this.feedForward = element.value32Bit1;
      } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.propotionalRegSubchannel) {
        this.propotionalReg = element.value32Bit1;
      } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.integrationRegSubchannel) {
        this.integrationReg = element.value32Bit1;
      } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.propotionalGainSubchannel) {
        this.propotionalGain = element.value32Bit1;
      } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.integrationTimeSubchannel) {
        this.integrationTime = element.value32Bit1 / 100; // getting value in centi seconds converting to seconds
      } if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.maxFeedbackDeviationSubchannel) {
        this.maxFeedbackDeviation = element.value32Bit1;
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
      if (this.operation == Constants.values.read && this.countAtmQList > 4) {
        this.setParameterValuesToUI();
        this.setItemValuesToUI();
      } else if (this.operation == Constants.values.write && this.countAtmQList > 6) {
        this.checkWriteStatus();
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
    //console.log(Constants.messages.increment + item.Value);
    if (item.Max > item.Value) {
      item.Value = item.Value + item.Steps;
      this.setItemValuesToSys(item);
    }
    else this.presentAlert(Constants.messages.maximumLimit, Constants.messages.maximumLimitReached);
    this.cd.detectChanges();
  }

  /** 
  * This is used 
  * @param {JSON} item selected item from UI 
  */
  decrement(item) {
    //console.log(Constants.messages.decrement + item.Value);
    if (item.Min < item.Value) {
      item.Value = item.Value - item.Steps;
      this.setItemValuesToSys(item);
    }
    else this.presentAlert(Constants.messages.minimumLimit, Constants.messages.minimumLimitReached);
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
      if (element.Title == Constants.messages.feedForwardTitle) {
        element.Value = this.feedForward;
      }
      if (element.Title == Constants.messages.proportionalGainTitle) {
        element.Value = this.propotionalGain;
      }
      if (element.Title == Constants.messages.integrationTimeTitle) {
        element.Value = this.integrationTime;
      }
      if (element.Title == Constants.messages.maxFeedbackDeviationTitle) {
        element.Value = this.maxFeedbackDeviation;
      }
    });

    this.cd.detectChanges();
  }

  /** 
    * This is used to set the list values to their respective items
    * @param {JSON} item - 
    */
  setItemValuesToSys(item) {
    if (item.Title == Constants.messages.feedForwardTitle) {
      this.feedForward = item.Value;
    }
    if (item.Title == Constants.messages.proportionalGainTitle) {
      this.propotionalGain = item.Value;
    }
    if (item.Title == Constants.messages.integrationTimeTitle) {
      this.integrationTime = item.Value;
    }
    if (item.Title == Constants.messages.maxFeedbackDeviationTitle) {
      this.maxFeedbackDeviation = item.Value;
    }
  }

  /** 
 * This is used to navigate to DriveLogPage
 */
  navegateToLiveTune() {
    this.navCtrl.push(LiveTunePage, { deviceObject: this.deviceObject, liveTuneGraphType: this.regulatorType });
  }

  /**
   * This is a alert controller popup which helps the user set specific value
   * @param item - the item chosen from the list
   */
  valueChangePrompt(item) {

    this.pcmchanneldataservice.alert = this.alertCtrl.create({
      title: item.Title + ":",
      subTitle: Constants.messages.enterValueToBeSet,
      inputs: [
        {
          name: Constants.messages.value,
          placeholder: Constants.messages.enter + item.Title + ' ' + Constants.messages.value
        }
      ],
      buttons: [
        {
          text: Constants.messages.apply,
          handler: data => {
            if (item.Min < data.value && item.Max > data.value) {
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


  /**
   * This is used to check the button live tune , is to be disabled or enabled
   */
  buttonState() {
    // console.log("Called "+  this.regulatorType) ;
    return this.regulatorTypeCheck;
  }


 

}