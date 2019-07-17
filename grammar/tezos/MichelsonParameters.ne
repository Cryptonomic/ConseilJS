@{%
const moo = require("moo");

const lexer = moo.compile({
  ws: /[ \t]+/,
  lparen: '(',
  rparen: ')',
  lbrace: '{',
  rbrace: '}',
  keyword: ['Unit', 'True', 'False', 'None'],
  singleArgData: ['Left', 'Right', 'Some'],
  doubleArgData: ['Pair'],
  number: /-?[0-9]+/,
  string: /\"[^"]+\"/
});
%}

# Pass your lexer object using the @lexer option:
@lexer lexer

# Tezos Data Grammar
data ->
    %keyword {% keywordToJson %}
  | %string {% stringToJson %}
  | %lbrace _ %rbrace {% d => "[]" %}
  | %number {% intToJson %}
  | %singleArgData _ data {% singleArgDataToJson %}
  | %lparen _ %singleArgData _ data _ %rparen {% singleArgDataWithParenToJson %}
  | %doubleArgData _ data _ data {% doubleArgDataToJson %}
  | %lparen _ %doubleArgData _ data _ data _ %rparen {% doubleArgDataWithParenToJson %}

_ -> [\s]:*

@{%
  /**
    * Given a keyword with one argument, convert it to JSON.
    * Example: "option int" -> "{ prim: option, args: [int] }"
    */
  const singleArgDataToJson = d => { return `{ "prim": "${d[0]}", "args": [ ${d[2]} ] }`; }

  /**
    * Given a keyword with one argument and parentheses, convert it to JSON.
    * Example: "(option int)" -> "{ prim: option, args: [{prim: int}] }"
    */
  const singleArgDataWithParenToJson = d => { return `{ "prim": "${d[2]}", "args": [ ${d[4]} ] }`; }

  /**
    * Given a keyword with two arguments, convert it into JSON.
    * Example: "Pair unit instruction" -> "{ prim: Pair, args: [{prim: unit}, {prim: instruction}] }"
    */
  const doubleArgDataToJson = d => { return `{ "prim": "${d[0]}", "args": [${d[2]}, ${d[4]}] }`; }

  /**
    * Given a keyword with two arguments and parentheses, convert it into JSON.
    * Example: "(Pair unit instruction)" -> "{ prim: Pair, args: [{prim: unit}, {prim: instruction}] }"
    */
  const doubleArgDataWithParenToJson = d => { return `{ "prim": "${d[2]}", "args": [ ${d[4]}, ${d[6]} ] }`; }

  /**
    * Given a int, convert it to JSON.
    * Example: "3" -> { "int": "3" }
    */
  const intToJson = d => { return `{ "int": "${parseInt(d[0])}" }`; }

  /**
    * Given a string, convert it to JSON.
    * Example: "string" -> "{ "string": "blah" }"
    */
  const stringToJson = d => { return `{ "string": ${d[0]} }`; }

  /**
    * Given a keyword, convert it to JSON.
    * Example: "int" -> "{ "prim" : "int" }"
    */
  const keywordToJson = d => { return `{ "prim": "${d[0]}" }`; }
%}