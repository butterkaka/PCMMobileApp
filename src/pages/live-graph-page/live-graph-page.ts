import { Constants } from './../../shared/app.constant';
import { Chart } from 'chart.js';
import { Component, ChangeDetectorRef, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { PCMChannelDataService } from '../../providers/pcm-channel-data-service';
import { DeviceModel, AtmQuestionTypeModel } from '../../Models/ExportModelClass';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the LiveGraphPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-live-graph-page',
  templateUrl: 'live-graph-page.html',
})
export class LiveGraphPage {

  data = {
    labels: [],
    datasets: [
      {
        label: "",
        fill: false,
        backgroundColor: "rgba(41, 128, 185,0.4)",
        borderColor: "rgba(41, 128, 185,1)",
        data: []
      }
    ]
  };

  graphHeader = "";
  grapValue = 0;
  liveTuneGraphType: any;

  currentValueString;
  currentValueGraph;
  currentValue: number = 0;
  deviceObject: DeviceModel;
  atmQuestionObjectList: Array<AtmQuestionTypeModel>;
  atmQuestionInputObjList: Array<AtmQuestionTypeModel>;
  countAtmQList: number = 0;

  operation: string;
  startUpdateId;
  liveGraphSetupDetails;
  i = 0;
  myLineChart;
  liveGraphType;
  liveGraphTypeVal;
  liveGraphTypeName;
  time;
  ifPT100: Boolean = false;

  // temperatureDisplayUnit;
  // pressureDisplayUnit;
  sensorUnit = 0;
  displayUnit = 0;
  currentSiUnit = "";
  disabledDataFlag: boolean = false;
  readOnceFlag: boolean = false;
  currentToggleFlag: boolean = false;
  toggleValue = Constants.messages.switchToVal;

  analogMinInput;
  analogMaxInput;
  headerLabel = "Live graph";

  /**
     * LiveGraphPage Constructor.
     * @constructor
     * @param navCtrl NavController for navigation
     * @param navParams NavParams paremters from previous component
     */
  constructor(public navCtrl: NavController, public elemRef: ElementRef, public navParams: NavParams, public alertCtrl: AlertController, private ble: BLE,
    private cd: ChangeDetectorRef, public loadingController: LoadingController, public pcmchanneldataservice: PCMChannelDataService, private storage: Storage) {
    this.deviceObject = navParams.get(Constants.values.deviceObject);
  }

  /** 
  * @event ionViewDidLoad PageLoad Event  
  */
  ionViewDidLoad() {
    //console.log('ionViewDidLoad LiveGraphPage');
  }

  /** 
  * @event ionViewDidEnter - Event triggered when the page has entered to focus
  */
  ionViewDidEnter() {
    // this.setSavedDisplaySiValue();
    // this.sensorUnitCheck();

    this.storage.get('liveGraphType').then((val) => {
      if (val == null) {
        this.storage.set('liveGraphType', 1);
        val = 1;
      }
      this.liveGraphType = val;
      this.currentToggleFlag = false;
      this.liveGraphTypeName = Constants.values.liveGraphSetpointValue;
      this.readLiveGraphParameters();
      this.addGraph();
      this.setGraphMinMax();

      this.startUpdate();
    });



  }
  /**
   * 
   * @event ionViewWillLeave - Event triggered when the page is about to leave to next page.  
  */
  ionViewWillLeave() {
    this.onChange(1)
    clearInterval(this.startUpdateId);
  }

  /**
   * This  is used to add thegrph to the canvas
   */
  addGraph() {


    let canvas = document.getElementById('myChart');

    let option = {
      legend: {
        display: false
      },
      showLines: true,
      elements: {
        line: {
          tension: 0
        },
        point: {
          radius: 0
        }
      }, animation: {
        duration: 0
      },
      tooltips: {
        enabled: false
      },
      scales: {
        yAxes: [{
          ticks: {
            min: this.liveGraphSetupDetails.min,
            max: this.liveGraphSetupDetails.max

          }
        }],
        // xAxes: [{
        //   ticks: {
        //     padding: 10
        //   }
        // }]
      },
      pan: {
        // Boolean to enable panning
        enabled: true,

        // Panning directions. Remove the appropriate direction to disable 
        // Eg. 'y' would only allow panning in the y direction
        mode: 'xy',
        rangeMin: {
          // Format of min pan range depends on scale type
          x: null,
          y: null
        },
        rangeMax: {
          // Format of max pan range depends on scale type
          x: null,
          y: null
        }
      },

      // Container for zoom options
      zoom: {
        // Boolean to enable zooming
        enabled: true,

        // Enable drag-to-zoom behavior
        drag: true,

        // Zooming directions. Remove the appropriate direction to disable 
        // Eg. 'y' would only allow zooming in the y direction
        mode: 'xy',
        rangeMin: {
          // Format of min zoom range depends on scale type
          x: null,
          y: null
        },
        rangeMax: {
          // Format of max zoom range depends on scale type
          x: null,
          y: null
        }
      }

    };
    this.myLineChart = Chart.Line(canvas, {
      data: this.data,
      options: option,
      responsive: true,
    });
  }

  /**
   * 
   * This is used to add the  setpoint and current Pressure/current Swash value onto the graph 
   */
  addData() {
    let currentValueTemp;
    try {
      //ANu - do changes here
      if (!this.disabledDataFlag || this.toggleValue == Constants.messages.switchToVal) {
        if ((this.liveGraphSetupDetails.channel >= Constants.channels.liveGraphAnalogInput1Channel && this.liveGraphSetupDetails.channel <= Constants.channels.liveGraphAnalogInput6Channel) && this.toggleValue == Constants.messages.switchToVal) {
          currentValueTemp = this.currentValue / 1000; // Micro Amp to milli Amps
        }
        else currentValueTemp = this.conversionToUnit(this.currentValue);
        this.currentValueString = Number(currentValueTemp.toFixed(2));
        console.log("currentValueString:", this.currentValueString)
        this.myLineChart.data.labels.push(String(this.i));
        this.myLineChart.data.datasets[0].data.push(this.currentValueString);
        if (this.i > 200) {
          this.myLineChart.data.labels.shift();
          this.myLineChart.data.datasets[0].data.shift();
        }

        this.myLineChart.update();
        this.i++;
      } else {
        this.currentValueString = "Input not configured";
        this.currentSiUnit = "";
      }



    } catch (error) {
      //console.log(error)
    }

  }

  /**
   * Get the type of live graph selected
   */
  getLiveGraphType(liveGraphVal) {
    this.ifPT100 = false;
    //console.log('liveGraphVal:' + liveGraphVal)
    if (liveGraphVal == 1) {
      this.currentSiUnit = "%";
      return Constants.values.liveGraphSetpointValue
    }
    else if (liveGraphVal == 2) {
      return Constants.values.liveGraphPressureValue
    }
    else if (liveGraphVal == 3) {
      this.currentSiUnit = "%";
      return Constants.values.liveGraphSwashAngleValue
    }
    else if (liveGraphVal == 4) {
      this.currentSiUnit = "mA";
      return Constants.values.liveGraphPumpCurrentValue
    }
    else if (liveGraphVal == 5) {
      return Constants.values.liveGraphAnalogInput1Value
    }
    else if (liveGraphVal == 6) {
      return Constants.values.liveGraphAnalogInput2Value
    }
    else if (liveGraphVal == 7) {
      return Constants.values.liveGraphAnalogInput3Value
    }
    else if (liveGraphVal == 8) {
      return Constants.values.liveGraphAnalogInput4Value
    }
    else if (liveGraphVal == 9) {
      return Constants.values.liveGraphAnalogInput5Value
    }
    else if (liveGraphVal == 10) {
      return Constants.values.liveGraphAnalogInput6Value
    }
    else if (liveGraphVal == 11) {
      this.toggleValue = Constants.messages.switchToCurrent;
      this.ifPT100 = true;
      return Constants.values.liveGraphPT100Value

    }
  }

  /**
   * This is used to read and add the data onto the graph
   */
  startUpdate() {
    this.startUpdateId = setInterval(() => {
      this.readLiveGraphParameters();
      this.addData();
      // //console.log('started')
    },
      150);

  }

  /** 
  * This is used to read the LiveGraph setup paraemters from the device.  
  */
  readLiveGraphParameters() {
    this.operation = Constants.values.read;
    this.startNotify(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId);
    // workaround for notifier
    let byteArray = new Uint8Array([0, 0, 0, 0, 0, 0]);
    this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);

    this.atmQuestionObjectList = [];
    //Test Anu - 23/8/2107
    this.liveGraphSetupDetails = PCMChannelDataService.liveGraphParameterSetupValues(this.getLiveGraphType(this.liveGraphType));
    //console.log('liveGraphSetupDetails.name:' + this.liveGraphSetupDetails.name);
    //console.log('liveGraphSetupDetails.channel:' + this.liveGraphSetupDetails.channel);
    //console.log('liveGraphSetupDetails.subchannel:' + this.liveGraphSetupDetails.subchannel);
    //console.log('liveGraphSetupDetails.divisor:' + this.liveGraphSetupDetails.divisor);


    if (this.liveGraphSetupDetails.channel >= Constants.channels.standaloneAnalog1FunctionChannel && this.liveGraphSetupDetails.channel <= Constants.channels.standaloneFunctionPT100Channel) {
      if (!this.readOnceFlag) {
        byteArray = new Uint8Array([this.liveGraphSetupDetails.rType, 0, this.liveGraphSetupDetails.channel, Constants.channels.functionInputSubChannel, 0, 0]);
        this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
        byteArray = new Uint8Array([this.liveGraphSetupDetails.rType, 0, this.liveGraphSetupDetails.channel, Constants.channels.sensorUnitSubchannel, 0, 0]);
        this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
        byteArray = new Uint8Array([this.liveGraphSetupDetails.rType, 0, this.liveGraphSetupDetails.channel, Constants.channels.minInputSubchannel, 0, 0]);
        this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
        byteArray = new Uint8Array([this.liveGraphSetupDetails.rType, 0, this.liveGraphSetupDetails.channel, Constants.channels.maxInputSubchannel, 0, 0]);
        this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
        this.readOnceFlag = true;
        this.currentToggleFlag = true;
      }
      if (this.toggleValue == Constants.messages.switchToCurrent) {
        this.liveGraphSetupDetails.subchannel = 9;
      }else{
        this.liveGraphSetupDetails.channel =  this.liveGraphSetupDetails.powerchannel;
      }
      this.currentToggleFlag = true;
    }

    byteArray = new Uint8Array([this.liveGraphSetupDetails.rType, 0, this.liveGraphSetupDetails.channel, this.liveGraphSetupDetails.subchannel, 0, 0]);
    this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);


  }

  write(deviceID, serviceID, characteristicID, value) {

    this.ble.writeWithoutResponse(deviceID, serviceID, characteristicID, value).then(
      result => {

      }).catch(error => {
        //console.log('write fun:' + JSON.stringify(error));
      });

    // this.check = false;
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
        this.SetParameterValuesToUI();
        //console.log('startNotify');
      }
    }, error => {
      //console.log(JSON.stringify(error));
    })
  }

  /** 
  * This is used to SetParameter  Values to the UI  
  */
  SetParameterValuesToUI() {
    this.atmQuestionObjectList.forEach(element => {
      try {

        if (element.channel == this.liveGraphSetupDetails.channel && element.subChannel == Constants.channels.functionInputSubChannel) {
          //console.log('functionInput currentValue ' + element.value32Bit1);
          if (element.value32Bit1 == 0) {
            this.disabledDataFlag = true;
          }
        }

        if (element.channel == this.liveGraphSetupDetails.channel && element.subChannel == this.liveGraphSetupDetails.subchannel) {

          if (this.liveGraphSetupDetails.name == Constants.values.liveGraphPressureValue) {

            this.sensorUnit = this.pcmchanneldataservice.pressureDisplayUnit;
            this.sensorUnitCheck();
            this.addGraph();
            this.setGraphMinMax();
          }
          //ANu - do changes here
          if (this.toggleValue == Constants.messages.switchToVal && this.liveGraphSetupDetails.channel >= Constants.channels.liveGraphAnalogInput1Channel && this.liveGraphSetupDetails.channel <= Constants.channels.liveGraphAnalogInput6Channel) {
            this.currentValue = (element.value32Bit1);
          } else this.currentValue = (element.value32Bit1 / this.liveGraphSetupDetails.divisor);
          this.liveGraphTypeName = String(this.liveGraphSetupDetails.name);

          console.log('SetParameterValuesToUI currentValue ' + this.currentValue);
          console.log('SetParameterValuesToUI element.value32Bit1 ' + element.value32Bit1);
        }

        if (element.channel >= Constants.channels.standaloneAnalog1FunctionChannel &&
          element.channel <= Constants.channels.standaloneFunctionPT100Channel) {
          if (element.subChannel == Constants.channels.minInputSubchannel) {
            this.analogMinInput = element.value32Bit1;
          }
          else if (element.subChannel == Constants.channels.maxInputSubchannel) {
            this.analogMaxInput = element.value32Bit1;

          }
          else if (element.subChannel == Constants.channels.sensorUnitSubchannel) {
            // THe changes according to the analog - with unit conversion and its display units
            //console.log('FunctionChannel entered ');
            this.sensorUnit = element.value32Bit1;
            // this.setSavedDisplaySiValue();
            this.sensorUnitCheck();
          }
        }
        // this.onChange(1);
        this.cd.detectChanges();
      } catch (error) {
        //console.log('this.SetParameterValuesToUI error:' + error);
      }

    });
  }
  /** 
  * This is used for going back to the previous page
  */
  back() {
    this.navCtrl.pop();
  }

  onChange(value) {
    if (value == 1) {
      if (this.toggleValue == Constants.messages.switchToCurrent)
        this.toggleValue = Constants.messages.switchToVal
    }

    this.currentToggleFlag = false;
    this.storage.set('liveGraphType', this.liveGraphType);
    this.currentValue = 0;
    this.disabledDataFlag = false;
    this.readOnceFlag = false;
    this.currentSiUnit = "";
    this.currentValueString = Number(this.currentValue.toFixed(2));
    //console.log('onChange entered');
    this.i = 0;
    this.myLineChart.data.labels = [];
    this.myLineChart.data.datasets[0].data = [];
    this.readLiveGraphParameters();
    this.setGraphMinMax();

  }


  // setSavedDisplaySiValue() {

  //   this.storage.get('temperature').then((val) => {
  //     if (val == null) {
  //       this.storage.set('temperature', Constants.values.CelsiusUnitValue);
  //       val = Constants.values.CelsiusUnitValue;
  //     }
  //     this.temperatureDisplayUnit = val;
  //     //console.log('Temperature is', val);

  //   });

  //   this.storage.get('pressure').then((val) => {
  //     if (val == null) {
  //       this.storage.set('pressure', Constants.values.BarUnitValue);
  //       val = Constants.values.BarUnitValue;
  //     }
  //     this.pressureDisplayUnit = val;
  //     //console.log('pressure is', val);
  //   });


  // }

  sensorUnitCheck() {
    //console.log('this.sensorUnit is', this.sensorUnit);
    if (this.sensorUnit >= Constants.values.CelsiusUnitValue && this.sensorUnit <= Constants.values.FahrenheitUnitValue) {
      this.displayUnit = this.pcmchanneldataservice.temperatureDisplayUnit;
      //console.log('this.temperatureDisplayUnit is', this.pcmchanneldataservice.temperatureDisplayUnit);
    }
    else if (this.sensorUnit >= Constants.values.BarUnitValue && this.sensorUnit <= Constants.values.MpaUnitValue) {
      this.displayUnit = this.pcmchanneldataservice.pressureDisplayUnit;
      //console.log('this.pressureDisplayUnit is', this.pcmchanneldataservice.pressureDisplayUnit);
    }
    else {
      this.displayUnit = this.sensorUnit;
      //console.log('otherwise displayUnit is', this.displayUnit);
    }

    //console.log('displayUnit is', this.displayUnit);
    // if (this.displayUnit == Constants.values.FahrenheitUnitValue) {
    //   //console.log('entered FahrenheitUnitValue');
    //   this.currentValue=this.convertCelsiusToFahrenheit(this.currentValue);
    // }
    // else if (this.displayUnit == Constants.values.MpaUnitValue) {
    //   //console.log('entered MpaUnitValue');
    //   this.currentValue=this.convertBarToMpA(this.currentValue);
    //   // this.DisplayUnit = Constants.values.MpaUnitValue;
    // }
    // else if (this.displayUnit == Constants.values.PsiUnitValue) {
    //   //console.log('entered PsiUnitValue');
    //   this.currentValue=this.convertBarToPsi(this.currentValue);
    // }
    // this.currentValue = this.conversionToUnit(this.currentValue);
    this.setSiUnit();
  }

  conversionToUnit(value) {
    if (!(this.currentSiUnit == "%" || this.currentSiUnit == "mA")) {
      if (this.displayUnit == Constants.values.FahrenheitUnitValue) {
        //console.log('entered FahrenheitUnitValue');
        return this.convertCelsiusToFahrenheit(value);
      }
      else if (this.displayUnit == Constants.values.MpaUnitValue) {
        //console.log('entered MpaUnitValue');
        return this.convertBarToMpA(value);
      }
      else if (this.displayUnit == Constants.values.PsiUnitValue) {
        //console.log('entered PsiUnitValue');
        return this.convertBarToPsi(value);
      }
      // else return value;
    }
    //  else 
    return value;
  }

  convertCelsiusToFahrenheit(tempInCelsius) {
    return (tempInCelsius * 1.8) + 32;
  }

  convertBarToMpA(pressureInBar) {
    return (pressureInBar * 0.1)
  }

  convertBarToPsi(pressureInBar) {
    return (pressureInBar * 14.5038)
  }

  setSiUnit() {
    //console.log('Set Graph Header entered', ' this.displayUnit: ', this.displayUnit);
    if (this.displayUnit == Constants.values.BarUnitValue)
      this.currentSiUnit = " Bar";
    if (this.displayUnit == Constants.values.PsiUnitValue)
      this.currentSiUnit = " Psi";
    if (this.displayUnit == Constants.values.MpaUnitValue)
      this.currentSiUnit = " Mpa";
    else if (this.displayUnit == Constants.values.CelsiusUnitValue)
      this.currentSiUnit = " C";
    else if (this.displayUnit == Constants.values.FahrenheitUnitValue)
      this.currentSiUnit = " F";
    else if (this.displayUnit == Constants.values.RpmUnitValue)
      this.currentSiUnit = " Rpm";
    else if (this.displayUnit == Constants.values.LUnitValue)
      this.currentSiUnit = " L";
    else if (this.displayUnit == Constants.values.LPerMinUnitValue)
      this.currentSiUnit = " L/min";
//ANu - do changes here
    if (this.toggleValue == Constants.messages.switchToVal && this.liveGraphSetupDetails.channel >= Constants.channels.liveGraphAnalogInput1Channel && this.liveGraphSetupDetails.channel <= Constants.channels.liveGraphAnalogInput6Channel) {
      this.currentSiUnit = " mA";
    }
    this.cd.detectChanges();
  }

  /**
  * On click of Nav bar settings button, navigate to Settings page
  */
  navigateToSettings() {
    this.navCtrl.push("SettingsPage", { deviceObject: this.deviceObject });
  }

  analogToggle() {
    if (this.toggleValue == Constants.messages.switchToVal) {
      this.toggleValue = Constants.messages.switchToCurrent;
    } else {
      this.toggleValue = Constants.messages.switchToVal
    }
    this.onChange(2);
    this.setSiUnit();
  }

  setGraphMinMax() {
    if (this.liveGraphSetupDetails.channel >= Constants.channels.standaloneAnalog1FunctionChannel && this.liveGraphSetupDetails.channel <= Constants.channels.standaloneFunctionPT100Channel
      && this.toggleValue == Constants.messages.switchToCurrent) {
      if (this.liveGraphSetupDetails.channel != Constants.channels.standaloneFunctionPT100Channel) {
        this.analogMinInput = this.conversionToUnit(this.convertAnalogSensorValueToBar(this.analogMinInput));
        this.analogMaxInput = this.conversionToUnit(this.convertAnalogSensorValueToBar(this.analogMaxInput));
        this.myLineChart.options.scales.yAxes[0].ticks.min = (this.analogMinInput - ((this.analogMaxInput - this.analogMinInput) * 0.05));
        this.myLineChart.options.scales.yAxes[0].ticks.max = (this.analogMaxInput + ((this.analogMaxInput - this.analogMinInput) * 0.05));

      } else {
        this.myLineChart.options.scales.yAxes[0].ticks.min = this.conversionToUnit(-40);
        this.myLineChart.options.scales.yAxes[0].ticks.max = this.conversionToUnit(100);
      }


    }
    //ANu - do changes here
    else if (this.liveGraphSetupDetails.channel >= Constants.channels.liveGraphAnalogInput1Channel && this.liveGraphSetupDetails.channel <= Constants.channels.liveGraphAnalogInput6Channel
      && this.toggleValue == Constants.messages.switchToVal) {
      this.myLineChart.options.scales.yAxes[0].ticks.min = this.liveGraphSetupDetails.min;
      this.myLineChart.options.scales.yAxes[0].ticks.max = this.liveGraphSetupDetails.max;
    }
    else {
      this.myLineChart.options.scales.yAxes[0].ticks.min = this.conversionToUnit(this.liveGraphSetupDetails.min);
      this.myLineChart.options.scales.yAxes[0].ticks.max = this.conversionToUnit(this.liveGraphSetupDetails.max);

    }
    this.myLineChart.update();
  }

  convertPsiToBar(pressureInPsi) {
    return (pressureInPsi / 14.5038)
  }

  convertMpaToBar(pressureInMpa) {
    return (pressureInMpa / 0.1)
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


}