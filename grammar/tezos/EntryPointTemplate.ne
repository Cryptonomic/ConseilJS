@preprocessor typescript

@{%
    const moo = require("moo");

    const lexer = moo.compile({
        wspace: /[ \t]+/,
        lparen: '(',
        rparen: ')',
        annot: /:[^ );]+|%[^ );]+/,
        parameter: 'parameter',
        or: 'or',
        pair: 'pair',
        data: ['bytes', 'int', 'nat', 'bool', 'string', 'timestamp', 'signature', 'key', 'key_hash', 'mutez', 'address', 'unit'],
        dualData: ['lambda', 'map', 'big_map'], // TODO
        singleArgType: ['option', 'list', 'contract'],
        semicolon: ';'
    });
%}

# Pass your lexer object using the @lexer option:
@lexer lexer

entry -> %parameter __ parameters _ %semicolon {% breakParameter %}

# Parameters
parameters ->
    %lparen _ %or _ %annot __ parameters __ parameters _ %rparen {% branchOrWithAnnot %}
  | %lparen _ %or _ %annot __ %annot __ parameters __ parameters _ %rparen {% branchOrWithTwoAnnot %}
  | %lparen _ %or _ parameters __ parameters _ %rparen {% branchOr %}
  | %lparen _ %pair __ %annot __ parameters __ parameters _ %rparen {% mergePairWithAnnot %}
  | %lparen _ %pair __ parameters __ parameters _ %rparen {% mergePair %}
  | %lparen _ %pair __ %annot __ %annot __ parameters __ parameters _ %rparen {% mergePairWithTwoAnnot %}
  | %lparen _ %pair __ parameters __ parameters _ %rparen {% mergePair %}
  | %singleArgType _ %annot __ parameters {% recordSingleArgTypeWithAnnot %}
  | %singleArgType _ %annot __ %annot __ parameters {% recordSingleArgTypeWithTwoAnnot %}
  | %singleArgType _ parameters {% recordSingleArgType %}
  | %lparen _ parameters _ %rparen {% stripParen %}
  | %data __ %annot {% recordDataWithAnnot %}
  | %data {% recordData %}

# Whitespace
_ -> [\s]:*
__ -> [\s]

# Post Processors
@{%
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

    const branchOrWithTwoAnnot = (d: any): EntryPoint[] => {
        const leftEntryPoints: EntryPoint[] = d[8];
        const rightEntryPoints: EntryPoint[] = d[10];
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

    const mergePairWithTwoAnnot = (d: any): EntryPoint[] => {
        const annot: string = d[4];
        //const annot: string = d[6]; // TODO
        const firstEntryPoints: EntryPoint[] = d[8];
        const secondEntryPoints: EntryPoint[] = d[10];
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

    const recordSingleArgTypeWithTwoAnnot = (d: any): EntryPoint[] => {
        const singleArgType: string = d[0].toString();
        const annot: string = d[2].toString();
        //const annot: string = d[4].toString(); // TODO
        const entryPoints: EntryPoint[] = d[6];

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

    const stripParen = (d: any): EntryPoint[] => d[2];

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
%}
