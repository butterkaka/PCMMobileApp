import { BLE } from '@ionic-native/ble';
import { AtmQuestionTypeModel } from './../../Models/AtmQuestionType_t';
import { Constants } from './../../shared/app.constant';
import { PCMChannelDataService } from './../../providers/pcm-channel-data-service';
import { PumpSetupPage } from './../pump-setup-page/pump-setup-page';
import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { DeviceModel } from '../../Models/ExportModelClass';
import { IOSetupPage } from '../io-setup-page/io-setup-page'
import { File } from '@ionic-native/file';
import { PcmParameterDataSaveServiceProvider } from './../../providers/pcm-parameter-data-save-service';
import { Platform } from 'ionic-angular'
import { DatePipe } from '@angular/common'
import { EmailComposer } from '@ionic-native/email-composer';
import { FileOpener } from '@ionic-native/file-opener'
import { AtmAuthenticationTypeModel } from './../../Models/AtmAuthenticationModel';

// For Android only comment this both for IOS
import { FileChooser } from '@ionic-native/file-chooser';

declare let FilePicker: any;

/**
 * Generated class for the DeviceSetupPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-device-setup-page',
  templateUrl: 'device-setup-page.html',
})
export class DeviceSetupPage {

  deviceObject: DeviceModel;
  DeviceSetupChanneDetails; //Gets the details of channel and subchannel for the button clicked
  operation = "";
  countAtmQList: number = 0;
  atmAuthenticationTypeObject: AtmAuthenticationTypeModel;
  atmQuestionObjectList: Array<AtmQuestionTypeModel>;
  paramterFileObject;
  isReadRunning = false;
  isFileCreated = false;
  isLoading = false;
  parameterObjectLoad;
  isFileLoaded = false;
  filePlatformSpecificPathDataDirectory = "";
  allparameterCount = 94;
  platformSpeceficProvidedFileName;
  parameterFileObjectIdMapped;
  //FilePicker: any;


  /**
  * DeviceSetupPage Constructor.
  * @constructor
  * @param navCtrl NavController for navigation
  * @param navParams NavParams paremters from previous component
  */
  constructor(public navCtrl: NavController, public navParams: NavParams, public pcmchanneldataservice: PCMChannelDataService, private cd: ChangeDetectorRef,
    public alertCtrl: AlertController, private ble: BLE, private file: File, private pcmParameterDataSaveServiceProvider: PcmParameterDataSaveServiceProvider,
    public loadingController: LoadingController, public platform: Platform, private emailComposer: EmailComposer, private fileOpener: FileOpener,
    private datepipe: DatePipe, private fileChooser: FileChooser) {
    this.deviceObject = navParams.get("deviceObject");

    // For Android only
    //this.filePlatformSpecificPathDataDirectory = this.file.externalDataDirectory;

    // For iOS only
    this.filePlatformSpecificPathDataDirectory = this.file.dataDirectory;
    console.log("this.filePlatformSpecificPathDataDirectory ", this.filePlatformSpecificPathDataDirectory);
  }

  /** 
  * @event ionViewDidLoad PageLoad Event  
  */
  ionViewDidLoad() {
    console.log('ionViewDidLoad DeviceSetup');
  }
  ionViewDidEnter() {
    //console.log(this.connectorPinType);
    this.operation = "";
    this.initializeStartNotify();
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
    this.atmQuestionObjectList = []
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
        // if (!this.pcmchanneldataservice.passwordFlag && !this.pcmchanneldataservice.passwordDeviceSetupPageFlag) {
        //   this.enterPaswordPrompt();
        // }
      }
      else if (this.operation == Constants.values.authenticate) {
        console.log("startNotify authenticate")
        this.atmAuthenticationTypeObject = (new AtmAuthenticationTypeModel(new Uint8Array(buffer)));

        if (this.atmAuthenticationTypeObject.status == 0) {
          console.log("Works");
          this.pcmchanneldataservice.passwordFlag = true;

          this.pcmchanneldataservice.presentAlert(Constants.messages.passwordAuthHeader, Constants.messages.passwordAuthSubheaderSuccess);
        }
        else {
          console.log("Not Working");
          this.pcmchanneldataservice.presentAlert(Constants.messages.passwordAuthHeader, Constants.messages.passwordAuthSubheaderFailure);
        }
      }

      else {
        this.atmQuestionObjectList.push(new AtmQuestionTypeModel(new Uint8Array(buffer)));
        this.countAtmQList++;
        //console.log("Count List" + this.countAtmQList);
        if (this.operation == Constants.values.write) {
          this.checkWriteStatus();
        }
        else if (this.operation == Constants.values.SaveToFile && this.countAtmQList > (this.allparameterCount - 1)) {
          this.LoadValuesToParameterFileObject();
        } else if (this.operation == Constants.values.LoadToDevice && this.countAtmQList > (this.allparameterCount - 1)) {
          this.CheckLoadStatus();
        }


      }
    }, error => {
      console.log(JSON.stringify(error));
    })
  }

  /** 
      *This is to navigate to Previous Page
  */
  back() {
    this.navCtrl.pop();
  }



  /** 
      *This is to navigate to PumpSetupPage
  */
  launchPumpSetupPage() {
    this.navCtrl.push(PumpSetupPage, { deviceObject: this.deviceObject });
  }

  /** 
      *This is to navigate to RegularSetupPage
  */
  GoToRegularSetupPage() {
    this.navCtrl.push("PressureRegulatorSetupPage");
  }

  launchRampSetupPage() {
    this.navCtrl.push("RampSetupPage", { deviceObject: this.deviceObject });
  }

  launchSwashAngleSetupPage() {
    this.navCtrl.push("SwashAngleSetupPage", { deviceObject: this.deviceObject });
  }

  /** 
  *This is to navigate to IOSetupPage
  */
  navigateToIOSetup() {
    //this.navCtrl.push(IOSetupPage);
    this.navCtrl.push(IOSetupPage, { deviceObject: this.deviceObject, ioSetupHeader: Constants.values.ioSetup });
  }

  /**
   * This is to Factory reset the PCM device
   */
  factoryResetButtonClick() {
    console.log('factoryResetButtonClick');
    this.DeviceSetupChanneDetails = PCMChannelDataService.deviceSetupFunctionality(Constants.values.FactoryReset);
    this.confirmActionPrompt();
  }

  /**
   * This is to  save the configurations to the PCM device
   */
  saveToEepromButtonClick() {
    console.log('saveToEepromButtonClick');
    this.DeviceSetupChanneDetails = PCMChannelDataService.deviceSetupFunctionality(Constants.values.SaveToEeprom);
    this.confirmActionPrompt();

  }

  /**
   * This is to  save the configurations to the PCM device
   */
  loadFromEepromButtonClick() {
    console.log('loadFromEepromButtonClick');
    this.DeviceSetupChanneDetails = PCMChannelDataService.deviceSetupFunctionality(Constants.values.LoadFromEeprom);
    this.confirmActionPrompt();

  }

  /** 
  * This is to send Eeprom function parameters onto the device.  
  */
  writeEepromData() {
    this.operation = Constants.values.write;
    this.atmQuestionObjectList = [];
    this.countAtmQList = 0;

    var byteArray = new Uint8Array([this.DeviceSetupChanneDetails.wType, 0, this.DeviceSetupChanneDetails.channel, this.DeviceSetupChanneDetails.subchannel, 0, 0]);
    this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
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
  * This is used to check the write status of the parameters.  
  */
  checkWriteStatus() {

    let saveFlag = 0;
    if (this.atmQuestionObjectList != null) {
      this.atmQuestionObjectList.forEach(element => {
        if (element.status != 0) {
          saveFlag = 1;
          if (element.channel == this.DeviceSetupChanneDetails.channel && element.subChannel == this.DeviceSetupChanneDetails.subChannel) {
            this.pcmchanneldataservice.presentAlert(Constants.messages.Failed, Constants.messages.alarmMinTitle + element.status)
          }
          else {
            console.log('Please check the channel')
          }
        }
      });
    }
    else {
      console.log(Constants.messages.atmQuestionObjectListnull);
    }
    if (saveFlag == 0) {

      console.log('check write status: ' + this.DeviceSetupChanneDetails.name);
      if (this.DeviceSetupChanneDetails.name == Constants.values.FactoryReset) {
        this.pcmchanneldataservice.presentAlert(Constants.values.FactoryReset, Constants.messages.paramResetSuccessfully);
      }
      else if (this.DeviceSetupChanneDetails.name == Constants.values.LoadFromEeprom) {
        this.pcmchanneldataservice.presentAlert(Constants.values.LoadFromEeprom, Constants.messages.paramLoadedSuccessfully);
      }
      else if (this.DeviceSetupChanneDetails.name == Constants.values.SaveToEeprom) {
        this.pcmchanneldataservice.presentAlert(Constants.values.SaveToEeprom, Constants.messages.paramSavedSuccessfully);
      }
    }


  }

  /**
   * Prompt to confirm users actions 
   */
  confirmActionPrompt() {

    if (this.pcmchanneldataservice.passwordFlag) {

      this.pcmchanneldataservice.alert = this.alertCtrl.create({
        title: Constants.messages.confirmHeader,
        subTitle: Constants.messages.confirmSubheader + this.DeviceSetupChanneDetails.name + '?',

        buttons: [
          {
            text: Constants.messages.apply,
            handler: data => {
              this.writeEepromData();
            }
          },
          {
            text: Constants.messages.cancel
          }
        ]
      });
      this.pcmchanneldataservice.alert.present();
    } else this.enterPaswordPrompt();
  }

  savetoFilePlatformSpecific() {
    if (this.pcmchanneldataservice.passwordFlag) {
      // IOS
      // this.saveToFile();

      // for Android
      this.fleNameChangePrompt();
    } else this.enterPaswordPrompt();
  }

  // /**
  //  * Prompt to confirm users actions 
  //  */
  // confirmActionPromptForLoadFile() {

  //   this.pcmchanneldataservice.alert = this.alertCtrl.create({
  //     title: Constants.messages.confirmHeader,
  //     subTitle: Constants.messages.confirmLoadFileSubheader,

  //     buttons: [
  //       {
  //         text: Constants.messages.apply,
  //         handler: data => {
  //           this.loadFromFile(this.file.externalDataDirectory);
  //         }
  //       },
  //       {
  //         text: Constants.messages.cancel
  //       }
  //     ]
  //   });
  //   this.pcmchanneldataservice.alert.present();

  // }



  /**
   * Save all the parameters to File
   */
  saveToFile() {

    this.isFileCreated = false;

    this.pcmchanneldataservice.loaderGlobal = this.loadingController.create({
      content: Constants.messages.SavingFile
    });
    this.pcmchanneldataservice.loaderGlobal.present();


    //console.log("applicationDirectory"+this.file.applicationDirectory);
    //console.log("externalDataDirectory" + this.file.externalDataDirectory);


    this.readAllParameterList();
    // JSON.Parse(fileText) to convert to object again   


  }




  async readAllParameterList() {

    console.log("read started");
    this.operation = Constants.values.SaveToFile;
    this.atmQuestionObjectList = [];
    this.countAtmQList = 0;
    let i = 0;
    this.isReadRunning = true;

    this.paramterFileObject = PcmParameterDataSaveServiceProvider.getAllParametersList();

    for (let element of this.paramterFileObject) {
      i++;
      //console.log("i val : " + i + "channel : " + element.channel + "element.subchannel :" + element.subchannel);
      var byteArray = new Uint8Array([Constants.values.rType, 0, element.channel, element.subchannel, 0, 0]);
      this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
      await this.sleep(5);
    }

    this.isReadRunning = false;

    // work aorund if all values not get saved
    setTimeout(() => {
      if (this.countAtmQList < this.allparameterCount && !this.isReadRunning && this.operation == Constants.values.SaveToFile) {
        this.checkRequestWithNoResponse();
        this.pcmchanneldataservice.loaderGlobal.dismiss();
      }
    }, 4000);

  }


  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // this will check if any request has not got the response or not.If not it will call that request seperately
  async checkRequestWithNoResponse() {

    // compare atmQuestionObjectList vs paramterFileObject

    let existFlag = false;
    let i = 0;

    for (let element of this.paramterFileObject) {

      existFlag = false;
      this.atmQuestionObjectList.forEach(atmQuestionObjectListelement => {
        if (element.channel == atmQuestionObjectListelement.channel && element.subchannel == atmQuestionObjectListelement.subChannel) {
          existFlag = true;
        }
      });

      if (existFlag == false) {
        i++;
        //console.log("i val : " + i + "channel : " + element.channel + "element.subchannel :" + element.subchannel);
        var byteArray = new Uint8Array([Constants.values.rType, 0, element.channel, element.subchannel, 0, 0]);
        this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
        await this.sleep(5);
      }
    }

  }



  /**
  * This will get values read from device and store it in the object
  */
  LoadValuesToParameterFileObject() {
    console.log("load started");
    this.atmQuestionObjectList.forEach(element => {
      this.paramterFileObject.forEach(parameterFileItem => {
        if (element.channel == parameterFileItem.channel && element.subChannel == parameterFileItem.subchannel) {
          parameterFileItem.value = element.value32Bit1;
        }
      });
    });

    // save to the file 

    this.SaveParameterObjectToFile();
  }


  /**
  * This will convert the object to JSON text and save in a file
  */
  SaveParameterObjectToFile() {
    try {
      let fileText;
      this.pcmchanneldataservice.loaderGlobal.dismiss();

      this.CopyAllparameterListToMapID();

      //fileText = JSON.stringify(this.paramterFileObject);

      fileText = JSON.stringify(this.parameterFileObjectIdMapped);

      this.file.writeFile(this.filePlatformSpecificPathDataDirectory, this.platformSpeceficProvidedFileName + Constants.values.fileExtentionText, fileText, { replace: true }).then(() => { //New Anu
        // this.file.writeFile(this.filePlatformSpecificPathDataDirectory, Constants.values.SaveFileName, fileText, { replace: true }).then(() => {
        console.log("SaveParameterObjectToFile this.platformSpeceficProvidedFileName ", this.platformSpeceficProvidedFileName);
        console.log("SaveParameterObjectToFile this.filePlatformSpecificPathDataDirectory ", this.filePlatformSpecificPathDataDirectory);
        console.log("File Created");
        if (!this.isFileCreated) {
          this.isFileCreated = true;
          // this.pcmchanneldataservice.presentAlert(Constants.messages.saveToFileAlertHeader, Constants.messages.saveToFileAlertMessageSuccess);
          // Need to call the send mail Question here inside this if  ********************
          this.presentEmailAlert();
        }
      }).catch(error => {
        console.log(JSON.stringify(error));
        this.pcmchanneldataservice.presentAlert(Constants.messages.saveToFileAlertHeader, Constants.messages.saveToFileAlertMessageFailed);
      });
    } catch (error) {
      console.log(error);
    }


  }

  // this function copies to different json to hide the channel list
  CopyAllparameterListToMapID() {
    try {
      this.parameterFileObjectIdMapped = PcmParameterDataSaveServiceProvider.getAllParametersListIdMap();

      this.paramterFileObject.forEach(element => {
        this.parameterFileObjectIdMapped.forEach(elementIdMap => {
          if (element.pid == elementIdMap.pid) {
            elementIdMap.value = element.value;
          }
        });

      });
    } catch (e) {
      console.log(e)
    }

  }

  /**
 * This will Load values from File to Object
 */
  LoadFile() {
    if (this.pcmchanneldataservice.passwordFlag) {
      this.fileChooseOptionPrompt();
    } else this.enterPaswordPrompt();
  }

  /**
   * Prompt to confirm users actions 
   */
  fileChooseOptionPrompt() {

    this.pcmchanneldataservice.alert = this.alertCtrl.create({
      title: Constants.messages.confirmHeader,
      subTitle: Constants.messages.confirmLoadFileSubheader,

      buttons: [
        // {
        //   text: "Default",
        //   handler: data => {
        //     // this.loadFromFile(this.filePlatformSpecificPathDataDirectory, Constants.values.SaveFileName);
        //     this.loadFromFile(this.filePlatformSpecificPathDataDirectory, this.platformSpeceficProvidedFileName); //New Anu 
        //   }
        // },
        {
          text: "Browse",
          handler: data => {
            this.pcmchanneldataservice.appResetFlag=false;
            //for android
            //this.fileChooserFunction();

            // for ios
            this.pickFileForIOSFromDocumentProvider();
          }

        },
        {
          text: "Cancel"
        }
      ]
    });
    this.pcmchanneldataservice.alert.present();

  }



  openFileSaved() {
    // this.fileOpener.open(this.filePlatformSpecificPathDataDirectory + Constants.values.SaveFileName, "application/txt")
    this.fileOpener.open(this.filePlatformSpecificPathDataDirectory + this.platformSpeceficProvidedFileName + Constants.values.fileExtentionText, "application/txt") //New Anu 
      .then(() => {
        console.log('File is opened')
      })
      .catch(e => {
        console.log('Error openening file', e)
      });
  }


  /**
   * This function will open the file borwser to select the file for loading // ONLY FOR ANDROID
   */
  fileChooserFunction() {
    let newFilePath;
    let tempPath;
    let selectedfilename;
    // Only Works For Android
    this.fileChooser.open().then(uri => {
      console.log(uri);
      tempPath = uri;
      newFilePath = uri.substr(0, uri.lastIndexOf('/') + 1);
      selectedfilename = tempPath.replace(newFilePath, "");

      console.log(newFilePath);
      console.log(selectedfilename);

      //newFilePath = tempPath.replace(Constants.values.SaveFileName, "");
      this.loadFromFile(newFilePath, selectedfilename);
    }).catch(error => {
      console.log(JSON.stringify(error));
    });
  }

  // this function copies to different json to hide the channel list
  CopyIDMapToAllparameterList() {
    try {
      this.parameterObjectLoad = PcmParameterDataSaveServiceProvider.getAllParametersList();
      this.parameterFileObjectIdMapped.forEach(elementIdMap => {
        this.parameterObjectLoad.forEach(element => {
          if (element.pid == elementIdMap.pid) {
            element.value = elementIdMap.value;
          }
        });
      });
    } catch (error) {
      console.log("CopyIDMapToAllparameterList:" + error)

    }
  }

  /**
   * This function reads the file and loads the file to the device 
   */
  loadFromFile(fileFullPath, fileName) {

    //alert("Load From File");
    console.log("Load From file Function  started");

    this.file.checkFile(fileFullPath, fileName).then(() => {

      this.isFileLoaded = false;
      this.pcmchanneldataservice.loaderGlobal = this.loadingController.create({
        content: Constants.messages.LoadingFile
      });
      this.pcmchanneldataservice.loaderGlobal.present();

      console.log("Load File Started");

      //console.log("nativePath"+nativePath);
      this.file.readAsText(fileFullPath, fileName).then(data => {
        this.parameterObjectLoad = JSON.parse(data);
        this.LoadValuesToTheDevice();
      }).catch(error => {
        console.log(JSON.stringify(error));
      });

    }).catch(error => {
      console.log("Check file failed");
      console.log(JSON.stringify(error));
      this.pcmchanneldataservice.presentAlert(Constants.messages.FileCheckHeader, Constants.messages.FileCheckSubHeader);
    });

  }



  /**
  * This will Write Values from File Object to device
  */
  async LoadValuesToTheDevice() {
    let i = 0;
    let val1;
    let val2;
    let val3;
    let val4;
    let value32;
    this.operation = Constants.values.LoadToDevice
    this.atmQuestionObjectList = [];
    this.countAtmQList = 0;
    this.isLoading = true;

    this.CopyIDMapToAllparameterList();

    //this.parameterObjectLoad.forEach(element => {

    for (let element of this.parameterObjectLoad) {
      //console.log("i val : " + i + "channel : " + element.channel + "element.subchannel :" + element.subchannel + "Value : " + element.value);
      i++;

      // converting 16 bt balue to 2 8bit and write to the device
      // high

      value32 = element.value;

      val4 = (value32 & 0xff000000) >> 24;
      val3 = (value32 & 0x00ff0000) >> 16;
      val2 = (value32 & 0x0000ff00) >> 8;
      val1 = (value32 & 0x000000ff);
      var byteArray = new Uint8Array([Constants.values.wType, 0, element.channel, element.subchannel, val1, val2, val3, val4]);
      this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
      await this.sleep(5);
      // });    
    }
    console.log("Total Count :" + i);
    this.isLoading = false;

    // work aorund if all values not get saved
    // this will have a recheck of loading functionality after 4 seconds 
    setTimeout(() => {
      if (this.countAtmQList < this.allparameterCount && !this.isLoading && this.operation == Constants.values.SaveToFile) {
        this.checkLoadMismatch();
        this.pcmchanneldataservice.loaderGlobal.dismiss();
      }
    }, 4000);
  }



  /**
  * This function will check the status of wirte to device from file object
  */
  CheckLoadStatus() {
    console.log("Check Load Started")
    this.pcmchanneldataservice.loaderGlobal.dismiss();
    let errorMessage: string = Constants.messages.ulOpen;
    let message;
    let isAllStatusSuccess = true;

    this.atmQuestionObjectList.forEach(element => {
      if (element.status != 0) {
        //test  ignore 2 erros just for testing
        if (element.status == -1 || element.status == -3) {
        } else {
          isAllStatusSuccess = false;
        }

        //errorMessagge.push("Failed with status :"+element.status+" Channel :"+element.channel+" Subchannel : "+element.subChannel);
        //console.log("Failed with status :" + element.status + " Channel :" + element.channel + " Subchannel : " + element.subChannel)
        let nameValue = this.FindingName(element.channel, element.subChannel);
        message = " Name :" + nameValue + "<br> status :" + element.status;

        errorMessage = errorMessage + Constants.messages.liOpen + message + Constants.messages.liClose;
      }
    });
    if (!this.isFileLoaded) {
      this.isFileLoaded = true;
      if (isAllStatusSuccess) {
        this.pcmchanneldataservice.presentAlert(Constants.messages.FileLoadSuccessHeader, Constants.messages.FileLoadSuccess);
      } else {
        this.pcmchanneldataservice.presentAlert(Constants.messages.FileLoadSuccessHeader, Constants.messages.FileLoadFailed + "<br>" + errorMessage);
      }
    }
  }

  FindingName(channel, subchannel) {
    let findingNameObject = PcmParameterDataSaveServiceProvider.getAllParametersList();
    let itemName;

    findingNameObject.forEach(findingNameItem => {
      if (channel == findingNameItem.channel && subchannel == findingNameItem.subchannel) {

        itemName = findingNameItem.name;
      }
    });
    return itemName;
  }

  /**
 * This function will check mismatch number of write and response
 */
  async checkLoadMismatch() {

    console.log("Check Load Mismatch")
    let existFlag = false;
    let i = 0;
    let val1;
    let val2;
    let val3;
    let val4;
    let value32;


    for (let element of this.parameterObjectLoad) {
      existFlag = false;
      this.atmQuestionObjectList.forEach(atmQuestionObjectListelement => {
        if (element.channel == atmQuestionObjectListelement.channel && element.subchannel == atmQuestionObjectListelement.subChannel) {
          existFlag = true;
        }
      });

      if (existFlag == false) {
        i++;
        //console.log("i val : " + i + "channel : " + element.channel + "element.subchannel :" + element.subchannel);
        value32 = element.value;

        val4 = (value32 & 0xff000000) >> 24;
        val3 = (value32 & 0x00ff0000) >> 16;
        val2 = (value32 & 0x0000ff00) >> 8;
        val1 = (value32 & 0x000000ff);
        var byteArray = new Uint8Array([Constants.values.wType, 0, element.channel, element.subchannel, val1, val2, val3, val4]);
        this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
        await this.sleep(5);
      }
    }
    this.pcmchanneldataservice.loaderGlobal.dismiss();
  }

  /**
  * This function will pick the file from Icloud ONLY for IOS
  */
  pickFileForIOSFromDocumentProvider() {

    FilePicker.isAvailable(function (avail) {
      // alert(avail ? "YES" : "NO");
    });
    let errorCallback = "error jk";



    FilePicker.pickFile(successCallback.bind(this), errorCallback);

    function successCallback(path) {

      var fullPath;
      var fileName;

      console.log(this.file);
      var tempPath;
      var newFilePath;
      //alert("You picked this file: " + path);      
      tempPath = path;
      newFilePath = tempPath.substr(0, tempPath.lastIndexOf('/') + 1);


      // project ID
      fileName = tempPath.replace(newFilePath, "");
      // fullPathFileName = this.file.tempDirectory + "com.bosch.edc.pcmmobile-Inbox/" + Constants.values.SaveFileName
      fullPath = this.file.tempDirectory + "com.bosch.edc.pcmmobile-Inbox/";

      this.loadFromFile(fullPath, fileName);

    }
  }

  /**
  * This is a alert controller popup which warns the user that the Pressure Regulator is ON
  */
  presentEmailAlert() {

    this.pcmchanneldataservice.alert = this.alertCtrl.create({
      title: Constants.messages.saveToFileAlertHeader + ":",
      subTitle: Constants.messages.emailSubheaderIOS1 + this.platformSpeceficProvidedFileName + Constants.messages.emailSubheaderIOS2,

      buttons: [
        {
          text: Constants.messages.proceed,
          handler: data => {
            this.sendEmail();
            this.pcmchanneldataservice.appResetFlag=false;
          }
        },
        {
          text: "Open File",
          handler: data => {
            this.openFileSaved();
            this.pcmchanneldataservice.appResetFlag=false;
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
   * THis will be used to send Email with the log file as attachment
   */

  sendEmail() {
    // console.log(this.filePlatformSpecificPathDataDirectory + Constants.values.SaveFileName);
    console.log('sendEmail: ', this.filePlatformSpecificPathDataDirectory + this.platformSpeceficProvidedFileName); //New Anu
    let email = {
      // attachments: [this.filePlatformSpecificPathDataDirectory + Constants.values.SaveFileName],
      attachments: [this.filePlatformSpecificPathDataDirectory + this.platformSpeceficProvidedFileName + Constants.values.fileExtentionText], //New Anu
      subject: 'Log File: ' + this.datepipe.transform(new Date(), 'yyyy-MM-dd H:mm a'),
      isHtml: true
    };
    this.emailComposer.open(email);
  }

  /**   
 * This is a alert controller popup which helps the user set specific value ONLY For Android
 * 
 */
  fleNameChangePrompt() {

    this.pcmchanneldataservice.alert = this.alertCtrl.create({
      title: "Save",
      subTitle: Constants.messages.enterFileNameToBeSet,
      inputs: [
        {
          value: "PcmParameterFile",
          name: Constants.messages.value,
          //placeholder: Constants.messages.enter + item.Title +' '+ Constants.messages.value
        }
      ],
      buttons: [
        {
          text: Constants.messages.apply,
          handler: data => {
            let regexp = /[^\w\s]/;
            if (regexp.test(data.value)) {

              this.pcmchanneldataservice.presentAlert("File Name Error:", "File name entered was incorrect.\n Please, try again without any special characters");
            }
            else {
              this.platformSpeceficProvidedFileName = data.value;
              this.saveToFile();
            }
            console.log("data.value: ", data.value);
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
     * This is a alert controller popup which helps the user set specific value
     * @param item - the item chosen from the list
     */
  enterPaswordPrompt() {
    this.pcmchanneldataservice.passwordDeviceSetupPageFlag = true;
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

