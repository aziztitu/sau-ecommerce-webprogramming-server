import { Request, Response, NextFunction } from 'express';
import { cartService } from '@/services/cartService';

export const cartMiddlewares = {
    async initCartDataInRoute(req: Request, res: Response, next: NextFunction) {
        req.routeData.cartData = await cartService.getCartData(req);
        next();
    },
};
