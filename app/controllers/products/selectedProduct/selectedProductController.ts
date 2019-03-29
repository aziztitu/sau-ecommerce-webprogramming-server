import { Router, NextFunction, Request, Response } from 'express';
import authMiddlewares from '@/middlewares/authMiddlewares';
import { ProductModel } from '@/models/Product';
import { ApiResponseData } from '@/controllers/apiController';

export const selectedProductController = Router({ mergeParams: true });

selectedProductController.use(validateSelectedProduct);
selectedProductController.get('/details', getProductDetails);

selectedProductController.use(authMiddlewares.allowOnlyWithToken);
selectedProductController.post('/update', authMiddlewares.allowOnlyAdmin, updateProduct);
selectedProductController.post('/remove', authMiddlewares.allowOnlyAdmin, removeProduct);

/**
 * Middlewares
 */

function validateSelectedProduct(req: Request, res: Response, next: NextFunction) {
    let selectedProductId = req.params.productId;

    console.log(`Selected Product ID: ${selectedProductId}`);

    ProductModel.findById(selectedProductId, (err, product) => {
        if (err || !product) {
            res.json({
                success: false,
                message: 'Error finding the product',
                errorReport: err,
                productId: selectedProductId,
            } as ApiResponseData);
            return;
        }

        req.routeData.products.selectedProduct = product;
        next();
    });
}

/**
 * Controllers
 */

async function getProductDetails(req: Request, res: Response, next: NextFunction) {
    let selectedProduct = req.routeData.products.selectedProduct!;

    res.json({
        success: true,
        message: 'Product details fetched',
        productDetails: {
            product: selectedProduct,
        },
    } as ApiResponseData);
}

async function updateProduct(req: Request, res: Response, next: NextFunction) {
    let { name, price, plu, description, detailHTML, vendorId } = req.body;

    let selectedProduct = req.routeData.products.selectedProduct!;
    selectedProduct.name = name;
    selectedProduct.price = price;
    selectedProduct.plu = plu;
    selectedProduct.description = description;
    selectedProduct.detailHTML = detailHTML;
    selectedProduct.vendorId = vendorId;

    try {
        let saveResult = await selectedProduct.save();

        res.json({
            success: true,
            message: 'Product updated',
        } as ApiResponseData);
    } catch (err) {
        res.json({
            success: false,
            message: 'Error updating product',
            errorReport: err,
        } as ApiResponseData);
    }
}

async function removeProduct(req: Request, res: Response, next: NextFunction) {
    let selectedProduct = req.routeData.products.selectedProduct!;

    try {
        let result = await selectedProduct.remove();

        res.json({
            success: true,
            message: 'Product removed',
        } as ApiResponseData);
    } catch (err) {
        res.json({
            success: false,
            message: 'Error removing product',
            errorReport: err,
        } as ApiResponseData);
    }
}
