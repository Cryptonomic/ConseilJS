// Generated automatically by nearley, version 2.19.1
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
        data: ['bytes', 'int', 'nat', 'bool', 'string', 'timestamp', 'signature', 'key', 'key_hash', 'mutez', 'address', 'unit', 'operation', 'chain_id'],
        singleArgData: ['option', 'list', 'contract', 'set'],
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

        for (const leftEntryPoint of leftEntryPoints) {
            const branchedEntryPoint: EntryPoint = {
                name: leftEntryPoint.name, // TODO
                parameters: leftEntryPoint.parameters,
                structure: '(Left ' + leftEntryPoint.structure + ')',
                generateInvocationString: leftEntryPoint.generateInvocationString,
                generateInvocationPair: leftEntryPoint.generateInvocationPair,
                generateSampleInvocation: leftEntryPoint.generateSampleInvocation
            }
            branchedEntryPoints.push(branchedEntryPoint);
        }

        for (const rightEntryPoint of rightEntryPoints) {
            const branchedEntryPoint: EntryPoint = {
                name: rightEntryPoint.name, // TODO
                parameters: rightEntryPoint.parameters,
                structure: '(Right ' + rightEntryPoint.structure + ')',
                generateInvocationString: rightEntryPoint.generateInvocationString,
                generateInvocationPair: rightEntryPoint.generateInvocationPair,
                generateSampleInvocation: rightEntryPoint.generateSampleInvocation
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

        for (const leftEntryPoint of leftEntryPoints) {
            const branchedEntryPoint: EntryPoint = {
                name: `${annot}.${leftEntryPoint.name}`, // TODO
                parameters: leftEntryPoint.parameters,
                structure: '(Left ' + leftEntryPoint.structure + ')',
                generateInvocationString: leftEntryPoint.generateInvocationString,
                generateInvocationPair: leftEntryPoint.generateInvocationPair,
                generateSampleInvocation: leftEntryPoint.generateSampleInvocation
            }
            branchedEntryPoints.push(branchedEntryPoint);
        }

        for (const rightEntryPoint of rightEntryPoints) {
            const branchedEntryPoint: EntryPoint = {
                name: `${annot}.${rightEntryPoint.name}`, // TODO
                parameters: rightEntryPoint.parameters,
                structure: '(Right ' + rightEntryPoint.structure + ')',
                generateInvocationString: rightEntryPoint.generateInvocationString,
                generateInvocationPair: rightEntryPoint.generateInvocationPair,
                generateSampleInvocation: rightEntryPoint.generateSampleInvocation
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
            if (leftEntryPoint.parameters.length === 1 && leftEntryPoint.parameters[0].name === leftEntryPoint.name) {
                leftEntryPoint.parameters[0].name = undefined;
            }
            branchedEntryPoints.push({...leftEntryPoint, structure: `(Left ${leftEntryPoint.structure})`});
        }

        for (const rightEntryPoint of rightEntryPoints) {
            if (rightEntryPoint.parameters.length === 1 && rightEntryPoint.parameters[0].name === rightEntryPoint.name) {
                rightEntryPoint.parameters[0].name = undefined;
            }
            branchedEntryPoints.push({...rightEntryPoint, structure: `(Right ${rightEntryPoint.structure})`});
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

        for (const firstEntryPoint of firstEntryPoints) {
            for (const secondEntryPoint of secondEntryPoints) {
                const pairedEntryPoint: EntryPoint = {
                    name: getTypeAnnotation(annotA.toString(), annotB.toString()),
                    parameters: firstEntryPoint.parameters.concat(secondEntryPoint.parameters),
                    structure: `(Pair ${firstEntryPoint.structure} ${secondEntryPoint.structure})`,
                    generateInvocationString: firstEntryPoint.generateInvocationString,
                    generateInvocationPair: firstEntryPoint.generateInvocationPair,
                    generateSampleInvocation: firstEntryPoint.generateSampleInvocation
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

        for (const firstEntryPoint of firstEntryPoints) {
            for (const secondEntryPoint of secondEntryPoints) {
                const name = getTypeAnnotation(annot.toString()) || getFieldAnnotation(annot.toString());
                const pairedEntryPoint: EntryPoint = {
                    name: name || undefined,
                    parameters: firstEntryPoint.parameters.concat(secondEntryPoint.parameters),
                    structure: `(Pair ${firstEntryPoint.structure} ${secondEntryPoint.structure})`,
                    generateInvocationString: firstEntryPoint.generateInvocationString,
                    generateInvocationPair: firstEntryPoint.generateInvocationPair,
                    generateSampleInvocation: firstEntryPoint.generateSampleInvocation // TODO
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
                const pairedEntryPoint: EntryPoint = {
                    name: undefined,
                    parameters: firstEntryPoint.parameters.concat(secondEntryPoint.parameters),
                    structure: `(Pair ${firstEntryPoint.structure} ${secondEntryPoint.structure})`,
                    generateInvocationString: firstEntryPoint.generateInvocationString,
                    generateInvocationPair: firstEntryPoint.generateInvocationPair,
                    generateSampleInvocation: firstEntryPoint.generateSampleInvocation // TODO
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

        entryPoints[0].name = getFieldAnnotation(annotA, annotB);
        entryPoints[0].parameters[0].constituentType = entryPoints[0].parameters[0].type;
        if (singleArgData === 'option') { entryPoints[0].parameters[0].optional = true; }
        entryPoints[0].parameters[0].type = `${singleArgData} (${entryPoints[0].parameters[0].type})`;
        entryPoints[0].structure = `(${entryPoints[0].structure})`;

        return entryPoints;
    }

    const recordSingleArgDataWithAnnot = (d: any): EntryPoint[] => {
        const singleArgData: string = d[0].toString();
        const annot: string = d[2].toString();
        const entryPoints: EntryPoint[] = d[4];

        entryPoints[0].name = getFieldAnnotation(annot);
        entryPoints[0].parameters[0].constituentType = entryPoints[0].parameters[0].type;
        if (singleArgData === 'option') { entryPoints[0].parameters[0].optional = true; }
        entryPoints[0].parameters[0].type = `${singleArgData} (${entryPoints[0].parameters[0].type})`;
        entryPoints[0].structure = `(${entryPoints[0].structure})`;

        return entryPoints;
    }

    const recordSingleArgData = (d: any): EntryPoint[] => {
        const singleArgData: string = d[0].toString();
        const entryPoints: EntryPoint[] = d[2];

        entryPoints[0].parameters[0].constituentType = entryPoints[0].parameters[0].type;
        if (singleArgData === 'option') { entryPoints[0].parameters[0].optional = true; }
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

        firstEntryPoints[0].name = getFieldAnnotation(annotA, annotB);
        firstEntryPoints[0].parameters[0].type = `${doubleArgData} (${firstEntryPoints[0].parameters[0].type}) (${secondEntryPoints[0].parameters[0].type})`;
        firstEntryPoints[0].structure = `(${firstEntryPoints[0].structure})`;

        return firstEntryPoints;
    }

    const recordDoubleArgDataWithAnnot = (d: any): EntryPoint[] => {
        const doubleArgData: string = d[0].toString();
        const annot: string = d[2].toString();
        const firstEntryPoints: EntryPoint[] = d[4];
        const secondEntryPoints: EntryPoint[] = d[6];

        firstEntryPoints[0].name = getFieldAnnotation(annot);
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
            name: parameterName || entryPointName,
            type: d[0].toString()
        };

        const entryPoint: EntryPoint = {
            name: entryPointName,
            parameters: [parameter],
            structure: '$PARAM',
            generateInvocationString(...vars: any[]): string { // TODO: check double-quotes on string-like parameters; support for map type
                if (this.parameters.length !== vars.length) { throw new Error(`Incorrect number of parameters provided; expected ${this.parameters.length}, got ${vars.length}`); }
                let invocationParameter: string = this.structure;
                for (let i = 0 ; i < this.parameters.length; i++) {
                    let val = vars[i];

                    if (this.parameters[i].type === 'unit') { val = 'Unit'; }

                    if (this.parameters[i].type.startsWith('list')) {
                        if (!Array.isArray(val)) { throw new Error(`${JSON.stringify(this.parameters[i])} requires an array value`); }
                        val = `{${val.join('; ')}}`;
                    }

                    if (this.parameters[i].optional && vars[i]) {
                        val = `Some ${val}`;
                    } else if (this.parameters[i].optional && !vars[i]) { 
                        val = 'None';
                    }

                    invocationParameter = invocationParameter.replace('$PARAM', val);
                }
                return invocationParameter;
            },
            generateInvocationPair(...vars: any[]): any {
                let param = this.generateInvocationString(...vars);

                while (param.startsWith('(Left ') || param.startsWith('(Right ')) {
                    if (param.startsWith('(Left ')) {
                        param = param.slice(6, -1);
                    }
                    if (param.startsWith('(Right ')) {
                        param = param.slice(7, -1);
                    }
                }
                return { entrypoint: this.name, parameters: param };
            },
            generateSampleInvocation(): string {
                const params = this.parameters.map(p => {
                    switch (p.type) {
                        case 'string': { return '"Tacos"'; }
                        case 'int': { return -1; }
                        case 'nat': { return 99; }
                        case 'address': { return '"KT1EGbAxguaWQFkV3Egb2Z1r933MWuEYyrJS"'; }
                        case 'key_hash': { return '"tz1SQnJaocpquTztY3zMgydTPoQBBQrDGonJ"'; }
                        case 'timestamp': { return `"${(new Date()).toISOString()}"`}
                        case 'mutez': { return 500000; }
                        case 'unit': { return 'Unit'; }
                        case 'bytes':
                        case 'bool':
                        case 'signature':
                        case 'key':
                        case 'operation':
                        case 'chain_id':
                        default: { return p.type; }
                    }
                });

                return this.generateInvocationString(...params);
                
            }
        };

        return [entryPoint];
    }

    const getFieldAnnotation = (...annot: string[]) => {
        const fa = annot.find(a => a.startsWith('%'));

        return !!fa ? formatFieldAnnotation(fa): undefined;
    }

    const getTypeAnnotation = (...annot: string[]) => {
        const ta = annot.find(a => a.startsWith(':'));

        return !!ta ? formatTypeAnnotation(ta): undefined;
    }

    const formatFieldAnnotation = (annot: string) => {
        if (!annot.startsWith('%')) { throw new Error(`${annot} must start with '%'`); }

        return annot.replace(/^%_Liq_entry_/, '').replace('%', '');
    }

    const formatTypeAnnotation = (annot: string) => {
        if (!annot.startsWith(':')) { throw new Error(`${annot} must start with ':'`); }

        return annot.replace(':', '');
    }

interface NearleyToken {  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: NearleyToken) => string;
  has: (tokenType: string) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
  Lexer: lexer,
  ParserRules: [
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
  ],
  ParserStart: "entry",
};

export default grammar;
