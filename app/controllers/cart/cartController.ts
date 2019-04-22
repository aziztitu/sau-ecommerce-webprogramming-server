import { Router, Request, Response, NextFunction } from 'express';
import { helperUtils } from '@/tools/utils/helperUtils';
import { CartData, CartItem, AccountModel } from '@/models/Account';
import { cartService } from '@/services/cartService';
import { ApiResponseData } from '../apiController';
import { ProductModel } from '@/models/Product';
import authMiddlewares from '@/middlewares/authMiddlewares';
import { Order, OrderItem } from '../../models/Order';
import serverConfig from '@/tools/serverConfig';

export const cartController = Router();

cartController.get('/data', getCartData);
cartController.post('/updateCartItem', updateCartItem);
cartController.post('/eraseCartItem', eraseCartItem);
cartController.put('/placeOrder', authMiddlewares.allowOnlyWithToken, placeOrder);

function getCartData(req: Request, res: Response, next: NextFunction) {
    res.json({
        success: true,
        message: 'Successfully retrieved cart data',
        cartData: req.routeData.cartData,
    } as ApiResponseData);
}

async function updateCartItem(req: Request, res: Response, next: NextFunction) {
    let { productId, count } = req.body;

    let product = await ProductModel.findById(productId).exec();
    if (!product) {
        res.json({
            success: false,
            message: 'Invalid Product ID',
        } as ApiResponseData);
        return;
    }

    let { cartData } = req.routeData;

    let cartItemIndex = cartData.cartItems.findIndex((cartItem) => {
        return cartItem.product == productId;
    });

    if (cartItemIndex >= 0) {
        let cartItem = cartData.cartItems[cartItemIndex];
        cartItem.count += count;
        if (cartItem.count <= 0) {
            cartData.cartItems.splice(cartItemIndex, 1);
        }
    } else {
        if (count > 0) {
            let cartItem = new CartItem();
            cartItem.product = productId;
            cartItem.count = count;

            cartData.cartItems.push(cartItem);
        }
    }

    await cartService.updateCartData(req, cartData);

    res.json({
        success: true,
        message: 'Cart updated successfully',
    } as ApiResponseData);
}

async function eraseCartItem(req: Request, res: Response, next: NextFunction) {
    let { productId } = req.body;

    let product = await ProductModel.findById(productId).exec();
    if (!product) {
        res.json({
            success: false,
            message: 'Invalid Product ID',
        } as ApiResponseData);
        return;
    }

    let { cartData } = req.routeData;

    let cartItemIndex = cartData.cartItems.findIndex((cartItem) => {
        return cartItem.product == productId;
    });

    if (cartItemIndex >= 0) {
        cartData.cartItems.splice(cartItemIndex, 1);
        await cartService.updateCartData(req, cartData);
    }

    res.json({
        success: true,
        message: 'Item removed successfully',
    } as ApiResponseData);
}

async function placeOrder(req: Request, res: Response, next: NextFunction) {
    type OrderData = {
        orderType: 0 | 1;

        pickupDate: string;
        pickupTime: string;

        deliveryStreet: string;
        deliveryCity: string;
        deliveryState: string;
        deliveryZip: string;

        billingCardNum: string;
        billingCVV: string;
        billingStreet: string;
        billingCity: string;
        billingState: string;
        billingZip: string;
    };

    let orderData: OrderData = req.body;

    let cartData = await cartService.getCartData(req);
    if (cartData.cartItems.length == 0) {
        res.json({
            success: false,
            message: 'Cart is empty',
        } as ApiResponseData);
        return;
    }

    let order = new Order();
    order.orderItems = [];
    cartData.cartItems.forEach(async (cartItem) => {
        let orderItem = new OrderItem();
        orderItem.product = cartItem.product;
        orderItem.qty = cartItem.count;

        let product = await ProductModel.findById(orderItem.product, 'price').exec();
        if (product) {
            orderItem.price = product.price;
            order.orderItems.push(orderItem);
        }
    });

    order.taxRate = serverConfig.dashboard.checkout.taxRate;
    order.deliveryCharge = serverConfig.dashboard.checkout.deliveryCharge;

    for (const key in orderData) {
        if (orderData.hasOwnProperty(key)) {
            let val = (orderData as any)[key];
            (order as any)[key] = val;
        }
    }

    let account = await AccountModel.findById(req.apiTokenPayload!.accountData.id).exec();
    if (account) {
        account.orders.push(order);
        await account.save();
        await cartService.updateCartData(req, new CartData());
    }

    res.json({
        success: true,
        message: 'Order placed successfully',
    } as ApiResponseData);
}
