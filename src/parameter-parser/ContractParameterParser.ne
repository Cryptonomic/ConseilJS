@preprocessor typescript

@{%
  const moo = require("moo");

  const lexer = moo.compile({
      wspace: /[ \t]+/,
      lparen: '(',
      rparen: ')',
      annot: /:[^ )]+|%[^ )]+/,
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
    %data _ %annot:? {% recordData %}
  | %singleArgType _ %annot:? _ parameters {% recordSingleArgType %}

  | %lparen _ %pair _ %annot:? _ parameters _ parameters _ %rparen {% processPair %}
  | %lparen _ %or _ %annot:? _ parameters _ parameters _ %rparen {% splitOr %}

  | %lparen _ parameters _ %rparen {% stripParen %}

# Whitespace
_ -> [\s]:*

# Post Processors
@{%
    const breakParameter = (d: string[][]) => { return d[2]; }

    const recordData = (d: string[][]) => { return [`([${d[0]}!${d[2]}])`]; }
    const recordSingleArgType = (d: string[][]) => { return `([${d[0]} ${d[2]} ${d[4]}])`; }
    const stripParen = (d: string[][]) => { return [d[2]]; }
    const processPair = (d: string[][]) => {
      if (d[4] === null) {
        return [`(Pair ${d[6]} ${d[8]})`];
      } else {
        return [`(Pair ${d[4]} ${d[6]} ${d[8]})`];
      }
    }

    const splitOr = (d: string[][]) => {
      let result: string[] = [];
      const leftBranch: string[] = d[6];
      const rightBranch: string[] = d[8];

      for (let leftNode of leftBranch) {
          result.push('(Left ' + leftNode + ')');
      }
      for (let rightNode of rightBranch) {
          result.push('(Right ' + rightNode + ')');
      }
      
      return result;
    }
%}