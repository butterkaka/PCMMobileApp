import { Constants } from './../../shared/app.constant';
import { Chart } from 'chart.js';
import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { PCMChannelDataService } from '../../providers/pcm-channel-data-service'
import { DeviceModel, AtmQuestionTypeModel } from '../../Models/ExportModelClass';

/**
 * Generated class for the LiveTunePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-live-tune-page',
  templateUrl: 'live-tune-page.html',
})
export class LiveTunePage {

  /**
   * LiveTunePage Constructor.
   * @constructor
   * @param navCtrl NavController for navigation
   * @param navParams NavParams paremters from previous component
   * @param alertCtrl AlertController to show when limit is reached
   * @param ble BLE object injected for Bluetooth Low Energy 
   * @param cd ChangeDetectorRef for detecting the change and updating UI
   * @param loadingController LoadingController for UI
   * @param pcmchanneldataservice PCMChannelDataService for UI 
   */
  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController,
    private ble: BLE, private cd: ChangeDetectorRef, public loadingController: LoadingController, public pcmchanneldataservice: PCMChannelDataService) {
    this.deviceObject = navParams.get(Constants.values.deviceObject);
    this.liveTuneGraphType = navParams.get(Constants.values.liveTuneGraphType)

    if (this.liveTuneGraphType == 2) {
      this.graphHeader = Constants.messages.setpointVsSwashAngle;
      this.minYAxesValue = -100;
      this.maxYAxesValue = 100;
    }
    else {
      this.graphHeader = Constants.messages.setpointVsPressure;
      this.minYAxesValue = this.conversionToUnit(0);
      this.maxYAxesValue = this.conversionToUnit(450);
    }
    //console.log('liveTuneGraphType:' + this.liveTuneGraphType);
    this.items = PCMChannelDataService.getLiveTuneValuesList(this.liveTuneGraphType);
    this.graphItems = JSON.parse(JSON.stringify(pcmchanneldataservice.liveTuneItems));
  }

  headerLabel = "Live tune";
  myLineChart;

  // label: "tooltip label test",
  // fill: false,
  // lineTension: 0.1,
  // backgroundColor: "rgba(192, 57, 43,0.4)",
  // borderColor: "rgba(192, 57, 43,1)",
  // borderCapStyle: 'butt',
  // borderDash: [],
  // borderDashOffset: 0.0,
  // borderJoinStyle: 'miter',
  // pointBorderColor: "rgba(75,192,192,1)",
  // pointBackgroundColor: "#fff",
  // pointBorderWidth: 1,
  // pointHoverRadius: 5,
  // pointHoverBackgroundColor: "rgba(75,192,192,1)",
  // pointHoverBorderColor: "rgba(220,220,220,1)",
  // pointHoverBorderWidth: 2,
  // pointRadius: 5,
  // pointHitRadius: 10,
  // data: [],

  data = {
    labels: [],
    datasets: [
      {
        label: "Setpoint",
        fill: false,
        yAxisID:'Setpoint',
        backgroundColor: "rgba(41, 128, 185,0.4)",
        borderColor: "rgba(41, 128, 185,1)",
        data: []
      },
      {
        label: "Value",
        yAxisID:'Pressure',
        fill: false,
        backgroundColor: "rgba(192, 57, 43,0.4)",
        borderColor: "rgba(192, 57, 43,1)",
        data: []
      }
    ]
  };

  graphHeader = "";
  liveTuneGraphType: any;
  check = false;
  pPartValue: number = 0;
  iPartValue: number = 0;
  dPartValue: number = 0;
  setpointValue: number = 0;
  currentSwashAngleValue: number = 0;
  currentPressureValue: number = 0;
  deviceObject: DeviceModel;
  atmQuestionObjectList: Array<AtmQuestionTypeModel>;
  atmQuestionInputObjList: Array<AtmQuestionTypeModel>;
  countAtmQList: number = 0;

  operation: string;
  startUpdateId;
  items;
  graphItems;
  temp = 0;
  minYAxesValue;
  maxYAxesValue;

  /** 
 * @event ionViewDidLoad PageLoad Event  
 */
  ionViewDidLoad() {

    //console.log('ionViewDidLoad LiveTunePage');

    this.addGraph();
    this.readLiveTuneParameters();
    this.readLiveTuneGraphParameters();
  }

  /** 
  * @event ionViewDidEnter - Event triggered when the page has entered to focus
  */
  ionViewDidEnter() {
    this.setTimeoutForViewUpdate();
    this.startUpdate();
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
   * 
   * @event ionViewWillLeave - Event triggered when the page is about to leave to next page.  
  */
  ionViewWillLeave() {
    clearInterval(this.startUpdateId);

  }

  /**
  * This  is used to add thegrph to the canvas
  */

  //Line tension - 0.4(Default) Bezier curve tension of the line. Set to 0 to draw straightlines. 
  addGraph() {
    var canvas = document.getElementById('myChart');

    var option = {
      showLines: true,
      elements: {
        line: {
          tension: 0.1
        },
        point: {
          radius: 0
        }
      }, animation: {
        duration: 0
      },
      scales: {
        yAxes: [{
          id: 'Pressure',
          type: 'linear',
          position: 'right',
          ticks: {
            min: this.minYAxesValue,
            max: this.maxYAxesValue
          }
        }, {
          id: 'Setpoint',
          type: 'linear',
          position: 'left',
          ticks: {
            min: 0,
            max: 100
          },
           gridLines: {
                    display:false
                }   

        }]
      }
    };
    this.myLineChart = Chart.Line(canvas, {
      data: this.data,
      options: option,
      responsive: true,
    });
  }


  i = 0

  /**
   * This is used to add the  setpoint and current Pressure/current Swash value onto the graph 
   */
  addData() {
    try {
      //console.log('this.setpointValue:' + this.setpointValue);
      //console.log('this.currentSwashAngleValue:' + this.currentSwashAngleValue);
      //console.log('this.currentPressureValue:' + this.currentPressureValue);
      this.myLineChart.data.labels.push(String(this.i));
      this.myLineChart.data.datasets[0].data.push(this.setpointValue);
      if (this.liveTuneGraphType == 2) {
        this.myLineChart.data.datasets[1].label = 'Swash angle';
        this.myLineChart.data.datasets[1].data.push(this.currentSwashAngleValue);
        console.log('this.currentSwashAngleValue:' + this.currentSwashAngleValue);
      }
      else {
        this.myLineChart.data.datasets[1].label = 'Pressure';
        this.myLineChart.data.datasets[1].data.push(this.currentPressureValue);
        console.log('this.currentPressureValue:' + this.currentPressureValue);
      }
      if (this.i > 20) {
        this.myLineChart.data.labels.shift();
        this.myLineChart.data.datasets[0].data.shift();
        this.myLineChart.data.datasets[1].data.shift();
      }

      this.myLineChart.update();
      this.i++;


    } catch (error) {
      //console.log(error)
    }

  }

  /**
   * This is used to read and add the data onto the graph
   */
  startUpdate() {
    this.startUpdateId = setInterval(() => {
      this.readLiveTuneParameters();
      this.readLiveTuneGraphParameters();
      this.addData();
      // //console.log('started')
    },
      500);

  }

  /** 
  * This is used to read the regulator setup paraemtrs from the device.  
  */
  readLiveTuneParameters() {
    this.operation = Constants.values.read;
    this.startNotify(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId);
    // workaround for notifier
    var byteArray = new Uint8Array([0, 0, 0, 0, 0, 0]);
    this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);

    this.atmQuestionObjectList = [];
    this.items.forEach(element => {
      var byteArray = new Uint8Array([element.rType, 0, element.channel, element.subchannel, 0, 0]);
      this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
    });

  }

  /** 
 * This is used to read the regulator setup paraemtrs from the device.  
 */
  readLiveTuneGraphParameters() {
    this.operation = Constants.values.read;
    this.startNotify(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId);
    // workaround for notifier
    var byteArray = new Uint8Array([0, 0, 0, 0, 0, 0]);
    this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);

    this.atmQuestionObjectList = [];
    this.graphItems.forEach(element => {
      var byteArray = new Uint8Array([element.rType, 0, element.channel, element.subchannel, 0, 0]);
      this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
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
      if (this.operation == Constants.values.read) { //&& this.countAtmQList > 2
        this.SetParameterValuesToUI();
        this.setItemValuesToUI();
      } else if (this.operation == Constants.values.write) { //&& this.countAtmQList > 3
        this.checkWriteStatus();
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
        if (element.channel == Constants.channels.standaloneSettingsChannel && element.subChannel == Constants.channels.setPointSubChannel) {
          this.setpointValue = (element.value32Bit1 / 100);
          //console.log('live tune  this.setpointValue : ' + this.setpointValue)
        } if (element.channel == Constants.channels.standaloneSettingsChannel && element.subChannel == Constants.channels.swashAngleSubChannel) {
          this.currentSwashAngleValue = (element.value32Bit1 / 100);
          //console.log('live tune this.currentSwashAngleValue:' + this.currentSwashAngleValue)
        } if (element.channel == Constants.channels.standaloneSettingsChannel && element.subChannel == Constants.channels.pressureSubChannel) {

          this.currentPressureValue = this.conversionToUnit((element.value32Bit1 / 1000))
          // if (this.pcmchanneldataservice.pressureDisplayUnit == Constants.values.MpaUnitValue) {
          //   //console.log('entered MpaUnitValue');
          //   this.currentPressureValue = ((element.value32Bit1 / 1000) * 0.1)
          // }
          // else if (this.pcmchanneldataservice.pressureDisplayUnit == Constants.values.PsiUnitValue) {
          //   //console.log('entered PsiUnitValue');
          //   this.currentPressureValue = ((element.value32Bit1 / 1000) * 14.5038);
          // } else {
          //   this.currentPressureValue = element.value32Bit1 / 1000;
          // }

          // this.currentPressureValue = (element.value32Bit1);
          //console.log('live tune this.currentPressureValue:' + this.currentPressureValue)
        }
        if (this.check == false) {
          if (this.liveTuneGraphType == 2) {
            if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.pPartGainSubChannel) {
              this.pPartValue = element.value32Bit1;
            }
            if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.iPartTimeSubChannel) {
              this.iPartValue = element.value32Bit1 / 100;;
            }
          } else {
            //console.log('liveTuneGraphType  :2');

            if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.pPartGainPressureRegSubChannel) {
              this.pPartValue = element.value32Bit1;
              //console.log('pPartValue  :' + this.pPartValue);
            }
            if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.iPartTimePressureRegSubChannel) {
              this.iPartValue = element.value32Bit1 / 100;;
              //console.log('iPartValue  :' + this.iPartValue);
            }
            if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.dPartGainPressureRegSubChannel) {
              this.dPartValue = element.value32Bit1;
              //console.log('dPartValue  :' + this.dPartValue);
            }
          }
        }

        // //console.log('this.setpointValue:' + this.setpointValue);
        // //console.log('this.currentPressureValue:' + this.currentPressureValue);

        // this.cd.detectChanges();
      } catch (error) {
        //console.log('this.SetParameterValuesToUI error:' + error);
      }

    });
    this.cd.detectChanges();
  }

  /** 
  * This is used to set item values read from PCM to the UI Controls
  */
  setItemValuesToUI() {

    if (this.check == false) {
      // //console.log("Hello")
      this.items.forEach(element => {
        if (element.Title == Constants.values.pPartGain) {
          element.Value = this.pPartValue;
        }
        if (element.Title == Constants.values.iPartTime) {
          element.Value = this.iPartValue;
        }
        if (element.Title == Constants.values.dPartGain) {
          element.Value = this.dPartValue;
        }
      });
    }



    this.cd.detectChanges();
  }

  /** 
  * This is used to check the write status of the parameters.  
  */
  checkWriteStatus() {
    let saveFlag = 0;
    this.atmQuestionObjectList.forEach(element => {
      if (element.status != 0) {
        saveFlag = 1;
        if (this.liveTuneGraphType == 2) {
          if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.pPartGainSubChannel) {
            //console.log(Constants.messages.status, Constants.messages.pPartGainStatus + element.status);
          }

          if (element.channel == Constants.channels.PWMSettingsChannel && element.subChannel == Constants.channels.iPartTimeSubChannel) {
            //console.log(Constants.messages.status, Constants.messages.iPartTimeStatus + element.status);
            saveFlag = 0;
          }

        }
        else {
          if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.pPartGainPressureRegSubChannel) {
            //console.log(Constants.messages.status, Constants.messages.pPartGainStatus + element.status);
          }
          if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.iPartTimePressureRegSubChannel) {
            //console.log(Constants.messages.status, Constants.messages.iPartTimeStatus + element.status);
          }
          if (element.channel == Constants.channels.pressurePIDRegChannel && element.subChannel == Constants.channels.dPartGainPressureRegSubChannel) {
            //console.log(Constants.messages.status, Constants.messages.dPartGainStatus + element.status);
            saveFlag = 0;
          }
        }
      }
    });

    if (saveFlag == 0) {
      //console.log(Constants.messages.saveParameters, Constants.messages.paramSavedSuccessfully);
    }

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
        //console.log('write fun:' + JSON.stringify(error));
      });

    this.check = false;


  }


  /** 
  * This is used for going back to the previous page
  */
  back() {
    clearInterval(this.startUpdateId);
    this.navCtrl.pop();
  }


  /** 
  * This is used for incrementing the value clicked
  * @param {JSON} item - selected item value from UI  
  */
  increment(item) {
    if (item.Max > item.Value) {
      item.Value = item.Value + item.Steps;
      this.setItemValuesToSys(item);
      this.writeLiveTuneParameters();
    }

    else this.presentAlert(Constants.messages.maximumLimit, Constants.messages.maximumLimitReached);

    this.cd.detectChanges();
  }

  /** 
    * This is used for decrementing the value clicked
    * @param {JSON} item - selected item value from UI  
    */
  decrement(item) {
    if (item.Min < item.Value) {
      item.Value = item.Value - item.Steps;
      this.setItemValuesToSys(item);
      this.writeLiveTuneParameters();
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
      buttons: [Constants.messages.ok]
    });
    this.pcmchanneldataservice.alert.present();
  }

  /** 
  * This is used to write the pump setup paraemtrs to the device.  
  */
  writeLiveTuneParameters() {
    this.check = true;
    this.operation = Constants.values.write;
    this.atmQuestionObjectList = [];
    this.countAtmQList = 0;
    let val1;
    let val2;
    let val3;
    let val4;
    let value32;
    let flag = 0;
    var liveTuneInputList = JSON.parse(JSON.stringify(this.items));;



    liveTuneInputList.forEach(element => {
      value32 = 0;
      flag = 0;
      if (element.Title == Constants.values.pPartGain) {
        value32 = this.pPartValue;
        flag = 1;
      } if (element.Title == Constants.values.iPartTime) {
        value32 = this.iPartValue * 100;
        flag = 1;
      } if (element.Title == Constants.values.dPartGain) {
        value32 = this.dPartValue;
        flag = 1;
      }
      if (flag == 1) {

        val4 = (value32 & 0xff000000) >> 24;
        val3 = (value32 & 0x00ff0000) >> 16;
        val2 = (value32 & 0x0000ff00) >> 8;
        val1 = (value32 & 0x000000ff);

        var byteArray = new Uint8Array([element.wType, 0, element.channel, element.subchannel, val1, val2, val3, val4]);
        try {
          this.write(this.deviceObject.deviceId, this.deviceObject.serviceUUID, this.deviceObject.characteristicId, byteArray.buffer);
        } catch (error) {
          //console.log("writeLiveTuneParameters error:" + error);
        }

      }
    });
  }

  /** 
   * This is used to set the list values to their respective items
   * @param {JSON} item - 
   */
  setItemValuesToSys(element) {


    if (element.Title == Constants.values.pPartGain) {
      this.pPartValue = element.Value;
    }
    if (element.Title == Constants.values.iPartTime) {
      this.iPartValue = element.Value;

    } if (element.Title == Constants.values.dPartGain) {
      this.dPartValue = element.Value;
    }
  }

  conversionToUnit(value) {
    if (this.graphHeader != Constants.messages.setpointVsSwashAngle) {
      if (this.pcmchanneldataservice.pressureDisplayUnit == Constants.values.MpaUnitValue) {
        console.log('entered MpaUnitValue');
        return this.convertBarToMpA(value);
      }
      else if (this.pcmchanneldataservice.pressureDisplayUnit == Constants.values.PsiUnitValue) {
        console.log('entered PsiUnitValue');
        return this.convertBarToPsi(value);
      }
    }
    return value;
  }

  convertBarToMpA(pressureInBar) {
    return (pressureInBar * 0.1)
  }

  convertBarToPsi(pressureInBar) {
    return (pressureInBar * 14.5038)
  }



}

