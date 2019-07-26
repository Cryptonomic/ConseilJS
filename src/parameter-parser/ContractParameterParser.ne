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
        data: ['int', 'nat', 'bool', 'string', 'timestamp', 'signature', 'key', 'key_hash', 'mutez', 'address', 'unit'],
        singleArgType: ['option', 'list', 'contract'],
        semicolon: ';'
    });
%}

# Pass your lexer object using the @lexer option:
@lexer lexer

entry -> %parameter _ parameters _ %semicolon {% breakParameter %}

# Parameters
parameters ->
    %lparen _ %or _ %annot _ parameters _ parameters _ %rparen {% branchOrWithAnnot %}
  | %lparen _ %or _ parameters _ parameters _ %rparen {% branchOr %}
  | %lparen _ %pair _ %annot _ parameters _ parameters _ %rparen {% mergePairWithAnnot %}
  | %lparen _ %pair _ parameters _ parameters _ %rparen {% mergePair %}
  | %singleArgType _ %annot _ parameters {% recordSingleArgTypeWithAnnot %}
  | %singleArgType _ parameters {% recordSingleArgType %}
  | %lparen _ parameters _ %rparen {% stripParen %}
  | %data _ %annot {% recordDataWithAnnot %}
  | %data {% recordData %}

# Whitespace
_ -> [\s]:*

# Post Processors
@{%
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
                    structure: `(Pair ${firstEntrypoint.structure} ${secondEntrypoint.structure})`
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
        entrypoints[0].structure = `(${singleArgType} ${entrypoints[0].structure})`;

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
%}