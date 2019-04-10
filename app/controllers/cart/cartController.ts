import { Router, Request, Response, NextFunction } from 'express';
import { helperUtils } from '@/tools/utils/helperUtils';
import { CartData, CartItem } from '@/models/Account';
import { cartService } from '@/services/cartService';
import { ApiResponseData } from '../apiController';
import { ProductModel } from '@/models/Product';

export const cartController = Router();

cartController.get('/data', getCartData);
cartController.post('/updateCartItem', updateCartItem);
cartController.post('/eraseCartItem', eraseCartItem);

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
