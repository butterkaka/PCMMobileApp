import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
//import { ImgMapComponent } from 'ng2-img-map';
import { PCMChannelDataService } from '../../providers/pcm-channel-data-service';
import { Constants } from '../../shared/app.constant';

/**
 * Generated class for the IOSetupPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-io-setup-page',  
  templateUrl: 'io-setup-page.html',
})
export class IOSetupPage {
  // @ViewChild('imgMap')
  // imgMap: ImgMapComponent;
  deviceObject;
  deviceName;
  ioSetupHeader;
  // markers: number[][] = [[12, 10],[12, 20],[12, 29],[12, 47],[12, 58],[12, 68],[12, 79],[12, 89], 
  //                                 [88, 20],[88, 29],[88, 47],[88, 58],[88, 68],[88, 79],[88, 89]];

  // markers: number[][] = [[24, 11],[24, 20],[24, 29],[24, 47],[24, 58],[24, 68],[24, 79],[24, 89], 
  // [73, 20],[73, 29],[73, 47],[73, 58],[73, 68],[73, 79],[73, 89]];
  markers: number[][] = [[26, 11],[26, 20],[26, 29],[26, 47],[26, 58],[26, 68],[26, 79],[26, 89], 
                                  [73, 20],[73, 29],[73, 47],[73, 58],[73, 68],[73, 79],[73, 89]];

   /**
   * IOSetupPage Constructor.
   * @constructor
   * @param navCtrl NavController for navigation
   * @param navParams NavParams paremters from previous component
   * @param pcmchanneldataservice PCMChannelDataService for UI 
   */
  constructor(public navCtrl: NavController, public navParams: NavParams,public pcmchanneldataservice: PCMChannelDataService) {
    this.deviceName =  pcmchanneldataservice.deviceObjectGlobal.deviceName;
    this.ioSetupHeader = navParams.get(Constants.values.ioSetupHeader);
  }

  /** 
  * @event ionViewDidLoad PageLoad Event  
  */
  ionViewDidLoad() {
    console.log('ionViewDidLoad IOSetupPage');       
  }

  ionViewDidEnter(){
    //  this.markers = [[24, 11],[24, 20],[24, 29],[24, 47],[24, 58],[24, 68],[24, 79],[24, 89], 
    //                               [73, 20],[73, 29],[73, 47],[73, 58],[73, 68],[73, 79],[73, 89]];
    this.markers = [[26, 9],[26, 18],[26, 28],[26, 47],[26, 58],[26, 70],[26, 80],[26, 91], 
    [75, 18],[75, 28],[75, 47],[75, 58],[75, 70],[75, 80],[75, 91]];
  }

  onChange(marker: number[]) {
    let count = 0;
    // console.log('Marker', marker);
    this.markers.forEach(element => {
      count++;
      if (marker == element) {
        //alert(count);
        // console.log(count);
        if(count==1){
          this.connectorInput(Constants.values.USB);
        }else if(count==2){
          this.connectorInput(Constants.values.LO);
        }else if(count==3){
          this.connectorInput(Constants.values.LI);
        }else if(count==4){
          this.connectorInput(Constants.values.O1);
        }else if(count==5){
          this.connectorInput(Constants.values.AI);
        }else if(count==6){
          this.connectorInput(Constants.values.X1);
        }else if(count==7){
          this.connectorInput(Constants.values.X3);
        }else if(count==8){
          this.connectorInput(Constants.values.DI);
        }else if(count==9){
          this.connectorInput(Constants.values.PO);
        }else if(count==10){
          this.connectorInput(Constants.values.PI);
        }else if(count==11){
          this.connectorInput(Constants.values.O2);
        }else if(count==12){
          this.connectorInput(Constants.values.PT);
        }else if(count==13){
          this.connectorInput(Constants.values.X2);
        }else if(count==14){
          this.connectorInput(Constants.values.X4);
          // console.log("13 clicked");
        }else if(count==15){
          this.connectorInput(Constants.values.DO);
        }
      }
    });
  }

  onClick(marker){
     console.log('Marker', marker);
  }

  


  /** 
  *This is to navigate back
  */
  back() {
    this.navCtrl.pop();
  }

 connectorInput(input:string){
   this.navCtrl.push("ConnectorSetupPage", {connector: input});
 }
}
