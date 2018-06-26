/**
 * DeviceModel Class.
 * 
 * on Ionic pages and navigation.
 * created by jkm5kor 05-08-2017
 */
 export class DeviceModel{
    deviceName:string;
    deviceId:string;
    serviceUUID:string
    rssi:string;
    characteristicId:string;

    
 /**
 * ScanDevicePage Constructor.
 * @constructor
 * @param deviceName_v
 * @param deviceId_
 * @param serviceUUIDstring_v
 * @param rssi_
 * @param characteristicId_
 */
    constructor(private deviceName_v:string,private deviceId_:string,private serviceUUIDstring_v:string,private rssi_:string,private characteristicId_:string) {

           this.deviceName = deviceName_v;           
           this.deviceId = deviceId_;         
           this.serviceUUID = serviceUUIDstring_v;
           this.rssi = rssi_;           
           this.characteristicId = characteristicId_;           
 }
}

