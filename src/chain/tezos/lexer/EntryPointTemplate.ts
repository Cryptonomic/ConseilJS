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


    import { Parameter, EntryPoint } from '../../../types/tezos/ContractIntrospectionTypes';

    const breakParameter = (d: any): EntryPoint[] => { return d[2]; }

    const branchOrWithAnnot = (d: any): EntryPoint[] => {
        const leftEntryPoints: EntryPoint[] = d[6];
        const rightEntryPoints: EntryPoint[] = d[8];
        const branchedEntryPoints: EntryPoint[] = [];

        for (const leftEntryPoint of leftEntryPoints) {
            const branchedEntryPoint: EntryPoint = {
                name: leftEntryPoint.name,
                parameters: leftEntryPoint.parameters,
                structure: '(Left ' + leftEntryPoint.structure + ')',
                generateParameter: leftEntryPoint.generateParameter
            }
            branchedEntryPoints.push(branchedEntryPoint);
        }
        for (const rightEntryPoint of rightEntryPoints) {
            const branchedEntryPoint: EntryPoint = {
                name: rightEntryPoint.name,
                parameters: rightEntryPoint.parameters,
                structure: '(Right ' + rightEntryPoint.structure + ')',
                generateParameter: rightEntryPoint.generateParameter
            }
            branchedEntryPoints.push(branchedEntryPoint);
        }

        return branchedEntryPoints;
    }

    const branchOr = (d: any): EntryPoint[] => {
        const leftEntryPoints: EntryPoint[] = d[4];
        const rightEntryPoints: EntryPoint[] = d[6];
        const branchedEntryPoints: EntryPoint[] = [];

        for (const leftEntryPoint of leftEntryPoints) {
            const branchedEntryPoint: EntryPoint = {
                name: leftEntryPoint.name,
                parameters: leftEntryPoint.parameters,
                structure: '(Left ' + leftEntryPoint.structure + ')',
                generateParameter: leftEntryPoint.generateParameter
            }
            branchedEntryPoints.push(branchedEntryPoint);
        }
        for (const rightEntryPoint of rightEntryPoints) {
            const branchedEntryPoint: EntryPoint = {
                name: rightEntryPoint.name,
                parameters: rightEntryPoint.parameters,
                structure: '(Right ' + rightEntryPoint.structure + ')',
                generateParameter: rightEntryPoint.generateParameter
            }
            branchedEntryPoints.push(branchedEntryPoint);
        }

        return branchedEntryPoints;
    }

    const mergePairWithAnnot = (d: any): EntryPoint[] => {
        const annot: string = d[4];
        const firstEntryPoints: EntryPoint[] = d[6];
        const secondEntryPoints: EntryPoint[] = d[8];
        const pairedEntryPoints: EntryPoint[] = [];

        for (const firstEntryPoint of firstEntryPoints) {
            for (const secondEntryPoint of secondEntryPoints) {
                const pairedEntryPoint: EntryPoint = {
                    name: annot.toString(),
                    parameters: firstEntryPoint.parameters.concat(secondEntryPoint.parameters),
                    structure: `(Pair ${firstEntryPoint.structure} ${secondEntryPoint.structure})`,
                    generateParameter: firstEntryPoint.generateParameter
                }
                pairedEntryPoints.push(pairedEntryPoint);
            }
        }

        return pairedEntryPoints;
    }

    const mergePair = (d: any): EntryPoint[] => {
        const firstEntryPoints: EntryPoint[] = d[4];
        const secondEntryPoints: EntryPoint[] = d[6];
        const pairedEntryPoints: EntryPoint[] = [];

        for (const firstEntryPoint of firstEntryPoints) {
            for (const secondEntryPoint of secondEntryPoints) {
                let pairedEntryPointName: string | undefined = undefined;
                if (firstEntryPoint.name != undefined) {
                    pairedEntryPointName = firstEntryPoint.name;
                } else if (secondEntryPoint.name != undefined) {
                    pairedEntryPointName = secondEntryPoint.name;
                }
                const pairedEntryPoint: EntryPoint = {
                    name: pairedEntryPointName,
                    parameters: firstEntryPoint.parameters.concat(secondEntryPoint.parameters),
                    structure: `(Pair ${firstEntryPoint.structure} ${secondEntryPoint.structure})`,
                    generateParameter: firstEntryPoint.generateParameter
                }
                pairedEntryPoints.push(pairedEntryPoint);
            }
        }

        return pairedEntryPoints;
    }

    const recordSingleArgTypeWithAnnot = (d: any): EntryPoint[] => {
        const singleArgType: string = d[0].toString();
        const annot: string = d[2].toString();
        const entryPoints: EntryPoint[] = d[4];

        entryPoints[0].parameters[0].name = annot;
        entryPoints[0].parameters[0].type = `${singleArgType} (${entryPoints[0].parameters[0].type})`;
        entryPoints[0].structure = `(${entryPoints[0].structure})`;

        return entryPoints;
    }
    const recordSingleArgType = (d: any): EntryPoint[] => {
        const singleArgType: string = d[0].toString();
        const entryPoints: EntryPoint[] = d[2];

        entryPoints[0].parameters[0].type = `${singleArgType} (${entryPoints[0].parameters[0].type})`;
        entryPoints[0].structure = `(${entryPoints[0].structure})`;

        return entryPoints;
    }

    const stripParen = (d: any): EntryPoint[] => { return d[2]; }

    const recordDataWithAnnot = (d: string[]): EntryPoint[] => { 
        const annot = d[2].toString();
        let parameterName: string | undefined = undefined;
        let entryPointName: string | undefined = undefined;

        if (annot.charAt(0) === '%') {
            entryPointName = annot;
        } else {
            parameterName = annot;
        }

        const parameter: Parameter = {
            name: parameterName,
            type: d[0].toString()
        }

        const entryPoint: EntryPoint = {
            name: entryPointName,
            parameters: [parameter],
            structure: '$PARAM',
            generateParameter(... vars: any[]): string {
                let invocationParameter: string = this.structure;
                for (let i = 0 ; i < this.parameters.length; i++) {
                    invocationParameter = invocationParameter.replace('$PARAM', vars[i]);
                }
                return invocationParameter;
            }
        }

        return [entryPoint];
    }

    const recordData = (d: string[]): EntryPoint[] => { 
        const parameter: Parameter = {
            name: undefined,
            type: d[0].toString()
        }

        const entryPoint: EntryPoint = {
            name: undefined,
            parameters: [parameter],
            structure: '$PARAM',
            generateParameter(... vars: any[]): string {
                let invocationParameter: string = this.structure;
                for (let i = 0 ; i < this.parameters.length; i++) {
                    invocationParameter = invocationParameter.replace('$PARAM', vars[i]);
                }
                return invocationParameter;
            }
        }

        return [entryPoint];
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
