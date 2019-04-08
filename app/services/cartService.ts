import { Request } from 'express';
import { CartData, AccountModel } from '@/models/Account';
import { helperUtils } from '@/tools/utils/helperUtils';

export const cartService = {
    async getCartData(req: Request) {
        if (req.apiTokenPayload && req.apiTokenPayload.accountData) {
            let account = await AccountModel.findById(req.apiTokenPayload.accountData.id).exec();
            if (account) {
                return account.cart;
            }
        } else if (req.session) {
            if (req.session.cartData) {
                return req.session.cartData;
            }
        }

        return new CartData();
    },

    async updateCartData(req: Request, newCartData: CartData) {
        if (req.apiTokenPayload && req.apiTokenPayload.accountData) {
            let account = await AccountModel.findById(req.apiTokenPayload.accountData.id).exec();
            if (account) {
                account.cart = newCartData;
                await account.save();
            }
        } else if (req.session) {
            if (req.session.cartData) {
                req.session.cartData = newCartData;

                let sessionSavePromise = async () => {
                    return new Promise((resolve, reject) => {
                        if (!req.session) {
                            reject('Session is not defined');
                            return;
                        }

                        req.session.save((err) => {
                            if (err) {
                                helperUtils.error('Error saving cart data in session');
                                reject('Error saving cart data in session');
                                return;
                            } else {
                                resolve();
                            }
                        });
                    });
                };

                await sessionSavePromise();
            }
        }
    },
};
