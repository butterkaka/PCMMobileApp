import { Constants } from './../../shared/app.constant';
import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Keyboard } from 'ionic-angular';
import { PCMChannelDataService } from '../../providers/pcm-channel-data-service';
import { BLE } from '@ionic-native/ble';
import { DeviceModel, AtmQuestionTypeModel } from '../../Models/ExportModelClass';
import { Chart } from 'chart.js';
import { Storage } from '@ionic/storage';
import { AtmAuthenticationTypeModel } from './../../Models/AtmAuthenticationModel';

/**
 * Generated class for the ConnectorParameterSetupPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-connector-parameter-setup',
  templateUrl: 'connector-parameter-setup.html',
})
export class ConnectorParameterSetupPage {

  connector;
  connectorValObj;
  functionInput = 0;
  connectorParameterSetupList;
  unitValue; // same for all as values in the dropdown  of now// to discuss
  displayUnit = 4;
  graphHeader;
  graphValue;
  minInput = 0;
  MaxInput = 0;
  previousDisplayUnit;
  sensorUnit = 0;
  previousSensorUnit = 0;
  warningMin = 0;// = 5;
  warningMax = 0;// = 180;
  alarmMin = 0; //= 1;
  alarmMax = 0; //= 6;
  analogInputParameterItems;
  operation;
  countAtmQList: number = 0;
  atmQuestionObjectList: Array<AtmQuestionTypeModel>;
  deviceObject: DeviceModel;
  connecterSetupSetpinButtonDisabled;
  channel;
  functionInputsubChannel = 0;   // function input subchannel value is 0
  connectorSetupErrormessageList;
  connectorPinType;  // a constant value to identify the pins 
  countOfParametersForSelectedPin; // used while writing the parameters set when FunctionInput change / not used in readParameters
  invertedDigital;
  calibrationVal;
  disabledTrue = true;
  graphHideFlag = false;
  calibrationCount = 0;
  startUpdateId;
  xValueCounter = 0;
  myLineChart;
  sensorUnitDropdownList;
  displayUnitDropdownList;
  pT100HideFlag = false;
  // temperatureDisplayUnit;
  // pressureDisplayUnit;
  pinValueHeader;
  graphMinInput;
  graphMaxInput;

  writeData: string = Constants.messages.saveParameters;
  atmAuthenticationTypeObject: AtmAuthenticationTypeModel;

  data = {
    labels: [],
    datasets: [
      {
        label: "",
        fill: false,
        backgroundColor: "rgba(41, 128, 185,0.4)",
        borderColor: "rgba(41, 128, 185,1)",
        data: []
      },
      {
        label: "",
        fill: false,
        backgroundColor: "rgba(223,0,36,0.4)",
        borderColor: "rgba(223,0,36,1)",
        data: []
      },
      {
        label: "",
        fill: false,
        backgroundColor: "rgba(223,0,36,0.4)",
        borderColor: "rgba(223,0,36,1)",
        data: []
      },
      {
        label: "",
        fill: false,
        backgroundColor: "rgba(253,172,16,0.4)",
        borderColor: "rgba(253,172,16,1)",
        data: []
      },
      {
        label: "",
        fill: false,
        backgroundColor: "rgba(253,172,16,0.4)",
        borderColor: "rgba(253,172,16,1)",
        data: []
      }
    ]
  };

  constructor(public navCtrl: NavController, public navParams: NavParams, public pcmchanneldataservice: PCMChannelDataService, private cd: ChangeDetectorRef,
    public alertCtrl: AlertController, private ble: BLE, public keyboard: Keyboard, private storage: Storage) {

    this.connector = navParams.get(Constants.values.connector);
    this.connectorValObj = navParams.get(Constants.values.connectorValObj);
    if (this.connector == Constants.values.PT) {
      this.analogInputParameterItems = pcmchanneldataservice.analogInputParameterItemsPt100;
    } else this.analogInputParameterItems = pcmchanneldataservice.analogInputParameterItems;
    this.deviceObject = pcmchanneldataservice.deviceObjectGlobal;


  }


  /** 
  * @event ionViewDidEnter  
  */
  ionViewDidLoad() {
    console.log('ionViewDidLoad ConnectorParameterSetupPage');
    console.log('ionViewDidLoad pressureDisplayUnit', this.pcmchanneldataservice.pressureDisplayUnit);
    console.log('ionViewDidLoad temperatureDisplayUnit', this.pcmchanneldataservice.temperatureDisplayUnit);
  }

  /** 
  * @event ionViewDidEnter  
  */
  ionViewDidEnter() {
    console.log('ionViewDidEnter SettingsPage');


    if (this.connectorValObj.pinValue.indexOf("PT100") != -1) {
      this.pinValueHeader = "PT100";
    } else {
      this.pinValueHeader = this.connectorValObj.pinValue;
    }

    // this.setSavedDisplaySiValue();
    this.setConnecterPinType();
    this.GetConnectorDropDownList();
    this.setParamterChannel();
    //console.log(this.connectorPinType);
    this.initializeStartNotify();
    this.readParameterValuesFromPCM();
    this.functionInputChange();

    this.addGraph();
    this.startGraphUpdate();

    this.SetTimeoutForViewUpdate();

  }

  /**
  * 
  * @event ionViewWillLeave - Event triggered when the page is about to leave to next page.  
 */
  ionViewWillLeave() {
    this.stopGraphUpdate();

  }

  // setSavedDisplaySiValue() {

  //   this.storage.get('temperature').then((val) => {
  //     if (val == null) {
  //       this.storage.set('temperature', Constants.values.CelsiusUnitValue);
  //       val = Constants.values.CelsiusUnitValue;
  //     }
  //     this.pcmchanneldataservice.temperatureDisplayUnit = val;
  //     console.log('Temperature is', val);

  //   });

  //   this.storage.get('pressure').then((val) => {
  //     if (val == null) {
  //       this.storage.set('pressure', Constants.values.BarUnitValue);
  //       val = Constants.values.BarUnitValue;
  //     }
  //     this.pcmchanneldataservice.pressureDisplayUnit = val;
  //     console.log('pressure is', val);
  //   });
  // }

  /** 
    *This is to update the view 
    */
  SetTimeoutForViewUpdate() {

    setTimeout(() => {
      this.cd.detectChanges();
      console.log('SetTimeoutForViewUpdate');
    }, 200);
    setTimeout(() => {
      this.cd.detectChanges();
      console.log('SetTimeoutForViewUpdate');
    }, 300);
    //  setTimeout(() => {
    //   this.cd.detectChanges();
    // },400);   
  }

  /** 
    *SetTimeout For View Update
    */
  back() {
    this.navCtrl.pop();
  }

  /** 
 *This is set parameter channel value
 */
  setParamterChannel() {
    // set channel value
    if (this.connectorValObj.pinValue == Constants.values.AnalogIn1Value) {
      this.channel = Constants.channels.standaloneAnalog1FunctionChannel;
      //this.connectorPinType = Constants.values.AnalogIn1;     
    } else if (this.connectorValObj.pinValue == Constants.values.AnalogIn2Value) {
      this.channel = Constants.channels.standaloneAnalog2FunctionChannel;
    } else if (this.connectorValObj.pinValue == Constants.values.AnalogIn3Value) {
      this.channel = Constants.channels.standaloneAnalog3FunctionChannel;
    } else if (this.connectorValObj.pinValue == Constants.values.AnalogIn4Value) {
      this.channel = Constants.channels.standaloneAnalog4FunctionChannel;
    } else if (this.connectorValObj.pinValue == Constants.values.AnalogIn5Value) {
      this.channel = Constants.channels.standaloneAnalog5FunctionChannel;
    } else if (this.connectorValObj.pinValue == Constants.values.AnalogIn6Value) {
      this.channel = Constants.channels.standaloneAnalog6FunctionChannel;
    } else if (this.connectorValObj.pinValue == Constants.values.DigitalIn1Value) {
      this.channel = Constants.channels.standaloneDigitalInput1FunctionChannel;
    } else if (this.connectorValObj.pinValue == Constants.values.DigitalIn2Value) {
      this.channel = Constants.channels.standaloneDigitalInput2FunctionChannel
    } else if (this.connectorValObj.pinValue == Constants.values.DigitalIn3Value) {
      this.channel = Constants.channels.standaloneDigitalInput3FunctionChannel;
    } else if (this.connectorValObj.pinValue == Constants.values.DigitalIn4Value) {
      this.channel = Constants.channels.standaloneDigitalInput4FunctionChannel;
    } else if (this.connectorValObj.pinValue == Constants.values.DigitalIo1Value) {
      this.channel = Constants.channels.standaloneDigitalIO1FunctionChannel;
    } else if (this.connectorValObj.pinValue == Constants.values.DigitalIo2Value) {
      this.channel = Constants.channels.standaloneDigitalIO2FunctionChannel;
    } else if (this.connectorValObj.pinValue == Constants.values.DigitalIo3Value) {
      this.channel = Constants.channels.standaloneDigitalIO3FunctionChannel;
    } else if (this.connectorValObj.pinValue == Constants.values.DigitalIo4Value) {
      this.channel = Constants.channels.standaloneDigitalIO4FunctionChannel;
    } else if (this.connectorValObj.pinValue == Constants.values.DigitalIo5Value) {
      this.channel = Constants.channels.standaloneDigitalIO5FunctionChannel;
    } else if (this.connectorValObj.pinValue == Constants.values.DigitalIo6Value) {
      this.channel = Constants.channels.standaloneDigitalIO6FunctionChannel;
    } else if (this.connectorValObj.pinValue == Constants.values.DigitalIo7Value) {
      this.channel = Constants.channels.standaloneDigitalIO7FunctionChannel;
    } else if (this.connectorValObj.pinValue == Constants.values.DigitalIo8Value) {
      this.channel = Constants.channels.standaloneDigitalIO8FunctionChannel;
    } else if (this.connector == Constants.values.PT) { // same channel for all the PT input buttons
      this.channel = Constants.channels.standaloneFunctionPT100Channel;
    }
  }

  /** 
   * This is set selected parameter Connecter Pin type
   */
  setConnecterPinType() {
    if (this.isAnalogInSelected()) {
      this.connectorPinType = Constants.values.AnalogIn;  // based on this the list will be read for readParameters
    } else if (this.isDigitalIOSelected()) {
      this.connectorPinType = Constants.values.DigitalIn;
    } else if (this.connector == Constants.values.PT) { // PI does not have any inputs to trigger only PT is required      
      this.connectorPinType = Constants.values.PT100;
      this.pT100HideFlag = true; // For hiding sensor unit on PT100 
    }
  }



  /** 
   * This is get list of values for the selected connector.Options for the dropdown control
   */
  GetConnectorDropDownList() {
    if (this.connector == Constants.values.AI || this.connectorValObj.pinValue == Constants.values.AnalogIn3Value ||
      this.connectorValObj.pinValue == Constants.values.AnalogIn4Value || this.connectorValObj.pinValue == Constants.values.AnalogIn5Value
      || this.connectorValObj.pinValue == Constants.values.AnalogIn6Value) {
      this.connectorParameterSetupList = PCMChannelDataService.getconnectorParameterDropdownList(Constants.values.AI);
    } else if (this.connector == Constants.values.DI || this.connector == Constants.values.DO) {
      this.connectorParameterSetupList = PCMChannelDataService.getconnectorParameterDropdownList(Constants.values.DIO);
    } else if (this.connectorValObj.pinValue == Constants.values.DigitalIn1Value
      || this.connectorValObj.pinValue == Constants.values.DigitalIn2Value || this.connectorValObj.pinValue == Constants.values.DigitalIn3Value
      || this.connectorValObj.pinValue == Constants.values.DigitalIn4Value) {
      this.connectorParameterSetupList = PCMChannelDataService.getconnectorParameterDropdownList(Constants.values.DI);
    } else if (this.connector == Constants.values.PT) {
      this.connectorParameterSetupList = PCMChannelDataService.getconnectorParameterDropdownList(Constants.values.PT);
    }
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
   * Event to detect change of functionInput drop down
   */
  functionInputChange() {

    this.graphHideFlag = false;
    if (this.isAnalogInSelected() || this.connector == Constants.values.PT) {
      if (this.functionInput == Constants.values.workPressureInput) {
        this.countOfParametersForSelectedPin = 3; // 3 parameters including function input and excluding unit / have to discuss
        // this.unitValue = Constants.values.bar;
        this.sensorUnitDropdownList = PCMChannelDataService.getAnalogSensorUnitDropdownList(Constants.values.workPressureInput);
      } else if (this.functionInput == Constants.values.thresholdTemp) {
        this.countOfParametersForSelectedPin = 7;
        // this.unitValue = Constants.values.celsius; // 5 parameters including function input and excluding unit / have to discuss
        this.sensorUnitDropdownList = PCMChannelDataService.getAnalogSensorUnitDropdownList(Constants.values.thresholdTemp);
      } else if (this.functionInput == Constants.values.threshold) {
        this.countOfParametersForSelectedPin = 7;
        // this.unitValue = Constants.values.revMin;
        this.sensorUnitDropdownList = PCMChannelDataService.getAnalogSensorUnitDropdownList(Constants.values.threshold);
      } else {
        this.countOfParametersForSelectedPin = 1; // only fuinction input present
      }
    } else if (this.isDigitalIOSelected()) {
      this.countOfParametersForSelectedPin = 2;
    }
    this.checkSensorUnit();
    // this.clearGraphData();
    //this.displayUnit;
    this.cd.detectChanges();
  }

  /** 
  * This is used to read values of parameters of the  selected function functioninput
  * @param {string} connectorType
  */
  readParameterValuesFromPCM() {

    this.operation = Constants.values.read;
    this.atmQuestionObjectList = [];
    this.countAtmQList = 0;

    // read function input      
    var byteArray1 = new Uint8Array([Constants.values.rType, 0, this.channel, this.functionInputsubChannel, 0, 0]);
    this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray1.buffer);

    // read paramters     
    //if (this.connectorPinType == Constants.values.AnalogIn || this.connectorPinType == Constants.values.PT100) {
    //console.log("connectorPinType :"+this.connectorPinType);    
    let connectorParamterSetupValuesList = PCMChannelDataService.getconnectorParameterSetupValuesList(this.connectorPinType, this.channel);
    if (connectorParamterSetupValuesList != null) {
      connectorParamterSetupValuesList.forEach(element => {
        var byteArray = new Uint8Array([element.rType, 0, element.channel, element.subchannel, 0, 0]);
        this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
      });
    }
    else {
      console.log(Constants.messages.connectorParamterSetupValuesListnull);
    }
    // } else if (this.connectorPinType == Constants.values.DigitalIn) {
    //   var byteArray = new Uint8Array([Constants.values.rType, 0, this.channel, Constants.channels.invertedSubchannel, 0, 0]);
    //   this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
    // }
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
  * This is used for custom alert controller
  * @param {JSON} header - Title
  * @param {JSON} subHeader - Subtitle 
  */
  showAlert(title_, subTitle_) {
    this.pcmchanneldataservice.alert = this.alertCtrl.create({
      title: title_,
      subTitle: subTitle_,
      enableBackdropDismiss: false,
      buttons: [Constants.messages.ok]
    });
    this.pcmchanneldataservice.alert.present();
  }

  /** 
    * This is used to set the list values to their respective items
    * @param {JSON} item - 
    */
  setItemValuesToSys(item) {
    if (item.Title == Constants.messages.minInputTitle) {
      this.minInput = item.Value;
      console.log("Anu", "setItemValuesToSys", "this.minInput:", this.minInput);
      console.log("Anu", "setItemValuesToSys", "this.minInput:", this.minInput);
    }
    if (item.Title == Constants.messages.maxInputTitle) {
      this.MaxInput = item.Value;
    }
    if (item.Title == Constants.messages.sensorUnitTitle) {
      this.sensorUnit = item.Value;
      this.previousSensorUnit = this.sensorUnit;
      // this.setSavedDisplaySiValue();
      // this.sensorUnitCheck();
    }
    if (item.Title == Constants.messages.alarmMinTitle) {
      this.alarmMin = item.Value;
      console.log("Anu", "setItemValuesToSys", "this.alarmMin:", this.alarmMin);
    }
    if (item.Title == Constants.messages.alarmMaxTitle) {
      this.alarmMax = item.Value;
    }
    if (item.Title == Constants.messages.warningMinTitle) {
      this.warningMin = item.Value;
    }
    if (item.Title == Constants.messages.warningMaxTitle) {
      this.warningMax = item.Value;
    }
  }



  /** 
    * This is used check the function input and show/hide the input control
    * @param {JSON} item - control value and name 
    */
  checkToshowIncrementDecrementControl(item) {
    if (!this.isDigitalIOSelected()) {
      if (this.functionInput == Constants.values.workPressureInput || this.functionInput == Constants.values.threshold || this.functionInput == Constants.values.thresholdTemp) {
        // alarm min and max parameters are not there for workPressureInput       
        if (this.functionInput == Constants.values.workPressureInput && ((item.Title == Constants.messages.alarmMinTitle) || (item.Title == Constants.messages.alarmMaxTitle) || (item.Title == Constants.messages.warningMinTitle) || (item.Title == Constants.messages.warningMaxTitle))) { //Test asdf
          return false;
        }
        return true;
      }
    }
    return false;
  }

  /** 
   * This is used check the function input and show/hide the input control    
   */
  checkFunctionInputToshowOtherControls() {

    // if ( this.functionInput == Constants.values.workPressureInput || this.functionInput == Constants.values.threshold || this.functionInput == Constants.values.thresholdTemp) {
    //   this.graphHideFlag = true;
    //   // this.cd.detectChanges();
    // }
    if (!this.isDigitalIOSelected()) {
      if (this.functionInput == Constants.values.workPressureInput || this.functionInput == Constants.values.threshold || this.functionInput == Constants.values.thresholdTemp) {
        // if (this.functionInput != Constants.values.workPressureInput && this.connectorPinType != Constants.values.PT100) {
        //   this.graphHideFlag = true;
        // }

        // console.log('next line')
        this.graphHideFlag = true;

        return true;
      }
    }
    return false;
  }

  /** 
   * This is used check the the connecter input show/hide the input control for DI
   */
  checkToshowDIControls() {
    if (this.isDigitalIOSelected() && this.functionInput != Constants.values.disabledFuncInput) {
      return true;
    }
    return false;
  }
  /** 
   * This is used to enable /disable calibrate button    
   */
  disableCalibrateButton() {
    if (this.isDigitalIOSelected()) {
      return true;
    }
    return false;
  }

  /** 
  * This is used check the selected input is digital 
  * @returns true if digital
  */
  isDigitalIOSelected() {
    if (this.connector == Constants.values.DI || this.connector == Constants.values.DO || this.connectorValObj.pinValue == Constants.values.DigitalIn1Value
      || this.connectorValObj.pinValue == Constants.values.DigitalIn2Value || this.connectorValObj.pinValue == Constants.values.DigitalIn4Value
      || this.connectorValObj.pinValue == Constants.values.DigitalIn3Value) {
      return true;
    }
    return false;

  }

  /** 
 * This is used check the selected input is Analog  in 1 to 6
 * @returns true if digital
 */
  isAnalogInSelected() {
    if (this.connectorValObj.pinValue == Constants.values.AnalogIn1Value || this.connectorValObj.pinValue == Constants.values.AnalogIn2Value ||
      this.connectorValObj.pinValue == Constants.values.AnalogIn3Value || this.connectorValObj.pinValue == Constants.values.AnalogIn4Value ||
      this.connectorValObj.pinValue == Constants.values.AnalogIn5Value || this.connectorValObj.pinValue == Constants.values.AnalogIn6Value) {
      return true;
    }
    return false;

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
      if (this.operation == Constants.values.read) {
        if (this.countAtmQList > 7 && !this.isDigitalIOSelected()) {
          this.setParameterValuesToUI();
          this.setItemValuesToUI();
          this.sensorUnitCheck();
          console.log("read values");
        }
        if (this.isDigitalIOSelected() && this.countAtmQList > 2) {
          this.setParameterValuesToUI();
          this.setItemValuesToUI();
          // console.log("read digital parameter values");
          // console.log("this.invertedDigital "+this.invertedDigital);
          // console.log("this.countAtmQList "+this.countAtmQList);         
        }
      } else if (this.operation == Constants.values.write && this.countAtmQList == this.countOfParametersForSelectedPin) {
        this.checkWriteStatus();
        console.log("write values");
      } else if (this.operation == Constants.values.calibrate) {
        this.checkCalibrateStatus();
      }
      else if (this.operation == Constants.values.graphUpdate) {
        this.checkGraphReadStatus();
      }
      else if (this.operation == Constants.values.authenticate) {
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
    //this.cd.detectChanges();        
  }


  /** 
  * This is used to set item values read from PCM to the UI Controls 
  */
  setItemValuesToUI() {

    if (!this.isDigitalIOSelected()) {
      if (this.analogInputParameterItems != null) {
        this.analogInputParameterItems.forEach(element => {
          if (element.Title == Constants.messages.minInputTitle) {
            element.Value = this.minInput;
            console.log("Anu", "setItemValuesToUI", "this.minInput:", this.minInput);
            element.Metric = this.setMetric(this.sensorUnit);
          }
          if (element.Title == Constants.messages.maxInputTitle) {
            element.Value = this.MaxInput;
            element.Metric = this.setMetric(this.sensorUnit);
          }
          if (element.Title == Constants.messages.sensorUnitTitle) {
            element.Value = this.setMetric(this.sensorUnit);

          }
          if (element.Title == Constants.messages.alarmMinTitle) {
            element.Value = this.alarmMin;
            element.Metric = this.setMetric(this.displayUnit);
            console.log("Anu", "setItemValuesToUI", "this.alarmMin:", this.alarmMin);
          }
          if (element.Title == Constants.messages.alarmMaxTitle) {
            element.Value = this.alarmMax;
            element.Metric = this.setMetric(this.displayUnit);
          }
          if (element.Title == Constants.messages.warningMinTitle) {
            element.Value = this.warningMin;
            element.Metric = this.setMetric(this.displayUnit);
          }
          if (element.Title == Constants.messages.warningMaxTitle) {
            element.Value = this.warningMax;
            element.Metric = this.setMetric(this.displayUnit);
            console.log("Anu", "setItemValuesToUI", "this.warningMax:", this.warningMax);
          }
        });
      } else {
        console.log(Constants.messages.analogInputParameterItemsnull);
      }

    }

    this.cd.detectChanges();

  }

  /** 
    * This is used to SetParameter  Values to the UI  
    */
  setParameterValuesToUI() {
    if (this.atmQuestionObjectList != null) {
      this.atmQuestionObjectList.forEach(element => {
        if (element.channel == this.channel && element.subChannel == Constants.channels.minInputSubchannel) {
          this.minInput = element.value32Bit1;
          console.log("Anu", "this.minInput:", this.minInput);

        } if (element.channel == this.channel && element.subChannel == Constants.channels.maxInputSubchannel) {
          this.MaxInput = element.value32Bit1;
        } if (element.channel == this.channel && element.subChannel == Constants.channels.sensorUnitSubchannel) {
          this.sensorUnit = element.value32Bit1;
          console.log('setParameterValuesToUI sensorUnit:', this.sensorUnit);

          // this.previousDisplayUnit = this.displayUnit = this.sensorUnit;
        } if (element.channel == this.channel && element.subChannel == Constants.channels.functionInputSubChannel) {
          this.functionInput = element.value32Bit1;
          this.functionInputChange();

          this.displayUnitDropdownList = PCMChannelDataService.getAnalogDisplayUnitDropdownList(this.sensorUnit);
        }

        // These values are divided by 1000 to Get it milli SI to its SI unit
        if (element.channel == this.channel && element.subChannel == Constants.channels.alarmMinSubchannel) {
          this.alarmMin = element.value32Bit1 / 1000;
        } if (element.channel == this.channel && element.subChannel == Constants.channels.alarmMaxSubchannel) {
          this.alarmMax = element.value32Bit1 / 1000;
        } if (element.channel == this.channel && element.subChannel == Constants.channels.warnMinSubchannel) {
          this.warningMin = element.value32Bit1 / 1000;
        } if (element.channel == this.channel && element.subChannel == Constants.channels.warnMaxSubchannel) {
          this.warningMax = element.value32Bit1 / 1000;
        } if (element.channel == this.channel && element.subChannel == Constants.channels.invertedSubchannel) {
          this.invertedDigital = element.value32Bit1 / 1000;
          console.log("this.invertedDigital setParameterValuesToUI" + this.invertedDigital);
        }
        //this.cd.detectChanges();
      });
    } else {
      console.log(Constants.messages.atmQuestionObjectListnull);
    }

    if (this.pcmchanneldataservice.passwordFlag) {
      this.writeData = Constants.messages.saveParameters;
    } else {
      this.writeData = Constants.messages.enableWrite;
    }

    // this.sensorUnitChange();
    this.cd.detectChanges();
  }


  /** 
  * This is used to write the parameters to the PCM device
  */
  writeConnecterSetupPinParameters() {
    // To prevent write without password 
    // Testing remove

    if (this.pcmchanneldataservice.mockData) {
      this.pcmchanneldataservice.presentAlert(Constants.messages.mockDataAuthHeader, Constants.messages.mockDataSubheader);
    }
    else {
      if (this.pcmchanneldataservice.passwordFlag) {
        this.stopGraphUpdate();

        this.connecterSetupSetpinButtonDisabled = true;
        this.operation = Constants.values.write;
        this.atmQuestionObjectList = [];
        this.countAtmQList = 0;
        let val1;
        let val2;
        let val3;
        let val4;
        let value32;
        let flag = 0;


        let connectorParamterSetupValuesList = PCMChannelDataService.getconnectorParameterSetupValuesList(this.connectorPinType, this.channel);
        // To revert back to device Si unit after the sensor unit conversion 
        this.revertBackToDeviceSiUnit();


        // write selected function input
        value32 = this.functionInput;
        val4 = (value32 & 0xff000000) >> 24;
        val3 = (value32 & 0x00ff0000) >> 16;
        val2 = (value32 & 0x0000ff00) >> 8;
        val1 = (value32 & 0x000000ff);

        var byteArray = new Uint8Array([Constants.values.wType, 0, this.channel, this.functionInputsubChannel, val1, val2, val3, val4]);
        this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);


        if (this.countOfParametersForSelectedPin > 1) {   // only function input present so countOfParametersForSelectedPin = 1
          // write pin parameter values
          if (connectorParamterSetupValuesList != null) {

            connectorParamterSetupValuesList.forEach(element => {
              value32 = 0;
              flag = 0;
              if (element.name == Constants.values.minInput) {
                value32 = this.minInput;
                flag = 1;
              } if (element.name == Constants.values.maxInput) {
                value32 = this.MaxInput;
                flag = 1;
              } if (element.name == Constants.values.sensorUnit) {
                value32 = this.sensorUnit;
                //For setting the graph headers
                flag = 1;
              } if (element.name == Constants.values.inverted) {
                value32 = this.invertedDigital;
                flag = 1;
              }
              // These values will be converted back from SI units to Milli SI units
              if (element.name == Constants.values.alarmMin) {
                value32 = this.alarmMin * 1000;
                flag = 1;
              } if (element.name == Constants.values.alarmMax) {
                value32 = this.alarmMax * 1000;
                flag = 1;
              } if (element.name == Constants.values.warnMin) {
                value32 = this.warningMin * 1000;
                flag = 1;
              } if (element.name == Constants.values.warnMax) {
                value32 = this.warningMax * 1000;
                flag = 1;
              }
              console.log("Connector-parameter-setup", element.name, " this.value32:", value32, );

              if (flag == 1) {

                val4 = (value32 & 0xff000000) >> 24;
                val3 = (value32 & 0x00ff0000) >> 16;
                val2 = (value32 & 0x0000ff00) >> 8;
                val1 = (value32 & 0x000000ff);
                var byteArray = new Uint8Array([element.wType, 0, element.channel, element.subchannel, val1, val2, val3, val4]);
                this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
              }

            });
          } else {
            console.log(Constants.messages.connectorParamterSetupValuesListnull);
          }
          this.sensorUnitCheck();
        }
      }
      // Testing remove
      else this.enterPaswordPrompt();
    }

  }

  /** 
  * This is used to check the write status of the parameters.  
  */
  checkWriteStatus() {
    this.connectorSetupErrormessageList = [];
    let saveFlag = 0;
    let errorMessage: string = Constants.messages.ulOpen;
    if (this.atmQuestionObjectList != null) {
      this.atmQuestionObjectList.forEach(element => {
        if (element.status != 0) {
          saveFlag = 1;
          if (element.channel == this.channel && element.subChannel == Constants.channels.minInputSubchannel) {
            this.connectorSetupErrormessageList.push(Constants.messages.minInputTitle + element.status)
          } if (element.channel == this.channel && element.subChannel == Constants.channels.maxInputSubchannel) {
            this.connectorSetupErrormessageList.push(Constants.messages.maxInputTitle + element.status)
          } if (element.channel == this.channel && element.subChannel == Constants.channels.sensorUnitSubchannel) {
            this.connectorSetupErrormessageList.push(Constants.messages.alarmMinTitle + element.status)
          } if (element.channel == this.channel && element.subChannel == Constants.channels.alarmMinSubchannel) {
            this.connectorSetupErrormessageList.push(Constants.messages.alarmMinTitle + element.status)
          } if (element.channel == this.channel && element.subChannel == Constants.channels.alarmMaxSubchannel) {
            this.connectorSetupErrormessageList.push(Constants.messages.alarmMaxTitle + element.status)
          } if (element.channel == this.channel && element.subChannel == Constants.channels.warnMinSubchannel) {
            this.connectorSetupErrormessageList.push(Constants.messages.warningMinTitle + element.status)
          } if (element.channel == this.channel && element.subChannel == Constants.channels.warnMaxSubchannel) {
            this.connectorSetupErrormessageList.push(Constants.messages.warningMaxTitle + element.status)
          } if (element.channel == this.channel && element.subChannel == Constants.channels.functionInputSubChannel) {
            this.connectorSetupErrormessageList.push(Constants.messages.functionInputStatus + element.status)
          }
        }
        else { // Testing purposes
          if (element.channel == this.channel && element.subChannel == Constants.channels.minInputSubchannel) {
            console.log("minInput Success - Channel:", element.channel, "Subchannel:", element.subChannel);
          }
          if (element.channel == this.channel && element.subChannel == Constants.channels.maxInputSubchannel) {
            console.log("minInput Success - Channel:", element.channel, "Subchannel:", element.subChannel);
          }
        }
      });
    } else {
      console.log(Constants.messages.atmQuestionObjectListnull);
    }

    if (saveFlag == 0) {
      this.presentAlert(Constants.messages.saveParameters, Constants.messages.paramSavedSuccessfully);

    } else {
      if (this.connectorSetupErrormessageList != null) {
        this.connectorSetupErrormessageList.forEach(element => {
          errorMessage = errorMessage + Constants.messages.liOpen + element + Constants.messages.liClose;
        });
      }
      else {
        console.log(Constants.messages.connectorSetupErrormessageListnull);
      }
      errorMessage = errorMessage + Constants.messages.ulClose
      this.presentAlert(Constants.messages.Failed, errorMessage);
    }
    this.startGraphUpdate();

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
            this.connecterSetupSetpinButtonDisabled = false;
          }
        }]
    });
    this.pcmchanneldataservice.alert.present();
  }

  /**
  * This is a alert controller popup which helps the user set specific value
  * @param item - the item chosen from the list
  */
  valueChangePrompt(item) {
    if (this.pcmchanneldataservice.passwordFlag) {
      this.disabledTrue = false;
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

              if (item.Min <= data.value && item.Max >= data.value) {
                item.Value = Number(data.value);
                this.setItemValuesToSys(item);
              }
              else {
                this.presentAlert(Constants.messages.limitIssue, Constants.messages.enterValueWithin + item.Min + Constants.messages.and + item.Max);

              }
              this.disabledTrue = true;
              this.cd.detectChanges();
            }
          },
          {
            text: Constants.messages.cancel,
            handler: data => {
              this.disabledTrue = true;
            }
          }
        ]
      });
      this.pcmchanneldataservice.alert.present();
    }
  }

  /** 
 * This is used to when the user wants to calibrate the PCM device
 */
  calibrateConnecterSetupPinParameters() {
    // To prevent write without password 
    if (this.pcmchanneldataservice.passwordFlag) {
      this.calibrationCount = 0;

      this.calibrationVal = null;
      if (this.isAnalogInSelected) {
        this.calibrationVal = PCMChannelDataService.calibrateconnectorParameterSetupValuesList(this.connectorValObj.pinValue);
      } else if (this.connector == Constants.values.PT100) {
        this.calibrationVal = PCMChannelDataService.calibrateconnectorParameterSetupValuesList(this.connector);
      }
      console.log(this.calibrationVal.name);
      // this.calibrateTo4Ma();
      this.calibrateDevice(this.calibrationVal.values[0]);
      this.calibrationCount++;

    } else this.pcmchanneldataservice.presentAlert(Constants.messages.passwordAuthHeader, Constants.messages.noPasswordSubheader);
  }

  /** 
 * This is used to calibrate the device to the given value
 @param Value - the value it needs to be calibrated to
 */
  calibrateDevice(Value) {
    this.pcmchanneldataservice.alert = this.alertCtrl.create({
      title: Constants.messages.calibrationInputHeader + '<br/>' + this.connectorValObj.pinValue,
      subTitle: Constants.messages.pleaseApply + ' ' + Value + this.calibrationVal.metric + ' ' + Constants.messages.calibrationInputSubheader,
      enableBackdropDismiss: false,
      buttons: [
        {
          text: Constants.messages.ok,
          handler: data => {
            this.writeCalibrationData(Value);

          }
        },
        {
          text: Constants.messages.cancel,
          handler: data => {
            this.calibrationCount = 0;
          }

        }
      ]
    });
    this.pcmchanneldataservice.alert.present();

  }

  /** 
  * This is  write calibration  parameters onto the device.  
  @param value32 - the value to be written onto the device
  */
  writeCalibrationData(value32) {
    this.operation = Constants.values.calibrate;
    this.atmQuestionObjectList = [];
    this.countAtmQList = 0;

    console.log('Calibration val:' + value32)
    // converting to 8 bit
    let val4 = (value32 & 0xff000000) >> 24;
    let val3 = (value32 & 0x00ff0000) >> 16;
    let val2 = (value32 & 0x0000ff00) >> 8;
    let val1 = (value32 & 0x000000ff);
    var byteArray = new Uint8Array([this.calibrationVal.wType, 0, this.calibrationVal.channel, this.calibrationVal.subchannel, val1, val2, val3, val4]);
    this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
  }

  /** 
 * This is used to check the write calibration status of the parameters.  
 */
  checkCalibrateStatus() {
    this.atmQuestionObjectList.forEach(element => {
      // element.status = 0; // Testing
      if (element.status != 0) {
        if (element.channel == this.calibrationVal.channel && element.subChannel == this.calibrationVal.subchannel) {
          this.showAlert(Constants.messages.calibrationErrorStatus, element.status);
        }
      }
      else {
        if (this.calibrationCount < this.calibrationVal.values.length) {

          this.calibrateDevice(this.calibrationVal.values[this.calibrationCount]);
          this.calibrationCount++;
        }
        if (this.calibrationCount == this.calibrationVal.values.length) {

          console.log("out of loop");
        }
      }
    });

  }

  /**
   * This  is used to add thegrph to the canvas
   */
  addGraph() {
    // if (this.myLineChart != null) {
    //   this.myLineChart.destroy();
    // }

    //Line tension - 0.4(Default) Bezier curve tension of the line. Set to 0 to draw straightlines. 

    let canvas = document.getElementById('myChart');

    let option = {
      legend: {
        display: false
      },
      showLines: true,
      elements: {
        line: {
          tension: 0.1
        },
        point: {
          radius: 0
        }
      },
      animation: {
        duration: 0
      },
      // scales: {
      //   yAxes: [{
      //     ticks: {
      //       min: this.graphMinInput;
      //       max: this.graphMaxInput;
      //     }
      //   }],
      // },
    };
    this.myLineChart = Chart.Line(canvas, {
      data: this.data,
      options: option,
      responsive: true,
    });
  }



  /**
   * This is used to add the  setpoint and current Pressure/current Swash value onto the graph 
   */

  addData() {
    try {

      // this.graphValue = (this.minInput / this.MaxInput) + 0.05;
      this.myLineChart.data.labels.push(String(this.xValueCounter));
      this.myLineChart.data.datasets[0].data.push(this.graphValue);
      if (this.functionInput != Constants.values.workPressureInput) {
        this.myLineChart.data.datasets[1].data.push(this.alarmMin);
        this.myLineChart.data.datasets[2].data.push(this.alarmMax);
        this.myLineChart.data.datasets[3].data.push(this.warningMin);
        this.myLineChart.data.datasets[4].data.push(this.warningMax);
      }
      // else{
      //   this.myLineChart.data.datasets[1].data=[];
      //   this.myLineChart.data.datasets[2].data=[];
      //   this.myLineChart.data.datasets[3].data=[];
      //   this.myLineChart.data.datasets[4].data=[];
      // }

      if (this.xValueCounter > 20) {
        this.myLineChart.data.labels.shift();
        this.myLineChart.data.datasets[0].data.shift();
        if (this.functionInput != Constants.values.workPressureInput) {
          this.myLineChart.data.datasets[1].data.shift();
          this.myLineChart.data.datasets[2].data.shift();
          this.myLineChart.data.datasets[3].data.shift();
          this.myLineChart.data.datasets[4].data.shift();
        }
      }

      this.myLineChart.update();
      this.xValueCounter++;
    }

    catch (error) {
      console.log(error)
    }

  }

  /**.
   * This is used to read and add the data onto the graph
   */
  startGraphUpdate() {
    if (!this.isDigitalIOSelected()) { // && this.functionInput != Constants.values.workPressureInput
      this.startUpdateId = setInterval(() => {
        this.readGraphData()
        this.addData();
      },
        150);
    }
  }

  /**
    * Read  graph data
    * */
  readGraphData() {
    this.operation = Constants.values.graphUpdate;

    // read graph values
    var byteArray1 = new Uint8Array([Constants.values.rType, 0, this.channel, Constants.channels.analogGraphSubChannel, 0, 0]);
    this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray1.buffer);

  }

  /**
   * This is used to update the status value / current value of the graph
   */
  checkGraphReadStatus() {
    this.atmQuestionObjectList.forEach(element => {
      // element.status = 0; // Testing

      if (element.channel == this.channel && element.subChannel == Constants.channels.analogGraphSubChannel) {

        if (this.displayUnit == Constants.values.FahrenheitUnitValue) {
          console.log('checkGraphReadStatus FahrenheitUnitValue');
          this.graphValue = (this.convertCelsiusToFahrenheit(element.value32Bit1)) / 1000;
        }
        else if (this.displayUnit == Constants.values.MpaUnitValue) {
          console.log('checkGraphReadStatus MpaUnitValue');
          this.graphValue = (this.convertBarToMpA(element.value32Bit1)) / 1000;
          // this.DisplayUnit = Constants.values.MpaUnitValue;
        }
        else if (this.displayUnit == Constants.values.PsiUnitValue) {
          console.log('checkGraphReadStatus PsiUnitValue');
          this.graphValue = (this.convertBarToPsi(element.value32Bit1)) / 1000;
        }
        else {
          console.log('checkGraphReadStatus ', this.displayUnit);
          this.graphValue = element.value32Bit1 / 1000;
        }
      }


    });
  }

  /**
   * stop graph update
   * */
  stopGraphUpdate() {
    clearInterval(this.startUpdateId);
  }

  /**
   * This is used to convert the value from Celsius to Fahrenheit
   * @param tempInCelsius - The value is in Celcius
   */
  convertCelsiusToFahrenheit(tempInCelsius) {
    return (tempInCelsius * 1.8) + 32;
  }

  /**
   * This is used to convert the value from Fahrenheit to Celsius
   * @param tempInFahrenheit - The value is in Fahrenheit
   */
  convertFahrenheitToCelsius(tempInFahrenheit) {
    return (tempInFahrenheit - 32) / 1.8;
  }

  /**
   * This is used to convert the value from Bar to Psi
   * @param pressureInBar - The value is in Fahrenheit
   */
  convertBarToPsi(pressureInBar) {
    return (pressureInBar * 14.5038)
  }

  /**
   * This is used to convert the value from Bar to MpA
   * @param pressureInBar - The value is in Fahrenheit
   */
  convertBarToMpA(pressureInBar) {
    return (pressureInBar * 0.1)
  }

  /**
   * This is used to convert the value from Psi to Bar  
   * @param pressureInPsi - The value is in Fahrenheit
   */
  convertPsiToBar(pressureInPsi) {
    return (pressureInPsi / 14.5038)
  }

  /**
   * This is used to convert the value from Mpa to Bar  
   * @param pressureInMpa - The value is in Fahrenheit
   */
  convertMpaToBar(pressureInMpa) {
    return (pressureInMpa / 0.1)
  }

  /**
   * To change the values to its respective display units  
   */
  displayUnitChange() {

    if (this.displayUnit == Constants.values.CelsiusUnitValue) {
      this.convertAllValuesFahrenheitToCelsius();
    }
    else if (this.sensorUnit == Constants.values.FahrenheitUnitValue) {
      this.convertAllValuesCelsiusToFahrenheit();

    }

    else if (this.sensorUnit == Constants.values.BarUnitValue) {
      console.log('previousDisplayUnit:' + this.previousDisplayUnit)
      if (this.previousDisplayUnit == Constants.values.PsiUnitValue) {
        this.convertAllValuesPsiToBar();
      }
      else if (this.previousDisplayUnit == Constants.values.MpaUnitValue) {
        this.convertAllValuesMpAToBar();
      }

    }

    else if (this.sensorUnit == Constants.values.PsiUnitValue) {
      console.log('previousDisplayUnit:' + this.previousDisplayUnit)
      if (this.previousDisplayUnit == Constants.values.BarUnitValue) {
        this.convertAllValuesBarToPsi();
      }
      else if (this.previousDisplayUnit == Constants.values.MpaUnitValue) {
        this.convertAllValuesMpAToBar();
        this.convertAllValuesBarToPsi();
      }
    }

    else if (this.sensorUnit == Constants.values.MpaUnitValue) {
      console.log('previousDisplayUnit:' + this.previousDisplayUnit)
      if (this.previousDisplayUnit == Constants.values.BarUnitValue) {
        this.convertAllValuesBarToMpA();
      }
      else if (this.previousDisplayUnit == Constants.values.PsiUnitValue) {
        this.convertAllValuesPsiToBar();
        this.convertAllValuesBarToMpA();
      }
    }
    this.previousDisplayUnit = this.sensorUnit;

    this.setGraphHeader();
  }

  /**
   * This is to convert allvalues of Fahrenheit to Celsius 
   */
  convertAllValuesFahrenheitToCelsius() {
    // this.minInput = this.convertFahrenheitToCelsius(this.minInput);
    // this.MaxInput = this.convertFahrenheitToCelsius(this.MaxInput);

    this.graphValue = this.convertFahrenheitToCelsius(this.graphValue);
    this.alarmMin = this.convertFahrenheitToCelsius(this.alarmMin);
    this.alarmMax = this.convertFahrenheitToCelsius(this.alarmMax);
    this.warningMin = this.convertFahrenheitToCelsius(this.warningMin);
    this.warningMax = this.convertFahrenheitToCelsius(this.warningMax);
    this.setItemValuesToUI();
  }

  /**
   * This is to convert allvalues of Celsius to Fahrenheit
   */
  convertAllValuesCelsiusToFahrenheit() {
    // this.minInput = this.convertCelsiusToFahrenheit(this.minInput);
    // this.MaxInput = this.convertCelsiusToFahrenheit(this.MaxInput);

    this.graphValue = this.convertCelsiusToFahrenheit(this.graphValue);
    this.alarmMin = this.convertCelsiusToFahrenheit(this.alarmMin);
    this.alarmMax = this.convertCelsiusToFahrenheit(this.alarmMax);
    this.warningMin = this.convertCelsiusToFahrenheit(this.warningMin);
    this.warningMax = this.convertCelsiusToFahrenheit(this.warningMax);
    this.setItemValuesToUI();
  }

    /**
     * This is to convert allvalues of Bar to Psi
     */
  convertAllValuesBarToPsi() {
    // this.minInput = this.convertBarToPsi(this.minInput);
    // this.MaxInput = this.convertBarToPsi(this.MaxInput);

    this.graphValue = this.convertBarToPsi(this.graphValue);
    this.alarmMin = this.convertBarToPsi(this.alarmMin);
    this.alarmMax = this.convertBarToPsi(this.alarmMax);
    this.warningMin = this.convertBarToPsi(this.warningMin);
    this.warningMax = this.convertBarToPsi(this.warningMax);
    console.log("Anu", "convertAllValuesBarToPsi", "this.warningMax:", this.alarmMin);
    this.setItemValuesToUI();
  }

  /**
     * This is to convert allvalues of Psi to Bar  
     */
  convertAllValuesPsiToBar() {
    // this.minInput = this.convertBarToMpA(this.minInput);
    // this.MaxInput = this.convertBarToMpA(this.MaxInput);

    this.graphValue = this.convertPsiToBar(this.graphValue);
    this.alarmMin = this.convertPsiToBar(this.alarmMin);
    this.alarmMax = this.convertPsiToBar(this.alarmMax);
    this.warningMin = this.convertPsiToBar(this.warningMin);
    this.warningMax = this.convertPsiToBar(this.warningMax);
    this.setItemValuesToUI();
  }

   /**
     * This is to convert allvalues of Bar to Mpa  
     */
  convertAllValuesBarToMpA() {
    // this.minInput = this.convertBarToMpA(this.minInput);
    // this.MaxInput = this.convertBarToMpA(this.MaxInput);

    this.graphValue = this.convertBarToMpA(this.graphValue);
    this.alarmMin = this.convertBarToMpA(this.alarmMin);
    this.alarmMax = this.convertBarToMpA(this.alarmMax);
    this.warningMin = this.convertBarToMpA(this.warningMin);
    this.warningMax = this.convertBarToMpA(this.warningMax);
    this.setItemValuesToUI();
  }

   /**
     * This is to convert allvalues of Mpa to Bar  
     */
  convertAllValuesMpAToBar() {
    // this.minInput = this.convertMpAToBar(this.minInput);
    // this.MaxInput = this.convertMpAToBar(this.MaxInput);

    this.graphValue = this.convertMpaToBar(this.graphValue);
    this.alarmMin = this.convertMpaToBar(this.alarmMin);
    this.alarmMax = this.convertMpaToBar(this.alarmMax);
    this.warningMin = this.convertMpaToBar(this.warningMin);
    this.warningMax = this.convertMpaToBar(this.warningMax);
    this.setItemValuesToUI();
  }

  
  // sensorUnitChange() {
  //   this.sensorUnitChangePrompt()


  // }


  /** 
* This is used to calibrate the device to the given value
@param Value - the value it needs to be calibrated to
*/
  sensorUnitChangePrompt() {
    this.pcmchanneldataservice.alert = this.alertCtrl.create({
      title: Constants.messages.sensorUnitChangeHeader,
      subTitle: Constants.messages.sensorUnitChangeSubheader,
      enableBackdropDismiss: false,
      buttons: [
        {
          text: Constants.messages.ok,
          handler: data => {
            this.displayUnitDropdownList = PCMChannelDataService.getAnalogDisplayUnitDropdownList(this.sensorUnit);
            // this.displayUnit = this.sensorUnit;
            console.log("ok previoussSensorUnit: ", this.previousSensorUnit, " previoussSensorUnit: ", this.sensorUnit)
            this.previousSensorUnit = this.sensorUnit;

            this.revertBackToDeviceSiUnit()

            if (this.sensorUnit >= Constants.values.CelsiusUnitValue && this.sensorUnit <= Constants.values.FahrenheitUnitValue) {

              if (!(this.previousSensorUnit >= Constants.values.CelsiusUnitValue && this.previousSensorUnit <= Constants.values.FahrenheitUnitValue)) {
                this.alarmMin = 0;
                this.alarmMax = 0;
                this.warningMin = 0;
                this.warningMax = 0;
              }
              this.graphValue = 0;
              this.minInput = 0;
              this.MaxInput = 0;
            }

            else if (this.sensorUnit >= Constants.values.BarUnitValue && this.sensorUnit <= Constants.values.MpaUnitValue) {

              if (!(this.previousSensorUnit >= Constants.values.BarUnitValue && this.previousSensorUnit <= Constants.values.MpaUnitValue)) {
                this.alarmMin = 0;
                this.alarmMax = 0;
                this.warningMin = 0;
                this.warningMax = 0;
              }
              this.graphValue = 0;
              this.minInput = 0;
              this.MaxInput = 0;
            }

            else {
              this.alarmMin = 0;
              this.alarmMax = 0;
              this.warningMin = 0;
              this.warningMax = 0;
              this.graphValue = 0;
              this.minInput = 0;
              this.MaxInput = 0;
            }
            this.sensorUnitCheck();
            this.setItemValuesToUI();


          }
        },
        {
          text: Constants.messages.cancel,
          handler: data => {
            console.log("Cancel previoussSensorUnit: ", this.previousSensorUnit, " previoussSensorUnit: ", this.sensorUnit)
            this.sensorUnit = this.previousSensorUnit;
            // this.setSavedDisplaySiValue()
            this.setItemValuesToUI();
          }

        }
      ]
    });


    this.pcmchanneldataservice.alert.present();

  }


  sensorUnitCheck() {
    console.log('this.sensorUnit is', this.sensorUnit);
    if (this.sensorUnit >= Constants.values.CelsiusUnitValue && this.sensorUnit <= Constants.values.FahrenheitUnitValue) {
      this.displayUnit = this.pcmchanneldataservice.temperatureDisplayUnit;
      console.log('this.temperatureDisplayUnit is', this.pcmchanneldataservice.temperatureDisplayUnit);
    }
    else if (this.sensorUnit >= Constants.values.BarUnitValue && this.sensorUnit <= Constants.values.MpaUnitValue) {
      this.displayUnit = this.pcmchanneldataservice.pressureDisplayUnit;
      console.log('this.pressureDisplayUnit is', this.pcmchanneldataservice.pressureDisplayUnit);
    }
    else {
      this.displayUnit = this.sensorUnit;
      console.log('otherwise displayUnit is', this.displayUnit);
    }
    // else if (this.displayUnit == Constants.values.RpmUnitValue)
    //   this.displayUnit = this.sensorUnit;
    // else if (this.displayUnit == Constants.values.LUnitValue)
    //   this.displayUnit = this.sensorUnit;
    // else if (this.displayUnit == Constants.values.LPerMinUnitValue)
    //   this.displayUnit = this.sensorUnit;

    console.log('displayUnit is', this.displayUnit);
    if (this.displayUnit == Constants.values.FahrenheitUnitValue) {
      console.log('entered FahrenheitUnitValue');
      this.convertAllValuesCelsiusToFahrenheit();
    }
    else if (this.displayUnit == Constants.values.MpaUnitValue) {
      console.log('entered MpaUnitValue');
      this.convertAllValuesBarToMpA();
      // this.DisplayUnit = Constants.values.MpaUnitValue;
    }
    else if (this.displayUnit == Constants.values.PsiUnitValue) {
      console.log('entered PsiUnitValue');
      this.convertAllValuesBarToPsi();
    }
    this.setGraphHeader();
  }

  revertBackToDeviceSiUnit() {
    if (!this.isDigitalIOSelected()) {
      if (this.displayUnit == Constants.values.FahrenheitUnitValue) {
        this.convertAllValuesFahrenheitToCelsius();
      }
      else if (this.displayUnit == Constants.values.MpaUnitValue) {
        this.convertAllValuesMpAToBar();
      }
      else if (this.displayUnit == Constants.values.PsiUnitValue) {
        this.convertAllValuesPsiToBar();
      }
    }
  }

  setGraphHeader() {
    console.log('Set Graph Header entered', ' this.displayUnit: ', this.displayUnit);
    if (this.displayUnit == Constants.values.BarUnitValue)
      this.graphHeader = "Pressure in Bar";
    if (this.displayUnit == Constants.values.PsiUnitValue)
      this.graphHeader = "Pressure in Psi";
    if (this.displayUnit == Constants.values.MpaUnitValue)
      this.graphHeader = "Pressure in Mpa";
    else if (this.displayUnit == Constants.values.CelsiusUnitValue)
      this.graphHeader = "Temperature in C";
    else if (this.displayUnit == Constants.values.FahrenheitUnitValue)
      this.graphHeader = "Temperature in F";
    else if (this.displayUnit == Constants.values.RpmUnitValue)
      this.graphHeader = "Rotational speed in Rpm";
    else if (this.displayUnit == Constants.values.LUnitValue)
      this.graphHeader = "Volume in L";
    else if (this.displayUnit == Constants.values.LPerMinUnitValue)
      this.graphHeader = "Flow in L/min";

    this.cd.detectChanges();
  }

  /**
   * This takes in the unit value and converts it into the Unit names
   * @param unitValue - the unit value is entered 
   */
  setMetric(unitValue) {
    console.log('Set Metric entered', ' unitValue: ', unitValue);
    let unitMetric;
    if (unitValue == Constants.values.BarUnitValue)
      unitMetric = "Bar";
    if (unitValue == Constants.values.PsiUnitValue)
      unitMetric = "Psi";
    if (unitValue == Constants.values.MpaUnitValue)
      unitMetric = "Mpa";
    else if (unitValue == Constants.values.CelsiusUnitValue)
      unitMetric = "C";
    else if (unitValue == Constants.values.FahrenheitUnitValue)
      unitMetric = "F";
    else if (unitValue == Constants.values.RpmUnitValue)
      unitMetric = "Rpm";
    else if (unitValue == Constants.values.LUnitValue)
      unitMetric = "L";
    else if (unitValue == Constants.values.LPerMinUnitValue)
      unitMetric = "L/min";

    return unitMetric;
  }

  /**
   * On click of Nav bar settings button, navigate to Settings page
   */
  navigateToSettings() {
    this.navCtrl.push("SettingsPage", { deviceObject: this.deviceObject });
  }

  /**
   * Check if Sensor Unit is zero if yes , then set default values
   */
  checkSensorUnit() {
    if (this.functionInput == Constants.values.thresholdTemp) {
      if (!(this.sensorUnit >= Constants.values.CelsiusUnitValue && this.sensorUnit <= Constants.values.FahrenheitUnitValue)) {
        console.log('threshold ')
        this.sensorUnit = Constants.values.CelsiusUnitValue;
      }
    } else if (this.functionInput == Constants.values.workPressureInput) {
      if (!(this.sensorUnit >= Constants.values.BarUnitValue && this.sensorUnit <= Constants.values.MpaUnitValue)) {
        console.log('workPressureInput ')
        this.sensorUnit = Constants.values.BarUnitValue;
      }
    } else if (this.functionInput == Constants.values.threshold) {
      if (!(this.sensorUnit >= Constants.values.BarUnitValue && this.sensorUnit <= Constants.values.LPerMinUnitValue)) {
        console.log('threshold ')
        this.sensorUnit = Constants.values.BarUnitValue;
      }
    }
    console.log('checkSensorUnit entered', 'sensor Unit:', this.sensorUnit)
    this.cd.detectChanges();
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
    this.connecterSetupSetpinButtonDisabled = false;
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

  clearGraphData() {


    // this.myLineChart.options.scales.yAxes[0].ticks.min = this.liveGraphSetupDetails.min;
    // this.myLineChart.options.scales.yAxes[0].ticks.max = this.liveGraphSetupDetails.max;

    this.myLineChart.update();
  }


  //Anu - 1/1/2018
  onChangeResetGraph() {

    this.graphValue = 0;
    console.log('onChangeResetGraph entered');
    this.myLineChart.data.labels = [];

    this.myLineChart.data.datasets[0].data = [];
    this.myLineChart.data.datasets[1].data = [];
    this.myLineChart.data.datasets[2] = [];
    this.myLineChart.data.datasets[3] = [];
    this.myLineChart.data.datasets[4] = [];
    this.readGraphData();
    this.setGraphMinMax();

    this.addData();
  }


  convertAnalogSensorValueToBar(analogValue) {

    if (this.sensorUnit == Constants.values.PsiUnitValue) {
      analogValue = this.convertPsiToBar(analogValue);
    }
    else if (this.sensorUnit == Constants.values.MpaUnitValue) {
      analogValue = this.convertMpaToBar(analogValue);
    }
    return analogValue;
  }

  setGraphMinMax() {

    this.graphMinInput = this.conversionToUnit(this.convertAnalogSensorValueToBar(this.graphMinInput));
    this.graphMaxInput = this.conversionToUnit(this.convertAnalogSensorValueToBar(this.graphMaxInput));
    this.myLineChart.options.scales.yAxes[0].ticks.min = (this.graphMinInput - ((this.graphMaxInput - this.graphMinInput) * 0.05));
    this.myLineChart.options.scales.yAxes[0].ticks.max = (this.graphMaxInput + ((this.graphMaxInput - this.graphMinInput) * 0.05));
    this.myLineChart.update();
  }

  conversionToUnit(value) {
    if (this.displayUnit == Constants.values.FahrenheitUnitValue) {
      console.log('entered FahrenheitUnitValue');
      return this.convertCelsiusToFahrenheit(value);
    }
    else if (this.displayUnit == Constants.values.MpaUnitValue) {
      console.log('entered MpaUnitValue');
      return this.convertBarToMpA(value);
    }
    else if (this.displayUnit == Constants.values.PsiUnitValue) {
      console.log('entered PsiUnitValue');
      return this.convertBarToPsi(value);
    }
    return value;
  }
}


