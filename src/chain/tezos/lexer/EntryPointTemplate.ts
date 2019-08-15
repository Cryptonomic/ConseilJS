// Generated automatically by nearley, version 2.18.0
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var parameter: any;
declare var semicolon: any;
declare var lparen: any;
declare var rparen: any;
declare var or: any;
declare var annot: any;
declare var pair: any;
declare var singleArgData: any;
declare var doubleArgData: any;
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
        data: ['bytes', 'int', 'nat', 'bool', 'string', 'timestamp', 'signature', 'key', 'key_hash', 'mutez', 'address', 'unit', 'operation'],
        singleArgData: ['option', 'list', 'contract'],
        doubleArgData: ['lambda', 'map', 'big_map'],
        semicolon: ';'
    });


    import { Parameter, EntryPoint } from '../../../types/tezos/ContractIntrospectionTypes';

    const breakParameter = (d: any): EntryPoint[] => { return d[2]; }

    const stripParen = (d: any): EntryPoint[] => d[2];

    // <!-- Or -->

    const branchOrWithTwoAnnot = (d: any): EntryPoint[] => {
        const annotA: string = d[2];
        const annotB: string = d[4];
        const leftEntryPoints: EntryPoint[] = d[6];
        const rightEntryPoints: EntryPoint[] = d[8];
        const branchedEntryPoints: EntryPoint[] = [];

        console.log(`branchOrWithTwoAnnot found ${annotA}, ${annotB}`);
        for (const leftEntryPoint of leftEntryPoints) {
            const branchedEntryPoint: EntryPoint = {
                name: leftEntryPoint.name, // TODO
                parameters: leftEntryPoint.parameters,
                structure: '(Left ' + leftEntryPoint.structure + ')',
                generateParameter: leftEntryPoint.generateParameter
            }
            branchedEntryPoints.push(branchedEntryPoint);
        }

        for (const rightEntryPoint of rightEntryPoints) {
            const branchedEntryPoint: EntryPoint = {
                name: rightEntryPoint.name, // TODO
                parameters: rightEntryPoint.parameters,
                structure: '(Right ' + rightEntryPoint.structure + ')',
                generateParameter: rightEntryPoint.generateParameter
            }
            branchedEntryPoints.push(branchedEntryPoint);
        }

        return branchedEntryPoints;
    }

    const branchOrWithAnnot = (d: any): EntryPoint[] => {
        const annot = d[2];
        const leftEntryPoints: EntryPoint[] = d[4];
        const rightEntryPoints: EntryPoint[] = d[6];
        const branchedEntryPoints: EntryPoint[] = [];

        console.log(`branchOrWithAnnot found ${annot}`);
        for (const leftEntryPoint of leftEntryPoints) {
            const branchedEntryPoint: EntryPoint = {
                name: `${annot}.${leftEntryPoint.name}`, // TODO
                parameters: leftEntryPoint.parameters,
                structure: '(Left ' + leftEntryPoint.structure + ')',
                generateParameter: leftEntryPoint.generateParameter
            }
            branchedEntryPoints.push(branchedEntryPoint);
        }

        for (const rightEntryPoint of rightEntryPoints) {
            const branchedEntryPoint: EntryPoint = {
                name: `${annot}.${rightEntryPoint.name}`, // TODO
                parameters: rightEntryPoint.parameters,
                structure: '(Right ' + rightEntryPoint.structure + ')',
                generateParameter: rightEntryPoint.generateParameter
            }
            branchedEntryPoints.push(branchedEntryPoint);
        }

        return branchedEntryPoints;
    }

    const branchOr = (d: any): EntryPoint[] => {
        const leftEntryPoints: EntryPoint[] = d[2];
        const rightEntryPoints: EntryPoint[] = d[4];
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

    // <!-- Pair -->

    const mergePairWithTwoAnnot = (d: any): EntryPoint[] => {
        const annotA: string = d[2];
        const annotB: string = d[4];
        const firstEntryPoints: EntryPoint[] = d[6];
        const secondEntryPoints: EntryPoint[] = d[8];
        const pairedEntryPoints: EntryPoint[] = [];

        console.log(`mergePairWithTwoAnnot found ${annotA}, ${annotB}`);
        for (const firstEntryPoint of firstEntryPoints) {
            for (const secondEntryPoint of secondEntryPoints) {
                const pairedEntryPoint: EntryPoint = {
                    name: annotA.toString(), // TODO
                    parameters: firstEntryPoint.parameters.concat(secondEntryPoint.parameters),
                    structure: `(Pair ${firstEntryPoint.structure} ${secondEntryPoint.structure})`,
                    generateParameter: firstEntryPoint.generateParameter
                }
                pairedEntryPoints.push(pairedEntryPoint);
            }
        }

        return pairedEntryPoints;
    }

    const mergePairWithAnnot = (d: any): EntryPoint[] => {
        const annot: string = d[2];
        const firstEntryPoints: EntryPoint[] = d[4];
        const secondEntryPoints: EntryPoint[] = d[6];
        const pairedEntryPoints: EntryPoint[] = [];

        console.log(`mergePairWithAnnot found ${annot}`);
        for (const firstEntryPoint of firstEntryPoints) {
            for (const secondEntryPoint of secondEntryPoints) {
                const pairedEntryPoint: EntryPoint = {
                    name: annot.toString(), // TODO
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
        const firstEntryPoints: EntryPoint[] = d[2];
        const secondEntryPoints: EntryPoint[] = d[4];
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

    // <!-- Single Arg Data -->

    const recordSingleArgDataWithTwoAnnot = (d: any): EntryPoint[] => {
        const singleArgData: string = d[0].toString();
        const annotA: string = d[2].toString();
        const annotB: string = d[4].toString();
        const entryPoints: EntryPoint[] = d[6];

        console.log(`recordSingleArgDataWithTwoAnnot found ${annotA}, ${annotB}`);
        //entryPoints[0].parameters[0].name = annot;
        entryPoints[0].parameters[0].type = `${singleArgData} (${entryPoints[0].parameters[0].type})`;
        entryPoints[0].structure = `(${entryPoints[0].structure})`;

        return entryPoints;
    }

    const recordSingleArgDataWithAnnot = (d: any): EntryPoint[] => {
        const singleArgData: string = d[0].toString();
        const annot: string = d[2].toString();
        const entryPoints: EntryPoint[] = d[4];

        console.log(`recordSingleArgDataWithAnnot found ${annot}`);
        entryPoints[0].parameters[0].name = annot;
        entryPoints[0].parameters[0].type = `${singleArgData} (${entryPoints[0].parameters[0].type})`;
        entryPoints[0].structure = `(${entryPoints[0].structure})`;

        return entryPoints;
    }

    const recordSingleArgData = (d: any): EntryPoint[] => {
        const singleArgData: string = d[0].toString();
        const entryPoints: EntryPoint[] = d[2];

        entryPoints[0].parameters[0].type = `${singleArgData} (${entryPoints[0].parameters[0].type})`;
        entryPoints[0].structure = `(${entryPoints[0].structure})`;

        return entryPoints;
    }

    // <!-- Double Arg Data -->

    const recordDoubleArgDataWithTwoAnnot = (d: any): EntryPoint[] => {
        const doubleArgData: string = d[0].toString();
        const annotA: string = d[2].toString();
        const annotB: string = d[4].toString();
        const firstEntryPoints: EntryPoint[] = d[6];
        const secondEntryPoints: EntryPoint[] = d[8];

        //firstEntryPoints[0].parameters[0].name = annot;
        console.log(`recordDoubleArgDataWithTwoAnnot found ${annotA}, ${annotB}`);
        firstEntryPoints[0].parameters[0].type = `${doubleArgData} (${firstEntryPoints[0].parameters[0].type}) (${secondEntryPoints[0].parameters[0].type})`;
        firstEntryPoints[0].structure = `(${firstEntryPoints[0].structure})`;

        return firstEntryPoints;
    }

    const recordDoubleArgDataWithAnnot = (d: any): EntryPoint[] => {
        const doubleArgData: string = d[0].toString();
        const annot: string = d[2].toString();
        const firstEntryPoints: EntryPoint[] = d[4];
        const secondEntryPoints: EntryPoint[] = d[6];

        console.log(`recordDoubleArgDataWithAnnot found ${annot}`);
        firstEntryPoints[0].parameters[0].name = annot;
        firstEntryPoints[0].parameters[0].type = `${doubleArgData} (${firstEntryPoints[0].parameters[0].type}) (${secondEntryPoints[0].parameters[0].type})`;
        firstEntryPoints[0].structure = `(${firstEntryPoints[0].structure})`;

        return firstEntryPoints;
    }

    const recordDoubleArgData = (d: any): EntryPoint[] => {
        const doubleArgData: string = d[0].toString();
        const firstEntryPoints: EntryPoint[] = d[2];
        const secondEntryPoints: EntryPoint[] = d[4];

        firstEntryPoints[0].parameters[0].type = `${doubleArgData} (${firstEntryPoints[0].parameters[0].type}) (${secondEntryPoints[0].parameters[0].type})`;
        firstEntryPoints[0].structure = `(${firstEntryPoints[0].structure})`;

        return firstEntryPoints;
    }

    // <!-- Data -->

    const recordData = (d: string[]): EntryPoint[] => {
        let parameterName: string | undefined = undefined;
        let entryPointName: string | undefined = undefined;
//console.log(`recordData with ${d.join(', ')} `)
        if (d.length >= 3) {
            const annot = d[2].toString();
            if (annot.charAt(0) === '%') {
                entryPointName = formatFieldAnnotation(annot);
            } else {
                parameterName = formatTypeAnnotation(annot);
            }
        }

        if (d.length === 5) {
            const anotherAnnot = d[4].toString();
            if (anotherAnnot.startsWith('%') && entryPointName === undefined) {
                entryPointName = formatFieldAnnotation(anotherAnnot);
            }
            if (anotherAnnot.startsWith(':') && parameterName === undefined) {
                parameterName = formatTypeAnnotation(anotherAnnot);
            }
        }

        const parameter: Parameter = {
            name: parameterName,
            type: d[0].toString()
        };

        const entryPoint: EntryPoint = {
            name: entryPointName,
            parameters: [parameter],
            structure: '$PARAM',
            generateParameter(...vars: any[]): string {
                if (this.parameters.length !== vars.length) { throw new Error(`Incorrect number of parameters provided; expected ${this.parameters.length}, got ${vars.length}`); }
                let invocationParameter: string = this.structure;
                for (let i = 0 ; i < this.parameters.length; i++) {
                    invocationParameter = invocationParameter.replace('$PARAM', vars[i]);
                }
                return invocationParameter;
            }
        };

        return [entryPoint];
    }

    const getFieldAnnotation = (...annot: string[]) => {
        const fa = annot.find(a => a.startsWith('%'));
        if (!!fa) {
            return formatFieldAnnotation(fa);
        }

        return undefined;
    }

    const getTypeAnnotation = (...annot: string[]) => {
        const ta = annot.find(a => a.startsWith(':'));
        if (!!ta) {
            return formatTypeAnnotation(ta);
        }

        return undefined;
    }

    const formatFieldAnnotation = (annot: string) => {
        if (!annot.startsWith('%')) { throw new Error(`${annot} must start with '%'`); }

        let name = annot.replace(/^%_Liq_entry_/, '').replace('%', '');
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    const formatTypeAnnotation = (annot: string) => {
        if (!annot.startsWith(':')) { throw new Error(`${annot} must start with ':'`); }

        let name = annot.replace(':', '');
        return name.charAt(0).toUpperCase() + name.slice(1);
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
    {"name": "entry", "symbols": [(lexer.has("parameter") ? {type: "parameter"} : parameter), "__", "parameters", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon)], "postprocess": breakParameter},
    {"name": "parameters", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "parameters", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": stripParen},
    {"name": "parameters", "symbols": [(lexer.has("or") ? {type: "or"} : or), "_", (lexer.has("annot") ? {type: "annot"} : annot), "__", (lexer.has("annot") ? {type: "annot"} : annot), "__", "parameters", "__", "parameters"], "postprocess": branchOrWithTwoAnnot},
    {"name": "parameters", "symbols": [(lexer.has("or") ? {type: "or"} : or), "_", (lexer.has("annot") ? {type: "annot"} : annot), "__", "parameters", "__", "parameters"], "postprocess": branchOrWithAnnot},
    {"name": "parameters", "symbols": [(lexer.has("or") ? {type: "or"} : or), "_", "parameters", "__", "parameters"], "postprocess": branchOr},
    {"name": "parameters", "symbols": [(lexer.has("pair") ? {type: "pair"} : pair), "__", (lexer.has("annot") ? {type: "annot"} : annot), "__", (lexer.has("annot") ? {type: "annot"} : annot), "__", "parameters", "__", "parameters"], "postprocess": mergePairWithTwoAnnot},
    {"name": "parameters", "symbols": [(lexer.has("pair") ? {type: "pair"} : pair), "__", (lexer.has("annot") ? {type: "annot"} : annot), "__", "parameters", "__", "parameters"], "postprocess": mergePairWithAnnot},
    {"name": "parameters", "symbols": [(lexer.has("pair") ? {type: "pair"} : pair), "__", "parameters", "__", "parameters"], "postprocess": mergePair},
    {"name": "parameters", "symbols": [(lexer.has("singleArgData") ? {type: "singleArgData"} : singleArgData), "_", (lexer.has("annot") ? {type: "annot"} : annot), "__", (lexer.has("annot") ? {type: "annot"} : annot), "__", "parameters"], "postprocess": recordSingleArgDataWithTwoAnnot},
    {"name": "parameters", "symbols": [(lexer.has("singleArgData") ? {type: "singleArgData"} : singleArgData), "_", (lexer.has("annot") ? {type: "annot"} : annot), "__", "parameters"], "postprocess": recordSingleArgDataWithAnnot},
    {"name": "parameters", "symbols": [(lexer.has("singleArgData") ? {type: "singleArgData"} : singleArgData), "_", "parameters"], "postprocess": recordSingleArgData},
    {"name": "parameters", "symbols": [(lexer.has("doubleArgData") ? {type: "doubleArgData"} : doubleArgData), "_", (lexer.has("annot") ? {type: "annot"} : annot), "__", (lexer.has("annot") ? {type: "annot"} : annot), "__", "parameters", "__", "parameters"], "postprocess": recordDoubleArgDataWithTwoAnnot},
    {"name": "parameters", "symbols": [(lexer.has("doubleArgData") ? {type: "doubleArgData"} : doubleArgData), "_", (lexer.has("annot") ? {type: "annot"} : annot), "__", "parameters", "__", "parameters"], "postprocess": recordDoubleArgDataWithAnnot},
    {"name": "parameters", "symbols": [(lexer.has("doubleArgData") ? {type: "doubleArgData"} : doubleArgData), "_", "parameters", "__", "parameters"], "postprocess": recordDoubleArgData},
    {"name": "parameters", "symbols": [(lexer.has("data") ? {type: "data"} : data), "__", (lexer.has("annot") ? {type: "annot"} : annot)], "postprocess": recordData},
    {"name": "parameters", "symbols": [(lexer.has("data") ? {type: "data"} : data), "__", (lexer.has("annot") ? {type: "annot"} : annot), "__", (lexer.has("annot") ? {type: "annot"} : annot)], "postprocess": recordData},
    {"name": "parameters", "symbols": [(lexer.has("data") ? {type: "data"} : data)], "postprocess": recordData},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "_", "symbols": ["_$ebnf$1"]},
    {"name": "__", "symbols": [/[\s]/]}
];

export var ParserStart: string = "entry";
