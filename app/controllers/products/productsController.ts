import { Router, Request, Response, NextFunction } from 'express';
import authMiddlewares from '@/middlewares/authMiddlewares';
import { ApiResponseData } from '../apiController';
import { ProductModel, Product } from '@/models/Product';
import { selectedProductController } from './selectedProduct/selectedProductController';
import { Typegoose } from 'typegoose';
import { Types } from 'mongoose';

export const productsController = Router();

productsController.get('/all', getAllProducts);
productsController.post('/multiple', getProductsByIds);
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

async function getProductsByIds(req: Request, res: Response, next: NextFunction) {
    let { productIds } = req.body;

    let products = await ProductModel.find({
        _id: {
            $in: (productIds as string[]).map((productId) => Types.ObjectId(productId)),
        },
    }).exec();

    res.json({
        success: true,
        message: 'Products successfully retrieved',
        products,
    } as ApiResponseData);
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

    let resData = await ProductModel.addNewProduct(productData as Product, imageFileBuffer);

    res.json(resData);
}
