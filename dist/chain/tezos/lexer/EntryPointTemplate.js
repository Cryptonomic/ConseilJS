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
const branchOrWithAnnot = (d) => {
    const leftEntryPoints = d[6];
    const rightEntryPoints = d[8];
    const branchedEntryPoints = [];
    for (const leftEntryPoint of leftEntryPoints) {
        const branchedEntryPoint = {
            name: leftEntryPoint.name,
            parameters: leftEntryPoint.parameters,
            structure: '(Left ' + leftEntryPoint.structure + ')',
            generateParameter: leftEntryPoint.generateParameter
        };
        branchedEntryPoints.push(branchedEntryPoint);
    }
    for (const rightEntryPoint of rightEntryPoints) {
        const branchedEntryPoint = {
            name: rightEntryPoint.name,
            parameters: rightEntryPoint.parameters,
            structure: '(Right ' + rightEntryPoint.structure + ')',
            generateParameter: rightEntryPoint.generateParameter
        };
        branchedEntryPoints.push(branchedEntryPoint);
    }
    return branchedEntryPoints;
};
const branchOr = (d) => {
    const leftEntryPoints = d[4];
    const rightEntryPoints = d[6];
    const branchedEntryPoints = [];
    for (const leftEntryPoint of leftEntryPoints) {
        const branchedEntryPoint = {
            name: leftEntryPoint.name,
            parameters: leftEntryPoint.parameters,
            structure: '(Left ' + leftEntryPoint.structure + ')',
            generateParameter: leftEntryPoint.generateParameter
        };
        branchedEntryPoints.push(branchedEntryPoint);
    }
    for (const rightEntryPoint of rightEntryPoints) {
        const branchedEntryPoint = {
            name: rightEntryPoint.name,
            parameters: rightEntryPoint.parameters,
            structure: '(Right ' + rightEntryPoint.structure + ')',
            generateParameter: rightEntryPoint.generateParameter
        };
        branchedEntryPoints.push(branchedEntryPoint);
    }
    return branchedEntryPoints;
};
const mergePairWithAnnot = (d) => {
    const annot = d[4];
    const firstEntryPoints = d[6];
    const secondEntryPoints = d[8];
    const pairedEntryPoints = [];
    for (const firstEntryPoint of firstEntryPoints) {
        for (const secondEntryPoint of secondEntryPoints) {
            const pairedEntryPoint = {
                name: annot.toString(),
                parameters: firstEntryPoint.parameters.concat(secondEntryPoint.parameters),
                structure: `(Pair ${firstEntryPoint.structure} ${secondEntryPoint.structure})`,
                generateParameter: firstEntryPoint.generateParameter
            };
            pairedEntryPoints.push(pairedEntryPoint);
        }
    }
    return pairedEntryPoints;
};
const mergePair = (d) => {
    const firstEntryPoints = d[4];
    const secondEntryPoints = d[6];
    const pairedEntryPoints = [];
    for (const firstEntryPoint of firstEntryPoints) {
        for (const secondEntryPoint of secondEntryPoints) {
            let pairedEntryPointName = undefined;
            if (firstEntryPoint.name != undefined) {
                pairedEntryPointName = firstEntryPoint.name;
            }
            else if (secondEntryPoint.name != undefined) {
                pairedEntryPointName = secondEntryPoint.name;
            }
            const pairedEntryPoint = {
                name: pairedEntryPointName,
                parameters: firstEntryPoint.parameters.concat(secondEntryPoint.parameters),
                structure: `(Pair ${firstEntryPoint.structure} ${secondEntryPoint.structure})`,
                generateParameter: firstEntryPoint.generateParameter
            };
            pairedEntryPoints.push(pairedEntryPoint);
        }
    }
    return pairedEntryPoints;
};
const recordSingleArgTypeWithAnnot = (d) => {
    const singleArgType = d[0].toString();
    const annot = d[2].toString();
    const entryPoints = d[4];
    entryPoints[0].parameters[0].name = annot;
    entryPoints[0].parameters[0].type = `${singleArgType} (${entryPoints[0].parameters[0].type})`;
    entryPoints[0].structure = `(${entryPoints[0].structure})`;
    return entryPoints;
};
const recordSingleArgType = (d) => {
    const singleArgType = d[0].toString();
    const entryPoints = d[2];
    entryPoints[0].parameters[0].type = `${singleArgType} (${entryPoints[0].parameters[0].type})`;
    entryPoints[0].structure = `(${entryPoints[0].structure})`;
    return entryPoints;
};
const stripParen = (d) => { return d[2]; };
const recordDataWithAnnot = (d) => {
    const annot = d[2].toString();
    let parameterName = undefined;
    let entryPointName = undefined;
    if (annot.charAt(0) === '%') {
        entryPointName = annot;
    }
    else {
        parameterName = annot;
    }
    const parameter = {
        name: parameterName,
        type: d[0].toString()
    };
    const entryPoint = {
        name: entryPointName,
        parameters: [parameter],
        structure: '$PARAM',
        generateParameter(...vars) {
            let invocationParameter = this.structure;
            for (let i = 0; i < this.parameters.length; i++) {
                invocationParameter = invocationParameter.replace('$PARAM', vars[i]);
            }
            return invocationParameter;
        }
    };
    return [entryPoint];
};
const recordData = (d) => {
    const parameter = {
        name: undefined,
        type: d[0].toString()
    };
    const entryPoint = {
        name: undefined,
        parameters: [parameter],
        structure: '$PARAM',
        generateParameter(...vars) {
            let invocationParameter = this.structure;
            for (let i = 0; i < this.parameters.length; i++) {
                invocationParameter = invocationParameter.replace('$PARAM', vars[i]);
            }
            return invocationParameter;
        }
    };
    return [entryPoint];
};
;
;
;
exports.Lexer = lexer;
exports.ParserRules = [
    { "name": "entry", "symbols": [(lexer.has("parameter") ? { type: "parameter" } : parameter), "_", "parameters", "_", (lexer.has("semicolon") ? { type: "semicolon" } : semicolon)], "postprocess": breakParameter },
    { "name": "parameters", "symbols": [(lexer.has("lparen") ? { type: "lparen" } : lparen), "_", (lexer.has("or") ? { type: "or" } : or), "_", (lexer.has("annot") ? { type: "annot" } : annot), "_", "parameters", "_", "parameters", "_", (lexer.has("rparen") ? { type: "rparen" } : rparen)], "postprocess": branchOrWithAnnot },
    { "name": "parameters", "symbols": [(lexer.has("lparen") ? { type: "lparen" } : lparen), "_", (lexer.has("or") ? { type: "or" } : or), "_", "parameters", "_", "parameters", "_", (lexer.has("rparen") ? { type: "rparen" } : rparen)], "postprocess": branchOr },
    { "name": "parameters", "symbols": [(lexer.has("lparen") ? { type: "lparen" } : lparen), "_", (lexer.has("pair") ? { type: "pair" } : pair), "_", (lexer.has("annot") ? { type: "annot" } : annot), "_", "parameters", "_", "parameters", "_", (lexer.has("rparen") ? { type: "rparen" } : rparen)], "postprocess": mergePairWithAnnot },
    { "name": "parameters", "symbols": [(lexer.has("lparen") ? { type: "lparen" } : lparen), "_", (lexer.has("pair") ? { type: "pair" } : pair), "_", "parameters", "_", "parameters", "_", (lexer.has("rparen") ? { type: "rparen" } : rparen)], "postprocess": mergePair },
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
//# sourceMappingURL=EntryPointTemplate.js.map