import { Router, Request, Response, NextFunction } from 'express';
import authMiddlewares from '@/middlewares/authMiddlewares';
import { ApiResponseData } from '../apiController';
import { ProductModel, Product } from '@/models/Product';

export const productsController = Router();

productsController.use(authMiddlewares.allowOnlyWithToken);

productsController.put('/new', authMiddlewares.allowOnlyAdmin, addNewProduct);

async function addNewProduct(req: Request, res: Response, next: NextFunction) {
    console.log(req.body);

    let { name, price, plu, vendorId } = req.body;
    console.log(name);
    console.log(price);
    console.log(plu);
    console.log(vendorId);

    let files = (req as any).files;
    console.log(files);

    let imageFileBuffer = undefined;
    if (files && files.length > 0) {
        imageFileBuffer = files[0].buffer;
    }

    let resData = await ProductModel.addNewProduct(
        {
            name,
            price,
            plu,
            vendorId,
        } as Product,
        imageFileBuffer
    );

    res.json(resData);
}
