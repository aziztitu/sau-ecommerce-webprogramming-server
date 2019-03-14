import { Typegoose, prop, Ref, index, staticMethod, ModelType } from 'typegoose';
import { Vendor } from './Vendor';
import { ReturnResult } from '@/tools/utils/helperUtils';

export class Product extends Typegoose {
    @prop({ required: true })
    name!: string;

    @prop({ required: true })
    price!: number;

    @prop({ required: true })
    plu!: string;

    @prop()
    imageName!: string;

    @prop({ ref: Vendor, required: true, index: true })
    vendorId!: Ref<Vendor>;

    @staticMethod
    static addNewProduct(
        this: ModelType<Product> & Product,
        productDoc: Product,
        imageFileBuffer?: Buffer
    ) {
        return new Promise<ReturnResult>((resolve, reject) => {
            let resData: ReturnResult;

            const newProductModel = new ProductModel(productDoc);

            if (imageFileBuffer && !newProductModel.imageName) {
                newProductModel.imageName = newProductModel._id;
            }
            newProductModel.save((err) => {
                if (err) {
                    resData = {
                        success: false,
                        message: `Error adding the product!`,
                        errorReport: err,
                    };
                } else {
                    resData = {
                        success: true,
                        message: 'Product added successfully',
                    };

                    if (imageFileBuffer) {
                        // TODO: Write image buffer to file
                    }
                }

                resolve(resData);
            });
        });
    }
}

export const ProductModel = new Product().getModelForClass(Product);
