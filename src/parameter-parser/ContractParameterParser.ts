// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var parameter: any;
declare var semicolon: any;
declare var lparen: any;
declare var or: any;
declare var annot: any;
declare var rparen: any;
declare var pair: any;
declare var singleArgType: any;
declare var data: any;

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


    interface Parameter {
      name?: string,
      type: string
    }

    interface Entrypoint {
      name: string,
      parameters: Parameter[],
      structure: string
    }

    const breakParameter = (d: any): Entrypoint[] => { return d[2]; }

    const splitOrWithAnnot = (d: any): Entrypoint[] => {
        let result: Entrypoint[] = [];
        const leftBranch: Entrypoint[] = d[6];
        const rightBranch: Entrypoint[] = d[8];

        for (let leftNode of leftBranch) {
            let leftEntrypoint: Entrypoint = {
                name: leftNode.name,
                parameters: leftNode.parameters,
                structure: '(Left ' + leftNode.structure + ')'
            }
            result.push(leftEntrypoint);
        }
        for (let rightNode of rightBranch) {
            let rightEntrypoint: Entrypoint = {
                name: rightNode.name,
                parameters: rightNode.parameters,
                structure: '(Right ' + rightNode.structure + ')'
            }
            result.push(rightEntrypoint);
        }
        return result;
    }

    const splitOr = (d: any): Entrypoint[] => {
        let result: Entrypoint[] = [];
        const leftBranch: Entrypoint[] = d[4];
        const rightBranch: Entrypoint[] = d[6];

        for (let leftNode of leftBranch) {
            let leftEntrypoint: Entrypoint = {
                name: leftNode.name,
                parameters: leftNode.parameters,
                structure: '(Left ' + leftNode.structure + ')'
            }
            result.push(leftEntrypoint);
        }
        for (let rightNode of rightBranch) {
            let rightEntrypoint: Entrypoint = {
                name: rightNode.name,
                parameters: rightNode.parameters,
                structure: '(Right ' + rightNode.structure + ')'
            }
            result.push(rightEntrypoint);
        }
        return result;
    }

    const processPairWithAnnot = (d: any): Entrypoint[] => {
        const annot: string = d[4];
        const firstElement: Entrypoint[] = d[6];
        const secondElement: Entrypoint[] = d[8];
        const entrypoints: Entrypoint[] = firstElement.concat(secondElement);

        let pairedEntrypoint: Entrypoint = {
            name: annot.toString(),
            parameters: [],
            structure: `(Pair ${annot} ${d[6][0].structure} ${d[8][0].structure})`
        }

        for (let entrypoint of entrypoints) {
            pairedEntrypoint.parameters = pairedEntrypoint.parameters.concat(entrypoint.parameters);
        }

        return [pairedEntrypoint];
    }

    const processPair = (d: any): Entrypoint[] => {
        const firstElement: Entrypoint[] = d[4];
        const secondElement: Entrypoint[] = d[6];
        const entrypoints: Entrypoint[] = firstElement.concat(secondElement);

        let pairedEntrypoint: Entrypoint = {
            name: "",
            parameters: [],
            structure: `(Pair ${d[4][0].structure} ${d[6][0].structure})`
        }

        for (let entrypoint of entrypoints) {

            pairedEntrypoint.parameters = pairedEntrypoint.parameters.concat(entrypoint.parameters);
        }

        return [pairedEntrypoint];
    }

    const recordSingleArgTypeWithAnnot = (d: any): Entrypoint[] => {
        const singleArgType: string = d[0].toString();
        const annot: string = d[2].toString();
        const entrypoints: Entrypoint[] = d[4];

        entrypoints[0].parameters[0].name = annot;
        entrypoints[0].parameters[0].type = `${singleArgType} (${entrypoints[0].parameters[0].type})`;
        entrypoints[0].structure = `(${singleArgType} ${annot} ${entrypoints[0].structure})`;

        return entrypoints;
    }
    const recordSingleArgType = (d: any): Entrypoint[] => {
        const singleArgType: string = d[0].toString();
        const entrypoints: Entrypoint[] = d[2];

        entrypoints[0].parameters[0].type = `${singleArgType} (${entrypoints[0].parameters[0].type})`;
        entrypoints[0].structure = `(${singleArgType} ${entrypoints[0].structure})`;

        return entrypoints;
    }

    const stripParen = (d: any): Entrypoint[] => { return d[2]; }

    const recordDataWithAnnot = (d: string[]): Entrypoint[] => { 
        let parameter: Parameter = {
            name: d[2].toString(),
            type: d[0].toString()
        }
        let entrypoint: Entrypoint = {
            name: "",
            parameters: [parameter],
            structure: `(${d[0]} ${d[2]})`
        }
        return [entrypoint];
    }

    const recordData = (d: string[]): Entrypoint[] => { 
        let parameter: Parameter = {
            name: undefined,
            type: d[0].toString()
        }
        let entrypoint: Entrypoint = {
            name: "",
            parameters: [parameter],
            structure: `(${d[0]})`
        }
        return [entrypoint];
    }

export interface Token { value: any; [key: string]: any };

export interface Lexer {
  reset: (chunk: string, info: any) => void;
  next: () => Token | undefined;
  save: () => any;
  formatError: (token: Token) => string;
  has: (tokenType: string) => boolean
};

export interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any
};

export type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

export var Lexer: Lexer | undefined = lexer;

export var ParserRules: NearleyRule[] = [
    {"name": "entry", "symbols": [(lexer.has("parameter") ? {type: "parameter"} : parameter), "_", "parameters", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon)], "postprocess": breakParameter},
    {"name": "parameters", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("or") ? {type: "or"} : or), "_", (lexer.has("annot") ? {type: "annot"} : annot), "_", "parameters", "_", "parameters", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": splitOrWithAnnot},
    {"name": "parameters", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("or") ? {type: "or"} : or), "_", "parameters", "_", "parameters", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": splitOr},
    {"name": "parameters", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("pair") ? {type: "pair"} : pair), "_", (lexer.has("annot") ? {type: "annot"} : annot), "_", "parameters", "_", "parameters", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": processPairWithAnnot},
    {"name": "parameters", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("pair") ? {type: "pair"} : pair), "_", "parameters", "_", "parameters", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": processPair},
    {"name": "parameters", "symbols": [(lexer.has("singleArgType") ? {type: "singleArgType"} : singleArgType), "_", (lexer.has("annot") ? {type: "annot"} : annot), "_", "parameters"], "postprocess": recordSingleArgTypeWithAnnot},
    {"name": "parameters", "symbols": [(lexer.has("singleArgType") ? {type: "singleArgType"} : singleArgType), "_", "parameters"], "postprocess": recordSingleArgType},
    {"name": "parameters", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "parameters", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": stripParen},
    {"name": "parameters", "symbols": [(lexer.has("data") ? {type: "data"} : data), "_", (lexer.has("annot") ? {type: "annot"} : annot)], "postprocess": recordDataWithAnnot},
    {"name": "parameters", "symbols": [(lexer.has("data") ? {type: "data"} : data)], "postprocess": recordData},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "_", "symbols": ["_$ebnf$1"]}
];

export var ParserStart: string = "entry";
