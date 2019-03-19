@{%
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
    const prefix = (d[15].length == 1 ? '05' : '07');
    const prim = MichelineKeywords.indexOf(d[6].toString()).toString(16);
    const args =  d[15].map(v => v[0]).join('')
    return prefix + prim + args;
}

const primArgAnnToHex = d => {
    const prefix = (d[15].length == 1 ? '06' : '08')
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

%}
