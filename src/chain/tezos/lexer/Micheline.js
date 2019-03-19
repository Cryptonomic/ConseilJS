// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

const moo = require("moo");
const util = require('util');

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


/** Encode an int value
 * 
 * 
 */
const staticIntToHex = d => {
    return '00' + parseInt(d[6]).toString(16);
};

const staticStringToHex = d => {
    let text = d[6].toString();
    text = text.substring(1, text.length - 1); // strip double quotes
    return '01' + ('0000000' + text.length.toString(16)).slice(-8) + text.split('').map(c => c.charCodeAt(0).toString(16)).join('');
};

const staticArrayToHex = d => {
    let matchedArray = d[2]; // data array starts at position 2 after the opening bracket "[ "
    return '02' + ('0000000' + matchedArray.length.toString(16)).slice(-8) + matchedArray.map(a => a[0]).join('');
};

const primBareToHex = d => {
    //const keywords = lexer.groups.filter(g => g.defaultType === 'keyword')[0].match;
    return '03' + MichelineKeywords.indexOf(d[6].toString()).toString(16);
}

const primAnnToHex = d => {
    let text = d[15].map(v => {
            let t = v[0].toString();
            t = t.substring(1, t.length - 1); // strip double quotes
            t = t.split('').map(c => c.charCodeAt(0).toString(16)).join(''); // to hex
            t = ('0000000' + (t.length/2).toString(16)).slice(-8).toString(16) + t; // prepend length
            return t;
        });

    return '04' + MichelineKeywords.indexOf(d[6].toString()).toString(16) + text;
}

const primArgToHex = d => {
    return (d[15].length == 1 ? '05' : '07') + MichelineKeywords.indexOf(d[6].toString()).toString(16) + d[15].map(v => v[0]).join('');
}

const primArgAnnToHex = d => {
    console.log(`'${util.inspect(d[26], false, null, false)}'`)
    const prefix = '06';
    const prim = MichelineKeywords.indexOf(d[6].toString()).toString(16);
    const args = d[15].map(v => v[0]).join('');
    const ann = d[26].map(v => {
            let t = v[0].toString();
            t = t.substring(1, t.length - 1); // strip double quotes
            t = t.split('').map(c => c.charCodeAt(0).toString(16)).join(''); // to hex
            t = ('0000000' + (t.length/2).toString(16)).slice(-8).toString(16) + t; // prepend length
            return t;
        });

    return prefix + prim + args + ann;
}

//console.log(`'${util.inspect(d[15], false, null, false)}'`)

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
    {"name": "primArg$ebnf$3$subexpression$1", "symbols": ["primBare", "primArg$ebnf$3$subexpression$1$ebnf$1", "primArg$ebnf$3$subexpression$1$ebnf$2"]},
    {"name": "primArg$ebnf$3", "symbols": ["primArg$ebnf$3$subexpression$1"]},
    {"name": "primArg$ebnf$3$subexpression$2$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "primArg$ebnf$3$subexpression$2$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primArg$ebnf$3$subexpression$2$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "primArg$ebnf$3$subexpression$2$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "primArg$ebnf$3$subexpression$2", "symbols": ["primBare", "primArg$ebnf$3$subexpression$2$ebnf$1", "primArg$ebnf$3$subexpression$2$ebnf$2"]},
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
    {"name": "primArgAnn", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), (lexer.has("_") ? {type: "_"} : _), {"literal":"\"prim\""}, "primArgAnn$ebnf$1", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("_") ? {type: "_"} : _), (lexer.has("keyword") ? {type: "keyword"} : keyword), (lexer.has("comma") ? {type: "comma"} : comma), (lexer.has("_") ? {type: "_"} : _), {"literal":"\"args\""}, "primArgAnn$ebnf$2", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("_") ? {type: "_"} : _), (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), (lexer.has("_") ? {type: "_"} : _), "primArgAnn$ebnf$3", (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbracket") ? {type: "rbracket"} : rbracket), (lexer.has("comma") ? {type: "comma"} : comma), (lexer.has("_") ? {type: "_"} : _), {"literal":"\"annots\""}, "primArgAnn$ebnf$4", (lexer.has("colon") ? {type: "colon"} : colon), (lexer.has("_") ? {type: "_"} : _), (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), (lexer.has("_") ? {type: "_"} : _), "primArgAnn$ebnf$5", (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbracket") ? {type: "rbracket"} : rbracket), (lexer.has("_") ? {type: "_"} : _), (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": primArgAnnToHex}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
