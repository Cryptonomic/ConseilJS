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
        data: ['bytes', 'int', 'nat', 'bool', 'string', 'timestamp', 'signature', 'key', 'key_hash', 'mutez', 'address', 'unit', 'operation'],
        singleArgData: ['option', 'list', 'contract'],
        doubleArgData: ['lambda', 'map', 'big_map'],
        semicolon: ';'
    });
%}

# Pass your lexer object using the @lexer option:
@lexer lexer

entry -> %parameter __ parameters _ %semicolon {% breakParameter %}

# Parameters
parameters ->
    %lparen _ parameters _ %rparen {% stripParen %}
    
  | %or _ %annot __ %annot __ parameters __ parameters {% branchOrWithTwoAnnot %}
  | %or _ %annot __ parameters __ parameters {% branchOrWithAnnot %}
  | %or _ parameters __ parameters {% branchOr %}

  | %pair __ %annot __ %annot __ parameters __ parameters {% mergePairWithTwoAnnot %}
  | %pair __ %annot __ parameters __ parameters {% mergePairWithAnnot %}
  | %pair __ parameters __ parameters {% mergePair %}

  | %singleArgData _ %annot __ %annot __ parameters {% recordSingleArgDataWithTwoAnnot %}
  | %singleArgData _ %annot __ parameters {% recordSingleArgDataWithAnnot %}
  | %singleArgData _ parameters {% recordSingleArgData %}

  | %doubleArgData _ %annot __ %annot __ parameters __ parameters {% recordDoubleArgDataWithTwoAnnot %}
  | %doubleArgData _ %annot __ parameters __ parameters {% recordDoubleArgDataWithAnnot %}
  | %doubleArgData _ parameters __ parameters {% recordDoubleArgData %}

  | %data __ %annot {% recordDataWithAnnot %}
  | %data {% recordData %}

# Whitespace
_ -> [\s]:*
__ -> [\s]

# Post Processors
@{%
    import { Parameter, EntryPoint } from '../../../types/tezos/ContractIntrospectionTypes';

    const breakParameter = (d: any): EntryPoint[] => { return d[2]; }

    const stripParen = (d: any): EntryPoint[] => d[2];

    // <!-- Or -->

    const branchOrWithTwoAnnot = (d: any): EntryPoint[] => {
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

    const branchOrWithAnnot = (d: any): EntryPoint[] => {
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
        const annot: string = d[2];
        //const annot: string = d[4]; // TODO
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

    const mergePairWithAnnot = (d: any): EntryPoint[] => {
        const annot: string = d[2];
        const firstEntryPoints: EntryPoint[] = d[4];
        const secondEntryPoints: EntryPoint[] = d[6];
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
        const annot: string = d[2].toString();
        //const annot: string = d[4].toString(); // TODO
        const entryPoints: EntryPoint[] = d[6];

        entryPoints[0].parameters[0].name = annot;
        entryPoints[0].parameters[0].type = `${singleArgData} (${entryPoints[0].parameters[0].type})`;
        entryPoints[0].structure = `(${entryPoints[0].structure})`;

        return entryPoints;
    }

    const recordSingleArgDataWithAnnot = (d: any): EntryPoint[] => {
        const singleArgData: string = d[0].toString();
        const annot: string = d[2].toString();
        const entryPoints: EntryPoint[] = d[4];

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
        const annot: string = d[2].toString();
        //const annot: string = d[4].toString(); // TODO
        const firstEntryPoints: EntryPoint[] = d[6];
        const secondEntryPoints: EntryPoint[] = d[8];

        firstEntryPoints[0].parameters[0].name = annot;
        firstEntryPoints[0].parameters[0].type = `${doubleArgData} (${firstEntryPoints[0].parameters[0].type}) (${secondEntryPoints[0].parameters[0].type})`;
        firstEntryPoints[0].structure = `(${firstEntryPoints[0].structure})`;

        return firstEntryPoints;
    }

    const recordDoubleArgDataWithAnnot = (d: any): EntryPoint[] => {
        const doubleArgData: string = d[0].toString();
        const annot: string = d[2].toString();
        const firstEntryPoints: EntryPoint[] = d[4];
        const secondEntryPoints: EntryPoint[] = d[6];

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
