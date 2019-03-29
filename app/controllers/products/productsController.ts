import { Router, Request, Response, NextFunction } from 'express';
import authMiddlewares from '@/middlewares/authMiddlewares';
import { ApiResponseData } from '../apiController';
import { ProductModel, Product } from '@/models/Product';
import { selectedProductController } from './selectedProduct/selectedProductController';

export const productsController = Router();

productsController.get('/all', getAllProducts);
productsController.use('/select/:productId', selectedProductController);

productsController.use(authMiddlewares.allowOnlyWithToken);
productsController.put('/new', authMiddlewares.allowOnlyAdmin, addNewProduct);

async function getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
        let products = await ProductModel.find()
            .sort({ _id: 1 })
            .exec();

        res.json({
            success: true,
            message: 'Products fetched',
            products,
        } as ApiResponseData);
    } catch (err) {
        res.json({
            success: false,
            message: 'Error fetching products',
            errorReport: err,
        } as ApiResponseData);
    }
}

async function addNewProduct(req: Request, res: Response, next: NextFunction) {
    console.log(req.body);

    let productData = req.body;

    let files = (req as any).files;
    console.log(files);

    let imageFileBuffer = undefined;
    if (files && files.length > 0) {
        imageFileBuffer = files[0].buffer;
    }

    let resData = await ProductModel.addNewProduct(
        productData as Product,
        imageFileBuffer
    );

    res.json(resData);
}

