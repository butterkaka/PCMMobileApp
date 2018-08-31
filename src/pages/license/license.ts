import { PCMChannelDataService } from './../../providers/pcm-channel-data-service';
import { Component } from '@angular/core';
import {  NavController, NavParams } from 'ionic-angular';
import { Http } from '@angular/http';

/**
 * Generated class for the LicensePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-license',
  templateUrl: 'license.html',
})
export class LicensePage {
  headerLabel = "License Page";

  information: any[];
  //information = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public pcmChannelDataService: PCMChannelDataService, private http: Http) {
    // let localData = http.get('assets/licensePageInfo.json').map(res => res.json().items);
    // localData.subscribe(data => {
    //   this.information = data;
    // });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LicensePage');

    //test 20180711
    this.information = this.pcmChannelDataService.licensePageItems.items;

  }

  toggleSection(i) {
    this.information[i].open = !this.information[i].open;
  }

  toggleItem(i, j) {
    this.information[i].children[j].open = !this.information[i].children[j].open;
  }

  /** 
    *This is to navigate to Previous Page(
*/
  back() {
    this.navCtrl.pop();
  }

}
