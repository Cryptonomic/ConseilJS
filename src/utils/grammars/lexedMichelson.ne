@{%
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
    comparableType: ['int', 'nat', 'string', 'bytes', 'mutez', 'bool', 'key_hash', 'timestamp', 'tez'],
    constantType: ['key', 'unit', 'signature', 'operation', 'address'],
    singleArgType: ['option', 'list', 'set', 'contract'],
    doubleArgType: ['pair', 'or', 'lambda', 'map', 'big_map'],
    type: ['key', 'unit', 'signature', 'option', 'list', 'set', 'operation', 'address', 'contract', 'pair', 'or', 'lambda', 'map', 'big_map' ],
    instruction: ['DROP', 'DUP', 'SWAP', 'PUSH', 'SOME', 'NONE', 'UNIT', 'IF_NONE', 'PAIR', 'CAR', 'CDR', 'LEFT', 'RIGHT', 'IF_LEFT', 'IF_RIGHT', 
    'NIL', 'CONS', 'IF_CONS', 'SIZE', 'EMPTY_SET', 'EMPTY_MAP', 'MAP',  'ITER', 'MEM',  'GET',  'UPDATE',  'IF',  'LOOP',  'LOOP_LEFT',  
    'LAMBDA', 'EXEC', 'DIP', 'FAILWITH', 'CAST', 'RENAME', 'CONCAT', 'SLICE', 'PACK', 'UNPACK', 'ADD',  'SUB',  'MUL', 'EDIV', 'ABS', 'NEG',   
    'LSL', 'LSR', 'OR', 'AND', 'XOR', 'NOT', 'COMPARE', 'EQ', 'NEQ', 'LT', 'GT', 'LE', 'GE', 'SELF', 'CONTRACT', 'TRANSFER_TOKENS', 
    'SET_DELEGATE', 'CREATE_CONTRACT', 'IMPLICIT_ACCOUNT', 'NOW', 'AMOUNT', 'BALANCE', 'CHECK_SIGNATURE', 'BLAKE2B', 'SHA256',
     'SHA512', 'HASH_KEY', 'STEPS_TO_QUOTA', 'SOURCE', 'SENDER', 'ADDRESS', 'DEFAULT_ACCOUNT', 'FAIL', 'CDAR', 'CDDR', 'DUUP', 'DUUUP', 'DUUUUP', 
     'DUUUUUP', 'DUUUUUUP', 'DUUUUUUUP', 'DIIP', 'DIIIP', 'DIIIIP', 'DIIIIIP', 'DIIIIIIP', 'DIIIIIIIP', 'REDUCE'],
    data: ['Unit', 'True', 'False', 'Left', 'Right', 'Pair', 'Some', 'None', 'instruction'],
    constantData: ['Unit', 'True', 'False', 'None', 'instruction'],
    singleArgData: ['Left', 'Right', 'Some'],
    doubleArgData: ['Pair'],
    parameter: ["parameter", "Parameter"],
    storage: ["Storage", "storage"],
    code: ["Code", "code"],
    elt: "Elt",
    number: /-?(?:[0-9]|[1-9][0-9]+)(?:\.[0-9]+)?(?:[eE][-+]?[0-9]+)?\b/,
    word: /[a-z]+/,
    string: /"(?:\\["\\]|[^\n"\\])*"/
});
%}

# Pass your lexer object using the @lexer option:
@lexer lexer

# Main endpoint, parameter, storage, and code are necessary for user usage. Instruction, data, and type are for testing purposes.
main -> instruction {% id %} | data {% id %} | type {% id %} | parameter {% id %} | storage {% id %} | code {% id %} | script {% id %}
script -> parameter _ storage _ code {% scriptToJson %} 
parameter -> %parameter _ type ";" {% singleArgKeywordToJson %}
storage -> %storage _ type ";" {% singleArgKeywordToJson %}
code -> %code _ subInstruction _ semicolons _ {% d => d[2] %}  | %code _ "{};" {% d => "code {}" %}

# Grammar of a Michelson type
type -> 
    %comparableType {% keywordToJson %} 
  | %constantType {% keywordToJson %} 
  | %singleArgType _ type {% singleArgKeywordToJson %}
  | %lparen _ %singleArgType _ type %rparen {% singleArgKeywordWithParenToJson %}
  | %doubleArgType _ type _ type {% doubleArgKeywordToJson %}
  | %lparen _ %doubleArgType _ type _ type %rparen {% doubleArgKeywordWithParenToJson %}

# Helper pattern for lists of michelson instructions
subInstruction -> %lbrace _ (instruction _ %semicolon _):+ %rbrace {% instructionSetToJson %} 
 #| %lbrace _ instruction (_ %semicolon _ instruction):+ _ %rbrace {% id %} potential fix for arbitrary semicolons in list of michelson instructions.
  | %lbrace _ instruction _ %rbrace {% d => d[2] %}
  | %lbrace _ %rbrace {% d => "{}" %}
# Grammar for michelson instruction.   
instruction ->
    subInstruction {% id %}
  | %instruction {% keywordToJson %}
  | %instruction _ subInstruction {% singleArgKeywordToJson %}
  | %instruction _ type {% singleArgKeywordToJson %}
  | %instruction _ data {% singleArgKeywordToJson %}
  | %instruction _ type _ type _ subInstruction {% tripleArgKeyWordToJson %}
  | %instruction _ subInstruction _ subInstruction {% doubleArgKeywordToJson %}
  | %instruction _ type _ type {% doubleArgKeywordToJson %}
  | %instruction _ type _ data {% doubleArgKeywordToJson %}

# Grammar for michelson data.
data ->
    %data {% keywordToJson %}
  | %data _ data {% singleArgKeywordToJson %}
  | %data _ data _ data {% doubleArgKeywordWithParenToJson %}
  | subData {% id %}
  | subElt {% id %}
  | %number {% intToJson %}
  | %string {% stringToJson %}
# Helper grammar for list of michelson data types.
subData -> 
    "{" _ (data ";" _):+ "}" {% instructionSetToJson %}
  | "(" _ (data ";" _):+ ")" {% instructionSetToJson %}
# Helper grammar for list of pairs of michelson data types.
subElt -> 
    "{" _ (elt ";" _):+ "}" {% instructionSetToJson %}
  | "(" _ (elt ";" _):+ ")" {% instructionSetToJson %}
elt -> %elt _ data _ data {% doubleArgKeywordToJson  %}

# Helper grammar for whitespace.
_ -> [\s]:*
# Helper grammar for semicolons.
semicolons -> null | semicolons ";"

@{%
  /* Given a int, convert it to JSON.
     Example: "3" -> { "int": "3" }
  */
  const intToJson = d => { return `{ "int": "${parseInt(d[0])}" }`; }

  /* Given a string, convert it to JSON.
     Example: "string" -> "{ "string": "blah" }"
  */
  const stringToJson =  d => { return `{ "string": "${d[0]}" }`; }

  /* Given a keyword, convert it to JSON.
     Example: "int" -> "{ "prim" : "int" }"
  */
  const keywordToJson = d => { return `{ "prim": "${d[0]}" }`; }

  /* Given a keyword with one argument, convert it to JSON.
     Example: "option int" -> "{ prim: option, args: [int] }"
  */
  const singleArgKeywordToJson = d => 
    { 
      const s = d[0]
      const doubleQuotedS = '"' + s + '"'      
      const rule = d[2]
      return "{ \"prim\": " + doubleQuotedS + ", \"args\": [" + rule + "] }"
    }  

  /* Given a keyword with one argument and parentheses, convert it to JSON.
     Example: "(option int)" -> "{ prim: option, args: [{prim: int}] }"
  */
  const singleArgKeywordWithParenToJson = d =>
    {
      const s = d[2]
      const doubleQuotedS = '"' + s + '"'
      const rule = d[4]
      return "{ \"prim\": " + doubleQuotedS + ", \"args\": [" + rule + "] }"
    }

  /* Given a keyword with two arguments, convert it into JSON.
     Example: "Pair unit instruction" -> "{ prim: Pair, args: [{prim: unit}, {prim: instruction}] }"
  */
  const doubleArgKeywordToJson = d => 
    {
      const s = d[0]
      const doubleQuotedS = '"' + s + '"'
      const rule_one = d[2]
      const rule_two = d[4]
      return "{ \"prim\": " + doubleQuotedS + ", \"args\": [" + rule_one + ", " + rule_two + "] }"
    }  

  /* Given a keyword with two arguments and parentheses, convert it into JSON.
     Example: "(Pair unit instruction)" -> "{ prim: Pair, args: [{prim: unit}, {prim: instruction}] }"
  */
  const doubleArgKeywordWithParenToJson = d =>  
    {
      const s = d[2]
      const doubleQuotedS = '"' + s + '"'
      const rule_one = d[4]
      const rule_two = d[6]
      return "{ \"prim\": " + doubleQuotedS + ", \"args\": [" + rule_one + ", " + rule_two + "] }"
    }

  /* Given a keyword with three arguments, convert it into JSON.
     Example: "LAMBDA key unit {DIP;}" -> "{ prim: LAMBDA, args: [{prim: key}, {prim: unit}, {prim: DIP}] }"
  */
  const tripleArgKeyWordToJson = d => 
    {
      const s = d[0]
      const doubleQuotedS = '"' + s + '"'
      const rule_one = d[2]
      const rule_two = d[4]
      const rule_three = d[6]
      return "{ \"prim\": " + doubleQuotedS + ", \"args\": [" + rule_one + ", " + rule_two + ", " + rule_three + "] }"
    }  

  /* Given a keyword with three arguments and parentheses, convert it into JSON.
      Example: "(LAMBDA key unit {DIP;})" -> "{ prim: LAMBDA, args: [{prim: key}, {prim: unit}, {prim: DIP}] }"
  */
  const tripleArgKeyWordWithParenToJson = d =>  
    {
      const s = d[2]
      const doubleQuotedS = '"' + s + '"'
      const rule_one = d[4]
      const rule_two = d[6]
      return "{ \"prim\": " + doubleQuotedS + ", \"args\": [" + rule_one + ", " + rule_two + ", " + rule_three + "] }"
    }  

  /* Given a list of michelson instructions, convert it into JSON.
     Example: "{CAR; NIL operation; PAIR;}" -> 
     [ '{ prim: CAR }',
       '{ prim: NIL, args: [{ prim: operation }] }',
       '{ prim: PAIR }' ]
  */
  const instructionSetToJson = d =>
    {
      const instructions = d[2]
      const instructionsList = instructions.map(x => x[0])
      return instructionsList
    }

  /* Unused right now, may be helpful in arbitrary semicolons in 
     list of instructions case. Will update description or delete
     if used.
  */
  const altInstructionSetToJson = d =>
    {
      const instruction = d[2]
      const instructions = d[3]
      instructions.unshift(instruction)
      const instructionsList = instructions.map(x => x[0])
      return instructionsList
    }  

    const scriptToJson = d =>
      {
        const parameterJson = d[0]
        const storageJson = d[2]
        const code = d[4] 
        const codeJson = "{ \"prim\": \"code\", \"args\": " + "[" + code + "]}"
        return [parameterJson, storageJson, codeJson]
      }

%}