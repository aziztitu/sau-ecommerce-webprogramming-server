import {
    Typegoose,
    prop,
    staticMethod,
    ModelType,
    pre,
    InstanceType,
    Ref,
    arrayProp,
} from 'typegoose';
import bcrypt from 'bcrypt';
import { MongooseDocument } from 'mongoose';
import serverConfig from '@/tools/serverConfig';
import { ReturnResult } from '@/tools/utils/helperUtils';
import { Product } from './Product';
import { Order } from './Order';

export enum AccountRole {
    Admin = 'admin',
    User = 'user',
}

export enum ReservedUsername {
    Empty = '',
    Admin = 'admin',
}

export class CartItem {
    @prop({ ref: Product, required: true })
    product!: Ref<Product>;

    @prop({ default: 0 })
    count: number = 0;
}

export class CartData {
    @arrayProp({ items: CartItem, default: [] })
    cartItems: CartItem[] = [];
}

@pre('save', function(next) {
    const account = this as MongooseDocument & Account;

    if (account.isModified('password')) {
        // console.log("Hashing password...");

        bcrypt.hash(
            account.password,
            serverConfig.mongo.passwordHash.saltingRounds,
            (err, hash) => {
                if (err) {
                    console.log('Error hashing password!');
                    next(err);
                } else {
                    account.password = hash;
                    next();
                }
            }
        );
    } else {
        next();
    }
})
export class Account extends Typegoose {
    @prop({ required: true, unique: true })
    username!: string;

    @prop({ required: true })
    password!: string;

    @prop({ required: true })
    name!: string;

    @prop({ required: true, unique: true })
    email!: string;

    @prop({ required: true, enum: AccountRole, default: AccountRole.User })
    role!: AccountRole;

    @prop({ default: () => new CartData() })
    cart!: CartData;

    @arrayProp({ items: Order, default: [] })
    orders!: Order[];

    @staticMethod
    static async addAdminIfMissing(this: ModelType<Account> & Account) {
        try {
            const account = await this.findOne({ role: AccountRole.Admin }).exec();
            if (!account) {
                console.log('Admin Account is missing...');
                console.log('Creating Admin Account...');

                const adminAccountModel = new AccountModel({
                    username: 'admin',
                    password: serverConfig.mongo.defaultAdminPassword,
                    name: 'Admin',
                    role: AccountRole.Admin,
                    email: 'admin@azeesoft.com',
                } as Account);

                try {
                    await adminAccountModel.save();
                    console.log('Admin Account created successfully!\n');
                } catch (err) {
                    if (err) {
                        console.log('Error saving admin account!\n');
                        return false;
                    }
                }
            }
        } catch (err) {
            if (err) {
                console.log('Error retrieving admin account!\n');
                return false;
            }
        }

        return true;
    }

    @staticMethod
    static addNewAccount(this: ModelType<Account> & Account, accountDoc: Account) {
        return new Promise<ReturnResult>((resolve, reject) => {
            let resData: ReturnResult;

            for (const reservedUsernameId in ReservedUsername) {
                if (accountDoc.username === ReservedUsername[reservedUsernameId]) {
                    resData = {
                        success: false,
                        message: `Username '${
                            accountDoc.username
                        }' is reserved. Use a different username.`,
                    };

                    resolve(resData);
                    return;
                }
            }

            const newAccountModel = new AccountModel(accountDoc);
            newAccountModel.save((err) => {
                if (err) {
                    resData = {
                        success: false,
                        message: `Error creating the account!`,
                        errorReport: err,
                    };
                } else {
                    resData = {
                        success: true,
                        message: 'Account created successfully',
                    };
                }

                resolve(resData);
            });
        });
    }
}

export const AccountModel = new Account().getModelForClass(Account);
