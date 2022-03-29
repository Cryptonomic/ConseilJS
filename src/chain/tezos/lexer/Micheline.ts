// Generated automatically by nearley, version 2.19.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var lbrace: any;
declare var _: any;
declare var colon: any;
declare var quotedValue: any;
declare var rbrace: any;
declare var comma: any;
declare var lbracket: any;
declare var rbracket: any;

import { TezosMessageUtils } from '../TezosMessageUtil';
import * as moo from 'moo';

// https://gitlab.com/tezos/tezos/-/blob/master/src/proto_012_Psithaca/lib_protocol/michelson_v1_primitives.ml#L580
export const DefaultMichelsonKeywords = ['"parameter"', '"storage"', '"code"', '"False"', '"Elt"', '"Left"', '"None"', '"Pair"', '"Right"', '"Some"', '"True"', '"Unit"', '"PACK"', '"UNPACK"', '"BLAKE2B"', '"SHA256"', '"SHA512"', '"ABS"', '"ADD"', '"AMOUNT"', '"AND"', '"BALANCE"', '"CAR"', '"CDR"', '"CHECK_SIGNATURE"', '"COMPARE"', '"CONCAT"', '"CONS"', '"CREATE_ACCOUNT"', '"CREATE_CONTRACT"', '"IMPLICIT_ACCOUNT"', '"DIP"', '"DROP"', '"DUP"', '"EDIV"', '"EMPTY_MAP"', '"EMPTY_SET"', '"EQ"', '"EXEC"', '"FAILWITH"', '"GE"', '"GET"', '"GT"', '"HASH_KEY"', '"IF"', '"IF_CONS"', '"IF_LEFT"', '"IF_NONE"', '"INT"', '"LAMBDA"', '"LE"', '"LEFT"', '"LOOP"', '"LSL"', '"LSR"', '"LT"', '"MAP"', '"MEM"', '"MUL"', '"NEG"', '"NEQ"', '"NIL"', '"NONE"', '"NOT"', '"NOW"', '"OR"', '"PAIR"', '"PUSH"', '"RIGHT"', '"SIZE"', '"SOME"', '"SOURCE"', '"SENDER"', '"SELF"', '"STEPS_TO_QUOTA"', '"SUB"', '"SWAP"', '"TRANSFER_TOKENS"', '"SET_DELEGATE"', '"UNIT"', '"UPDATE"', '"XOR"', '"ITER"', '"LOOP_LEFT"', '"ADDRESS"', '"CONTRACT"', '"ISNAT"', '"CAST"', '"RENAME"', '"bool"', '"contract"', '"int"', '"key"', '"key_hash"', '"lambda"', '"list"', '"map"', '"big_map"', '"nat"', '"option"', '"or"', '"pair"', '"set"', '"signature"', '"string"', '"bytes"', '"mutez"', '"timestamp"', '"unit"', '"operation"', '"address"', '"SLICE"', '"DIG"', '"DUG"', '"EMPTY_BIG_MAP"', '"APPLY"', '"chain_id"', '"CHAIN_ID"', '"LEVEL"', '"SELF_ADDRESS"', '"never"', '"NEVER"', '"UNPAIR"', '"VOTING_POWER"', '"TOTAL_VOTING_POWER"', '"KECCAK"', '"SHA3"', '"PAIRING_CHECK"', '"bls12_381_g1"', '"bls12_381_g2"', '"bls12_381_fr"', '"sapling_state"', '"sapling_transaction"', '"SAPLING_EMPTY_STATE"', '"SAPLING_VERIFY_UPDATE"', '"ticket"', '"TICKET"', '"READ_TICKET"', '"SPLIT_TICKET"', '"JOIN_TICKETS"', '"GET_AND_UPDATE"', '"chest"', '"chest_key"', '"OPEN_CHEST"', '"VIEW"', '"view"', '"constant"', '"SUB_MUTEZ"'];
let _languageKeywords = [...DefaultMichelsonKeywords];

export const setKeywordList = list => {
    _languageKeywords = list;
}

export const getCodeForKeyword = word => {
    return _languageKeywords.indexOf(word);
}

export const getKeywordForCode = code => {
    return _languageKeywords[code];
}

const lexer = moo.compile({
    lbrace: '{',
    rbrace: '}',
    lbracket: '[',
    rbracket: ']',
    colon: ":",
    comma: ",",
    _: /[ \t]+/,
    quotedValue: /"(?:[^"\\]|\\.)*"/s
});


/**
 * Encode a signed int value, add "00" prefix.
 * { "int": "42" } => 002a
 */
const staticIntToHex = d => {
    const prefix = '00';
    const text = d[6].toString();
    const value = TezosMessageUtils.writeSignedInt(text.substring(1, text.length - 1)); // strip double quotes

    return prefix + value;
};

/**
 * Encode a string to hex, add "01" prefix.
 * { "string": "abc" } => 0100000003616263
 */
const staticStringToHex = d => {
    const prefix = '01';
    let text = d[6].toString();
    text = text.substring(1, text.length - 1); // strip double quotes
    text = text.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
    const len = encodeLength(text.length);

    text = text.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join('');
    return prefix + len + text;
};

const staticBytesToHex = d => {
    const prefix = '0a';
    let bytes = d[6].toString();
    bytes = bytes.substring(1, bytes.length - 1); // strip double quotes
    const len = encodeLength(bytes.length / 2);

    return prefix + len + bytes;
};

/**
 * Encode an array of static values with a "02" prefix. Individual value encoding is done by staticIntToHex or staticStringToHex.
 *[ { "int": "42" }, { "string": "abc" } ] => 020000000a002a0100000003616263
 */
const staticArrayToHex = d => {
    const matchedArray = d[2]; // data array starts at position 2 after the opening bracket "[ "
    const prefix = '02';
    const content = matchedArray.map(a => a[0]).join('');
    const len = encodeLength(content.length / 2);

    return prefix + len + content;
};

/**
 * Encodes a single primitive without arguments or annotations.
 * { "prim": "PUSH" } => 0343
 */
const primBareToHex = d => {
    //const keywords = lexer.groups.filter(g => g.defaultType === 'keyword')[0].match;
    const prefix = '03';
    const prim = encodePrimitive(d[6].toString());

    return prefix + prim;
}

/**
 * Encodes a single primitive with an annotation
 * { "prim": "PUSH", "annots": [ "@cba" ] } => 04430000000440636261
 */
const primAnnToHex = d => {
    const prefix = '04';
    const prim = encodePrimitive(d[6].toString());
    let ann = d[15].map(v => {
            let t = v[0].toString();
            t = t.substring(1, t.length - 1); // strip double quotes
            return t;
        }).join(' ');
    ann = ann.split('').map(c => c.charCodeAt(0).toString(16)).join(''); // to hex
    ann = encodeLength(ann.length / 2) + ann; // prepend length

    return prefix + prim + ann;
}

/**
 * Encodes a single primitive with one or more arguments.
 * { "prim": "NIL", "args": [ { "prim": "operation" } ] } => 053d036d
 * { "prim": "NIL", "args": [ { "prim": "operation" }, { "prim": "operation" } ] } => 073d036d036d
 */
const primArgToHex = d => {
    let prefix = '05';
    if (d[15].length == 2) {
        prefix = '07';
    } else if (d[15].length > 2) {
        prefix = '09';
    }

    const prim = encodePrimitive(d[6].toString());
    let args = d[15].map(v => v[0]).join('');

    if (prefix === '09') {
        args = ('0000000' + (args.length / 2).toString(16)).slice(-8) + args; // args is implicitly an array here, array prefix (02) is missing, but 4-byte length is written
        args += '00000000';  // append empty annotation to message type 09
    }

    return prefix + prim + args;
}

/**
 * Encodes a primitive with arguments and annotations
 * { "prim": "NIL", "args": [ { "prim": "operation" } ], "annots": [ "@cba" ] } => 063d036d0000000440636261
 * { "prim": "NIL", "args": [ { "prim": "operation" }, { "prim": "operation" } ], "annots": [ "@cba" ] } => 083d036d036d0000000440636261
 *
 */
const primArgAnnToHex = d => {
    let prefix = '06';
    if (d[15].length == 2) {
        prefix = '08';
    } else if (d[15].length > 2) {
        prefix = '09';
    }

    const prim = encodePrimitive(d[6].toString());
    let args = d[15].map(v => v[0]).join('');
    let ann = d[26].map(v => {
            let t = v[0].toString();
            t = t.substring(1, t.length - 1); // strip double quotes
            return t;
        }).join(' '); // multiple annotations are encoded as a single space-separated string
    ann = ann.split('').map(c => c.charCodeAt(0).toString(16)).join(''); // to hex
    ann = encodeLength(ann.length / 2) + ann; // prepend length

    if (prefix === '09') {
        args = ('0000000' + (args.length / 2).toString(16)).slice(-8) + args;  // args is implicitly an array here, array prefix (02) is missing, but 4-byte length is written
    }

    return prefix + prim + args + ann;
}

const encodePrimitive = p => {
    return ('00' + getCodeForKeyword(p).toString(16)).slice(-2);
}

const encodeLength = l => {
    return ('0000000' + l.toString(16)).slice(-8);
}

interface NearleyToken {  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: NearleyToken) => string;
  has: (tokenType: string) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
  Lexer: lexer,
  ParserRules: [
    {"name": "main", "symbols": ["staticObject"], "postprocess": id},
    {"name": "main", "symbols": ["primAny"], "postprocess": id},
    {"name": "main", "symbols": ["anyArray"], "postprocess": id},
    {"name": "staticInt$ebnf$1", "symbols": []},
    {"name": "staticInt$ebnf$1", "symbols": ["staticInt$ebnf$1", (lexer.has("_") ? {type: "_"} : _)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "staticInt", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), (lexer.has("_") ? {type: "_"} : _), {"literal":"\"int\""}, "staticInt$ebnf$1", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("_") ? {type: "_"} : _), (lexer.has("quotedValue") ? {type: "quotedValue"} : quotedValue), (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": staticIntToHex},
    {"name": "staticString$ebnf$1", "symbols": []},
    {"name": "staticString$ebnf$1", "symbols": ["staticString$ebnf$1", (lexer.has("_") ? {type: "_"} : _)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "staticString", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), (lexer.has("_") ? {type: "_"} : _), {"literal":"\"string\""}, "staticString$ebnf$1", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("_") ? {type: "_"} : _), (lexer.has("quotedValue") ? {type: "quotedValue"} : quotedValue), (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": staticStringToHex},
    {"name": "staticBytes$ebnf$1", "symbols": []},
    {"name": "staticBytes$ebnf$1", "symbols": ["staticBytes$ebnf$1", (lexer.has("_") ? {type: "_"} : _)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "staticBytes", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), (lexer.has("_") ? {type: "_"} : _), {"literal":"\"bytes\""}, "staticBytes$ebnf$1", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("_") ? {type: "_"} : _), (lexer.has("quotedValue") ? {type: "quotedValue"} : quotedValue), (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": staticBytesToHex},
    {"name": "staticObject", "symbols": ["staticInt"], "postprocess": id},
    {"name": "staticObject", "symbols": ["staticString"], "postprocess": id},
    {"name": "staticObject", "symbols": ["staticBytes"], "postprocess": id},
    {"name": "primBare$ebnf$1", "symbols": []},
    {"name": "primBare$ebnf$1", "symbols": ["primBare$ebnf$1", (lexer.has("_") ? {type: "_"} : _)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "primBare", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), (lexer.has("_") ? {type: "_"} : _), {"literal":"\"prim\""}, "primBare$ebnf$1", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("_") ? {type: "_"} : _), (lexer.has("quotedValue") ? {type: "quotedValue"} : quotedValue), (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": primBareToHex},
    {"name": "primArg$ebnf$1", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArg$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "primArg$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArg$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "primArg$ebnf$3$subexpression$1$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "primArg$ebnf$3$subexpression$1$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "primArg$ebnf$3$subexpression$1$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArg$ebnf$3$subexpression$1$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "primArg$ebnf$3$subexpression$1", "symbols": ["any", "primArg$ebnf$3$subexpression$1$ebnf$1", "primArg$ebnf$3$subexpression$1$ebnf$2"]},
    {"name": "primArg$ebnf$3", "symbols": ["primArg$ebnf$3$subexpression$1"]},
    {"name": "primArg$ebnf$3$subexpression$2$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "primArg$ebnf$3$subexpression$2$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "primArg$ebnf$3$subexpression$2$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArg$ebnf$3$subexpression$2$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "primArg$ebnf$3$subexpression$2", "symbols": ["any", "primArg$ebnf$3$subexpression$2$ebnf$1", "primArg$ebnf$3$subexpression$2$ebnf$2"]},
    {"name": "primArg$ebnf$3", "symbols": ["primArg$ebnf$3", "primArg$ebnf$3$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "primArg", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), (lexer.has("_") ? {type: "_"} : _), {"literal":"\"prim\""}, "primArg$ebnf$1", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("_") ? {type: "_"} : _), (lexer.has("quotedValue") ? {type: "quotedValue"} : quotedValue), (lexer.has("comma") ? {type: "comma"} : comma), (lexer.has("_") ? {type: "_"} : _), {"literal":"\"args\""}, "primArg$ebnf$2", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("_") ? {type: "_"} : _), (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), (lexer.has("_") ? {type: "_"} : _), "primArg$ebnf$3", (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbracket") ? {type: "rbracket"} : rbracket), (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": primArgToHex},
    {"name": "primAnn$ebnf$1", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primAnn$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "primAnn$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primAnn$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "primAnn$ebnf$3$subexpression$1$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "primAnn$ebnf$3$subexpression$1$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "primAnn$ebnf$3$subexpression$1$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primAnn$ebnf$3$subexpression$1$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "primAnn$ebnf$3$subexpression$1", "symbols": [(lexer.has("quotedValue") ? {type: "quotedValue"} : quotedValue), "primAnn$ebnf$3$subexpression$1$ebnf$1", "primAnn$ebnf$3$subexpression$1$ebnf$2"]},
    {"name": "primAnn$ebnf$3", "symbols": ["primAnn$ebnf$3$subexpression$1"]},
    {"name": "primAnn$ebnf$3$subexpression$2$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "primAnn$ebnf$3$subexpression$2$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "primAnn$ebnf$3$subexpression$2$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primAnn$ebnf$3$subexpression$2$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "primAnn$ebnf$3$subexpression$2", "symbols": [(lexer.has("quotedValue") ? {type: "quotedValue"} : quotedValue), "primAnn$ebnf$3$subexpression$2$ebnf$1", "primAnn$ebnf$3$subexpression$2$ebnf$2"]},
    {"name": "primAnn$ebnf$3", "symbols": ["primAnn$ebnf$3", "primAnn$ebnf$3$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "primAnn", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), (lexer.has("_") ? {type: "_"} : _), {"literal":"\"prim\""}, "primAnn$ebnf$1", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("_") ? {type: "_"} : _), (lexer.has("quotedValue") ? {type: "quotedValue"} : quotedValue), (lexer.has("comma") ? {type: "comma"} : comma), (lexer.has("_") ? {type: "_"} : _), {"literal":"\"annots\""}, "primAnn$ebnf$2", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("_") ? {type: "_"} : _), (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), (lexer.has("_") ? {type: "_"} : _), "primAnn$ebnf$3", (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbracket") ? {type: "rbracket"} : rbracket), (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": primAnnToHex},
    {"name": "primArgAnn$ebnf$1", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArgAnn$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "primArgAnn$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArgAnn$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "primArgAnn$ebnf$3$subexpression$1$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "primArgAnn$ebnf$3$subexpression$1$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "primArgAnn$ebnf$3$subexpression$1$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArgAnn$ebnf$3$subexpression$1$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "primArgAnn$ebnf$3$subexpression$1", "symbols": ["any", "primArgAnn$ebnf$3$subexpression$1$ebnf$1", "primArgAnn$ebnf$3$subexpression$1$ebnf$2"]},
    {"name": "primArgAnn$ebnf$3", "symbols": ["primArgAnn$ebnf$3$subexpression$1"]},
    {"name": "primArgAnn$ebnf$3$subexpression$2$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "primArgAnn$ebnf$3$subexpression$2$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "primArgAnn$ebnf$3$subexpression$2$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArgAnn$ebnf$3$subexpression$2$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "primArgAnn$ebnf$3$subexpression$2", "symbols": ["any", "primArgAnn$ebnf$3$subexpression$2$ebnf$1", "primArgAnn$ebnf$3$subexpression$2$ebnf$2"]},
    {"name": "primArgAnn$ebnf$3", "symbols": ["primArgAnn$ebnf$3", "primArgAnn$ebnf$3$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "primArgAnn$ebnf$4", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArgAnn$ebnf$4", "symbols": [], "postprocess": () => null},
    {"name": "primArgAnn$ebnf$5$subexpression$1$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "primArgAnn$ebnf$5$subexpression$1$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "primArgAnn$ebnf$5$subexpression$1$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArgAnn$ebnf$5$subexpression$1$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "primArgAnn$ebnf$5$subexpression$1", "symbols": [(lexer.has("quotedValue") ? {type: "quotedValue"} : quotedValue), "primArgAnn$ebnf$5$subexpression$1$ebnf$1", "primArgAnn$ebnf$5$subexpression$1$ebnf$2"]},
    {"name": "primArgAnn$ebnf$5", "symbols": ["primArgAnn$ebnf$5$subexpression$1"]},
    {"name": "primArgAnn$ebnf$5$subexpression$2$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "primArgAnn$ebnf$5$subexpression$2$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "primArgAnn$ebnf$5$subexpression$2$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArgAnn$ebnf$5$subexpression$2$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "primArgAnn$ebnf$5$subexpression$2", "symbols": [(lexer.has("quotedValue") ? {type: "quotedValue"} : quotedValue), "primArgAnn$ebnf$5$subexpression$2$ebnf$1", "primArgAnn$ebnf$5$subexpression$2$ebnf$2"]},
    {"name": "primArgAnn$ebnf$5", "symbols": ["primArgAnn$ebnf$5", "primArgAnn$ebnf$5$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "primArgAnn", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), (lexer.has("_") ? {type: "_"} : _), {"literal":"\"prim\""}, "primArgAnn$ebnf$1", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("_") ? {type: "_"} : _), (lexer.has("quotedValue") ? {type: "quotedValue"} : quotedValue), (lexer.has("comma") ? {type: "comma"} : comma), (lexer.has("_") ? {type: "_"} : _), {"literal":"\"args\""}, "primArgAnn$ebnf$2", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("_") ? {type: "_"} : _), (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), (lexer.has("_") ? {type: "_"} : _), "primArgAnn$ebnf$3", (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbracket") ? {type: "rbracket"} : rbracket), (lexer.has("comma") ? {type: "comma"} : comma), (lexer.has("_") ? {type: "_"} : _), {"literal":"\"annots\""}, "primArgAnn$ebnf$4", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("_") ? {type: "_"} : _), (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), (lexer.has("_") ? {type: "_"} : _), "primArgAnn$ebnf$5", (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbracket") ? {type: "rbracket"} : rbracket), (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": primArgAnnToHex},
    {"name": "primAny", "symbols": ["primBare"], "postprocess": id},
    {"name": "primAny", "symbols": ["primArg"], "postprocess": id},
    {"name": "primAny", "symbols": ["primAnn"], "postprocess": id},
    {"name": "primAny", "symbols": ["primArgAnn"], "postprocess": id},
    {"name": "any", "symbols": ["primAny"], "postprocess": id},
    {"name": "any", "symbols": ["staticObject"], "postprocess": id},
    {"name": "any", "symbols": ["anyArray"], "postprocess": id},
    {"name": "anyArray", "symbols": [(lexer.has("lbracket") ? {type: "lbracket"} : lbracket), (lexer.has("rbracket") ? {type: "rbracket"} : rbracket)], "postprocess": function(d) { return '0200000000'; }},
    {"name": "anyArray$ebnf$1$subexpression$1$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "anyArray$ebnf$1$subexpression$1$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "anyArray$ebnf$1$subexpression$1$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "anyArray$ebnf$1$subexpression$1$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "anyArray$ebnf$1$subexpression$1", "symbols": ["any", "anyArray$ebnf$1$subexpression$1$ebnf$1", "anyArray$ebnf$1$subexpression$1$ebnf$2"]},
    {"name": "anyArray$ebnf$1", "symbols": ["anyArray$ebnf$1$subexpression$1"]},
    {"name": "anyArray$ebnf$1$subexpression$2$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "anyArray$ebnf$1$subexpression$2$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "anyArray$ebnf$1$subexpression$2$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "anyArray$ebnf$1$subexpression$2$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "anyArray$ebnf$1$subexpression$2", "symbols": ["any", "anyArray$ebnf$1$subexpression$2$ebnf$1", "anyArray$ebnf$1$subexpression$2$ebnf$2"]},
    {"name": "anyArray$ebnf$1", "symbols": ["anyArray$ebnf$1", "anyArray$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "anyArray", "symbols": [(lexer.has("lbracket") ? {type: "lbracket"} : lbracket), (lexer.has("_") ? {type: "_"} : _), "anyArray$ebnf$1", (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbracket") ? {type: "rbracket"} : rbracket)], "postprocess": staticArrayToHex}
  ],
  ParserStart: "main",
};

export default grammar;
