import colors from 'colors/safe';
import axios from 'axios';
import qs from 'qs';
import serverConfig from '../serverConfig';

export enum StringDecoration {
    HIGHLIGHT = 'yellow',
    SUCCESS = 'green',
    ERROR = 'red',

    UNDERLINE = 'underline',

    CONTENT_BOUNDARY = 'bold white bgBlue',
}

export type StringDecorationType = StringDecoration;

export const helperUtils = {
    log(message?: any, ...decorations: StringDecorationType[]) {
        if (message) {
            console.log(this.decorate(message, ...decorations));
        } else {
            console.log();
        }
    },

    error(message?: any, ...decorations: StringDecorationType[]) {
        decorations = [StringDecoration.ERROR, ...decorations];
        if (message) {
            console.error(this.decorate(message, ...decorations));
        } else {
            console.error();
        }
    },

    getPrettyJSON(data: object) {
        return JSON.stringify(data, null, 4);
    },

    decorate(message: string, ...decorations: StringDecorationType[]) {
        let decoratedMessage = message;

        let color: any;
        decorations.forEach((decor) => {
            decor.split(' ').forEach((style) => {
                if (!color) {
                    color = (colors as any)[style];
                } else {
                    color = color[style];
                }
            });
        });

        if (color) {
            decoratedMessage = color(message);
        }

        return decoratedMessage;
    },

    enumContains(enumObject: any, val: any) {
        for (const valId in enumObject) {
            if (val === enumObject[valId]) {
                return true;
            }
        }

        return false;
    },

    async validateRecaptcha(recaptchaResponse: string) {
        let res = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            qs.stringify({
                secret: serverConfig.recaptcha.secretKey,
                response: recaptchaResponse,
            })
        );

        if (res.data.success === true) {
            return true;
        }

        helperUtils.log(this.getPrettyJSON(res.data));

        return false;
    },
};
