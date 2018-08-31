
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { PCMChannelDataService } from '../../providers/pcm-channel-data-service';
import { Constants } from '../../shared/app.constant';

/**
 * Generated class for the ConnectorSetupPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-connector-setup-page',
  templateUrl: 'connector-setup-page.html',
})
export class ConnectorSetupPage {

  deviceObject;
  deviceName;
  connector;  
  connectorSetupDetails;
  imagePath:string;
  headerLabel:string = "Connector setup";

  /**
 * ConnectorSetupPage Constructor.
 * @constructor
 * @param navCtrl NavController for navigation
 * @param navParams NavParams paremters from previous component
 * @param pcmchanneldataservice PCMChannelDataService for UI 
 */
  constructor(public navCtrl: NavController, public navParams: NavParams,public pcmchanneldataservice: PCMChannelDataService) {    
    this.deviceName =  pcmchanneldataservice.deviceObjectGlobal.deviceName;
    this.connector = navParams.get(Constants.values.connector);
    this.GetConnectorButtonDetails();
    this.setImagePath();
  }

  setImagePath(){
    if(this.connector == Constants.values.USB){
      this.imagePath = "assets/images/usb.png"//miniusb.png 
      //this.imagePath = "assets/images/5_socket_contact_TOP.png"
    }else if(this.connector == Constants.values.PI){
      this.imagePath = "assets/images/4_power_pin_dd00069567.png"
    }
    else if(this.connector == Constants.values.PO){
      this.imagePath = "assets/images/4_power_socket_DD00069566.png"
    }
    else if(this.connector == Constants.values.LI){
      this.imagePath = "assets/images/5_pin_contact_DD00069565.png"
    }
    else if(this.connector == Constants.values.LO || this.connector == Constants.values.O1 || this.connector == Constants.values.AI || this.connector == Constants.values.X1
    || this.connector == Constants.values.X3 || this.connector == Constants.values.DI){
      //this.imagePath = "assets/images/5_socket_contact_TOP.png"
      this.imagePath = "assets/images/5_socket_contact_DD00069564.png"
    }else if(this.connector == Constants.values.O2 || this.connector == Constants.values.PT || this.connector == Constants.values.X2 || this.connector == Constants.values.X4
    || this.connector == Constants.values.DO){
      this.imagePath = "assets/images/5_socket_contact_90_deg_DD00069562.png"
    }
    else{
      this.imagePath = "assets/images/5_pin_contact_DD00069565.png"
    }
  }

  /** 
  * @event ionViewDidLoad PageLoad Event  
  */
  ionViewDidLoad() {
    console.log('ionViewDidLoad ConnectorSetupPage');
    console.log(this.connector);
  }

  /** 
   * This is to navigate to Previous Page
   */
  back() {
    this.navCtrl.pop();
  }
  
  /** 
   * This is get list of values for the selected connector
   */
  GetConnectorButtonDetails(){
    this.connectorSetupDetails = PCMChannelDataService.getconnectorSetupDetails(this.connector);       
  }
  
  /** 
   *  This is to check if the button is enabled/disabled - returns true if disabled
   */
  checkIsDisabled(connectorVal){
      //if(!this.pcmchanneldataservice.isIOOverViewMock){    
      let isDisabled:boolean = false;

      if(this.connector == Constants.values.USB || this.connector==Constants.values.O1 || this.connector == Constants.values.O2 || 
        this.connector == Constants.values.PO || this.connector == Constants.values.PI || this.connector == Constants.values.LO || this.connector == Constants.values.LI){
        isDisabled = true;
      }else if(this.connector == Constants.values.AI || this.connector == Constants.values.X1 || 
              this.connector == Constants.values.X2 || this.connector == Constants.values.X3 || this.connector == Constants.values.X4){
        if((connectorVal.pinNum==1) || (connectorVal.pinNum==3)){
          isDisabled = true;
        }
      }else if(this.connector == Constants.values.DI){
        if(connectorVal.pinNum==1){
          isDisabled = true;
        }        
      }else if(this.connector == Constants.values.DO){
        if(connectorVal.pinNum==3){
          isDisabled = true;
        }        
      }
    return isDisabled;
      // }else{
      //   return true;
      // }
  }

  /** 
     * button click event 
     * @param {connectorVal} string - the selected connector pin value 
     */
  connectorButtonClick(connectorVal){
    //alert(connectorVal.pinValue);
    // if(this.connector== Constants.values.PT) 
    //   {
    //     connectorVal.pinValue="PT100"
    //   }
    this.navigateToConnectorParameterPage(connectorVal);
  }


  /** 
    * This is to navigate to the connector paramter setup page
    * @param {connectorVal} string - the selected connector pin value 
    */
  navigateToConnectorParameterPage(connectorVal){
    console.log("this connector: " + connectorVal.pinValue);
    this.navCtrl.push("ConnectorParameterSetupPage",{connectorValObj: connectorVal,connector:this.connector});
  }
  

}
