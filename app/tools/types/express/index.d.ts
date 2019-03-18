import { ApiTokenPayload } from '../auth';
import { Response } from 'express';
import { InstanceType } from 'typegoose';
import { Account } from '../../../models/Account';
import { Product } from '@/models/Product';

declare global {
    namespace Express {
        interface Request {
            apiTokenPayload?: ApiTokenPayload;
            routeData: {
                accounts: {
                    providedAccount?: InstanceType<Account>;
                };
                products: {
                    selectedProduct?: InstanceType<Product>;
                };
            };
        }

        interface SessionData {
            apiToken?: string;
        }
    }
}
