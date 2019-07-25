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
    %lparen _ %or _ %annot _ parameters _ parameters _ %rparen {% splitOrWithAnnot %}
  | %lparen _ %or _ parameters _ parameters _ %rparen {% splitOr %}
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
%}