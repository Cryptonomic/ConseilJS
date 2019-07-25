"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function id(d) { return d[0]; }
const moo = require("moo");
const lexer = moo.compile({
    wspace: /[ \t]+/,
    lparen: '(',
    rparen: ')',
    annot: /:[^ );]+|%[^ );]+/,
    parameter: 'parameter',
    or: 'or',
    pair: 'pair',
    data: ['int', 'nat', 'bool', 'string', 'timestamp', 'signature', 'key', 'key_hash', 'mutez', 'address', 'unit'],
    singleArgType: ['option', 'list', 'contract'],
    semicolon: ';'
});
const breakParameter = (d) => { return d[2]; };
const splitOrWithAnnot = (d) => {
    let result = [];
    const leftBranch = d[6];
    const rightBranch = d[8];
    for (let leftNode of leftBranch) {
        let leftEntrypoint = {
            name: leftNode.name,
            parameters: leftNode.parameters,
            structure: '(Left ' + leftNode.structure + ')'
        };
        result.push(leftEntrypoint);
    }
    for (let rightNode of rightBranch) {
        let rightEntrypoint = {
            name: rightNode.name,
            parameters: rightNode.parameters,
            structure: '(Right ' + rightNode.structure + ')'
        };
        result.push(rightEntrypoint);
    }
    return result;
};
const splitOr = (d) => {
    let result = [];
    const leftBranch = d[4];
    const rightBranch = d[6];
    for (let leftNode of leftBranch) {
        let leftEntrypoint = {
            name: leftNode.name,
            parameters: leftNode.parameters,
            structure: '(Left ' + leftNode.structure + ')'
        };
        result.push(leftEntrypoint);
    }
    for (let rightNode of rightBranch) {
        let rightEntrypoint = {
            name: rightNode.name,
            parameters: rightNode.parameters,
            structure: '(Right ' + rightNode.structure + ')'
        };
        result.push(rightEntrypoint);
    }
    return result;
};
const processPairWithAnnot = (d) => {
    const annot = d[4];
    const firstElement = d[6];
    const secondElement = d[8];
    const entrypoints = firstElement.concat(secondElement);
    let pairedEntrypoint = {
        name: annot.toString(),
        parameters: [],
        structure: `(Pair ${annot} ${d[6][0].structure} ${d[8][0].structure})`
    };
    for (let entrypoint of entrypoints) {
        pairedEntrypoint.parameters = pairedEntrypoint.parameters.concat(entrypoint.parameters);
    }
    return [pairedEntrypoint];
};
const processPair = (d) => {
    const firstElement = d[4];
    const secondElement = d[6];
    const entrypoints = firstElement.concat(secondElement);
    let pairedEntrypoint = {
        name: "",
        parameters: [],
        structure: `(Pair ${d[4][0].structure} ${d[6][0].structure})`
    };
    for (let entrypoint of entrypoints) {
        pairedEntrypoint.parameters = pairedEntrypoint.parameters.concat(entrypoint.parameters);
    }
    return [pairedEntrypoint];
};
const recordSingleArgTypeWithAnnot = (d) => {
    const singleArgType = d[0].toString();
    const annot = d[2].toString();
    const entrypoints = d[4];
    entrypoints[0].parameters[0].name = annot;
    entrypoints[0].parameters[0].type = `${singleArgType} (${entrypoints[0].parameters[0].type})`;
    entrypoints[0].structure = `(${singleArgType} ${annot} ${entrypoints[0].structure})`;
    return entrypoints;
};
const recordSingleArgType = (d) => {
    const singleArgType = d[0].toString();
    const entrypoints = d[2];
    entrypoints[0].parameters[0].type = `${singleArgType} (${entrypoints[0].parameters[0].type})`;
    entrypoints[0].structure = `(${singleArgType} ${entrypoints[0].structure})`;
    return entrypoints;
};
const stripParen = (d) => { return d[2]; };
const recordDataWithAnnot = (d) => {
    let parameter = {
        name: d[2].toString(),
        type: d[0].toString()
    };
    let entrypoint = {
        name: "",
        parameters: [parameter],
        structure: `(${d[0]} ${d[2]})`
    };
    return [entrypoint];
};
const recordData = (d) => {
    let parameter = {
        name: undefined,
        type: d[0].toString()
    };
    let entrypoint = {
        name: "",
        parameters: [parameter],
        structure: `(${d[0]})`
    };
    return [entrypoint];
};
;
;
;
exports.Lexer = lexer;
exports.ParserRules = [
    { "name": "entry", "symbols": [(lexer.has("parameter") ? { type: "parameter" } : parameter), "_", "parameters", "_", (lexer.has("semicolon") ? { type: "semicolon" } : semicolon)], "postprocess": breakParameter },
    { "name": "parameters", "symbols": [(lexer.has("lparen") ? { type: "lparen" } : lparen), "_", (lexer.has("or") ? { type: "or" } : or), "_", (lexer.has("annot") ? { type: "annot" } : annot), "_", "parameters", "_", "parameters", "_", (lexer.has("rparen") ? { type: "rparen" } : rparen)], "postprocess": splitOrWithAnnot },
    { "name": "parameters", "symbols": [(lexer.has("lparen") ? { type: "lparen" } : lparen), "_", (lexer.has("or") ? { type: "or" } : or), "_", "parameters", "_", "parameters", "_", (lexer.has("rparen") ? { type: "rparen" } : rparen)], "postprocess": splitOr },
    { "name": "parameters", "symbols": [(lexer.has("lparen") ? { type: "lparen" } : lparen), "_", (lexer.has("pair") ? { type: "pair" } : pair), "_", (lexer.has("annot") ? { type: "annot" } : annot), "_", "parameters", "_", "parameters", "_", (lexer.has("rparen") ? { type: "rparen" } : rparen)], "postprocess": processPairWithAnnot },
    { "name": "parameters", "symbols": [(lexer.has("lparen") ? { type: "lparen" } : lparen), "_", (lexer.has("pair") ? { type: "pair" } : pair), "_", "parameters", "_", "parameters", "_", (lexer.has("rparen") ? { type: "rparen" } : rparen)], "postprocess": processPair },
    { "name": "parameters", "symbols": [(lexer.has("singleArgType") ? { type: "singleArgType" } : singleArgType), "_", (lexer.has("annot") ? { type: "annot" } : annot), "_", "parameters"], "postprocess": recordSingleArgTypeWithAnnot },
    { "name": "parameters", "symbols": [(lexer.has("singleArgType") ? { type: "singleArgType" } : singleArgType), "_", "parameters"], "postprocess": recordSingleArgType },
    { "name": "parameters", "symbols": [(lexer.has("lparen") ? { type: "lparen" } : lparen), "_", "parameters", "_", (lexer.has("rparen") ? { type: "rparen" } : rparen)], "postprocess": stripParen },
    { "name": "parameters", "symbols": [(lexer.has("data") ? { type: "data" } : data), "_", (lexer.has("annot") ? { type: "annot" } : annot)], "postprocess": recordDataWithAnnot },
    { "name": "parameters", "symbols": [(lexer.has("data") ? { type: "data" } : data)], "postprocess": recordData },
    { "name": "_$ebnf$1", "symbols": [] },
    { "name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": (d) => d[0].concat([d[1]]) },
    { "name": "_", "symbols": ["_$ebnf$1"] }
];
exports.ParserStart = "entry";
//# sourceMappingURL=ContractParameterParser.js.map