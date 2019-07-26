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
        name?: string;
        type: string;
    }

    interface Entrypoint {
        name?: string;
        parameters: Parameter[];
        structure: string;
        generateParameter?(... vars): string;
    }

    const breakParameter = (d: any): Entrypoint[] => {
        const entrypoints: Entrypoint[] = d[2];
        for (const entrypoint of entrypoints) {
            entrypoint.generateParameter = function(... vars): string {
                let invocationParameter: string = this.structure;
                for (let i = 0 ; i < this.parameters.length; i++) {
                    invocationParameter = invocationParameter.replace('$PARAM', vars[i]);
                }
                return invocationParameter;
            };
        }
        return entrypoints;
    }

    const branchOrWithAnnot = (d: any): Entrypoint[] => {
        const leftEntrypoints: Entrypoint[] = d[6];
        const rightEntrypoints: Entrypoint[] = d[8];
        const branchedEntrypoints: Entrypoint[] = [];

        for (const leftEntrypoint of leftEntrypoints) {
            const branchedEntrypoint: Entrypoint = {
                name: leftEntrypoint.name,
                parameters: leftEntrypoint.parameters,
                structure: '(Left ' + leftEntrypoint.structure + ')'
            }
            branchedEntrypoints.push(branchedEntrypoint);
        }
        for (const rightEntrypoint of rightEntrypoints) {
            const branchedEntrypoint: Entrypoint = {
                name: rightEntrypoint.name,
                parameters: rightEntrypoint.parameters,
                structure: '(Right ' + rightEntrypoint.structure + ')'
            }
            branchedEntrypoints.push(branchedEntrypoint);
        }

        return branchedEntrypoints;
    }

    const branchOr = (d: any): Entrypoint[] => {
        const leftEntrypoints: Entrypoint[] = d[4];
        const rightEntrypoints: Entrypoint[] = d[6];
        const branchedEntrypoints: Entrypoint[] = [];

        for (const leftEntrypoint of leftEntrypoints) {
            const branchedEntrypoint: Entrypoint = {
                name: leftEntrypoint.name,
                parameters: leftEntrypoint.parameters,
                structure: '(Left ' + leftEntrypoint.structure + ')'
            }
            branchedEntrypoints.push(branchedEntrypoint);
        }
        for (const rightEntrypoint of rightEntrypoints) {
            const branchedEntrypoint: Entrypoint = {
                name: rightEntrypoint.name,
                parameters: rightEntrypoint.parameters,
                structure: '(Right ' + rightEntrypoint.structure + ')'
            }
            branchedEntrypoints.push(branchedEntrypoint);
        }

        return branchedEntrypoints;
    }

    const mergePairWithAnnot = (d: any): Entrypoint[] => {
        const annot: string = d[4];
        const firstEntrypoints: Entrypoint[] = d[6];
        const secondEntrypoints: Entrypoint[] = d[8];
        const pairedEntrypoints: Entrypoint[] = [];

        for (const firstEntrypoint of firstEntrypoints) {
            for (const secondEntrypoint of secondEntrypoints) {
                const pairedEntrypoint: Entrypoint = {
                    name: annot.toString(),
                    parameters: firstEntrypoint.parameters.concat(secondEntrypoint.parameters),
                    structure: `(Pair ${annot} ${firstEntrypoint.structure} ${secondEntrypoint.structure})`
                }
                pairedEntrypoints.push(pairedEntrypoint);
            }
        }

        return pairedEntrypoints;
    }

    const mergePair = (d: any): Entrypoint[] => {
        const firstEntrypoints: Entrypoint[] = d[4];
        const secondEntrypoints: Entrypoint[] = d[6];
        const pairedEntrypoints: Entrypoint[] = [];

        for (const firstEntrypoint of firstEntrypoints) {
            for (const secondEntrypoint of secondEntrypoints) {
                const pairedEntrypoint: Entrypoint = {
                    name: undefined,
                    parameters: firstEntrypoint.parameters.concat(secondEntrypoint.parameters),
                    structure: `(Pair ${firstEntrypoint.structure} ${secondEntrypoint.structure})`
                }
                pairedEntrypoints.push(pairedEntrypoint);
            }
        }

        return pairedEntrypoints;
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
        const parameter: Parameter = {
            name: d[2].toString(),
            type: d[0].toString()
        }
        const entrypoint: Entrypoint = {
            name: undefined,
            parameters: [parameter],
            structure: `$PARAM`
        }
        return [entrypoint];
    }

    const recordData = (d: string[]): Entrypoint[] => { 
        const parameter: Parameter = {
            name: undefined,
            type: d[0].toString()
        }
        const entrypoint: Entrypoint = {
            name: undefined,
            parameters: [parameter],
            structure: `$PARAM`
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
    {"name": "parameters", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("or") ? {type: "or"} : or), "_", (lexer.has("annot") ? {type: "annot"} : annot), "_", "parameters", "_", "parameters", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": branchOrWithAnnot},
    {"name": "parameters", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("or") ? {type: "or"} : or), "_", "parameters", "_", "parameters", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": branchOr},
    {"name": "parameters", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("pair") ? {type: "pair"} : pair), "_", (lexer.has("annot") ? {type: "annot"} : annot), "_", "parameters", "_", "parameters", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": mergePairWithAnnot},
    {"name": "parameters", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("pair") ? {type: "pair"} : pair), "_", "parameters", "_", "parameters", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": mergePair},
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
