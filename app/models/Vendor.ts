import { Typegoose, prop, staticMethod, ModelType } from 'typegoose';
import { ReturnResult } from '@/tools/utils/helperUtils';

export class Vendor extends Typegoose {
    @prop({ required: true })
    name!: string;

    @prop()
    email!: string;

    @prop()
    phone!: string;

    @prop()
    address!: string;

    @staticMethod
    static addNewVendor(this: ModelType<Vendor> & Vendor, vendorDoc: Vendor) {
        return new Promise<ReturnResult>((resolve, reject) => {
            let resData: ReturnResult;

            const newVendorModel = new VendorModel(vendorDoc);
            newVendorModel.save((err) => {
                if (err) {
                    resData = {
                        success: false,
                        message: `Error adding the vendor!`,
                        errorReport: err,
                    };
                } else {
                    resData = {
                        success: true,
                        message: 'Vendor added successfully',
                    };
                }

                resolve(resData);
            });
        });
    }
}

export const VendorModel = new Vendor().getModelForClass(Vendor);
