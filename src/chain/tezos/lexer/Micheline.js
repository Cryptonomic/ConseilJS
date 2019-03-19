// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

const moo = require("moo");
const baseN = require("base-n");

const base128 = baseN.create({ characters: [...Array(128).keys()].map(k => ("0" + k.toString(16)).slice(-2)) });

const MichelineKeywords = ['"parameter"', '"storage"', '"code"', '"False"', '"Elt"', '"Left"', '"None"', '"Pair"', '"Right"', '"Some"', '"True"', '"Unit"', '"PACK"', '"UNPACK"', '"BLAKE2B"', '"SHA256"', '"SHA512"', '"ABS"', '"ADD"', '"AMOUNT"', '"AND"', '"BALANCE"', '"CAR"', '"CDR"', '"CHECK_SIGNATURE"', '"COMPARE"', '"CONCAT"', '"CONS"', '"CREATE_ACCOUNT"', '"CREATE_CONTRACT"', '"IMPLICIT_ACCOUNT"', '"DIP"', '"DROP"', '"DUP"', '"EDIV"', '"EMPTY_MAP"', '"EMPTY_SET"', '"EQ"', '"EXEC"', '"FAILWITH"', '"GE"', '"GET"', '"GT"', '"HASH_KEY"', '"IF"', '"IF_CONS"', '"IF_LEFT"', '"IF_NONE"', '"INT"', '"LAMBDA"', '"LE"', '"LEFT"', '"LOOP"', '"LSL"', '"LSR"', '"LT"', '"MAP"', '"MEM"', '"MUL"', '"NEG"', '"NEQ"', '"NIL"', '"NONE"', '"NOT"', '"NOW"', '"OR"', '"PAIR"', '"PUSH"', '"RIGHT"', '"SIZE"', '"SOME"', '"SOURCE"', '"SENDER"', '"SELF"', '"STEPS_TO_QUOTA"', '"SUB"', '"SWAP"', '"TRANSFER_TOKENS"', '"SET_DELEGATE"', '"UNIT"', '"UPDATE"', '"XOR"', '"ITER"', '"LOOP_LEFT"', '"ADDRESS"', '"CONTRACT"', '"ISNAT"', '"CAST"', '"RENAME"', '"bool"', '"contract"', '"int"', '"key"', '"key_hash"', '"lambda"', '"list"', '"map"', '"big_map"', '"nat"', '"option"', '"or"', '"pair"', '"set"', '"signature"', '"string"', '"bytes"', '"mutez"', '"timestamp"', '"unit"', '"operation"', '"address"', '"SLICE"'];

const lexer = moo.compile({
    reservedWord: ['"prim"', '"args"', '"annots"'],
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
        .map(v => ('00' + v.toString(16)).slice(-2))
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
    const len = encodeLength(text.length);

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
    const len = encodeLength(matchedArray.length);

    return prefix + len + matchedArray.map(a => a[0]).join('');
};

/**
 * Encodes a single primitive without arguments or annotations.
 *{ "prim": "PUSH" } => 0343
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

    const prim = encodePrimitive(d[6].toString());
    const args = d[15].map(v => v[0]).join('');
    let ann = d[26].map(v => {
            let t = v[0].toString();
            t = t.substring(1, t.length - 1); // strip double quotes
            return t;
        }).join(' ');
    ann = ann.split('').map(c => c.charCodeAt(0).toString(16)).join(''); // to hex
    ann = encodeLength(ann.length / 2) + ann; // prepend length

    return prefix + prim + args + ann;
}

// 10

const encodePrimitive = p => {
    return ('00' + MichelineKeywords.indexOf(p).toString(16)).slice(-2);
}

const encodeLength = l => {
    return ('0000000' + l.toString(16)).slice(-8).toString(16)
}
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "main", "symbols": ["staticInt"], "postprocess": id},
    {"name": "main", "symbols": ["staticString"], "postprocess": id},
    {"name": "main", "symbols": ["staticArray"], "postprocess": id},
    {"name": "main", "symbols": ["primBare"], "postprocess": id},
    {"name": "main", "symbols": ["primArg"], "postprocess": id},
    {"name": "main", "symbols": ["primAnn"], "postprocess": id},
    {"name": "main", "symbols": ["primArgAnn"], "postprocess": id},
    {"name": "main", "symbols": ["primArray"], "postprocess": id},
    {"name": "staticInt$ebnf$1", "symbols": []},
    {"name": "staticInt$ebnf$1", "symbols": ["staticInt$ebnf$1", (lexer.has("_") ? {type: "_"} : _)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "staticInt", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), (lexer.has("_") ? {type: "_"} : _), {"literal":"\"int\""}, "staticInt$ebnf$1", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("_") ? {type: "_"} : _), (lexer.has("number") ? {type: "number"} : number), (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": staticIntToHex},
    {"name": "staticString$ebnf$1", "symbols": []},
    {"name": "staticString$ebnf$1", "symbols": ["staticString$ebnf$1", (lexer.has("_") ? {type: "_"} : _)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "staticString", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), (lexer.has("_") ? {type: "_"} : _), {"literal":"\"string\""}, "staticString$ebnf$1", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("_") ? {type: "_"} : _), (lexer.has("text") ? {type: "text"} : text), (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": staticStringToHex},
    {"name": "staticArray$ebnf$1$subexpression$1$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "staticArray$ebnf$1$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "staticArray$ebnf$1$subexpression$1$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "staticArray$ebnf$1$subexpression$1$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "staticArray$ebnf$1$subexpression$1", "symbols": ["staticObject", "staticArray$ebnf$1$subexpression$1$ebnf$1", "staticArray$ebnf$1$subexpression$1$ebnf$2"]},
    {"name": "staticArray$ebnf$1", "symbols": ["staticArray$ebnf$1$subexpression$1"]},
    {"name": "staticArray$ebnf$1$subexpression$2$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "staticArray$ebnf$1$subexpression$2$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "staticArray$ebnf$1$subexpression$2$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "staticArray$ebnf$1$subexpression$2$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "staticArray$ebnf$1$subexpression$2", "symbols": ["staticObject", "staticArray$ebnf$1$subexpression$2$ebnf$1", "staticArray$ebnf$1$subexpression$2$ebnf$2"]},
    {"name": "staticArray$ebnf$1", "symbols": ["staticArray$ebnf$1", "staticArray$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "staticArray", "symbols": [(lexer.has("lbracket") ? {type: "lbracket"} : lbracket), (lexer.has("_") ? {type: "_"} : _), "staticArray$ebnf$1", (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbracket") ? {type: "rbracket"} : rbracket)], "postprocess": staticArrayToHex},
    {"name": "staticObject", "symbols": ["staticInt"], "postprocess": id},
    {"name": "staticObject", "symbols": ["staticString"], "postprocess": id},
    {"name": "primBare$ebnf$1", "symbols": []},
    {"name": "primBare$ebnf$1", "symbols": ["primBare$ebnf$1", (lexer.has("_") ? {type: "_"} : _)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "primBare", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), (lexer.has("_") ? {type: "_"} : _), {"literal":"\"prim\""}, "primBare$ebnf$1", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("_") ? {type: "_"} : _), (lexer.has("keyword") ? {type: "keyword"} : keyword), (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": primBareToHex},
    {"name": "primArg$ebnf$1", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArg$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primArg$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArg$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primArg$ebnf$3$subexpression$1$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "primArg$ebnf$3$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primArg$ebnf$3$subexpression$1$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArg$ebnf$3$subexpression$1$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primArg$ebnf$3$subexpression$1", "symbols": ["any", "primArg$ebnf$3$subexpression$1$ebnf$1", "primArg$ebnf$3$subexpression$1$ebnf$2"]},
    {"name": "primArg$ebnf$3", "symbols": ["primArg$ebnf$3$subexpression$1"]},
    {"name": "primArg$ebnf$3$subexpression$2$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "primArg$ebnf$3$subexpression$2$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primArg$ebnf$3$subexpression$2$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArg$ebnf$3$subexpression$2$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primArg$ebnf$3$subexpression$2", "symbols": ["any", "primArg$ebnf$3$subexpression$2$ebnf$1", "primArg$ebnf$3$subexpression$2$ebnf$2"]},
    {"name": "primArg$ebnf$3", "symbols": ["primArg$ebnf$3", "primArg$ebnf$3$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "primArg", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), (lexer.has("_") ? {type: "_"} : _), {"literal":"\"prim\""}, "primArg$ebnf$1", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("_") ? {type: "_"} : _), (lexer.has("keyword") ? {type: "keyword"} : keyword), (lexer.has("comma") ? {type: "comma"} : comma), (lexer.has("_") ? {type: "_"} : _), {"literal":"\"args\""}, "primArg$ebnf$2", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("_") ? {type: "_"} : _), (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), (lexer.has("_") ? {type: "_"} : _), "primArg$ebnf$3", (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbracket") ? {type: "rbracket"} : rbracket), (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": primArgToHex},
    {"name": "primAnn$ebnf$1", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primAnn$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primAnn$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primAnn$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primAnn$ebnf$3$subexpression$1$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "primAnn$ebnf$3$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primAnn$ebnf$3$subexpression$1$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primAnn$ebnf$3$subexpression$1$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primAnn$ebnf$3$subexpression$1", "symbols": [(lexer.has("text") ? {type: "text"} : text), "primAnn$ebnf$3$subexpression$1$ebnf$1", "primAnn$ebnf$3$subexpression$1$ebnf$2"]},
    {"name": "primAnn$ebnf$3", "symbols": ["primAnn$ebnf$3$subexpression$1"]},
    {"name": "primAnn$ebnf$3$subexpression$2$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "primAnn$ebnf$3$subexpression$2$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primAnn$ebnf$3$subexpression$2$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primAnn$ebnf$3$subexpression$2$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primAnn$ebnf$3$subexpression$2", "symbols": [(lexer.has("text") ? {type: "text"} : text), "primAnn$ebnf$3$subexpression$2$ebnf$1", "primAnn$ebnf$3$subexpression$2$ebnf$2"]},
    {"name": "primAnn$ebnf$3", "symbols": ["primAnn$ebnf$3", "primAnn$ebnf$3$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "primAnn", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), (lexer.has("_") ? {type: "_"} : _), {"literal":"\"prim\""}, "primAnn$ebnf$1", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("_") ? {type: "_"} : _), (lexer.has("keyword") ? {type: "keyword"} : keyword), (lexer.has("comma") ? {type: "comma"} : comma), (lexer.has("_") ? {type: "_"} : _), {"literal":"\"annots\""}, "primAnn$ebnf$2", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("_") ? {type: "_"} : _), (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), (lexer.has("_") ? {type: "_"} : _), "primAnn$ebnf$3", (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbracket") ? {type: "rbracket"} : rbracket), (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": primAnnToHex},
    {"name": "primArgAnn$ebnf$1", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArgAnn$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primArgAnn$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArgAnn$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primArgAnn$ebnf$3$subexpression$1$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "primArgAnn$ebnf$3$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primArgAnn$ebnf$3$subexpression$1$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArgAnn$ebnf$3$subexpression$1$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primArgAnn$ebnf$3$subexpression$1", "symbols": ["primBare", "primArgAnn$ebnf$3$subexpression$1$ebnf$1", "primArgAnn$ebnf$3$subexpression$1$ebnf$2"]},
    {"name": "primArgAnn$ebnf$3", "symbols": ["primArgAnn$ebnf$3$subexpression$1"]},
    {"name": "primArgAnn$ebnf$3$subexpression$2$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "primArgAnn$ebnf$3$subexpression$2$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primArgAnn$ebnf$3$subexpression$2$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArgAnn$ebnf$3$subexpression$2$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primArgAnn$ebnf$3$subexpression$2", "symbols": ["primBare", "primArgAnn$ebnf$3$subexpression$2$ebnf$1", "primArgAnn$ebnf$3$subexpression$2$ebnf$2"]},
    {"name": "primArgAnn$ebnf$3", "symbols": ["primArgAnn$ebnf$3", "primArgAnn$ebnf$3$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "primArgAnn$ebnf$4", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArgAnn$ebnf$4", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primArgAnn$ebnf$5$subexpression$1$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "primArgAnn$ebnf$5$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primArgAnn$ebnf$5$subexpression$1$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArgAnn$ebnf$5$subexpression$1$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primArgAnn$ebnf$5$subexpression$1", "symbols": [(lexer.has("text") ? {type: "text"} : text), "primArgAnn$ebnf$5$subexpression$1$ebnf$1", "primArgAnn$ebnf$5$subexpression$1$ebnf$2"]},
    {"name": "primArgAnn$ebnf$5", "symbols": ["primArgAnn$ebnf$5$subexpression$1"]},
    {"name": "primArgAnn$ebnf$5$subexpression$2$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "primArgAnn$ebnf$5$subexpression$2$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primArgAnn$ebnf$5$subexpression$2$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArgAnn$ebnf$5$subexpression$2$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primArgAnn$ebnf$5$subexpression$2", "symbols": [(lexer.has("text") ? {type: "text"} : text), "primArgAnn$ebnf$5$subexpression$2$ebnf$1", "primArgAnn$ebnf$5$subexpression$2$ebnf$2"]},
    {"name": "primArgAnn$ebnf$5", "symbols": ["primArgAnn$ebnf$5", "primArgAnn$ebnf$5$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "primArgAnn", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), (lexer.has("_") ? {type: "_"} : _), {"literal":"\"prim\""}, "primArgAnn$ebnf$1", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("_") ? {type: "_"} : _), (lexer.has("keyword") ? {type: "keyword"} : keyword), (lexer.has("comma") ? {type: "comma"} : comma), (lexer.has("_") ? {type: "_"} : _), {"literal":"\"args\""}, "primArgAnn$ebnf$2", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("_") ? {type: "_"} : _), (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), (lexer.has("_") ? {type: "_"} : _), "primArgAnn$ebnf$3", (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbracket") ? {type: "rbracket"} : rbracket), (lexer.has("comma") ? {type: "comma"} : comma), (lexer.has("_") ? {type: "_"} : _), {"literal":"\"annots\""}, "primArgAnn$ebnf$4", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("_") ? {type: "_"} : _), (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), (lexer.has("_") ? {type: "_"} : _), "primArgAnn$ebnf$5", (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbracket") ? {type: "rbracket"} : rbracket), (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": primArgAnnToHex},
    {"name": "primAny", "symbols": ["primBare"], "postprocess": id},
    {"name": "primAny", "symbols": ["primArg"], "postprocess": id},
    {"name": "primAny", "symbols": ["primAnn"], "postprocess": id},
    {"name": "primAny", "symbols": ["primArgAnn"], "postprocess": id},
    {"name": "primArray$ebnf$1$subexpression$1$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "primArray$ebnf$1$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primArray$ebnf$1$subexpression$1$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArray$ebnf$1$subexpression$1$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primArray$ebnf$1$subexpression$1", "symbols": ["primAny", "primArray$ebnf$1$subexpression$1$ebnf$1", "primArray$ebnf$1$subexpression$1$ebnf$2"]},
    {"name": "primArray$ebnf$1", "symbols": ["primArray$ebnf$1$subexpression$1"]},
    {"name": "primArray$ebnf$1$subexpression$2$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "primArray$ebnf$1$subexpression$2$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primArray$ebnf$1$subexpression$2$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArray$ebnf$1$subexpression$2$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primArray$ebnf$1$subexpression$2", "symbols": ["primAny", "primArray$ebnf$1$subexpression$2$ebnf$1", "primArray$ebnf$1$subexpression$2$ebnf$2"]},
    {"name": "primArray$ebnf$1", "symbols": ["primArray$ebnf$1", "primArray$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "primArray", "symbols": [(lexer.has("lbracket") ? {type: "lbracket"} : lbracket), (lexer.has("_") ? {type: "_"} : _), "primArray$ebnf$1", (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbracket") ? {type: "rbracket"} : rbracket)], "postprocess": staticArrayToHex},
    {"name": "any", "symbols": ["primAny"], "postprocess": id},
    {"name": "any", "symbols": ["staticObject"], "postprocess": id},
    {"name": "any", "symbols": ["primArray"], "postprocess": id},
    {"name": "any", "symbols": ["staticArray"], "postprocess": id}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
