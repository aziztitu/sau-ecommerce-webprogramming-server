import { Router, Request, Response, NextFunction } from 'express';
import authMiddlewares from '@/middlewares/authMiddlewares';

export const productsController = Router();

productsController.use(authMiddlewares.allowOnlyWithToken);

productsController.put('/new', authMiddlewares.allowOnlyAdmin);

async function addNewProduct(req: Request, res: Response, next: NextFunction) {
    let { name, price, plu, vendorId } = req.body;
}
