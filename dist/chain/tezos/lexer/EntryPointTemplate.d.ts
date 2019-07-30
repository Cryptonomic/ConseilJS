export interface Token {
    value: any;
    [key: string]: any;
}
export interface Lexer {
    reset: (chunk: string, info: any) => void;
    next: () => Token | undefined;
    save: () => any;
    formatError: (token: Token) => string;
    has: (tokenType: string) => boolean;
}
export interface NearleyRule {
    name: string;
    symbols: NearleySymbol[];
    postprocess?: (d: any[], loc?: number, reject?: {}) => any;
}
export declare type NearleySymbol = string | {
    literal: any;
} | {
    test: (token: any) => boolean;
};
export declare var Lexer: Lexer | undefined;
export declare var ParserRules: NearleyRule[];
export declare var ParserStart: string;
