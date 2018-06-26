import { Constants } from './../shared/app.constant';
import { AlertController } from 'ionic-angular';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { DeviceModel } from '../Models/ExportModelClass';
/*
  Generated class for the PCMChannelDataService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
  created by jkm5kor -  20-06-2017
*/
@Injectable()
export class PCMChannelDataService {



  alert = null; // testing Anu - for alertCntrl close.
  deviceIdGlobal: string;
  deviceObjectGlobal: DeviceModel;
  isIOOverViewMock: boolean;
  loaderGlobal;

  // Password Global Values
  passwordDeviceSetupPageFlag: boolean = false;
  passwordFlag: boolean = false;
  passwordString: string = "";

  //SI unit Global values
  temperatureDisplayUnit;
  pressureDisplayUnit;

  //Mockdata check global value
  mockData: boolean = false;
  appResetFlag: boolean = true;

  regulatorSetupItems = [
    { Title: 'Feed forward', Value: 0, Min: 0, Max: 100, Steps: 1, Metric: '%' },
    { Title: 'Proportional gain', Value: 0, Min: 0, Max: 500, Steps: 5, Metric: '' },
    { Title: 'Integration time', Value: 0, Min: 0.5, Max: 60, Steps: 0.5, Metric: 's' },
    // { Title: 'Derivation gain', Value: 0.0, Min: 0.0, Max: 1.0, Steps: 0.10, Metric: 's' },                      --TBD
    // { Title: 'Derivation decline time', Value: 0.0, Min: 0.0, Max: 1.0, Steps: 0.10, Metric: 's' },              --TBD
    { Title: 'Max feedback deviation', Value: 0, Min: 0, Max: 100, Steps: 1, Metric: '%' }

  ];

  // { Title: Constants.values.pPartGain, Value: 0, Min: 0, Max: 1000, Steps: 1, Metric: '%' },
  // { Title: Constants.values.iPartTime, Value: 0, Min: 0, Max: 10000, Steps: 10, Metric: 's' },
  // { Title: Constants.values.dPartGain, Value: 0, Min: 0, Max: 1000, Steps: 1, Metric: '%' },
  // { Title: Constants.values.feedforwardPercentage, Value: 0, Min: 0, Max: 1000, Steps: 1, Metric: '%' },
  // { Title: Constants.values.positiveOperationPercentage, Value: 0, Min: 0, Max: 100, Steps: 1, Metric: '%' },
  // { Title: Constants.values.negativeOperationPercentage, Value: 0, Min: 0, Max: 100, Steps: 1, Metric: '%' },
  // { Title: Constants.values.errorLimitPercentage, Value: 0, Min: 0, Max: 100, Steps: 1, Metric: '%' },
  pressureRegulatorSetupItems = [

    { 'name': Constants.values.swashAngle, 'isDropdown': true, 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneSettingsChannel, 'subchannel': Constants.channels.sswashAngleSubChannel },
    { 'name': Constants.values.pressureRegulator, 'isDropdown': true, 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.pressureRegSubChannel },
    { 'name': Constants.values.pPart, 'isDropdown': true, 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.pPartPressureRegSubChannel },
    { 'name': Constants.values.pPartGain, 'isDropdown': false, Value: 0, Min: 0, Max: 1000, Steps: 1, Metric: '%', 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.pPartGainPressureRegSubChannel },
    { 'name': Constants.values.iPart, 'isDropdown': true, 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.iPartPressureRegSubChannel },
    { 'name': Constants.values.iPartTime, 'isDropdown': false, Value: 0, Min: 0.5, Max: 10000, Steps: 0.1, Metric: 's', 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.iPartTimePressureRegSubChannel },
    { 'name': Constants.values.dPart, 'isDropdown': true, 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.dPartPressureRegSubChannel },
    { 'name': Constants.values.dPartGain, 'isDropdown': false, Value: 0, Min: 0, Max: 1000, Steps: 1, Metric: '%', 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.dPartGainPressureRegSubChannel },
    { 'name': Constants.values.feedforwardPercentage, 'isDropdown': false, Value: 0, Min: 0, Max: 1000, Steps: 1, Metric: '%', 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.feedForwardPressureRegSubChannel },
    { 'name': Constants.values.positiveOperationPercentage, 'isDropdown': false, Value: 0, Min: 0, Max: 100, Steps: 1, Metric: '%', 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.positiveOperationPressureRegSubChannel },
    { 'name': Constants.values.negativeOperationPercentage, 'isDropdown': false, Value: 0, Min: 0, Max: 100, Steps: 1, Metric: '%', 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.negativeOperationPressureRegSubChannel },
    { 'name': Constants.values.errorLimitPercentage, 'isDropdown': false, Value: 0, Min: 0, Max: 100, Steps: 1, Metric: '%', 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.errorLimitPressureRegSubChannel },
    { 'name': Constants.values.invertFeedbackDirection, 'isDropdown': true, 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.invertFeedbackDirectionPressureRegSubChannel }
  ];

  /** 
 * This is used to get input values list of Swash setup
 * @returns {JSON} regulatorSetupInputList - The regularsetup data
 */
  // static getPressureRegulatorsetupInputDetails() {
  //   let regulatorSetupInputList = [
  //     { 'name': Constants.values.swashAngle, 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneSettingsChannel, 'subchannel': Constants.channels.sswashAngleSubChannel },
  //     { 'name': Constants.values.pressureRegulator, 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.pressureRegSubChannel },
  //     { 'name': Constants.values.pPart, 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.pPartPressureRegSubChannel },
  //     { 'name': Constants.values.pPartGain, 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.pPartGainPressureRegSubChannel },
  //     { 'name': Constants.values.iPart, 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.iPartPressureRegSubChannel },
  //     { 'name': Constants.values.iPartTime, 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.iPartTimePressureRegSubChannel },
  //     { 'name': Constants.values.dPart, 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.dPartPressureRegSubChannel },
  //     { 'name': Constants.values.dPartGain, 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.dPartGainPressureRegSubChannel },
  //     { 'name': Constants.values.feedforwardPercentage, 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.feedForwardPressureRegSubChannel },
  //     { 'name': Constants.values.positiveOperationPercentage, 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.positiveOperationPressureRegSubChannel },
  //     { 'name': Constants.values.negativeOperationPercentage, 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.negativeOperationPressureRegSubChannel },
  //     { 'name': Constants.values.errorLimitPercentage, 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.errorLimitPressureRegSubChannel },
  //     { 'name': Constants.values.invertFeedbackDirection, 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.invertFeedbackDirectionPressureRegSubChannel }
  //   ]
  //   return regulatorSetupInputList;
  // }


  // { Title: Constants.values.pPartGain,'isDropdown':true,  Value: 0, Min: 0, Max: 1000, Steps: 1, Metric: '' },
  //   { Title: Constants.values.iPartTime,'isDropdown':true, Value: 0, Min: 0, Max: 6000, Steps: 10, Metric: 's' },
  //   { Title: Constants.values.integrationOffOverThisError, Value: 0, Min: 0, Max: 100, Steps: 1, Metric: '%' },
  //   { Title: Constants.values.feedforwardPercentage, Value: 0, Min: 0, Max: 1000, Steps: 1, Metric: '%' },
  //   { Title: Constants.values.swashAngleErrorLimitPercentage, Value: 0, Min: 0, Max: 100, Steps: 1, Metric: '%' }
  swashAngleSetupItems = [
    { 'name': Constants.values.pressureRegulator, 'isDropdown': true, 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.pressureRegSubChannel },
    { 'name': Constants.values.swashAngle, 'isDropdown': true, 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneSettingsChannel, 'subchannel': Constants.channels.sswashAngleSubChannel },
    { 'name': Constants.values.pPart, 'isDropdown': true, 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.pPartSubChannel },
    { 'name': Constants.values.pPartGain, 'isDropdown': false, Value: 0, Min: 0, Max: 1000, Steps: 1, Metric: '%', 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.pPartGainSubChannel },
    { 'name': Constants.values.iPart, 'isDropdown': true, 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.iPartSubChannel },
    { 'name': Constants.values.iPartTime, 'isDropdown': false, Value: 0, Min: 0.5, Max: 6000, Steps: 0.1, Metric: 's', 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.iPartTimeSubChannel },
    { 'name': Constants.values.integrationOffOverThisError, 'isDropdown': false, Value: 0, Min: 0, Max: 100, Steps: 1, Metric: '%', 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.integrationOffOverThisErrorSubChannel },
    { 'name': Constants.values.feedforwardPercentage, 'isDropdown': false, Value: 0, Min: 0, Max: 1000, Steps: 1, Metric: '%', 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.feedforwardPercentageSubChannel },
    { 'name': Constants.values.swashAngleErrorLimitPercentage, 'isDropdown': false, Value: 0, Min: 0, Max: 100, Steps: 1, Metric: '%', 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.swashAngleErrorLimitPercentageSubChannel },
    { 'name': Constants.values.iinvertSwashAngleDirection, 'isDropdown': true, 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.invertSwashAngleDirectionSubchannel }

  ];

  /** 
 * This is used to get input values list of Swash setup
 * @returns {JSON} regulatorSetupInputList - The regularsetup data
 */
  // static getSwashsetupInputDetails() {
  //   let regulatorSetupInputList = [
  //     { 'name': Constants.values.pressureRegulator, 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.pressureRegSubChannel },
  //     { 'name': Constants.values.swashAngle, 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneSettingsChannel, 'subchannel': Constants.channels.sswashAngleSubChannel },
  //     { 'name': Constants.values.pPart, 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.pPartSubChannel },
  //     { 'name': Constants.values.pPartGain, 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.pPartGainSubChannel },
  //     { 'name': Constants.values.iPart, 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.iPartSubChannel },
  //     { 'name': Constants.values.iPartTime, 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.iPartTimeSubChannel },
  //     { 'name': Constants.values.integrationOffOverThisError, 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.integrationOffOverThisErrorSubChannel },
  //     { 'name': Constants.values.feedforwardPercentage, 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.feedforwardPercentageSubChannel },
  //     { 'name': Constants.values.swashAngleErrorLimitPercentage, 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.swashAngleErrorLimitPercentageSubChannel },
  //     { 'name': Constants.values.iinvertSwashAngleDirection, 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.invertSwashAngleDirectionSubchannel }
  //   ]
  //   return regulatorSetupInputList;
  // }


  rampSetupItems = [
    { Title: Constants.values.shutdownRamp, Value: 0, Min: 0, Max: 60, Steps: 1, Metric: 's', rType: 2, wType: 3, channel: Constants.channels.PWMSettingsChannel, subchannel: Constants.channels.shutdownRampSubChannel },
    { Title: Constants.values.positiveRampForwardDirection, Value: 0, Min: 0, Max: 10000, Steps: 1, Metric: 's', rType: 2, wType: 3, channel: Constants.channels.standaloneSettingsChannel, subchannel: Constants.channels.positiveRampForwardDirectionSubChannel },
    { Title: Constants.values.negativeRampForwardDirection, Value: 0, Min: 0, Max: 10000, Steps: 1, Metric: 's', rType: 2, wType: 3, channel: Constants.channels.standaloneSettingsChannel, subchannel: Constants.channels.negativeRampForwardDirectionSubChannel },
    { Title: Constants.values.positiveRampReverseDirection, Value: 0, Min: 0, Max: 10000, Steps: 1, Metric: 's', rType: 2, wType: 3, channel: Constants.channels.standaloneSettingsChannel, subchannel: Constants.channels.positiveRampReverseDirectionSubChannel },
    { Title: Constants.values.negativeRampReverseDirection, Value: 0, Min: 0, Max: 10000, Steps: 1, Metric: 's', rType: 2, wType: 3, channel: Constants.channels.standaloneSettingsChannel, subchannel: Constants.channels.negativeRampReverseDirectionSubChannel }
  ];

  analogInputParameterItems = [
    { Title: 'MinInput', Value: 0, Min: -10000, Max: 10000, Steps: 1, Metric: '' },
    { Title: 'MaxInput', Value: 0, Min: -10000, Max: 10000, Steps: 1, Metric: '' },
    { Title: 'Warning(min)', Value: 0, Min: -10000, Max: 10000, Steps: 1, Metric: '' },
    { Title: 'Warning(max)', Value: 0, Min: -10000, Max: 10000, Steps: 1, Metric: '' },
    { Title: 'Alarm(min)', Value: 0, Min: -10000, Max: 10000, Steps: 1, Metric: '' },
    { Title: 'Alarm(max)', Value: 0, Min: -10000, Max: 10000, Steps: 1, Metric: '' }
  ];
  analogInputParameterItemsPt100 = [

    { Title: 'Warning(min)', Value: 0, Min: -10000, Max: 10000, Steps: 1, Metric: '' },
    { Title: 'Warning(max)', Value: 0, Min: -10000, Max: 10000, Steps: 1, Metric: '' },
    { Title: 'Alarm(min)', Value: 0, Min: -10000, Max: 10000, Steps: 1, Metric: '' },
    { Title: 'Alarm(max)', Value: 0, Min: -10000, Max: 10000, Steps: 1, Metric: '' }
  ];



  pumpSetupItems = [
    { Title: Constants.values.forwardMinCurrent, Value: 0, Min: 50, Max: 1500, Steps: 10, Metric: 'mA', rType: 2, wType: 3, channel: 30, subchannel: 7 },
    { Title: Constants.values.forwardMaxCurrent, Value: 0, Min: 50, Max: 1500, Steps: 10, Metric: 'mA', rType: 2, wType: 3, channel: 30, subchannel: 8 },
    { Title: Constants.values.reverseMinCurrent, Value: 0, Min: 50, Max: 1500, Steps: 10, Metric: 'mA', rType: 2, wType: 3, channel: 30, subchannel: 9 },
    { Title: Constants.values.forwardMaxCurrent, Value: 0, Min: 50, Max: 1500, Steps: 10, Metric: 'mA', rType: 2, wType: 3, channel: 30, subchannel: 10 },
    { Title: Constants.values.coilResistance, Value: 0, Min: 1 , Max: 100 , Steps: 1 , Metric: 'ohm', rType: 2, wType: 3, channel: 30, subchannel: 4 },
    // { Title: 'PWM Frequency', Value: 100, Min: 100, Max: 10000, Steps: 100, Metric: 'Hz' }, --TBD
    { Title: Constants.values.ditherAmplitude, Value: 0, Min: 0, Max: 500, Steps: 10, Metric: 'mA', rType: 2, wType: 3, channel: 30, subchannel: 3 },
    { Title:  Constants.values.ditherFrequency, Value: 0, Min: 50, Max: 1000, Steps: 10, Metric: 'Hz', rType: 2, wType: 3, channel: 30, subchannel: 2 },
    { Title:  Constants.values.maxCurrentError, Value: 0, Min: 0, Max: 100, Steps: 1, Metric: '%', rType: 2, wType: 3, channel: 30, subchannel: 11 },
    // { Title: 'Limp Home Ramp Time', Value: 0, Min: 0, Max: 60, Steps: 1, Metric: 's', rType: 2, wType: 3, channel: 30, subchannel: 12 }
  ];

  liveTuneItems = [
    { 'name': Constants.values.liveGraphSetpointValue, 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneSettingsChannel, 'subchannel': Constants.channels.setPointSubChannel },
    { 'name': Constants.values.liveGraphPressureValue, 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneSettingsChannel, 'subchannel': Constants.channels.pressureSubChannel },
    { 'name': Constants.values.liveGraphSwashAngleValue, 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneSettingsChannel, 'subchannel': Constants.channels.swashAngleSubChannel }
  ];

  static getLiveTuneValuesList(LiveTuneType) {


    let liveTunepValuesList = {
      'PressureRegulator': [
        { 'Title': Constants.values.pPartGain, Value: 0, Min: 0, Max: 1000, Steps: 1, Metric: '%', 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.pPartGainPressureRegSubChannel },
        { 'Title': Constants.values.iPartTime, Value: 0, Min: 0.5, Max: 10000, Steps: 0.1, Metric: 's', 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.iPartTimePressureRegSubChannel },
        { 'Title': Constants.values.dPartGain, Value: 0, Min: 0, Max: 1000, Steps: 1, Metric: '%', 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.dPartGainPressureRegSubChannel }
      ],
      'SwashAngle': [

        { 'Title': Constants.values.pPartGain, Value: 0, Min: 0, Max: 1000, Steps: 1, Metric: '%', 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.pPartGainSubChannel },
        { 'Title': Constants.values.iPartTime, Value: 0, Min: 0.5, Max: 10000, Steps: 0.1, Metric: 's', 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.iPartTimeSubChannel }
      ]

    }
    if (LiveTuneType == 1) {
      console.log('LiveTuneType selected :PressureRegulator')
      return liveTunepValuesList.PressureRegulator;
    } else if (LiveTuneType == 2) {
      return liveTunepValuesList.SwashAngle;
    }


  }

  constructor(private alertCtrl: AlertController) {
    console.log('Hello PCMChannelDataService Provider');
  }

  /** 
  * This is used to get input values list
  * @returns {JSON} regulatorSetupInputList - The regularsetup data
  */
  static getInputDetails() {
    let regulatorSetupInputList = [
      { 'name': 'regulatorType', 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneSettingsChannel, 'subchannel': Constants.channels.regTypeSubchannel },
      { 'name': 'feedForward', 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.feedForwardSubchannel },
      { 'name': 'propotionalReg', 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.propotionalRegSubchannel },
      { 'name': 'integrationReg', 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.integrationRegSubchannel },
      { 'name': 'propotionalGain', 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.propotionalGainSubchannel },
      { 'name': 'integrationTime', 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.integrationTimeSubchannel },
      { 'name': 'maxFeedbackDeviation', 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.maxFeedbackDeviationSubchannel },
    ]
    return regulatorSetupInputList;
  }


  /** 
   * This is used to get input values list
   * @returns {JSON} connectorSetupDetails - The connectorSetupDetails data
   */
  static getInputDetailsDeviceMainPage() {
    let deviceMainPageParameterInputList = [
      { 'name': Constants.values.pressureRegulator, 'rType': 2, 'wType': 3, 'channel': Constants.channels.pressurePIDRegChannel, 'subchannel': Constants.channels.pressureRegSubChannel },
      { 'name': Constants.values.swashAngle, 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneSettingsChannel, 'subchannel': Constants.channels.sswashAngleSubChannel },
      { 'name': 'runMode', 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneSettingsChannel, 'subchannel': Constants.channels.runModeSubChannel },
      { 'name': 'setPoint', 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneSettingsChannel, 'subchannel': Constants.channels.setPointSubChannel },
      { 'name': 'pressure', 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneSettingsChannel, 'subchannel': Constants.channels.pressureSubChannel },
      { 'name': 'swashAngle', 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneSettingsChannel, 'subchannel': Constants.channels.swashAngleSubChannel },
      { 'name': 'firmwareVersion', 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneSettingsChannel, 'subchannel': Constants.channels.firmwareVersion }
    ]
    return deviceMainPageParameterInputList;
  }

  /** 
  * This is used to get input values list
  * @returns {JSON} deviceMainPageParameterInputList - The deviceMainPageParameter data
  */
  static getconnectorSetupDetails(connector: string) {

    let connectorSetupDetails = {
      "LO": [
        { "pinNum": "1", "pinValue": "Do not connect" },
        { "pinNum": "2", "pinValue": "+24V power out" },
        { "pinNum": "3", "pinValue": "Ground out" },
        { "pinNum": "4", "pinValue": "Do not connect" },
        { "pinNum": "5", "pinValue": "Do not connect" }
      ],
      "LI": [
        { "pinNum": "1", "pinValue": "Do not connect" },
        { "pinNum": "2", "pinValue": "+24V power in" },
        { "pinNum": "3", "pinValue": "Ground in" },
        { "pinNum": "4", "pinValue": "Do not connect" },
        { "pinNum": "5", "pinValue": "Do not connect" }
      ],
      "PO": [
        { "pinNum": "1", "pinValue": "+24V I/O power out" },
        { "pinNum": "2", "pinValue": "+24V Pump power in" },
        { "pinNum": "3", "pinValue": "Ground I/O out" },
        { "pinNum": "4", "pinValue": "Ground I/O out" }
      ],
      "PI": [
        { "pinNum": "1", "pinValue": "+24V I/O power in" },
        { "pinNum": "2", "pinValue": "+24V Pump power in" },
        { "pinNum": "3", "pinValue": "Ground I/O in" },
        { "pinNum": "4", "pinValue": "Ground I/O in" }
      ],
      "O1": [
        { "pinNum": "1", "pinValue": "Ground I/O" },
        { "pinNum": "2", "pinValue": "Pump out" },
        { "pinNum": "3", "pinValue": "Ground I/O" },
        { "pinNum": "4", "pinValue": "Pump out" },
      ],
      "O2": [
        { "pinNum": "1", "pinValue": "Ground I/O" },
        { "pinNum": "2", "pinValue": "Pump out" },
        { "pinNum": "3", "pinValue": "Ground I/O" },
        { "pinNum": "4", "pinValue": "Pump out" },
      ],
      "AI": [
        { "pinNum": "1", "pinValue": "+24V power" },
        { "pinNum": "2", "pinValue": "Analog in 1" },
        { "pinNum": "3", "pinValue": "Ground I/O" },
        { "pinNum": "4", "pinValue": "Analog in 2" },
      ],
      "PT": [
        { "pinNum": "1", "pinValue": "PT100 +" },
        { "pinNum": "2", "pinValue": "PT100 + sense" },
        { "pinNum": "3", "pinValue": "PT100 -" },
        { "pinNum": "4", "pinValue": "PT100 - sense" },
      ],
      "X1": [
        { "pinNum": "1", "pinValue": "+24V power" },
        { "pinNum": "2", "pinValue": "Analog in 3" },
        { "pinNum": "3", "pinValue": "Ground I/O" },
        { "pinNum": "4", "pinValue": "Digital in 1" },
      ],
      "X2": [
        { "pinNum": "1", "pinValue": "+24V power" },
        { "pinNum": "2", "pinValue": "Analog in 4" },
        { "pinNum": "3", "pinValue": "Ground I/O" },
        { "pinNum": "4", "pinValue": "Digital in 2" },
      ],
      "X3": [
        { "pinNum": "1", "pinValue": "+24V power" },
        { "pinNum": "2", "pinValue": "Analog in 5" },
        { "pinNum": "3", "pinValue": "Ground I/O" },
        { "pinNum": "4", "pinValue": "Digital in 3" },
      ],
      "X4": [
        { "pinNum": "1", "pinValue": "+24V power" },
        { "pinNum": "2", "pinValue": "Analog in 6" },
        { "pinNum": "3", "pinValue": "Ground I/O" },
        { "pinNum": "4", "pinValue": "Digital in 4" },
      ],
      "DI": [
        { "pinNum": "1", "pinValue": "+24V power" },
        { "pinNum": "2", "pinValue": "Digital I/O 1" },
        { "pinNum": "3", "pinValue": "Digital I/O 2" },
        { "pinNum": "4", "pinValue": "Digital I/O 3" },
        { "pinNum": "5", "pinValue": "Digital I/O 4" }
      ],
      "DO": [
        { "pinNum": "1", "pinValue": "Digital I/O 5" },
        { "pinNum": "2", "pinValue": "Digital I/O 6" },
        { "pinNum": "3", "pinValue": "Ground I/O" },
        { "pinNum": "4", "pinValue": "Digital I/O 7" },
        { "pinNum": "5", "pinValue": "Digital I/O 8" }
      ],
      "USB": [
        { "pinNum": "", "pinValue": "Not Configurable" }
      ]

    }

    if (connector == Constants.values.LO) {
      return connectorSetupDetails.LO;
    } else if (connector == Constants.values.LI) {
      return connectorSetupDetails.LI;
    } else if (connector == Constants.values.O1) {
      return connectorSetupDetails.O1;
    } else if (connector == Constants.values.O2) {
      return connectorSetupDetails.O2;
    } else if (connector == Constants.values.PI) {
      return connectorSetupDetails.PI;
    } else if (connector == Constants.values.PO) {
      return connectorSetupDetails.PO;
    } else if (connector == Constants.values.AI) {
      return connectorSetupDetails.AI;
    } else if (connector == Constants.values.PT) {
      return connectorSetupDetails.PT;
    } else if (connector == Constants.values.X1) {
      return connectorSetupDetails.X1;
    } else if (connector == Constants.values.X2) {
      return connectorSetupDetails.X2;
    } else if (connector == Constants.values.X3) {
      return connectorSetupDetails.X3;
    } else if (connector == Constants.values.X4) {
      return connectorSetupDetails.X4
    } else if (connector == Constants.values.DI) {
      return connectorSetupDetails.DI;
    } else if (connector == Constants.values.DO) {
      return connectorSetupDetails.DO;
    } else if (connector == Constants.values.USB) {
      return connectorSetupDetails.USB;
    }

  }


  /** 
 * This is used to get connector parameter function input dropdown list
 * @returns {JSON} connectorParameterSetupDetails - The connectorParameterSetupDetails data
 */
  static getconnectorParameterDropdownList(connector: string) {
    let connectorParameterSetupDetails = {
      "AI": [
        { "value": "0", "name": "Disabled" },
        { "value": "1", "name": "Setpoint input" },
        { "value": "2", "name": "Swash angle input" },
        { "value": "3", "name": "Work pressure input" },
        { "value": "4", "name": "Threshold" },
        { "value": "5", "name": "Threshold temp" }
      ],
      "DI": [
        { "value": "0", "name": "Input disabled" },
        { "value": "1", "name": "Start drive" },
        { "value": "2", "name": "Reverse drive" },
        { "value": "333", "name": "Swash angle regulator enable" },
        { "value": "444", "name": "Pressure regulator enable" },
        { "value": "555", "name": "Monitor input signal" },
        { "value": "6", "name": "Quickstop input" },
        { "value": "7", "name": "Warning input" },
        { "value": "8", "name": "Temperature warning input" },
        { "value": "9", "name": "Alarm input" }
      ], "PT": [
        { "value": "0", "name": "disabled" },
        { "value": "5", "name": "threshold temp" }
      ],
      "DIO": [
        { "value": "0", "name": "Input disabled" },
        { "value": "1", "name": "Start drive" },
        { "value": "2", "name": "Reverse drive" },
        { "value": "3", "name": "Swash angle regulator enable" },
        { "value": "4", "name": "Pressure regulator enable" },
        { "value": "5", "name": "Monitor input signal" },
        { "value": "6", "name": "Quickstop input" },
        { "value": "7", "name": "Warning input" },
        { "value": "8", "name": "Temperature warning input" },
        { "value": "9", "name": "Alarm input" },
        { "value": "10", "name": "Alarm output" },
        { "value": "11", "name": "Warning output" },
        { "value": "12", "name": "Temperature warning output" },
      ]
    }
    if (connector == Constants.values.AI) {
      return connectorParameterSetupDetails.AI;
    } else if (connector == Constants.values.DI) {
      return connectorParameterSetupDetails.DI;
    } else if (connector == Constants.values.PT) {
      return connectorParameterSetupDetails.PT;
    } else if (connector == Constants.values.DIO) {
      return connectorParameterSetupDetails.DIO;
    }

  }

  /** 
 * This is used to get analog sensor unit  dropdown list
 * @returns {JSON} AnalogSensorUnitDetails - The AnalogSensorUnit data
 */
  static getAnalogSensorUnitDropdownList(functionInputAnalog: number) {
    let analogUnitDropdownList = {
      "thresholdTemp": [
        // { "value": "0", "name": "None" },
        { "value": "1", "name": "C" },
        { "value": "2", "name": "F" },
      ],
      "workPressureInput": [
        // { "value": "0", "name": "None" },
        { "value": "3", "name": "Bar" },
        { "value": "4", "name": "Psi" },
        { "value": "5", "name": "Mpa" }

      ], "threshold": [
        // { "value": "0", "name": "None" },
        { "value": "3", "name": "Bar" },
        { "value": "4", "name": "Psi" },
        { "value": "5", "name": "Mpa" },
        { "value": "6", "name": "Rpm" },
        { "value": "7", "name": "L" },
        { "value": "8", "name": "L/min" }
      ]
    }
    if (functionInputAnalog == Constants.values.thresholdTemp) {
      return analogUnitDropdownList.thresholdTemp;
    } else if (functionInputAnalog == Constants.values.workPressureInput) {
      return analogUnitDropdownList.workPressureInput;
    } else if (functionInputAnalog == Constants.values.threshold) {
      return analogUnitDropdownList.threshold;
    }
  }


  /** 
 * This is used to get analog sensor unit  dropdown list
 * @returns {JSON} AnalogSensorUnitDetails - The AnalogSensorUnit data
 */
  static getAnalogDisplayUnitDropdownList(sensorInput: number) {
    let analogUnitDropdownList = {
      "temperature": [

        { "value": "1", "name": "C" },
        { "value": "2", "name": "F" },
      ],
      "pressure": [
        { "value": "3", "name": "Bar" },
        { "value": "4", "name": "Psi" },
        { "value": "5", "name": "Mpa" }

      ], "rotationalSpeed": [

        { "value": "6", "name": "Rpm" }

      ], "volume": [

        { "value": "7", "name": "L" }
      ],
      "flow": [
        { "value": "8", "name": "L/min" }
      ]
    }
    if (sensorInput == Constants.values.BarUnitValue || sensorInput == Constants.values.PsiUnitValue || sensorInput == Constants.values.MpaUnitValue) {

      return analogUnitDropdownList.pressure;
    }
    else if (sensorInput == Constants.values.CelsiusUnitValue || sensorInput == Constants.values.FahrenheitUnitValue) {
      return analogUnitDropdownList.temperature;
    }
    else if (sensorInput == Constants.values.RpmUnitValue) {
      return analogUnitDropdownList.rotationalSpeed;
    }
    else if (sensorInput == Constants.values.LUnitValue) {
      return analogUnitDropdownList.volume;
    }
    else if (sensorInput == Constants.values.LPerMinUnitValue) {
      return analogUnitDropdownList.flow;
    }
  }


  /** 
 * This is used to get connector parameter values list
 * @returns {JSON} connectorParameterSetupDetails - The connectorParameterSetupDetails data
 */
  static getconnectorParameterSetupValuesList(connectorPinType: string, channel) {
    // let connectorParamterSetupValuesList = {
    //   "AnalogIn1": [
    //     { 'name': 'alarmMin', 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneAnalog1FunctionChannel, 'subchannel': Constants.channels.alarmMinSubchannel },
    //     { 'name': 'alarmMax', 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneAnalog1FunctionChannel, 'subchannel': Constants.channels.alarmMaxSubchannel },
    //     { 'name': 'warnMin', 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneAnalog1FunctionChannel, 'subchannel': Constants.channels.warnMinSubchannel },
    //     { 'name': 'warnMax', 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneAnalog1FunctionChannel, 'subchannel': Constants.channels.warnMaxSubchannel }
    //   ],
    //   "AnalogIn2": [
    //     { 'name': 'alarmMin', 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneAnalog2FunctionChannel, 'subchannel': Constants.channels.alarmMinSubchannel },
    //     { 'name': 'alarmMax', 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneAnalog2FunctionChannel, 'subchannel': Constants.channels.alarmMaxSubchannel },
    //     { 'name': 'warnMin', 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneAnalog2FunctionChannel, 'subchannel': Constants.channels.warnMinSubchannel },
    //     { 'name': 'warnMax', 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneAnalog2FunctionChannel, 'subchannel': Constants.channels.warnMaxSubchannel }
    //   ]
    // }

    let connectorParamterSetupValuesList = {
      "AnalogIn": [
        { 'name': 'minInput', 'rType': 2, 'wType': 3, 'channel': channel, 'subchannel': Constants.channels.minInputSubchannel },
        { 'name': 'maxInput', 'rType': 2, 'wType': 3, 'channel': channel, 'subchannel': Constants.channels.maxInputSubchannel },
        { 'name': 'sensorUnit', 'rType': 2, 'wType': 3, 'channel': channel, 'subchannel': Constants.channels.sensorUnitSubchannel },
        { 'name': 'warnMin', 'rType': 2, 'wType': 3, 'channel': channel, 'subchannel': Constants.channels.warnMinSubchannel },
        { 'name': 'warnMax', 'rType': 2, 'wType': 3, 'channel': channel, 'subchannel': Constants.channels.warnMaxSubchannel },
        { 'name': 'alarmMin', 'rType': 2, 'wType': 3, 'channel': channel, 'subchannel': Constants.channels.alarmMinSubchannel },
        { 'name': 'alarmMax', 'rType': 2, 'wType': 3, 'channel': channel, 'subchannel': Constants.channels.alarmMaxSubchannel }
      ], "PT100": [
        { 'name': 'sensorUnit', 'rType': 2, 'wType': 3, 'channel': channel, 'subchannel': Constants.channels.sensorUnitSubchannel },
        { 'name': 'warnMin', 'rType': 2, 'wType': 3, 'channel': channel, 'subchannel': Constants.channels.warnMinSubchannel },
        { 'name': 'warnMax', 'rType': 2, 'wType': 3, 'channel': channel, 'subchannel': Constants.channels.warnMaxSubchannel },
        { 'name': 'alarmMin', 'rType': 2, 'wType': 3, 'channel': channel, 'subchannel': Constants.channels.alarmMinSubchannel },
        { 'name': 'alarmMax', 'rType': 2, 'wType': 3, 'channel': channel, 'subchannel': Constants.channels.alarmMaxSubchannel }
      ],
      "DigitalIn": [
        { 'name': 'inverted', 'rType': 2, 'wType': 3, 'channel': channel, 'subchannel': Constants.channels.invertedSubchannel }
      ]

    }
    if (connectorPinType == Constants.values.AnalogIn || connectorPinType == Constants.values.PT100) {
      return connectorParamterSetupValuesList.AnalogIn;
    } else if (connectorPinType == Constants.values.PT100) {
      return connectorParamterSetupValuesList.PT100;
    } else if (connectorPinType == Constants.values.DigitalIn) {
      return connectorParamterSetupValuesList.DigitalIn;
    }


  }


  /** 
* This is used to get the calibration parameter values list
@param buttonName - Button name , on which the user has clicked on
* @returns {JSON} calibrationParamterSetupValuesList - The connectorParameterSetupDetails data
*/
  static deviceSetupFunctionality(buttonName) {
    let buttonParamterSetupValuesList = {
      "FactoryReset": { 'name': Constants.values.FactoryReset, 'rType': 2, 'wType': 3, 'channel': Constants.channels.eepromFunctionChannel, 'subchannel': Constants.channels.factoryResetSubChannel },
      "SaveToEeprom": { 'name': Constants.values.SaveToEeprom, 'rType': 2, 'wType': 3, 'channel': Constants.channels.eepromFunctionChannel, 'subchannel': Constants.channels.saveToEepromSubChannel },
      "LoadFromEeprom": { 'name': Constants.values.LoadFromEeprom, 'rType': 2, 'wType': 3, 'channel': Constants.channels.eepromFunctionChannel, 'subchannel': Constants.channels.loadFromEepromSubChannel }
    }

    if (buttonName == buttonParamterSetupValuesList.FactoryReset.name) {
      return buttonParamterSetupValuesList.FactoryReset;
    } else if (buttonName == buttonParamterSetupValuesList.SaveToEeprom.name) {
      return buttonParamterSetupValuesList.SaveToEeprom;
    } else if (buttonName == buttonParamterSetupValuesList.LoadFromEeprom.name) {
      return buttonParamterSetupValuesList.LoadFromEeprom;
    }
  }


  /** 
* This is used to get the calibration parameter values list
* @returns {JSON} calibrationParamterSetupValuesList - The connectorParameterSetupDetails data
*/
  static calibrateconnectorParameterSetupValuesList(connectorPinValue) {

    let calibrationParamterSetupValuesList = {
      "AnalogIn1": { 'name': Constants.values.AnalogIn1Value, 'rType': 2, 'wType': 3, 'channel': Constants.channels.calibrateAnalogInput, 'subchannel': Constants.channels.analogIn1SubChannel, 'metric': ' mA', 'values': [4, 20] },
      "AnalogIn2": { 'name': Constants.values.AnalogIn2Value, 'rType': 2, 'wType': 3, 'channel': Constants.channels.calibrateAnalogInput, 'subchannel': Constants.channels.analogIn2SubChannel, 'metric': ' mA', 'values': [4, 20] },
      "AnalogIn3": { 'name': Constants.values.AnalogIn3Value, 'rType': 2, 'wType': 3, 'channel': Constants.channels.calibrateAnalogInput, 'subchannel': Constants.channels.analogIn3SubChannel, 'metric': ' mA', 'values': [4, 20] },
      "AnalogIn4": { 'name': Constants.values.AnalogIn4Value, 'rType': 2, 'wType': 3, 'channel': Constants.channels.calibrateAnalogInput, 'subchannel': Constants.channels.analogIn4SubChannel, 'metric': ' mA', 'values': [4, 20] },
      "AnalogIn5": { 'name': Constants.values.AnalogIn5Value, 'rType': 2, 'wType': 3, 'channel': Constants.channels.calibrateAnalogInput, 'subchannel': Constants.channels.analogIn5SubChannel, 'metric': ' mA', 'values': [4, 20] },
      "AnalogIn6": { 'name': Constants.values.AnalogIn6Value, 'rType': 2, 'wType': 3, 'channel': Constants.channels.calibrateAnalogInput, 'subchannel': Constants.channels.analogIn6SubChannel, 'metric': ' mA', 'values': [4, 20] },
      "PT100": { 'name': Constants.values.PT100, 'rType': 2, 'wType': 3, 'channel': Constants.channels.calibratePt100, 'subchannel': Constants.channels.pt100SubChannel, 'metric': ' C', 'values': [0, 100] }
    }

    if (connectorPinValue == calibrationParamterSetupValuesList.AnalogIn1.name) {
      return calibrationParamterSetupValuesList.AnalogIn1;
    } else if (connectorPinValue == calibrationParamterSetupValuesList.AnalogIn2.name) {
      return calibrationParamterSetupValuesList.AnalogIn2;
    } else if (connectorPinValue == calibrationParamterSetupValuesList.AnalogIn3.name) {
      return calibrationParamterSetupValuesList.AnalogIn3;
    } else if (connectorPinValue == calibrationParamterSetupValuesList.AnalogIn4.name) {
      return calibrationParamterSetupValuesList.AnalogIn4;
    } else if (connectorPinValue == calibrationParamterSetupValuesList.AnalogIn5.name) {
      return calibrationParamterSetupValuesList.AnalogIn5;
    } else if (connectorPinValue == calibrationParamterSetupValuesList.AnalogIn6.name) {
      return calibrationParamterSetupValuesList.AnalogIn6;
    } else if (connectorPinValue.indexOf(calibrationParamterSetupValuesList.PT100.name) >= 0) { //Only for testing. Need to change - Anu 10/8/2017 
      return calibrationParamterSetupValuesList.PT100;
    }


  }

  static getLiveTuneInputDetails() {
    let liveTuneInputList = [
      { 'name': Constants.values.liveGraphSetpointValue, 'rType': 2, 'wType': 3, 'channel': Constants.channels.liveGraphSetpointChannel, 'subchannel': Constants.channels.liveGraphSetpointSubhannel },
      { 'name': Constants.values.liveGraphPressureValue, 'rType': 2, 'wType': 3, 'channel': Constants.channels.liveGraphPressureChannel, 'subchannel': Constants.channels.liveGraphPressureSubhannel },
      { 'name': Constants.values.liveGraphSwashAngleValue, 'rType': 2, 'wType': 3, 'channel': Constants.channels.liveGraphSwashAngleChannel, 'subchannel': Constants.channels.liveGraphSwashAngleSubhannel },
      { 'name': 'propotionalGain', 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.propotionalGainSubchannel },
      { 'name': 'integrationTime', 'rType': 2, 'wType': 3, 'channel': Constants.channels.PWMSettingsChannel, 'subchannel': Constants.channels.integrationTimeSubchannel },

    ]
    return liveTuneInputList;
  }

  /** 
* This is used to get the live graph parameter values 
* @returns {JSON} liveGraphParameterSetupValues - The live Graph Parameter Setup Details data
*/
  static liveGraphParameterSetupValues(liveGraphType) {
    console.log('liveGraphType ' + String(liveGraphType));
    // let liveGraphParamterSetupValuesList = [

    //   { 'name': Constants.values.liveGraphSetpointValue, 'rType': 2, 'wType': 3, 'channel': Constants.channels.liveGraphSetpointChannel, 'subchannel': Constants.channels.liveGraphSetpointSubhannel, 'divisor': 100 },
    //   { 'name': Constants.values.liveGraphPressureValue, 'rType': 2, 'wType': 3, 'channel': Constants.channels.liveGraphPressureChannel, 'subchannel': Constants.channels.liveGraphPressureSubhannel, 'divisor': 1 },
    //   { 'name': Constants.values.liveGraphSwashAngleValue, 'rType': 2, 'wType': 3, 'channel': Constants.channels.liveGraphSwashAngleChannel, 'subchannel': Constants.channels.liveGraphSwashAngleSubhannel, 'divisor': 100 },
    //   { 'name': Constants.values.liveGraphPumpCurrentValue, 'rType': 2, 'wType': 3, 'channel': Constants.channels.liveGraphPumpCurrentChannel, 'subchannel': Constants.channels.liveGraphPumpCurrentSubhannel, 'divisor': 10 },
    //   { 'name': Constants.values.liveGraphAnalogInput1Value, 'rType': 2, 'wType': 3, 'channel': Constants.channels.liveGraphAnalogInput1Channel, 'subchannel': Constants.channels.liveGraphAnalogInput1Subhannel, 'divisor': 1000 },
    //   { 'name': Constants.values.liveGraphAnalogInput2Value, 'rType': 2, 'wType': 3, 'channel': Constants.channels.liveGraphAnalogInput2Channel, 'subchannel': Constants.channels.liveGraphAnalogInput2Subhannel, 'divisor': 1000 },
    //   { 'name': Constants.values.liveGraphAnalogInput3Value, 'rType': 2, 'wType': 3, 'channel': Constants.channels.liveGraphAnalogInput3Channel, 'subchannel': Constants.channels.liveGraphAnalogInput3Subhannel, 'divisor': 1000 },
    //   { 'name': Constants.values.liveGraphAnalogInput4Value, 'rType': 2, 'wType': 3, 'channel': Constants.channels.liveGraphAnalogInput4Channel, 'subchannel': Constants.channels.liveGraphAnalogInput4Subhannel, 'divisor': 1000 },
    //   { 'name': Constants.values.liveGraphAnalogInput5Value, 'rType': 2, 'wType': 3, 'channel': Constants.channels.liveGraphAnalogInput5Channel, 'subchannel': Constants.channels.liveGraphAnalogInput5Subhannel, 'divisor': 1000 },
    //   { 'name': Constants.values.liveGraphAnalogInput6Value, 'rType': 2, 'wType': 3, 'channel': Constants.channels.liveGraphAnalogInput6Channel, 'subchannel': Constants.channels.liveGraphAnalogInput6Subhannel, 'divisor': 1000 },
    //   { 'name': Constants.values.liveGraphPT100Value, 'rType': 2, 'wType': 3, 'channel': Constants.channels.liveGraphPT100Channel, 'subchannel': Constants.channels.liveGraphPT100Subhannel, 'divisor': 1 }
    // ];

    let liveGraphParamterSetupValuesList = {
      'Setpoint': { 'name': Constants.values.liveGraphSetpointValue, 'rType': 2, 'wType': 3, 'channel': Constants.channels.liveGraphSetpointChannel, 'subchannel': Constants.channels.liveGraphSetpointSubhannel, 'min': -100, 'max': 100, 'divisor': 100 },
      'Pressure': { 'name': Constants.values.liveGraphPressureValue, 'rType': 2, 'wType': 3, 'channel': Constants.channels.liveGraphPressureChannel, 'subchannel': Constants.channels.liveGraphPressureSubhannel, 'min': 0, 'max': 450, 'divisor': 1000 },
      'SwashAngle': { 'name': Constants.values.liveGraphSwashAngleValue, 'rType': 2, 'wType': 3, 'channel': Constants.channels.liveGraphSwashAngleChannel, 'subchannel': Constants.channels.liveGraphSwashAngleSubhannel, 'min': -100, 'max': 100, 'divisor': 100 },
      'PumpCurrent': { 'name': Constants.values.liveGraphPumpCurrentValue, 'rType': 2, 'wType': 3, 'channel': Constants.channels.liveGraphPumpCurrentChannel, 'subchannel': Constants.channels.liveGraphPumpCurrentSubhannel, 'min': -2000, 'max': 2000, 'divisor': 10 },
      'AnalogIn1': { 'name': Constants.values.liveGraphAnalogInput1Value, 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneAnalog1FunctionChannel, 'subchannel': Constants.channels.liveGraphAnalogInput1Subhannel, 'min': 0, 'max': 25, 'divisor': 1000 },
      'AnalogIn2': { 'name': Constants.values.liveGraphAnalogInput2Value, 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneAnalog2FunctionChannel, 'subchannel': Constants.channels.liveGraphAnalogInput2Subhannel, 'min': 0, 'max': 25, 'divisor': 1000 },
      'AnalogIn3': { 'name': Constants.values.liveGraphAnalogInput3Value, 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneAnalog3FunctionChannel, 'subchannel': Constants.channels.liveGraphAnalogInput3Subhannel, 'min': 0, 'max': 25, 'divisor': 1000 },
      'AnalogIn4': { 'name': Constants.values.liveGraphAnalogInput4Value, 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneAnalog4FunctionChannel, 'subchannel': Constants.channels.liveGraphAnalogInput4Subhannel, 'min': 0, 'max': 25, 'divisor': 1000 },
      'AnalogIn5': { 'name': Constants.values.liveGraphAnalogInput5Value, 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneAnalog5FunctionChannel, 'subchannel': Constants.channels.liveGraphAnalogInput5Subhannel, 'min': 0, 'max': 25, 'divisor': 1000 },
      'AnalogIn6': { 'name': Constants.values.liveGraphAnalogInput6Value, 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneAnalog6FunctionChannel, 'subchannel': Constants.channels.liveGraphAnalogInput6Subhannel, 'min': 0, 'max': 25, 'divisor': 1000 },
      'PT100': { 'name': Constants.values.liveGraphPT100Value, 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneFunctionPT100Channel, 'subchannel': Constants.channels.liveGraphPT100Subhannel, 'min': 0, 'max': 25, 'divisor': 1000 }
      // 'PT100': { 'name': Constants.values.liveGraphPT100Value, 'rType': 2, 'wType': 3, 'channel': Constants.channels.standaloneFunctionPT100Channel, 'subchannel': Constants.channels.liveGraphPT100Subhannel, 'min': -30, 'max': 150, 'divisor': 10 }
    };

    // liveGraphParamterSetupValuesList.forEach(element => {
    //   if (liveGraphType == element.name) {
    //     console.log('element.name:' + element.name);
    //     console.log('element.channel:' + element.channel);
    //     console.log('element.channel:' + element.subchannel);
    //     return element;
    //    }
    // });
    if (liveGraphType == liveGraphParamterSetupValuesList.Setpoint.name) {
      return liveGraphParamterSetupValuesList.Setpoint;
    } else if (liveGraphType == liveGraphParamterSetupValuesList.SwashAngle.name) {
      return liveGraphParamterSetupValuesList.SwashAngle;
    } else if (liveGraphType == liveGraphParamterSetupValuesList.PumpCurrent.name) {
      return liveGraphParamterSetupValuesList.PumpCurrent;
    } else if (liveGraphType == liveGraphParamterSetupValuesList.Pressure.name) {
      return liveGraphParamterSetupValuesList.Pressure;
    } else if (liveGraphType == liveGraphParamterSetupValuesList.AnalogIn1.name) {
      return liveGraphParamterSetupValuesList.AnalogIn1;
    } else if (liveGraphType == liveGraphParamterSetupValuesList.AnalogIn2.name) {
      return liveGraphParamterSetupValuesList.AnalogIn2;
    } else if (liveGraphType == liveGraphParamterSetupValuesList.AnalogIn3.name) {
      return liveGraphParamterSetupValuesList.AnalogIn3;
    } else if (liveGraphType == liveGraphParamterSetupValuesList.AnalogIn4.name) {
      return liveGraphParamterSetupValuesList.AnalogIn4;
    } else if (liveGraphType == liveGraphParamterSetupValuesList.AnalogIn5.name) {
      return liveGraphParamterSetupValuesList.AnalogIn5;
    } else if (liveGraphType == liveGraphParamterSetupValuesList.AnalogIn6.name) {
      return liveGraphParamterSetupValuesList.AnalogIn6;
    } else if (liveGraphType == liveGraphParamterSetupValuesList.PT100.name) {
      return liveGraphParamterSetupValuesList.PT100;
    } else if (liveGraphType == "All") {
      return liveGraphParamterSetupValuesList;
    }

  }

  /** 
 * This is used for incrementing the value clicked
 * @param {any} header - header value  
 * @param {any} subHeader - subHeader value  
 */
  presentAlert(header, subHeader) {
    this.alert = this.alertCtrl.create({
      title: header,
      subTitle: subHeader,
      enableBackdropDismiss: false,
      buttons: [
        {
          text: Constants.messages.ok,
          handler: data => {
            this.alert = null;
          }
        }]
    });
    this.alert.present();
  }

  /** 
  * This is used to get input values list
  * @returns {JSON} regulatorSetupInputList - The regularsetup data
  */
  static getAlarmAndWarnInputDetails() {
    let alarmAndWarnInputList = [
      { 'name': 'Alarms', 'rType': 2, 'wType': 3, 'channel': Constants.channels.alarmCommunucationChannel, 'subchannel': Constants.channels.alarmsSubchannel },
      { 'name': 'HardwareAlarms', 'rType': 2, 'wType': 3, 'channel': Constants.channels.alarmCommunucationChannel, 'subchannel': Constants.channels.hardwareAlarmsSubchannel },
      { 'name': 'Warnings', 'rType': 2, 'wType': 3, 'channel': Constants.channels.alarmCommunucationChannel, 'subchannel': Constants.channels.warningsSubchannel },
      { 'name': 'TempWarnings', 'rType': 2, 'wType': 3, 'channel': Constants.channels.alarmCommunucationChannel, 'subchannel': Constants.channels.tempWarningsSubchannel },
      { 'name': 'Alarms', 'rType': 2, 'wType': 3, 'channel': Constants.channels.alarmCommunucationChannel, 'subchannel': Constants.channels.alarmsLogSubchannel },
      { 'name': 'HardwareAlarms', 'rType': 2, 'wType': 3, 'channel': Constants.channels.alarmCommunucationChannel, 'subchannel': Constants.channels.hardwareAlarmsLogSubchannel },
      { 'name': 'Warnings', 'rType': 2, 'wType': 3, 'channel': Constants.channels.alarmCommunucationChannel, 'subchannel': Constants.channels.warningsLogSubchannel },
      { 'name': 'TempWarnings', 'rType': 2, 'wType': 3, 'channel': Constants.channels.alarmCommunucationChannel, 'subchannel': Constants.channels.tempWarningsLogSubchannel }
    ]
    return alarmAndWarnInputList;
  }


  /** 
 * This is used to get input values list
 * @returns {JSON} regulatorSetupInputList - The regularsetup data
 */
  static getLogInputDetails() {
    let logInputList = [
      { 'name': 'Alarms', 'rType': 2, 'wType': 3, 'channel': Constants.channels.alarmCommunucationChannel, 'subchannel': Constants.channels.alarmsLogSubchannel },
      { 'name': 'HardwareAlarms', 'rType': 2, 'wType': 3, 'channel': Constants.channels.alarmCommunucationChannel, 'subchannel': Constants.channels.hardwareAlarmsLogSubchannel },
      { 'name': 'Warnings', 'rType': 2, 'wType': 3, 'channel': Constants.channels.alarmCommunucationChannel, 'subchannel': Constants.channels.warningsLogSubchannel },
      { 'name': 'TempWarnings', 'rType': 2, 'wType': 3, 'channel': Constants.channels.alarmCommunucationChannel, 'subchannel': Constants.channels.tempWarningsLogSubchannel }
    ]
    return logInputList;
  }





  /** 
  * This is used to get connector parameter function input dropdown list
  * @returns {JSON} connectorParameterSetupDetails - The connectorParameterSetupDetails data
  */
  static getAlarmsListMap(alarmType: string) {
    let alarmsListMap = {
      'Alarms': [
        { 'value': '1', 'name': 'Analog 1 min alarm' },
        { 'value': '2', 'name': 'Analog 2 min alarm' },
        { 'value': '3', 'name': 'Analog 3 min alarm' },
        { 'value': '4', 'name': 'Analog 4 min alarm' },
        { 'value': '5', 'name': 'Analog 5 min alarm' },
        { 'value': '6', 'name': 'Analog 6 min alarm' },
        { 'value': '7', 'name': 'Undefined' },
        { 'value': '8', 'name': 'Undefined' },
        { 'value': '9', 'name': 'Analog 1 max alarm' },
        { 'value': '10', 'name': 'Analog 2 max alarm' },
        { 'value': '11', 'name': 'Analog 3 max alarm' },
        { 'value': '12', 'name': 'Analog 4 max alarm' },
        { 'value': '13', 'name': 'Analog 5 max alarm' },
        { 'value': '14', 'name': 'Analog 6 max alarm' },
        { 'value': '15', 'name': 'Undefined' },
        { 'value': '16', 'name': 'Undefined' },
        { 'value': '17', 'name': 'Digital alarm 1' },
        { 'value': '18', 'name': 'Digital alarm 2' },
        { 'value': '19', 'name': 'Digital alarm 3' },
        { 'value': '20', 'name': 'Digital alarm 4' },
        { 'value': '21', 'name': 'Digital alarm 5' },
        { 'value': '22', 'name': 'Digital alarm 6' },
        { 'value': '23', 'name': 'Digital alarm 7' },
        { 'value': '24', 'name': 'Digital alarm 8' },
        { 'value': '25', 'name': 'Digital alarm 9' },
        { 'value': '26', 'name': 'Digital alarm 10' },
        { 'value': '27', 'name': 'Digital alarm 11' },
        { 'value': '28', 'name': 'Digital alarm 12' },
        { 'value': '29', 'name': 'Undefined' },
        { 'value': '30', 'name': 'Undefined' },
        { 'value': '31', 'name': 'PT100 min alarm' },
        { 'value': '32', 'name': 'PT100 max alarm' }
      ],
      'HardwareAlarms': [
        { 'value': '1', 'name': 'Bridge error' },
        { 'value': '2', 'name': 'IO error' },
        { 'value': '3', 'name': 'SCM timer' },
        { 'value': '4', 'name': 'Flash CRC error' },
        { 'value': '5', 'name': 'PWM current error' },
        { 'value': '6', 'name': 'PWM short circuit' },
        { 'value': '7', 'name': 'Swash angle error' },
        { 'value': '8', 'name': 'Driver error' },
        { 'value': '9', 'name': 'Open load error' },
        { 'value': '10', 'name': 'No swash angle input selected' },
        { 'value': '11', 'name': 'No swash angle regulator enable selected' },
        { 'value': '12', 'name': 'No work pressure input selected' },
        { 'value': '13', 'name': 'No pressure regulator enable selected' },
        { 'value': '14', 'name': 'Work pressure error to large vs setpoint' },
        { 'value': '15', 'name': 'Digital input 1 monitor lost' },
        { 'value': '16', 'name': 'Digital input 2 monitor lost' },
        { 'value': '17', 'name': 'Digital input 3 monitor lost' },
        { 'value': '18', 'name': 'Digital input 4 monitor lost' },
        { 'value': '19', 'name': 'Digital input 5 monitor lost' },
        { 'value': '20', 'name': 'Digital input 6 monitor lost' },
        { 'value': '21', 'name': 'Digital input 7 monitor lost' },
        { 'value': '22', 'name': 'Digital input 8 monitor lost' },
        { 'value': '23', 'name': 'Digital input 9 monitor lost' },
        { 'value': '24', 'name': 'Digital input 10 monitor lost' },
        { 'value': '25', 'name': 'Digital input 11 monitor lost' },
        { 'value': '26', 'name': 'Digital input 12 monitor lost' }
      ],
      'Warnings': [
        { 'value': '1', 'name': 'Analog 1 min warn' },
        { 'value': '2', 'name': 'Analog 2 min warn' },
        { 'value': '3', 'name': 'Analog 3 min warn' },
        { 'value': '4', 'name': 'Analog 4 min warn' },
        { 'value': '5', 'name': 'Analog 5 min warn' },
        { 'value': '6', 'name': 'Analog 6 min warn' },
        { 'value': '7', 'name': 'Undefined' },
        { 'value': '8', 'name': 'Undefined' },
        { 'value': '9', 'name': 'Analog 1 max warn' },
        { 'value': '10', 'name': 'Analog 2 max warn' },
        { 'value': '11', 'name': 'Analog 3 max warn' },
        { 'value': '12', 'name': 'Analog 4 max warn' },
        { 'value': '13', 'name': 'Analog 5 max warn' },
        { 'value': '14', 'name': 'Analog 6 max warn' },
        { 'value': '15', 'name': 'Undefined' },
        { 'value': '16', 'name': 'Undefined' },
        { 'value': '17', 'name': 'Digital warn 1' },
        { 'value': '18', 'name': 'Digital warn 2' },
        { 'value': '19', 'name': 'Digital warn 3' },
        { 'value': '20', 'name': 'Digital warn 4' },
        { 'value': '21', 'name': 'Digital warn 5' },
        { 'value': '22', 'name': 'Digital warn 6' },
        { 'value': '23', 'name': 'Digital warn 7' },
        { 'value': '24', 'name': 'Digital warn 8' },
        { 'value': '25', 'name': 'Digital warn 9' },
        { 'value': '26', 'name': 'Digital warn 10' },
        { 'value': '27', 'name': 'Digital warn 11' },
        { 'value': '28', 'name': 'Digital warn 12' },
        { 'value': '29', 'name': 'Undefined' },
        { 'value': '30', 'name': 'Undefined' },
        { 'value': '31', 'name': 'Undefined' },
        { 'value': '32', 'name': 'Undefined' },
      ],
      'TempWarnings': [
        { 'value': '1', 'name': 'Analog 1 min warn temp' },
        { 'value': '2', 'name': 'Analog 2 min warn temp' },
        { 'value': '3', 'name': 'Analog 3 min warn temp' },
        { 'value': '4', 'name': 'Analog 4 min warn temp' },
        { 'value': '5', 'name': 'Analog 5 min warn temp' },
        { 'value': '6', 'name': 'Analog 6 min warn temp' },
        { 'value': '7', 'name': 'Undefined' },
        { 'value': '8', 'name': 'Undefined' },
        { 'value': '9', 'name': 'Analog 1 max warn temp' },
        { 'value': '10', 'name': 'Analog 2 max warn temp' },
        { 'value': '11', 'name': 'Analog 3 max warn temp' },
        { 'value': '12', 'name': 'Analog 4 max warn temp' },
        { 'value': '13', 'name': 'Analog 5 max warn temp' },
        { 'value': '14', 'name': 'Analog 6 max warn temp' },
        { 'value': '15', 'name': 'Undefined' },
        { 'value': '16', 'name': 'Undefined' },
        { 'value': '17', 'name': 'Digital warn temp 1' },
        { 'value': '18', 'name': 'Digital warn temp 2' },
        { 'value': '19', 'name': 'Digital warn temp 3' },
        { 'value': '20', 'name': 'Digital warn temp 4' },
        { 'value': '21', 'name': 'Digital warn temp 5' },
        { 'value': '22', 'name': 'Digital warn temp 6' },
        { 'value': '23', 'name': 'Digital warn temp 7' },
        { 'value': '24', 'name': 'Digital warn temp 8' },
        { 'value': '25', 'name': 'Digital warn temp 9' },
        { 'value': '26', 'name': 'Digital warn temp 10' },
        { 'value': '27', 'name': 'Digital warn temp 11' },
        { 'value': '28', 'name': 'Digital warn temp 12' },
        { 'value': '29', 'name': 'Undefined' },
        { 'value': '30', 'name': 'Undefined' },
        { 'value': '31', 'name': 'PT100 min warn temp' },
        { 'value': '32', 'name': 'PT100 max warn temp' }



      ], 'AlarmsLog': [
        { 'value': '1', 'name': 'Analog 1 min alarm log' },
        { 'value': '2', 'name': 'Analog 2 min alarm log' },
        { 'value': '3', 'name': 'Analog 3 min alarm log' },
        { 'value': '4', 'name': 'Analog 4 min alarm log' },
        { 'value': '5', 'name': 'Analog 5 min alarm log' },
        { 'value': '6', 'name': 'Analog 6 min alarm log' },
        { 'value': '7', 'name': 'Undefined' },
        { 'value': '8', 'name': 'Undefined' },
        { 'value': '9', 'name': 'Analog 1 max alarm log' },
        { 'value': '10', 'name': 'Analog 2 max alarm log' },
        { 'value': '11', 'name': 'Analog 3 max alarm log' },
        { 'value': '12', 'name': 'Analog 4 max alarm log' },
        { 'value': '13', 'name': 'Analog 5 max alarm log' },
        { 'value': '14', 'name': 'Analog 6 max alarm log' },
        { 'value': '15', 'name': 'Undefined' },
        { 'value': '16', 'name': 'Undefined' },
        { 'value': '17', 'name': 'Digital alarm log 1' },
        { 'value': '18', 'name': 'Digital alarm log 2' },
        { 'value': '19', 'name': 'Digital alarm log 3' },
        { 'value': '20', 'name': 'Digital alarm log 4' },
        { 'value': '21', 'name': 'Digital alarm log 5' },
        { 'value': '22', 'name': 'Digital alarm log 6' },
        { 'value': '23', 'name': 'Digital alarm log 7' },
        { 'value': '24', 'name': 'Digital alarm log 8' },
        { 'value': '25', 'name': 'Digital alarm log 9' },
        { 'value': '26', 'name': 'Digital alarm log 10' },
        { 'value': '27', 'name': 'Digital alarm log 11' },
        { 'value': '28', 'name': 'Digital alarm log 12' },
        { 'value': '29', 'name': 'Undefined' },
        { 'value': '30', 'name': 'Undefined' },
        { 'value': '31', 'name': 'PT100 min alarm log' },
        { 'value': '32', 'name': 'PT100 max alarm log' }
      ],
      'HardwareAlarmsLog': [
       { 'value': '1', 'name': 'Bridge error log' },
        { 'value': '2', 'name': 'IO error log' },
        { 'value': '3', 'name': 'SCM timer log' },
        { 'value': '4', 'name': 'Flash CRC error log' },
        { 'value': '5', 'name': 'PWM current error log' },
        { 'value': '6', 'name': 'PWM short circuit log' },
        { 'value': '7', 'name': 'Swash angle error log' },
        { 'value': '8', 'name': 'Driver error log' },
        { 'value': '9', 'name': 'Open load errorlog' },
        { 'value': '10', 'name': 'No swash angle input selected' },
        { 'value': '11', 'name': 'No swash angle regulator enable selected' },
        { 'value': '12', 'name': 'No work pressure input selected' },
        { 'value': '13', 'name': 'No pressure regulator enable selected' },
        { 'value': '14', 'name': 'Work pressure error to large vs setpoint' },
        { 'value': '15', 'name': 'Digital input 1 monitor lost' },
        { 'value': '16', 'name': 'Digital input 2 monitor lost' },
        { 'value': '17', 'name': 'Digital input 3 monitor lost' },
        { 'value': '18', 'name': 'Digital input 4 monitor lost' },
        { 'value': '19', 'name': 'Digital input 5 monitor lost' },
        { 'value': '20', 'name': 'Digital input 6 monitor lost' },
        { 'value': '21', 'name': 'Digital input 7 monitor lost' },
        { 'value': '22', 'name': 'Digital input 8 monitor lost' },
        { 'value': '23', 'name': 'Digital input 9 monitor lost' },
        { 'value': '24', 'name': 'Digital input 10 monitor lost' },
        { 'value': '25', 'name': 'Digital input 11 monitor lost' },
        { 'value': '26', 'name': 'Digital input 12 monitor lost' }

      ],
      'WarningsLog': [
        { 'value': '1', 'name': 'Analog 1 min warn log' },
        { 'value': '2', 'name': 'Analog 2 min warn log' },
        { 'value': '3', 'name': 'Analog 3 min warn log' },
        { 'value': '4', 'name': 'Analog 4 min warn log' },
        { 'value': '5', 'name': 'Analog 5 min warn log' },
        { 'value': '6', 'name': 'Analog 6 min warn log' },
        { 'value': '7', 'name': 'Undefined' },
        { 'value': '8', 'name': 'Undefined' },
        { 'value': '9', 'name': 'Analog 1 max warn log' },
        { 'value': '10', 'name': 'Analog 2 max warn log' },
        { 'value': '11', 'name': 'Analog 3 max warn log' },
        { 'value': '12', 'name': 'Analog 4 max warn log' },
        { 'value': '13', 'name': 'Analog 5 max warn log' },
        { 'value': '14', 'name': 'Analog 6 max warn log' },
        { 'value': '15', 'name': 'Undefined' },
        { 'value': '16', 'name': 'Undefined' },
        { 'value': '17', 'name': 'Digital warn log 1' },
        { 'value': '18', 'name': 'Digital warn log 2' },
        { 'value': '19', 'name': 'Digital warn log 3' },
        { 'value': '20', 'name': 'Digital warn log 4' },
        { 'value': '21', 'name': 'Digital warn log 5' },
        { 'value': '22', 'name': 'Digital warn log 6' },
        { 'value': '23', 'name': 'Digital warn log 7' },
        { 'value': '24', 'name': 'Digital warn log 8' },
        { 'value': '25', 'name': 'Digital warn log 9' },
        { 'value': '26', 'name': 'Digital warn log 10' },
        { 'value': '27', 'name': 'Digital warn log 11' },
        { 'value': '28', 'name': 'Digital warn log 12' },
        { 'value': '29', 'name': 'Undefined' },
        { 'value': '30', 'name': 'Undefined' },
        { 'value': '31', 'name': 'Undefined' },
        { 'value': '32', 'name': 'Undefined' },
      ],
      'TempWarningsLog': [
        { 'value': '1', 'name': 'Analog 1 min warn temp  log' },
        { 'value': '2', 'name': 'Analog 2 min warn temp  log' },
        { 'value': '3', 'name': 'Analog 3 min warn temp  log' },
        { 'value': '4', 'name': 'Analog 4 min warn temp  log' },
        { 'value': '5', 'name': 'Analog 5 min warn temp  log' },
        { 'value': '6', 'name': 'Analog 6 min warn temp  log' },
        { 'value': '7', 'name': 'Undefined' },
        { 'value': '8', 'name': 'Undefined' },
        { 'value': '9', 'name': 'Analog 1 max warn temp  log' },
        { 'value': '10', 'name': 'Analog 2 max warn temp  log' },
        { 'value': '11', 'name': 'Analog 3 max warn temp  log' },
        { 'value': '12', 'name': 'Analog 4 max warn temp  log' },
        { 'value': '13', 'name': 'Analog 5 max warn temp  log' },
        { 'value': '14', 'name': 'Analog 6 max warn temp  log' },
        { 'value': '15', 'name': 'Undefined' },
        { 'value': '16', 'name': 'Undefined' },
        { 'value': '17', 'name': 'Digital warn temp  log 1' },
        { 'value': '18', 'name': 'Digital warn temp  log 2' },
        { 'value': '19', 'name': 'Digital warn temp  log 3' },
        { 'value': '20', 'name': 'Digital warn temp  log 4' },
        { 'value': '21', 'name': 'Digital warn temp  log 5' },
        { 'value': '22', 'name': 'Digital warn temp  log 6' },
        { 'value': '23', 'name': 'Digital warn temp  log 7' },
        { 'value': '24', 'name': 'Digital warn temp  log 8' },
        { 'value': '26', 'name': 'Digital warn temp  log10' },
        { 'value': '27', 'name': 'Digital warn temp log 11' },
        { 'value': '28', 'name': 'Digital warn temp log 12' },
        { 'value': '29', 'name': 'Undefined' },
        { 'value': '30', 'name': 'Undefined' },
        { 'value': '31', 'name': 'PT100 min warn temp log' },
        { 'value': '32', 'name': 'PT100 max warn temp log' }
      ]
    }
    if (alarmType == Constants.values.Alarms) {
      return alarmsListMap.Alarms;
    } else if (alarmType == Constants.values.HardwareAlarms) {
      return alarmsListMap.HardwareAlarms;
    } else if (alarmType == Constants.values.Warnings) {
      return alarmsListMap.Warnings;
    } else if (alarmType == Constants.values.TempWarnings) {
      return alarmsListMap.TempWarnings;
    } else if (alarmType == Constants.values.AlarmsLog) {
      return alarmsListMap.AlarmsLog;
    } else if (alarmType == Constants.values.HardwareAlarmsLog) {
      return alarmsListMap.HardwareAlarmsLog;
    } else if (alarmType == Constants.values.WarningsLog) {
      return alarmsListMap.WarningsLog;
    } else if (alarmType == Constants.values.TempWarningsLog) {
      return alarmsListMap.TempWarningsLog;
    }

  }

  licensePageItems = {

    "items": [{
      "name": "Apache license 2.0",
      "children": [{
        "name": "Android SDK Support Libraries",
        "version": "Unspecified",
        "link": "https://developer.android.com/tools/support-library/index.html"
      },
      {
        "name": "android-debug",
        "version": "Unspecified",
        "link": "https://github.com/vladotesanovic/a2cardboard"
      },
      {
        "name": "cordova-android",
        "version": "5.0.0",
        "link": "http://github.com/apache/cordova-android/"
      },
      {
        "name": "cordova-common",
        "version": "1.5.1",
        "link": "https://www.npmjs.org/package/cordova-common"
      },
      {
        "name": "cordova-email-plugin",
        "version": "Unspecified",
        "link": "https://github.com/hypery2k/cordova-emailplugin"
      },
      {
        "name": "cordova-lib",
        "version": "Unspecified",
        "link": "https://github.com/apache/cordova-lib"
      },
      {
        "name": "cordova-plugin-ble-central",
        "version": "1.1.4",
        "link": "https://www.npmjs.org/package/cordova-plugin-ble-central"
      },
      {
        "name": "cordova-plugin-compat",
        "version": "1.0.0",
        "link": "https://www.npmjs.org/package/cordova-plugin-compat"
      },
      {
        "name": "cordova-plugin-console",
        "version": "1.0.5",
        "link": "https://www.npmjs.org/package/cordova-plugin-console"
      },
      {
        "name": "cordova-plugin-device",
        "version": "1.1.4",
        "link": "http://github.com/apache/cordova-plugin-device/"
      },
      {
        "name": "cordova-plugin-file",
        "version": "Unspecified",
        "link": "https://www.npmjs.org/package/cordova-plugin-file"
      },
      {
        "name": "cordova-plugin-filechooser",
        "version": "Unspecified",
        "link": "https://github.com/don/cordova-filechooser"
      },
      {
        "name": "cordova-plugin-filepath",
        "version": "Unspecified",
        "link": "https://www.npmjs.org/package/cordova-plugin-filepath"
      },
      {
        "name": "cordova-plugin-splashscreen",
        "version": "4.0.3",
        "link": "http://github.com/apache/cordova-plugin-splashscreen/"
      },
      {
        "name": "cordova-plugin-statusbar",
        "version": "Unspecified",
        "link": "https://www.npmjs.org/package/cordova-plugin-statusbar"
      },
      {
        "name": "cordova-plugin-whitelist",
        "version": "Unspecified",
        "link": "https://www.npmjs.org/package/cordova-plugin-whitelist"
      },
      {
        "name": "cordova-registry-mapper",
        "version": "1.1.15",
        "link": "https://www.npmjs.org/package/cordova-registry-mapper"
      },
      {
        "name": "Gradle Wrapper",
        "version": "Unspecified",
        "link": "https://docs.gradle.org/current/userguide/gradle_wrapper.html"
      },
      {
        "name": "ionic-plugin-keyboard",
        "version": "2.2.1",
        "link": "https://www.npmjs.org/package/ionic-plugin-keyboard"
      },
      {
        "name": "localforage",
        "version": "1.4.3",
        "link": "https://github.com/localForage/localForage/tree/1.4.3"
      },
      {
        "name": "node-elementtree",
        "version": "0.1.6",
        "link": "https://www.npmjs.org/package/elementtree"
      },
      {
        "name": "sw-toolbox",
        "version": "3.4.0",
        "link": "https://www.npmjs.org/package/sw-toolbox"
      },
      {
        "name": "xenious-cordova-plugin-whitelist",
        "version": "1.3.1",
        "link": "https://www.npmjs.org/package/xenious-cordova-plugin-whitelist"
      }
      ]
    },
    {
      "name": "BSD (three clause license)",
      "childItems": [{
        "name": "shelljs",
        "version": "0.5.3",
        "link": "https://www.npmjs.org/package/shelljs"
      }]
    },
    {
      "name": "BSD (two clause license)",
      "childItems": [{
        "name": "osenv",
        "version": "0.1.4",
        "link": "http://github.com/isaacs/osenv/"
      }]
    },
    {
      "name": "ISC license",
      "childItems": [{
        "name": "inflight",
        "version": "1.0.6",
        "link": "https://www.npmjs.org/package/inflight"
      },
      {
        "name": "inherits",
        "version": "2.0.3",
        "link": "http://github.com/isaacs/inherits/"
      },
      {
        "name": "minimatch",
        "version": "3.0.3",
        "link": "http://github.com/isaacs/minimatch/"
      },
      {
        "name": "molpay-mobile-xdk-cordova",
        "version": "1.4.0",
        "link": "https://www.npmjs.org/package/molpay-mobile-xdk-cordova"
      },
      {
        "name": "node-glob",
        "version": "7.1.1",
        "link": "http://github.com/isaacs/node-glob/"
      },
      {
        "name": "node-semver",
        "version": "5.3.0",
        "link": "http://github.com/isaacs/node-semver/"
      },
      {
        "name": "nopt",
        "version": "3.0.6",
        "link": "https://www.npmjs.org/package/nopt"
      },
      {
        "name": "wrappy",
        "version": "1.0.2",
        "link": "https://www.npmjs.org/package/wrappy"
      }

      ]
    },
    {
      "name": "MIT license",
      "childItems": [{
        "name": "abbrev-js",
        "version": "1.0.9",
        "link": "https://www.npmjs.org/package/abbrev"
      },
      {
        "name": "angular io",
        "version": "4.0.0",
        "link": "https://angular.io"
      },
      {
        "name": "ansi.js",
        "version": "0.3.1",
        "link": "https://www.npmjs.org/package/ansi"
      },
      {
        "name": "balanced-match",
        "version": "0.4.2",
        "link": "https://www.npmjs.org/package/balanced-match"
      },
      {
        "name": "base64-arraybuffer",
        "version": "Unspecified",
        "link": "http://github.com/niklasvh/base64-arraybuffer/"
      },
      {
        "name": "beatgammit's base64-js",
        "version": "0.0.8",
        "link": "https://www.npmjs.org/package/base64-js"
      },
      {
        "name": "brace-expansion",
        "version": "1.1.6",
        "link": "http://github.com/juliangruber/brace-expansion/"
      },
      {
        "name": "cordova-plugin-file-opener2",
        "version": "Unspecified",
        "link": "https://www.npmjs.org/package/cordova-plugin-file-opener2"
      },
      {
        "name": "cordova-plugin-filepicker",
        "version": "Unspecified",
        "link": "https://www.npmjs.com/package/cordova-plugin-filepicker"
      },
      {
        "name": "ionicons",
        "version": "3.0.0",
        "link": "https://www.npmjs.org/package/ionicons"
      },
      {
        "name": "lodash",
        "version": "3.10.1",
        "link": "https://www.npmjs.org/package/lodash-es"
      },
      {
        "name": "ng2-img-map",
        "version": "0.1.2",
        "link": "https://github.com/jasonroyle/ng2-img-map/"
      },
      {
        "name": "node xmldom",
        "version": "0.1.27",
        "link": "https://www.npmjs.org/package/xmldom"
      },
      {
        "name": "node-bplist-parser",
        "version": "0.1.1",
        "link": "https://www.npmjs.org/package/bplist-parser"
      },
      {
        "name": "node-concat-map",
        "version": "0.0.1",
        "link": "http://github.com/substack/node-concat-map/"
      },
      {
        "name": "node-plist",
        "version": "1.2.0",
        "link": "https://www.npmjs.org/package/plist"
      },
      {
        "name": "node-properties-parser",
        "version": "0.2.3",
        "link": "https://www.npmjs.org/package/properties-parser"
      },
      {
        "name": "os-homedir",
        "version": "1.0.2",
        "link": "https://www.npmjs.org/package/os-homedir"
      },
      {
        "name": "os-tmpdir",
        "version": "1.0.2",
        "link": "https://www.npmjs.org/package/os-tmpdir"
      },
      {
        "name": "path-is-absolute",
        "version": "1.0.1",
        "link": "https://www.npmjs.org/package/path-is-absolute"
      },
      {
        "name": "Q in javascript",
        "version": "1.5.0",
        "link": "http://github.com/kriskowal/q/"
      },
      {
        "name": "sax-js",
        "version": "0.3.5",
        "link": "http://github.com/isaacs/sax-js/"
      },
      {
        "name": "underscore",
        "version": "1.8.3",
        "link": "http://github.com/documentcloud/underscore/"
      },
      {
        "name": "unorm",
        "version": "1.4.1",
        "link": "https://www.npmjs.org/package/unorm"
      },
      {
        "name": "util-deprecate",
        "version": "1.0.2",
        "link": "http://github.com/TooTallNate/util-deprecate/"
      },
      {
        "name": "xmlbuilder-js",
        "version": "4.0.0",
        "link": "https://www.npmjs.org/package/xmlbuilder"
      }

      ]
    },
    {
      "name": "The unlicense",
      "childItems": [{
        "name": "BigInteger.js",
        "version": "1.6.22",
        "link": "http://github.com/peterolson/BigInteger.js/"
      }]
    }
    ]
  }
}

