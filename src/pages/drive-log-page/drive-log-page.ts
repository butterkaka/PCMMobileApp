import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
// import { Chart } from "chart.js";

/**
 * Generated class for the DriveLogPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-drive-log-page',
  templateUrl: 'drive-log-page.html',
})
export class DriveLogPage {
  headerLabel = "Drive log";


  chartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };

  chartLabels: string[] = [' 1', ' 2', ' 3', ' 4'];
  chartType: string = 'bar';
  chartLegend: boolean = false;

  //  { data: [80, 55, 75, 95], label: ' A' }
  chartData1: any[] = [
    { data: [75, 80, 45, 100] }
  ];

  chartData2: any[] = [
    { data: [80, 55, 75, 175] }
  ];

  chartColors: any[] = [
    {
      backgroundColor: 'rgba(38,68,97, 0.7)',
      borderColor: "rgba(38,68,97,1)",
      borderWidth: 2
    }
  ]


  /**
  * DriveLogPage Constructor.
  * @constructor
  * @param navCtrl NavController for navigation
  * @param navParams NavParams paremters from previous component
  */
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  /** 
  * @event ionViewDidLoad PageLoad Event  
  */
  ionViewDidLoad() {
    console.log('ionViewDidLoad DriveLogPage');

  }

  /** 
  * This is used for going back to the previous page
  */
  back() {
    this.navCtrl.pop();
  }

}
