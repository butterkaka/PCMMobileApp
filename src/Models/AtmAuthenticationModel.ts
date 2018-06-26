/**
 * AtmQuestionTypeModel Class.
 * 
 * on Ionic pages and navigation.
 * created by jkm5kor 05-06-2017
 */
export class AtmAuthenticationTypeModel {
    questionType: number;
    status: number;
    password: string[];

    /**
    * ScanDevicePage Constructor.
    * @constructor
    * @param characteristicBArray Uint8Array
    */
    constructor(private characteristicBArray: Uint8Array) {

        this.questionType = characteristicBArray[0];
        this.status = AtmAuthenticationTypeModel.toSignedInt8(characteristicBArray[1]);
        for (let i = 2; i < 20; i++) {
            try {
                this.password[i - 2] = AtmAuthenticationTypeModel.fromStringtoAscii (characteristicBArray[i]);
            } catch (error) {
                console.log("AtmAuthenticationTypeModel error: ", error)
            }
        }
    }

    /**     
    * This is a static function used convert Unsigned 8bit value to Signed 8bit value 
    * @param val - unsigned 8 bit
    */
    static toSignedInt8(val) {
        var uint8 = val;
        if (uint8 >= Math.pow(2, 7)) {
            return uint8 - Math.pow(2, 8)
        } else {
            return uint8;
        }
    }

    /**     
    * This is a static function used convert asci value into a string
    * @param val - ascii value
    */
    static fromAsciiToString(val:any) {
        return String.fromCharCode(val);
        
    }

    /**     
    * This is a static function used convert string into an asci value
    * @param val - string
    */
    static fromStringtoAscii(val:any) {
        return val.charCodeAt();
    }
}