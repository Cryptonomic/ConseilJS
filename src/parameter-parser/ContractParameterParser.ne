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
  | %lparen _ %pair _ %annot _ parameters _ parameters _ %rparen {% processPairWithAnnot %}
  | %lparen _ %pair _ parameters _ parameters _ %rparen {% processPair %}
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
        name?: string,
        type: string
    }

    interface Entrypoint {
        name: string,
        parameters: Parameter[],
        structure: string
    }

    const breakParameter = (d: any): Entrypoint[] => { return d[2]; }

    const branchOrWithAnnot = (d: any): Entrypoint[] => {
        const leftEntrypoints: Entrypoint[] = d[6];
        const rightEntrypoints: Entrypoint[] = d[8];
        let branchedEntrypoints: Entrypoint[] = [];

        for (let leftEntrypoint of leftEntrypoints) {
            let branchedEntrypoint: Entrypoint = {
                name: leftEntrypoint.name,
                parameters: leftEntrypoint.parameters,
                structure: '(Left ' + leftEntrypoint.structure + ')'
            }
            branchedEntrypoints.push(branchedEntrypoint);
        }
        for (let rightEntrypoint of rightEntrypoints) {
            let branchedEntrypoint: Entrypoint = {
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
        let branchedEntrypoints: Entrypoint[] = [];

        for (let leftEntrypoint of leftEntrypoints) {
            let branchedEntrypoint: Entrypoint = {
                name: leftEntrypoint.name,
                parameters: leftEntrypoint.parameters,
                structure: '(Left ' + leftEntrypoint.structure + ')'
            }
            branchedEntrypoints.push(branchedEntrypoint);
        }
        for (let rightEntrypoint of rightEntrypoints) {
            let branchedEntrypoint: Entrypoint = {
                name: rightEntrypoint.name,
                parameters: rightEntrypoint.parameters,
                structure: '(Right ' + rightEntrypoint.structure + ')'
            }
            branchedEntrypoints.push(branchedEntrypoint);
        }

        return branchedEntrypoints;
    }

    const processPairWithAnnot = (d: any): Entrypoint[] => {
        const annot: string = d[4];
        const firstEntrypoints: Entrypoint[] = d[6];
        const secondEntrypoints: Entrypoint[] = d[8];
        let pairedEntrypoints: Entrypoint[] = [];

        for (let firstEntrypoint of firstEntrypoints) {
            for (let secondEntrypoint of secondEntrypoints) {
                let pairedEntrypoint: Entrypoint = {
                    name: annot.toString(),
                    parameters: firstEntrypoint.parameters.concat(secondEntrypoint.parameters),
                    structure: `(Pair ${annot} ${firstEntrypoint.structure} ${secondEntrypoint.structure})`
                }
                pairedEntrypoints.push(pairedEntrypoint);
            }
        }

        return pairedEntrypoints;
    }

    const processPair = (d: any): Entrypoint[] => {
        const firstEntrypoints: Entrypoint[] = d[4];
        const secondEntrypoints: Entrypoint[] = d[6];
        let pairedEntrypoints: Entrypoint[] = [];

        for (let firstEntrypoint of firstEntrypoints) {
            for (let secondEntrypoint of secondEntrypoints) {
                let pairedEntrypoint: Entrypoint = {
                    name: "",
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
%}