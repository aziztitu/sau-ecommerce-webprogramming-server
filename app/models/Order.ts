import { Typegoose, prop, staticMethod, ModelType, Ref, arrayProp } from 'typegoose';
import { ReturnResult } from '@/tools/utils/helperUtils';
import { Product } from './Product';

export class OrderItem extends Typegoose {
    @prop({ ref: Product, required: true, index: true })
    product!: Ref<Product>;

    @prop({ required: true })
    price!: number;

    @prop({ required: true })
    qty!: number;
}

export class Order extends Typegoose {
    @arrayProp({ items: OrderItem, default: [] })
    orderItems!: OrderItem[];

    @prop({ default: () => Date.now() })
    orderDate!: Date;

    @prop({ required: true })
    taxRate!: number;
    @prop({ default: 0 })
    deliveryCharge!: number;

    @prop({ required: true })
    orderType!: 0 | 1;

    @prop({ default: '' })
    pickupDate!: string;
    @prop({ default: '' })
    pickupTime!: string;

    @prop({ default: '' })
    deliveryStreet!: string;
    @prop({ default: '' })
    deliveryCity!: string;
    @prop({ default: '' })
    deliveryState!: string;
    @prop({ default: '' })
    deliveryZip!: string;

    @prop({ required: true })
    billingCardNum!: string;
    @prop({ required: true })
    billingCVV!: string;
    @prop({ required: true })
    billingStreet!: string;
    @prop({ required: true })
    billingCity!: string;
    @prop({ required: true })
    billingState!: string;
    @prop({ required: true })
    billingZip!: string;
}

export const OrderModel = new Order().getModelForClass(Order);
