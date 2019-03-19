@{%
const moo = require("moo");
const baseN = require("base-n");

const base128 = baseN.create({ characters: [...Array(128).keys()].map(k => ("0" + k.toString(16)).slice(-2)) });

const MichelineKeywords = ['"parameter"', '"storage"', '"code"', '"False"', '"Elt"', '"Left"', '"None"', '"Pair"', '"Right"', '"Some"', '"True"', '"Unit"', '"PACK"', '"UNPACK"', '"BLAKE2B"', '"SHA256"', '"SHA512"', '"ABS"', '"ADD"', '"AMOUNT"', '"AND"', '"BALANCE"', '"CAR"', '"CDR"', '"CHECK_SIGNATURE"', '"COMPARE"', '"CONCAT"', '"CONS"', '"CREATE_ACCOUNT"', '"CREATE_CONTRACT"', '"IMPLICIT_ACCOUNT"', '"DIP"', '"DROP"', '"DUP"', '"EDIV"', '"EMPTY_MAP"', '"EMPTY_SET"', '"EQ"', '"EXEC"', '"FAILWITH"', '"GE"', '"GET"', '"GT"', '"HASH_KEY"', '"IF"', '"IF_CONS"', '"IF_LEFT"', '"IF_NONE"', '"INT"', '"LAMBDA"', '"LE"', '"LEFT"', '"LOOP"', '"LSL"', '"LSR"', '"LT"', '"MAP"', '"MEM"', '"MUL"', '"NEG"', '"NEQ"', '"NIL"', '"NONE"', '"NOT"', '"NOW"', '"OR"', '"PAIR"', '"PUSH"', '"RIGHT"', '"SIZE"', '"SOME"', '"SOURCE"', '"SENDER"', '"SELF"', '"STEPS_TO_QUOTA"', '"SUB"', '"SWAP"', '"TRANSFER_TOKENS"', '"SET_DELEGATE"', '"UNIT"', '"UPDATE"', '"XOR"', '"ITER"', '"LOOP_LEFT"', '"ADDRESS"', '"CONTRACT"', '"ISNAT"', '"CAST"', '"RENAME"', '"bool"', '"contract"', '"int"', '"key"', '"key_hash"', '"lambda"', '"list"', '"map"', '"big_map"', '"nat"', '"option"', '"or"', '"pair"', '"set"', '"signature"', '"string"', '"bytes"', '"mutez"', '"timestamp"', '"unit"', '"operation"', '"address"', '"SLICE"'];

const lexer = moo.compile({
    reservedWord: ['"int"', '"string"', '"prim"', '"args"', '"annots"'],
    keyword: MichelineKeywords,
    lbrace: '{',
    rbrace: '}',
    lbracket: '[',
    rbracket: ']',
    colon: ":",
    comma: ",",
    _: /[ \t]+/,
    number: /-?(?:[0-9]|[1-9][0-9]+)(?:\.[0-9]+)?(?:[eE][-+]?[0-9]+)?\b/,
    text: /\"[\S\s]*?\"/
});
%}

@lexer lexer

main -> staticInt {% id %} | staticString {% id %} | staticArray {% id %}
        | primBare {% id %} | primArg {% id %} | primAnn {% id %} | primArgAnn {% id %}

staticInt -> %lbrace %_ "\"int\"" %_:* %colon %_ %number %_ %rbrace {% staticIntToHex %}
staticString -> %lbrace %_ "\"string\"" %_:* %colon %_ %text %_ %rbrace {% staticStringToHex %}
staticArray -> %lbracket %_ (staticObject %comma:? %_:?):+ %_ %rbracket {% staticArrayToHex %}
staticObject -> staticInt {% id %} | staticString {% id %}
primBare -> %lbrace %_ "\"prim\"" %_:* %colon %_ %keyword %_ %rbrace {% primBareToHex %}
primArg -> %lbrace %_ "\"prim\"" %_:? %colon %_ %keyword %comma %_ "\"args\"" %_:? %colon %_ %lbracket %_ (primBare %comma:? %_:?):+ %_ %rbracket %_ %rbrace {% primArgToHex %}
primAnn -> %lbrace %_ "\"prim\"" %_:? %colon %_ %keyword %comma %_ "\"annots\"" %_:? %colon %_ %lbracket %_ (%text %comma:? %_:?):+ %_ %rbracket %_ %rbrace {% primAnnToHex %}
primArgAnn -> %lbrace %_ "\"prim\"" %_:? %colon %_ %keyword %comma %_  "\"args\"" %_:? %colon %_ %lbracket %_ (primBare %comma:? %_:?):+ %_ %rbracket %comma %_ "\"annots\"" %_:? %colon %_ %lbracket %_ (%text %comma:? %_:?):+ %_ %rbracket %_ %rbrace {% primArgAnnToHex %}

@{%
/**
 * Encode an int value into zarith format, add "00" prefix.
 * { "int": "42" } => 002a
 */
const staticIntToHex = d => {
    const prefix = '00';
    const value = base128.encode(parseInt(d[6])).split('').map((v, i, a) => {
            if (i % 2 !== 0) { return null; } // skip odd indices
            const n = parseInt(v + a[i + 1], 16); // take two
            return i > 0 ? n ^ 0x80 : n;
        })
        .filter(v => v !== null)
        .reverse()
        .map(v => v.toString(16))
        .join('');

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
    const len = ('0000000' + text.length.toString(16)).slice(-8);

    text = text.split('').map(c => c.charCodeAt(0).toString(16)).join('');

    return prefix + len + text;
};

/**
 * Encode an array of static values with a "02" prefix. Individual value encoding is done by staticIntToHex or staticStringToHex.
 *[ { "int": "42" }, { "string": "abc" } ] => 020000000a002a0100000003616263
 */
const staticArrayToHex = d => {
    const matchedArray = d[2]; // data array starts at position 2 after the opening bracket "[ "
    const prefix = '02';
    const len = ('0000000' + matchedArray.length.toString(16)).slice(-8)

    return prefix + len + matchedArray.map(a => a[0]).join('');
};

/**
 * Encodes a single primitive without arguments or annotations.
 *{ "prim": "PUSH" } => 0343
 */
const primBareToHex = d => {
    //const keywords = lexer.groups.filter(g => g.defaultType === 'keyword')[0].match;
    const prefix = '03';
    const prim = MichelineKeywords.indexOf(d[6].toString()).toString(16);

    return prefix + prim;
}

/**
 * Encodes a single primitive with an annotation
 * { "prim": "PUSH", "annots": [ "@cba" ] } => 04430000000440636261
 */
const primAnnToHex = d => {
    const prefix = '04';
    const prim = MichelineKeywords.indexOf(d[6].toString()).toString(16);
    let ann = d[15].map(v => {
            let t = v[0].toString();
            t = t.substring(1, t.length - 1); // strip double quotes
            return t;
        }).join(' ');
    ann = ann.split('').map(c => c.charCodeAt(0).toString(16)).join(''); // to hex
    ann = ('0000000' + (ann.length/2).toString(16)).slice(-8).toString(16) + ann; // prepend length

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

    const prim = MichelineKeywords.indexOf(d[6].toString()).toString(16);
    const args = d[15].map(v => v[0]).join('');

    if (prefix === '09') { args += '00000000'; } // append empty annotation to message type 09

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

    const prim = MichelineKeywords.indexOf(d[6].toString()).toString(16);
    const args = d[15].map(v => v[0]).join('');
    let ann = d[26].map(v => {
            let t = v[0].toString();
            t = t.substring(1, t.length - 1); // strip double quotes
            return t;
        }).join(' ');
    ann = ann.split('').map(c => c.charCodeAt(0).toString(16)).join(''); // to hex
    ann = ('0000000' + (ann.length/2).toString(16)).slice(-8).toString(16) + ann; // prepend length

    return prefix + prim + args + ann;
}

// 10
%}
