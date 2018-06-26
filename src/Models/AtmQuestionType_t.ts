/**
 * AtmQuestionTypeModel Class.
 * 
 * on Ionic pages and navigation.
 * created by jkm5kor 05-06-2017
 */
export class AtmQuestionTypeModel {
    questionType: number;
    status: number;
    channel: number;
    subChannel: number;
    value1: number;
    value2: number;
    value3: number;
    value4: number;
    value5: number;
    value6: number;
    value7: number;
    value8: number;
    value9: number;
    value10: number;
    value11: number;
    value12: number;
    value13: number;
    value14: number;
    value15: number;
    value16: number;
    value16Bit1: number;
    value16Bit2: number;
    value16Bit3: number;
    value16Bit4: number;
    value16Bit5: number;
    value16Bit6: number;
    value16Bit7: number;
    value16Bit8: number;
    value32Bit1: number;
    value32Bit2: number;
    value32Bit3: number;
    value32Bit4: number;
    /**
    * ScanDevicePage Constructor.
    * @constructor
    * @param characteristicBArray Uint8Array
    */
    constructor(private characteristicBArray: Uint8Array) {

        this.questionType = characteristicBArray[0];
        this.status = AtmQuestionTypeModel.toSignedInt8(characteristicBArray[1]);
        this.channel = characteristicBArray[2];
        this.subChannel = characteristicBArray[3];

        this.value1 = characteristicBArray[4];
        this.value2 = characteristicBArray[5];
        this.value3 = characteristicBArray[6];
        this.value4 = characteristicBArray[7];
        this.value5 = characteristicBArray[8];
        this.value6 = characteristicBArray[9];
        this.value7 = characteristicBArray[10];
        this.value8 = characteristicBArray[11];
        this.value9 = characteristicBArray[12];
        this.value10 = characteristicBArray[13];
        this.value11 = characteristicBArray[14];
        this.value12 = characteristicBArray[15];
        this.value13 = characteristicBArray[16];
        this.value14 = characteristicBArray[17];
        this.value15 = characteristicBArray[18];
        this.value16 = characteristicBArray[19];

        this.value16Bit1 = AtmQuestionTypeModel.toSignedInt16(AtmQuestionTypeModel.getValue16Bit(this.value1, this.value2));
        this.value16Bit2 = AtmQuestionTypeModel.toSignedInt16(AtmQuestionTypeModel.getValue16Bit(this.value3, this.value4));
        this.value16Bit3 = AtmQuestionTypeModel.toSignedInt16(AtmQuestionTypeModel.getValue16Bit(this.value5, this.value6));
        this.value16Bit4 = AtmQuestionTypeModel.toSignedInt16(AtmQuestionTypeModel.getValue16Bit(this.value7, this.value8));
        this.value16Bit5 = AtmQuestionTypeModel.toSignedInt16(AtmQuestionTypeModel.getValue16Bit(this.value9, this.value10));
        this.value16Bit6 = AtmQuestionTypeModel.toSignedInt16(AtmQuestionTypeModel.getValue16Bit(this.value11, this.value12));
        this.value16Bit7 = AtmQuestionTypeModel.toSignedInt16(AtmQuestionTypeModel.getValue16Bit(this.value13, this.value14));
        this.value16Bit8 = AtmQuestionTypeModel.toSignedInt16(AtmQuestionTypeModel.getValue16Bit(this.value15, this.value16));
        
        this.value32Bit1 = AtmQuestionTypeModel.toSignedInt32(AtmQuestionTypeModel.getValue32Bit(this.value16Bit1, this.value16Bit2));
        this.value32Bit2 = AtmQuestionTypeModel.toSignedInt32(AtmQuestionTypeModel.getValue32Bit(this.value16Bit3, this.value16Bit4));
        this.value32Bit3 = AtmQuestionTypeModel.toSignedInt32(AtmQuestionTypeModel.getValue32Bit(this.value16Bit5, this.value16Bit6));
        this.value32Bit4 = AtmQuestionTypeModel.toSignedInt32(AtmQuestionTypeModel.getValue32Bit(this.value16Bit7, this.value16Bit8));
    }


    /**
    * createBArray To create the Byte array 8bit
    * @param atmQuestion_t AtmQuestionTypeModel
    */
    createBArray(atmQuestion_t: AtmQuestionTypeModel) {

        this.convert16ToTwo8BitValues(atmQuestion_t.value32Bit1);
        var array = new Uint8Array([atmQuestion_t.questionType,
        AtmQuestionTypeModel.toUnsignedInt8(atmQuestion_t.status),
        atmQuestion_t.channel,
        atmQuestion_t.subChannel,
        atmQuestion_t.value1,
        atmQuestion_t.value2]);
        return array.buffer;
    }


    /**     
    * This is a static function used convert Unsigned 8bit value to Signed 8bit value 
    * @param val 
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
   * This is a static function used convert Unsigned 8bit value to Signed 16 bit value 
   * @param val 
   */
    static toSignedInt16(val) {
        var uint16 = val;
        if (uint16 >= Math.pow(2, 15)) {
            return uint16 - Math.pow(2, 16)
        } else {
            return uint16;
        }
    }

    /**
   * toUnsignedInt8 convert to Unsigned integer 8 bit
   * @param val
   */
    static toUnsignedInt8(val) {
        var int8 = val;
        if (int8 < 0) {
            return int8 + Math.pow(2, 8);
        } else {
            return int8;
        }
    }

    /**
   * getValue16Bit To convert two 8bit values to 16 bit value
   * @param val to convert to Unsigned integet 8 bit
   */
    static getValue16Bit(val1, val2) {
        // val1 is the lowest bit and val2 is the higher bit
        var value16Bit = (((val2 & 0xff) << 8) | (val1 & 0xff));
        return value16Bit;
    }

    /**     
   * This is a static function used convert Unsigned 8bit value to Signed 16 bit value 
   * @param val 
   */
    static toSignedInt32(val) {
        var uint32 = val;
        if (uint32 >= Math.pow(2, 31)) {
            return uint32 - Math.pow(2, 32)
        } else {
            return uint32;
        }
    }

    /**
   * getValue32Bit To convert two 16bit values to 32 bit value
   * @param val to convert to Unsigned integet 8 bit
   */
    static getValue32Bit(val1, val2) {
        // val1 is the lowest bit and val2 is the higher bit
        var value32Bit = (((val2 & 0xffff) << 16) | (val1 & 0xffff));
        return value32Bit;
    }


    /** 
     * This a function used convert 16 bit value to High and Low 8 bit values
     * @param val16
     */
    convert16ToTwo8BitValues(val16) {
        // hig bit left
        this.value2 = (val16 >> 8) & 0xff;

        // low bit right 
        this.value1 = val16 & 0xff;
    }


    /** 
     * This a function used convert 16 bit value to High and Low 8 bit values
     * @param val16
     */
    convert32ToFour8BitValues(val32) {
        this.value4 = (val32 & 0xff000000) >> 24;
        this.value3 = (val32 & 0x00ff0000) >> 16;
        this.value2 = (val32 & 0x0000ff00) >> 8;
        this.value1 = (val32 & 0x000000ff);
    }
}