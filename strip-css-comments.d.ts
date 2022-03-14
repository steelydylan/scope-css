declare type Option = {
    preserve?: boolean | RegExp | ((comment: string) => boolean);
    all?: boolean;
};
export declare const stripCSSComments: (str: string, opts?: Option) => string;
export {};
