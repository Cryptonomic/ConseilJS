@preprocessor typescript

@{%
const moo = require("moo");
const bigInt = require("big-integer");

// taken from https://gitlab.com/nomadic-labs/tezos, lib_protocol/michelson_v1_primitives.ml, prim_encoding enum
const MichelineKeywords = ['"parameter"', '"storage"', '"code"', '"False"', '"Elt"', '"Left"', '"None"', '"Pair"', '"Right"', '"Some"', '"True"', '"Unit"', '"PACK"', '"UNPACK"', '"BLAKE2B"', '"SHA256"', '"SHA512"', '"ABS"', '"ADD"', '"AMOUNT"', '"AND"', '"BALANCE"', '"CAR"', '"CDR"', '"CHECK_SIGNATURE"', '"COMPARE"', '"CONCAT"', '"CONS"', '"CREATE_ACCOUNT"', '"CREATE_CONTRACT"', '"IMPLICIT_ACCOUNT"', '"DIP"', '"DROP"', '"DUP"', '"EDIV"', '"EMPTY_MAP"', '"EMPTY_SET"', '"EQ"', '"EXEC"', '"FAILWITH"', '"GE"', '"GET"', '"GT"', '"HASH_KEY"', '"IF"', '"IF_CONS"', '"IF_LEFT"', '"IF_NONE"', '"INT"', '"LAMBDA"', '"LE"', '"LEFT"', '"LOOP"', '"LSL"', '"LSR"', '"LT"', '"MAP"', '"MEM"', '"MUL"', '"NEG"', '"NEQ"', '"NIL"', '"NONE"', '"NOT"', '"NOW"', '"OR"', '"PAIR"', '"PUSH"', '"RIGHT"', '"SIZE"', '"SOME"', '"SOURCE"', '"SENDER"', '"SELF"', '"STEPS_TO_QUOTA"', '"SUB"', '"SWAP"', '"TRANSFER_TOKENS"', '"SET_DELEGATE"', '"UNIT"', '"UPDATE"', '"XOR"', '"ITER"', '"LOOP_LEFT"', '"ADDRESS"', '"CONTRACT"', '"ISNAT"', '"CAST"', '"RENAME"', '"bool"', '"contract"', '"int"', '"key"', '"key_hash"', '"lambda"', '"list"', '"map"', '"big_map"', '"nat"', '"option"', '"or"', '"pair"', '"set"', '"signature"', '"string"', '"bytes"', '"mutez"', '"timestamp"', '"unit"', '"operation"', '"address"', '"SLICE"', '"DIG"', '"DUG"', '"EMPTY_BIG_MAP"', '"APPLY"', '"chain_id"', '"CHAIN_ID"'];

const lexer = moo.compile({
    keyword: MichelineKeywords,
    lbrace: '{',
    rbrace: '}',
    lbracket: '[',
    rbracket: ']',
    colon: ":",
    comma: ",",
    _: /[ \t]+/,
    quotedValue: /\"[\S\s]*?\"/
});
%}

@lexer lexer

main -> staticObject {% id %}
        | primBare {% id %} | primArg {% id %} | primAnn {% id %} | primArgAnn {% id %}
        | anyArray {% id %}

staticInt -> %lbrace %_ "\"int\"" %_:* %colon %_ %quotedValue %_ %rbrace {% staticIntToHex %}
staticString -> %lbrace %_ "\"string\"" %_:* %colon %_ %quotedValue %_ %rbrace {% staticStringToHex %}
staticBytes -> %lbrace %_ "\"bytes\"" %_:* %colon %_ %quotedValue %_ %rbrace {% staticBytesToHex %}
staticObject -> staticInt {% id %} | staticString {% id %} | staticBytes {% id %}

primBare -> %lbrace %_ "\"prim\"" %_:* %colon %_ %keyword %_ %rbrace {% primBareToHex %}
primArg -> %lbrace %_ "\"prim\"" %_:? %colon %_ %keyword %comma %_ "\"args\"" %_:? %colon %_ %lbracket %_ (any %comma:? %_:?):+ %_ %rbracket %_ %rbrace {% primArgToHex %}
primAnn -> %lbrace %_ "\"prim\"" %_:? %colon %_ %keyword %comma %_ "\"annots\"" %_:? %colon %_ %lbracket %_ (%quotedValue %comma:? %_:?):+ %_ %rbracket %_ %rbrace {% primAnnToHex %}
primArgAnn -> %lbrace %_ "\"prim\"" %_:? %colon %_ %keyword %comma %_  "\"args\"" %_:? %colon %_ %lbracket %_ (any %comma:? %_:?):+ %_ %rbracket %comma %_ "\"annots\"" %_:? %colon %_ %lbracket %_ (%quotedValue %comma:? %_:?):+ %_ %rbracket %_ %rbrace {% primArgAnnToHex %}
primAny -> primBare {% id %} | primArg {% id %} | primAnn {% id %} | primArgAnn {% id %}

any -> primAny {% id %} | staticObject {% id %} | anyArray {% id %}
anyArray ->  %lbracket %rbracket {% function(d) { return '0200000000'; } %}
        | %lbracket %_ (any %comma:? %_:?):+ %_ %rbracket {% staticArrayToHex %}

@{%
/**
 * Encode a signed int value, add "00" prefix.
 * { "int": "42" } => 002a
 */
const staticIntToHex = d => {
    const prefix = '00';
    const text = d[6].toString();
    const value = writeSignedInt(parseInt(text.substring(1, text.length - 1))); // strip double quotes

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
    const len = encodeLength(text.length);

    text = text.split('').map(c => c.charCodeAt(0).toString(16)).join('');

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

// 10

const encodePrimitive = p => {
    return ('00' + MichelineKeywords.indexOf(p).toString(16)).slice(-2);
}

const encodeLength = l => {
    return ('0000000' + l.toString(16)).slice(-8);
}

const writeSignedInt = value => {
        if (value === 0) { return '00'; }

        const n = bigInt(value).abs();
        const l = n.bitLength().toJSNumber();
        let arr: any = [];
        let v = n;
        for (let i = 0; i < l; i += 7) {
            let byte = bigInt.zero;

            if (i === 0) {
                byte = v.and(0x3f); // first byte makes room for sign flag
                v = v.shiftRight(6);
            } else {
                byte = v.and(0x7f); // NOT base128 encoded
                v = v.shiftRight(7);
            }

            if (value < 0 && i === 0) { byte = byte.or(0x40); } // set sign flag

            if (i + 7 < l) { byte = byte.or(0x80); } // set next byte flag
            arr.push(byte.toJSNumber());
        }

        if (l % 7 === 0) {
            arr[arr.length - 1] = arr[arr.length - 1] | 0x80;
            arr.push(1);
        }

        return arr.map(v => ('0' + v.toString(16)).slice(-2)).join('');
    }
%}
