import { Router, NextFunction, Request, Response } from 'express';
import authMiddlewares from '@/middlewares/authMiddlewares';
import { VendorModel, Vendor } from '@/models/Vendor';
import { ApiResponseData } from '../apiController';

export const vendorsController: Router = Router();

vendorsController.use(authMiddlewares.allowOnlyWithToken);

vendorsController.get('/all', getAllVendors);
vendorsController.put('/new', authMiddlewares.allowOnlyAdmin, addNewVendor);

async function getAllVendors(req: Request, res: Response, next: NextFunction) {
    try {
        let vendors = await VendorModel.find()
            .sort({ _id: 1 })
            .exec();

        res.json({
            success: true,
            message: 'Vendors fetched',
            vendors,
        } as ApiResponseData);
    } catch (err) {
        res.json({
            success: false,
            message: 'Error fetching vendors',
            errorReport: err,
        } as ApiResponseData);
    }
}

async function addNewVendor(req: Request, res: Response, next: NextFunction) {
    let { name, email, phone, address } = req.body;

    console.log('Adding vendor');

    let resData = await VendorModel.addNewVendor({
        name,
        email,
        phone,
        address,
    } as Vendor);

    res.json(resData);
}
