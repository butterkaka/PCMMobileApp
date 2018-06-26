import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { DriveLogPage } from './../drive-log-page/drive-log-page';
import { DeviceModel, AtmQuestionTypeModel } from '../../Models/ExportModelClass';
import { BLE } from '@ionic-native/ble';
import { PCMChannelDataService } from '../../providers/pcm-channel-data-service';
import { Constants } from './../../shared/app.constant';
import { AtmAuthenticationTypeModel } from './../../Models/AtmAuthenticationModel';

/**
 * Generated class for the AlarmLogPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-alarm-log-page',
  templateUrl: 'alarm-log-page.html',
})
export class AlarmLogPage {

  //Hardcoded values for Demo 
  items: any[] = [
    { Name: 'Current out of bounds' },
    { Name: 'Short circuit' }
  ]

  deviceObject: DeviceModel;
  atmQuestionObjectList: Array<AtmQuestionTypeModel>;
  operation: string;
  countAtmQList: number = 0;

  warningMessageList = [];
  tempWarningMessageList = [];
  alarmsMessageList = [];
  hardwareAlarmsMessageList = [];
  warningMessageLogList = [];
  tempWarningMessageLogList = [];
  alarmsMessageLogList = [];
  hardwareAlarmsMessageLogList = [];


  writeData: string;
  atmAuthenticationTypeObject: AtmAuthenticationTypeModel;
  /**
 * AlarmLogPage Constructor.
 * @constructor
 * @param navCtrl NavController for navigation
 * @param navParams NavParams paremters from previous component
 */
  constructor(public navCtrl: NavController, public navParams: NavParams, public pcmchanneldataservice: PCMChannelDataService,
    private ble: BLE, private cd: ChangeDetectorRef, public alertCtrl: AlertController, ) {

    this.deviceObject = pcmchanneldataservice.deviceObjectGlobal;

  }

  /** 
  * @event ionViewDidLoad PageLoad Event  
  */
  ionViewDidLoad() {
    console.log('ionViewDidLoad AlarmLogPage');

  }

  /**  
  * @event ionViewDidEnter  
  */
  ionViewDidEnter() {
    this.initializeStartNotify();
    this.readAlarmsandWarnings();

    // this.hardwareAlarmsMessageList.push("dfshfsd dsfhsdj fasjkd sefjsdjfk shk dfsh sfsdf sd fsdhff");
    // this.alarmsMessageList.push("fsadhfsdj ");
    // this.warningMessageList.push("warning dfasfdsa  fsd");
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
  readAlarmsandWarnings() {
    console.log("readAlarmsandWarnings called");
    this.operation = Constants.values.read;
    this.atmQuestionObjectList = [];
    this.countAtmQList = 0;

    var alarmAndWarnInputList = PCMChannelDataService.getAlarmAndWarnInputDetails();
    if (alarmAndWarnInputList != null) {
      alarmAndWarnInputList.forEach(element => {
        var byteArray = new Uint8Array([element.rType, 0, element.channel, element.subchannel, 0, 0]);
        this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
      });
    } else {
      console.log(Constants.messages.alarmAndWarnInputListnull);
    }

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
      if (this.operation == Constants.values.read && this.countAtmQList > 7) {
        this.setParameterValuesToUI();
        //this.setItemValuesToUI();
      } else if (this.operation == Constants.values.authenticate) {
        console.log("startNotify authenticate")
        this.atmAuthenticationTypeObject = (new AtmAuthenticationTypeModel(new Uint8Array(buffer)));

        if (this.atmAuthenticationTypeObject.status == 0) {
          console.log("Works");
          this.writeData = Constants.messages.clearLog;
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
 * This is used to SetParameter  Values to the UI  
 */
  setParameterValuesToUI() {
    let valueList = [];
    if (this.atmQuestionObjectList != null) {
      this.atmQuestionObjectList.forEach(element => {
        // the conversion to 32 bit  is not doing now from the AtmQuestionTypeModel since it is used in only alrms page , it is done in this module only       
        // element.value16Bit2 = AtmQuestionTypeModel.getValue16Bit(element.value3, element.value4);
        // value32bit = AtmQuestionTypeModel.getValue32Bit(element.value16Bit1, element.value16Bit2);
        // value32bit=element.value32Bit1;
        // check if any alarms present
        valueList = [];
        if (element.value32Bit1 != 0) {
          valueList = this.decipher32bitToGetValuesList(element.value32Bit1);
        }
        if (valueList != null) {
          if (element.channel == Constants.channels.alarmCommunucationChannel && element.subChannel == Constants.channels.alarmsSubchannel) {
            this.alarmsMessageList = this.constructAlarmsandLogListAndShowInUI(valueList, Constants.values.Alarms);
          } if (element.channel == Constants.channels.alarmCommunucationChannel && element.subChannel == Constants.channels.hardwareAlarmsSubchannel) {
            this.hardwareAlarmsMessageList = this.constructAlarmsandLogListAndShowInUI(valueList, Constants.values.HardwareAlarms);
          } if (element.channel == Constants.channels.alarmCommunucationChannel && element.subChannel == Constants.channels.warningsSubchannel) {
            this.warningMessageList = this.constructAlarmsandLogListAndShowInUI(valueList, Constants.values.Warnings);
          } if (element.channel == Constants.channels.alarmCommunucationChannel && element.subChannel == Constants.channels.tempWarningsSubchannel) {
            this.tempWarningMessageList = this.constructAlarmsandLogListAndShowInUI(valueList, Constants.values.TempWarnings);
          } if (element.channel == Constants.channels.alarmCommunucationChannel && element.subChannel == Constants.channels.alarmsLogSubchannel) {
            this.alarmsMessageLogList = this.constructAlarmsandLogListAndShowInUI(valueList, Constants.values.AlarmsLog);
          } if (element.channel == Constants.channels.alarmCommunucationChannel && element.subChannel == Constants.channels.hardwareAlarmsLogSubchannel) {
            this.hardwareAlarmsMessageLogList = this.constructAlarmsandLogListAndShowInUI(valueList, Constants.values.HardwareAlarmsLog);
          } if (element.channel == Constants.channels.alarmCommunucationChannel && element.subChannel == Constants.channels.warningsLogSubchannel) {
            this.warningMessageLogList = this.constructAlarmsandLogListAndShowInUI(valueList, Constants.values.WarningsLog);
          } if (element.channel == Constants.channels.alarmCommunucationChannel && element.subChannel == Constants.channels.tempWarningsLogSubchannel) {
            this.tempWarningMessageLogList = this.constructAlarmsandLogListAndShowInUI(valueList, Constants.values.TempWarningsLog);
          }

          if (this.pcmchanneldataservice.passwordFlag) {
            this.writeData = Constants.messages.clearLog;
          } else {
            this.writeData = Constants.messages.enableWrite;
          }

          this.cd.detectChanges();
        }
      });
    } else {
      console.log(Constants.messages.atmQuestionObjectListnull);
    }


  }

  /** 
   * This is used to get check the bit of 32 bit value and get the set bits
   */
  constructAlarmsandLogListAndShowInUI(valueList, type) {
    let alarmsListMapSelectedValuesList = PCMChannelDataService.getAlarmsListMap(type)
    let messageList = [];
    let alarmLogMessage;
    let isAlarmFound = false;
    if (valueList != null) {
      valueList.forEach(element => {
        //console.log(element);
        if (alarmsListMapSelectedValuesList != null) {
          alarmsListMapSelectedValuesList.forEach(alarmElelement => {
            if (alarmElelement.value == element) {
              isAlarmFound = true;
              alarmLogMessage = alarmElelement.name;

              // constructing the mesage with number  Hardware alarms-: give the number received / For alarms :- add the number with 32              
              alarmLogMessage = this.constructMessageText(element, type, alarmElelement.name);
              messageList.push(alarmLogMessage);
            }
          });
        } else {
          console.log(Constants.messages.alarmsListMapSelectedValuesListnull);
        }


        // For the alarms which the error messages not defined
        if (!isAlarmFound) {
          alarmLogMessage = this.constructMessageText(element, type, Constants.messages.undefined);
          messageList.push(alarmLogMessage);
        }
        isAlarmFound = false; // the flag to be reset to false
      });
    } else {
      console.log(Constants.messages.valueListnull);
    }
    return messageList;
  }


  /** 
  * This is used to construct text with Error number and name 
  */
  constructMessageText(element, type, messageName) {
    // constructing the mesage with number  Hardware alarms-: give the number received / For alarms :- add the number with 32     
    let alarmLogMessage;
    let errorNumberString = element;
    let alarmChar;

    if (type == Constants.values.Alarms || type == Constants.values.AlarmsLog || type == Constants.values.HardwareAlarms || type == Constants.values.HardwareAlarmsLog) {
      alarmChar = Constants.values.E;
    } else {
      alarmChar = Constants.values.W;
    }

    if (type == Constants.values.Alarms || type == Constants.values.AlarmsLog || type == Constants.values.TempWarnings || type == Constants.values.TempWarningsLog) {
      alarmLogMessage = alarmChar + (32 + element) + " " + messageName;
    } else {
      if (element < 10) {
        errorNumberString = "0" + element;
      }
      alarmLogMessage = alarmChar + errorNumberString + " " + messageName;
    }

    return alarmLogMessage;
  }

  /** 
 * This is used to get check the bit of 32 bit value and get the set bits
 */
  decipher32bitToGetValuesList(responseValue32Bit) {
    let i = 0;
    let val;
    let valTopush = 0;
    let valueList = [];
    for (i = 0; i < 31; i++) {
      val = responseValue32Bit & Math.pow(2, i);
      if (val != 0) {
        valTopush = i + 1;
        valueList.push(valTopush);
      }
    }

    return valueList;
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
* This is used to navigate to DriveLogPage
*/
  navigateToDriveLog() {
    this.navCtrl.push(DriveLogPage);
  }

  /** 
* This is used to navigate to DriveLogPage
*/
  navigateToLiveGraph() {
    this.navCtrl.push("LiveGraphPage", { deviceObject: this.deviceObject });
  }

  /** 
   * This is used for going back to the previous page
   */
  back() {
    this.navCtrl.pop();
  }


  /** 
  * This is used to showOrHideAlarms
  */
  showOrHideAlarms() {
    let flag = 0;
    if (this.alarmsMessageList != null) {
      if (this.alarmsMessageList.length > 0) {
        flag = 1;
      }
    }

    if (this.hardwareAlarmsMessageList != null) {
      if (this.hardwareAlarmsMessageList.length > 0) {
        flag = 1;
      }


      if (this.warningMessageList != null) {
        if (this.warningMessageList.length > 0) {
          flag = 1;
        }
      }

      if (this.tempWarningMessageList != null) {
        if (this.tempWarningMessageList.length > 0) {
          flag = 1;
        }
      }

      if (flag == 1) {
        return true;
      } else {
        return false;
      }
    }
  }



  /** 
  * This is used to showOrHideAlarmsLog
  */
  showOrHideAlarmsLog() {
    let flag = 0;
    if (this.alarmsMessageLogList != null) {
      if (this.alarmsMessageLogList.length > 0) {
        flag = 1;
      }
    }

    if (this.hardwareAlarmsMessageLogList != null) {
      if (this.hardwareAlarmsMessageLogList.length > 0) {
        flag = 1;
      }

      if (this.warningMessageLogList != null) {
        if (this.warningMessageLogList.length > 0) {
          flag = 1;
        }
      }

      if (this.tempWarningMessageLogList != null) {
        if (this.tempWarningMessageLogList.length > 0) {
          flag = 1;
        }
      }

      if (flag == 1) {
        return true;
      } else {
        return false;
      }
    }
  }

  /** 
  * This is used to Clear Logs
  */
  clearLogs() {
    // to clear logs
    if (this.pcmchanneldataservice.passwordFlag) {
      console.log("readAlarmsandWarnings called");

      // for clearing the logs write the log channel and subchannel / value notused
      this.operation = Constants.values.write;
      this.atmQuestionObjectList = [];
      this.countAtmQList = 0;

      var logInputList = PCMChannelDataService.getLogInputDetails();
      if (logInputList != null) {
        logInputList.forEach(element => {
          var byteArray = new Uint8Array([element.wType, 0, element.channel, element.subchannel, 0, 0]);
          this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
        });
      } else {
        console.log(Constants.messages.logInputListnull);
      }

      this.readAlarmsandWarnings();
    } else this.enterPaswordPrompt();
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

  /**
* On click of Nav bar settings button, navigate to Settings page
*/
  navigateToSettings() {
    this.navCtrl.push("SettingsPage", { deviceObject: this.deviceObject });
  }


}