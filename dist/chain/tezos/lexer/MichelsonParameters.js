// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

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
  string: /\".+\"/
});


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
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "data", "symbols": [(lexer.has("keyword") ? {type: "keyword"} : keyword)], "postprocess": keywordToJson},
    {"name": "data", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": stringToJson},
    {"name": "data", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": d => "[]"},
    {"name": "data", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": intToJson},
    {"name": "data", "symbols": [(lexer.has("singleArgData") ? {type: "singleArgData"} : singleArgData), "_", "data"], "postprocess": singleArgDataToJson},
    {"name": "data", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("singleArgData") ? {type: "singleArgData"} : singleArgData), "_", "data", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": singleArgDataWithParenToJson},
    {"name": "data", "symbols": [(lexer.has("doubleArgData") ? {type: "doubleArgData"} : doubleArgData), "_", "data", "_", "data"], "postprocess": doubleArgDataToJson},
    {"name": "data", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("doubleArgData") ? {type: "doubleArgData"} : doubleArgData), "_", "data", "_", "data", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": doubleArgDataWithParenToJson},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"]}
]
  , ParserStart: "data"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
