import fs from 'fs';
import { Typegoose, prop, Ref, index, staticMethod, ModelType } from 'typegoose';
import { Vendor } from './Vendor';
import { ReturnResult, helperUtils } from '@/tools/utils/helperUtils';
import serverConfig from '@/tools/serverConfig';

export class Product extends Typegoose {
    @prop({ required: true })
    name!: string;

    @prop({ required: true })
    price!: number;

    @prop({ required: true, index: true, unique: true })
    plu!: string;

    @prop()
    imageName!: string;

    @prop({ ref: Vendor, required: true, index: true })
    vendorId!: Ref<Vendor>;

    @prop({ default: '' })
    description!: string;

    @prop({ default: '' })
    detailHTML!: string;

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
                        let imageFilePath = helperUtils.getPathSafe(
                            `${serverConfig.paths.images}/products/${newProductModel._id}`,
                            false
                        );
                        console.log(imageFilePath);

                        let stream = fs.createWriteStream(imageFilePath);
                        stream.write(imageFileBuffer);
                        stream.end();
                    }
                }

                resolve(resData);
            });
        });
    }
}

export const ProductModel = new Product().getModelForClass(Product);
