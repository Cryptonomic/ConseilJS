// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

const moo = require("moo");

/*
  Assumptions:
  - Grammar defined here: http://tezos.gitlab.io/mainnet/whitedoc/michelson.html#xii-full-grammar
  - In lexer, types and instructions may have zero, one, two, or three arguments based on the keyword.
  - Issue: Some keywords like "DIP" can have zero and one arguments, and the lexer is order-dependent from top to bottom.
    This may impact parsing and lead to awkward parse errors, and needs to be addressed accordingly.
  - Issue: Splitting instructions by number of arguments hasn't been done, so certain invalid michelson expressions like
    "PAIR key key {DROP;}" will pass through even though PAIR is a constant expression. This is a false positive.
  - Issue: Some keywords were found after trial and error that were not in the grammar. Will update list accordingly.
  - Issue: There is an ambiguous parsing between commands LE and LEFT.
  - Issue: Michelson comments are not parsed.
  - Issue: In general, if you have multiple Michelson instructions in a code block, all of them, no matter how nested, 
    need to have a semicolon at the end, unless it's a singleton code block. In regular Michelson, you can have the very
    last instruction in a code block not have a semicolon.
*/

/*
  Lexer to parse keywords more efficiently.
*/
const lexer = moo.compile({
    lparen: '(',
    rparen: ')',
    lbrace: '{',
    rbrace: '}',
    ws: /[ \t]+/,
    semicolon: ";",
    comparableType: ['int', 'nat', 'string', 'bytes', 'mutez', 'bool', 'key_hash', 'timestamp'],
    constantType: ['key', 'unit', 'signature', 'operation', 'address'],
    singleArgType: ['option', 'list', 'set', 'contract'],
    doubleArgType: ['pair', 'or', 'lambda', 'map', 'big_map'],
    type: ['key', 'unit', 'signature', 'option', 'list', 'set', 'operation', 'address', 'contract', 'pair', 'or', 'lambda', 'map', 'big_map'],
    instruction: ['DROP', 'DUP', 'SWAP', 'PUSH', 'SOME', 'NONE', 'UNIT', 'IF_NONE', 'PAIR', 'CAR', 'CDR', 'LEFT', 'RIGHT', 'IF_LEFT', 'IF_RIGHT', 
    'NIL', 'CONS', 'IF_CONS', 'SIZE', 'EMPTY_SET', 'EMPTY_MAP', 'MAP',  'ITER', 'MEM',  'GET',  'UPDATE',  'IF',  'LOOP',  'LOOP_LEFT',  
    'LAMBDA', 'EXEC', 'DIP', 'FAILWITH', 'CAST', 'RENAME', 'CONCAT', 'SLICE', 'PACK', 'UNPACK', 'ADD',  'SUB',  'MUL', 'EDIV', 'ABS', 'NEG',   
    'LSL', 'LSR', 'OR', 'AND', 'XOR', 'NOT', 'COMPARE', 'EQ', 'NEQ', 'LT', 'GT', 'LE', 'GE', 'SELF', 'CONTRACT', 'TRANSFER_TOKENS', 
    'SET_DELEGATE', 'CREATE_CONTRACT', 'IMPLICIT_ACCOUNT', 'NOW', 'AMOUNT', 'BALANCE', 'CHECK_SIGNATURE', 'BLAKE2B', 'SHA256',
     'SHA512', 'HASH_KEY', 'STEPS_TO_QUOTA', 'SOURCE', 'SENDER', 'ADDRESS', 'FAIL', 'CDAR', 'CDDR', 'DUUP', 'DUUUP', 'DUUUUP', 
     'DUUUUUP', 'DUUUUUUP', 'DUUUUUUUP', 'DIIP', 'DIIIP', 'DIIIIP', 'DIIIIIP', 'DIIIIIIP', 'DIIIIIIIP', 'REDUCE', 'CMPLT', 'UNPAIR', 'CMPGT'],
    data: ['Unit', 'True', 'False', 'Left', 'Right', 'Pair', 'Some', 'None', 'instruction'],
    constantData: ['Unit', 'True', 'False', 'None', 'instruction'],
    singleArgData: ['Left', 'Right', 'Some'],
    doubleArgData: ['Pair'],
    parameter: ["parameter", "Parameter"],
    storage: ["Storage", "storage"],
    code: ["Code", "code"],
    elt: "Elt",
    number: /-?[0-9]+/,
    word: /[a-z]+/,
    string: /"(?:\\["\\]|[^\n"\\])*"/
});


    /**
     * Given a int, convert it to JSON.
     * Example: "3" -> { "int": "3" }
     */
    const intToJson = d => { return `{ "int": "${parseInt(d[0])}" }`; }

    /**
     * Given a string, convert it to JSON.
     * Example: "string" -> "{ "string": "blah" }"
     */
    const stringToJson =  d => { return `{ "string": ${d[0]} }`; }

    /**
     * Given a keyword, convert it to JSON.
     * Example: "int" -> "{ "prim" : "int" }"
     */
    const keywordToJson = d => { return `{ "prim": "${d[0]}" }`; }

    /**
     * Given a keyword with one argument, convert it to JSON.
     * Example: "option int" -> "{ prim: option, args: [int] }"
     */
    const singleArgKeywordToJson = d => { return `{ "prim": "${d[0]}", "args": [ ${d[2]} ] }`; }

    /**
     * Given a keyword with one argument and parentheses, convert it to JSON.
     * Example: "(option int)" -> "{ prim: option, args: [{prim: int}] }"
     */
    const singleArgKeywordWithParenToJson = d => { return `{ "prim": "${d[2]}", "args": [ ${d[4]} ] }`; }

    /**
     * Given a keyword with two arguments, convert it into JSON.
     * Example: "Pair unit instruction" -> "{ prim: Pair, args: [{prim: unit}, {prim: instruction}] }"
     */
    const doubleArgKeywordToJson = d => { return `{ "prim": "${d[0]}", "args": [${d[2]}, ${d[4]}] }`; }

    /**
     * Given a keyword with two arguments and parentheses, convert it into JSON.
     * Example: "(Pair unit instruction)" -> "{ prim: Pair, args: [{prim: unit}, {prim: instruction}] }"
     */
    const doubleArgKeywordWithParenToJson = d => { return `{ "prim": "${d[2]}", "args": [ ${d[4]}, ${d[6]} ] }`; }

    /**
     * Given a keyword with three arguments, convert it into JSON.
     * Example: "LAMBDA key unit {DIP;}" -> "{ prim: LAMBDA, args: [{prim: key}, {prim: unit}, {prim: DIP}] }"
     */
    const tripleArgKeyWordToJson = d => { return `{ "prim": "${d[0]}", "args": [ ${d[2]}, ${d[4]}, ${d[6]} ] }`; }

    /**
     * Given a keyword with three arguments and parentheses, convert it into JSON.
     * Example: "(LAMBDA key unit {DIP;})" -> "{ prim: LAMBDA, args: [{prim: key}, {prim: unit}, {prim: DIP}] }"
     */
    const tripleArgKeyWordWithParenToJson = d =>  { return `{ "prim": "${d[0]}", "args": [ ${d[2]}, ${d[4]}, ${d[6]} ] }`; }

    /**
     * Given a list of michelson instructions, convert it into JSON.
     * Example: "{CAR; NIL operation; PAIR;}" -> 
     * [ '{ prim: CAR }',
     * '{ prim: NIL, args: [{ prim: operation }] }',
     * '{ prim: PAIR }' ]
     */
    const instructionSetToJson = d => { return d[2].map(x => x[0]).concat(d[3]); }

    const scriptToJson = d => {
        const parameterJson = d[0];
        const storageJson = d[2];
        const codeJson = `{ "prim": "code", "args": [ [ ${d[4]} ] ] }`;
        return `[ ${parameterJson}, ${storageJson}, ${codeJson} ]`;
    }
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "main", "symbols": ["instruction"], "postprocess": id},
    {"name": "main", "symbols": ["data"], "postprocess": id},
    {"name": "main", "symbols": ["type"], "postprocess": id},
    {"name": "main", "symbols": ["parameter"], "postprocess": id},
    {"name": "main", "symbols": ["storage"], "postprocess": id},
    {"name": "main", "symbols": ["code"], "postprocess": id},
    {"name": "main", "symbols": ["script"], "postprocess": id},
    {"name": "script", "symbols": ["parameter", "_", "storage", "_", "code"], "postprocess": scriptToJson},
    {"name": "parameter", "symbols": [(lexer.has("parameter") ? {type: "parameter"} : parameter), "_", "type", "semicolons"], "postprocess": singleArgKeywordToJson},
    {"name": "storage", "symbols": [(lexer.has("storage") ? {type: "storage"} : storage), "_", "type", "semicolons"], "postprocess": singleArgKeywordToJson},
    {"name": "code", "symbols": [(lexer.has("code") ? {type: "code"} : code), "_", "subInstruction", "_", "semicolons", "_"], "postprocess": d => d[2]},
    {"name": "code", "symbols": [(lexer.has("code") ? {type: "code"} : code), "_", {"literal":"{};"}], "postprocess": d => "code {}"},
    {"name": "type", "symbols": [(lexer.has("comparableType") ? {type: "comparableType"} : comparableType)], "postprocess": keywordToJson},
    {"name": "type", "symbols": [(lexer.has("constantType") ? {type: "constantType"} : constantType)], "postprocess": keywordToJson},
    {"name": "type", "symbols": [(lexer.has("singleArgType") ? {type: "singleArgType"} : singleArgType), "_", "type"], "postprocess": singleArgKeywordToJson},
    {"name": "type", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("singleArgType") ? {type: "singleArgType"} : singleArgType), "_", "type", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": singleArgKeywordWithParenToJson},
    {"name": "type", "symbols": [(lexer.has("doubleArgType") ? {type: "doubleArgType"} : doubleArgType), "_", "type", "_", "type"], "postprocess": doubleArgKeywordToJson},
    {"name": "type", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("doubleArgType") ? {type: "doubleArgType"} : doubleArgType), "_", "type", "_", "type", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": doubleArgKeywordWithParenToJson},
    {"name": "subInstruction$ebnf$1$subexpression$1", "symbols": ["instruction", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"]},
    {"name": "subInstruction$ebnf$1", "symbols": ["subInstruction$ebnf$1$subexpression$1"]},
    {"name": "subInstruction$ebnf$1$subexpression$2", "symbols": ["instruction", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"]},
    {"name": "subInstruction$ebnf$1", "symbols": ["subInstruction$ebnf$1", "subInstruction$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subInstruction", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "subInstruction$ebnf$1", "instruction", "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": instructionSetToJson},
    {"name": "subInstruction$ebnf$2$subexpression$1", "symbols": ["instruction", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"]},
    {"name": "subInstruction$ebnf$2", "symbols": ["subInstruction$ebnf$2$subexpression$1"]},
    {"name": "subInstruction$ebnf$2$subexpression$2", "symbols": ["instruction", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"]},
    {"name": "subInstruction$ebnf$2", "symbols": ["subInstruction$ebnf$2", "subInstruction$ebnf$2$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subInstruction", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "subInstruction$ebnf$2", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": instructionSetToJson},
    {"name": "subInstruction", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "instruction", "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": d => d[2]},
    {"name": "subInstruction", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": d => "{}"},
    {"name": "instruction", "symbols": ["subInstruction"], "postprocess": id},
    {"name": "instruction", "symbols": [(lexer.has("instruction") ? {type: "instruction"} : instruction)], "postprocess": keywordToJson},
    {"name": "instruction", "symbols": [(lexer.has("instruction") ? {type: "instruction"} : instruction), "_", "subInstruction"], "postprocess": singleArgKeywordToJson},
    {"name": "instruction", "symbols": [(lexer.has("instruction") ? {type: "instruction"} : instruction), "_", "type"], "postprocess": singleArgKeywordToJson},
    {"name": "instruction", "symbols": [(lexer.has("instruction") ? {type: "instruction"} : instruction), "_", "data"], "postprocess": singleArgKeywordToJson},
    {"name": "instruction", "symbols": [(lexer.has("instruction") ? {type: "instruction"} : instruction), "_", "type", "_", "type", "_", "subInstruction"], "postprocess": tripleArgKeyWordToJson},
    {"name": "instruction", "symbols": [(lexer.has("instruction") ? {type: "instruction"} : instruction), "_", "subInstruction", "_", "subInstruction"], "postprocess": doubleArgKeywordToJson},
    {"name": "instruction", "symbols": [(lexer.has("instruction") ? {type: "instruction"} : instruction), "_", "type", "_", "type"], "postprocess": doubleArgKeywordToJson},
    {"name": "instruction", "symbols": [(lexer.has("instruction") ? {type: "instruction"} : instruction), "_", "type", "_", "data"], "postprocess": doubleArgKeywordToJson},
    {"name": "data", "symbols": [(lexer.has("data") ? {type: "data"} : data)], "postprocess": keywordToJson},
    {"name": "data", "symbols": [(lexer.has("data") ? {type: "data"} : data), "_", "data"], "postprocess": singleArgKeywordToJson},
    {"name": "data", "symbols": [(lexer.has("data") ? {type: "data"} : data), "_", "data", "_", "data"], "postprocess": doubleArgKeywordWithParenToJson},
    {"name": "data", "symbols": ["subData"], "postprocess": id},
    {"name": "data", "symbols": ["subElt"], "postprocess": id},
    {"name": "data", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": intToJson},
    {"name": "data", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": stringToJson},
    {"name": "subData$ebnf$1$subexpression$1", "symbols": ["data", {"literal":";"}, "_"]},
    {"name": "subData$ebnf$1", "symbols": ["subData$ebnf$1$subexpression$1"]},
    {"name": "subData$ebnf$1$subexpression$2", "symbols": ["data", {"literal":";"}, "_"]},
    {"name": "subData$ebnf$1", "symbols": ["subData$ebnf$1", "subData$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subData", "symbols": [{"literal":"{"}, "_", "subData$ebnf$1", {"literal":"}"}], "postprocess": instructionSetToJson},
    {"name": "subData$ebnf$2$subexpression$1", "symbols": ["data", {"literal":";"}, "_"]},
    {"name": "subData$ebnf$2", "symbols": ["subData$ebnf$2$subexpression$1"]},
    {"name": "subData$ebnf$2$subexpression$2", "symbols": ["data", {"literal":";"}, "_"]},
    {"name": "subData$ebnf$2", "symbols": ["subData$ebnf$2", "subData$ebnf$2$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subData", "symbols": [{"literal":"("}, "_", "subData$ebnf$2", {"literal":")"}], "postprocess": instructionSetToJson},
    {"name": "subElt$ebnf$1$subexpression$1", "symbols": ["elt", {"literal":";"}, "_"]},
    {"name": "subElt$ebnf$1", "symbols": ["subElt$ebnf$1$subexpression$1"]},
    {"name": "subElt$ebnf$1$subexpression$2", "symbols": ["elt", {"literal":";"}, "_"]},
    {"name": "subElt$ebnf$1", "symbols": ["subElt$ebnf$1", "subElt$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subElt", "symbols": [{"literal":"{"}, "_", "subElt$ebnf$1", {"literal":"}"}], "postprocess": instructionSetToJson},
    {"name": "subElt$ebnf$2$subexpression$1", "symbols": ["elt", {"literal":";"}, "_"]},
    {"name": "subElt$ebnf$2", "symbols": ["subElt$ebnf$2$subexpression$1"]},
    {"name": "subElt$ebnf$2$subexpression$2", "symbols": ["elt", {"literal":";"}, "_"]},
    {"name": "subElt$ebnf$2", "symbols": ["subElt$ebnf$2", "subElt$ebnf$2$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subElt", "symbols": [{"literal":"("}, "_", "subElt$ebnf$2", {"literal":")"}], "postprocess": instructionSetToJson},
    {"name": "elt", "symbols": [(lexer.has("elt") ? {type: "elt"} : elt), "_", "data", "_", "data"], "postprocess": doubleArgKeywordToJson},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"]},
    {"name": "semicolons", "symbols": []},
    {"name": "semicolons", "symbols": ["semicolons", {"literal":";"}]}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
