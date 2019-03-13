import { Typegoose, prop, Ref, index } from 'typegoose';
import { Vendor } from './Vendor';

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
}

export const ProductModel = new Product().getModelForClass(Product);
