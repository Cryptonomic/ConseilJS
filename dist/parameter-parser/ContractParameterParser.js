"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function id(d) { return d[0]; }
const moo = require("moo");
const lexer = moo.compile({
    wspace: /[ \t]+/,
    lparen: '(',
    rparen: ')',
    annot: /:[^ )]+|%[^ )]+/,
    parameter: 'parameter',
    or: 'or',
    pair: 'pair',
    data: ['int', 'nat', 'bool', 'string', 'timestamp', 'signature', 'key', 'key_hash', 'mutez', 'address', 'unit'],
    singleArgType: ['option', 'list', 'contract'],
    semicolon: ';'
});
const breakParameter = (d) => { return d[2]; };
const recordData = (d) => { return [`([${d[0]}!${d[2]}])`]; };
const recordSingleArgType = (d) => { return `([${d[0]} ${d[2]} ${d[4]}])`; };
const stripParen = (d) => { return [d[2]]; };
const processPair = (d) => {
    if (d[4] === null) {
        return [`(Pair ${d[6]} ${d[8]})`];
    }
    else {
        return [`(Pair ${d[4]} ${d[6]} ${d[8]})`];
    }
};
const splitOr = (d) => {
    let result = [];
    const leftBranch = d[6];
    const rightBranch = d[8];
    for (let leftNode of leftBranch) {
        result.push('(Left ' + leftNode + ')');
    }
    for (let rightNode of rightBranch) {
        result.push('(Right ' + rightNode + ')');
    }
    return result;
};
;
;
;
exports.Lexer = lexer;
exports.ParserRules = [
    { "name": "entry", "symbols": [(lexer.has("parameter") ? { type: "parameter" } : parameter), "_", "parameters", "_", (lexer.has("semicolon") ? { type: "semicolon" } : semicolon)], "postprocess": breakParameter },
    { "name": "parameters$ebnf$1", "symbols": [(lexer.has("annot") ? { type: "annot" } : annot)], "postprocess": id },
    { "name": "parameters$ebnf$1", "symbols": [], "postprocess": () => null },
    { "name": "parameters", "symbols": [(lexer.has("data") ? { type: "data" } : data), "_", "parameters$ebnf$1"], "postprocess": recordData },
    { "name": "parameters$ebnf$2", "symbols": [(lexer.has("annot") ? { type: "annot" } : annot)], "postprocess": id },
    { "name": "parameters$ebnf$2", "symbols": [], "postprocess": () => null },
    { "name": "parameters", "symbols": [(lexer.has("singleArgType") ? { type: "singleArgType" } : singleArgType), "_", "parameters$ebnf$2", "_", "parameters"], "postprocess": recordSingleArgType },
    { "name": "parameters$ebnf$3", "symbols": [(lexer.has("annot") ? { type: "annot" } : annot)], "postprocess": id },
    { "name": "parameters$ebnf$3", "symbols": [], "postprocess": () => null },
    { "name": "parameters", "symbols": [(lexer.has("lparen") ? { type: "lparen" } : lparen), "_", (lexer.has("pair") ? { type: "pair" } : pair), "_", "parameters$ebnf$3", "_", "parameters", "_", "parameters", "_", (lexer.has("rparen") ? { type: "rparen" } : rparen)], "postprocess": processPair },
    { "name": "parameters$ebnf$4", "symbols": [(lexer.has("annot") ? { type: "annot" } : annot)], "postprocess": id },
    { "name": "parameters$ebnf$4", "symbols": [], "postprocess": () => null },
    { "name": "parameters", "symbols": [(lexer.has("lparen") ? { type: "lparen" } : lparen), "_", (lexer.has("or") ? { type: "or" } : or), "_", "parameters$ebnf$4", "_", "parameters", "_", "parameters", "_", (lexer.has("rparen") ? { type: "rparen" } : rparen)], "postprocess": splitOr },
    { "name": "parameters", "symbols": [(lexer.has("lparen") ? { type: "lparen" } : lparen), "_", "parameters", "_", (lexer.has("rparen") ? { type: "rparen" } : rparen)], "postprocess": stripParen },
    { "name": "_$ebnf$1", "symbols": [] },
    { "name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": (d) => d[0].concat([d[1]]) },
    { "name": "_", "symbols": ["_$ebnf$1"] }
];
exports.ParserStart = "entry";
//# sourceMappingURL=ContractParameterParser.js.map