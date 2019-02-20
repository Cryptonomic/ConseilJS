@{%
const moo = require("moo");

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
    constantData: ['Unit', 'True', 'False', 'None', 'instruction'],
    singleArgData: ['Left', 'Right', 'Some'],
    doubleArgData: ['Pair'],
    data: ['Unit', 'True', 'False', 'Left', 'Right', 'Pair', 'Some', 'None', 'instruction'],
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

main -> instruction {% id %} | data {% id %} | type {% id %} | parameter {% id %} | storage {% id %} | code {% id %}
parameter -> %parameter _ type ";" {% singleArgKeywordToJson %}
storage -> %storage _ type ";" {% singleArgKeywordToJson %}
code -> %code _ subInstruction _ semicolons _ {% d => d[2] %}  | %code _ "{};" {% d => "code {}" %}

type -> 
    %comparableType {% keywordToJson %} 
  | %constantType {% keywordToJson %} 
  | %singleArgType _ type {% singleArgKeywordToJson %}
  | %lparen _ %singleArgType _ type %rparen {% singleArgKeywordWithParenToJson %}
  | %doubleArgType _ type _ type {% doubleArgKeywordToJson %}
  | %lparen _ %doubleArgType _ type _ type %rparen {% doubleArgKeywordWithParenToJson %}

subInstruction -> %lbrace _ (instruction _ %semicolon _):+ %rbrace {% instructionSetToJson %} 
 #| %lbrace _ instruction (_ %semicolon _ instruction):+ _ %rbrace {% id %}
  | %lbrace _ instruction _ %rbrace {% d => d[2] %}
  | %lbrace _ %rbrace {% id %}
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

data ->
    %data {% keywordToJson %}
  | %data _ data {% singleArgKeywordToJson %}
  | %data _ data _ data {% doubleArgKeywordWithParenToJson %}
  | subData {% id %}
  | subElt {% id %}
  | %number {% keywordToJson %}
  | %string {% keywordToJson %}
subData -> 
    "{" _ (data ";" _):+ "}" {% instructionSetToJson %}
  | "(" _ (data ";" _):+ ")" {% instructionSetToJson %}
subElt -> 
    "{" _ (elt ";" _):+ "}" {% instructionSetToJson %}
  | "(" _ (elt ";" _):+ ")" {% instructionSetToJson %}
elt -> %elt _ data _ data {% doubleArgKeywordToJson  %}

_ -> [\s]:*
semicolons -> null | semicolons ";"

@{%

  const keywordToJson = d => 
    {
        const s = d[0]
        return "{ prim: " + s + " }"
    }

  const singleArgKeywordToJson = d => 
    { 
      const s = d[0]
      const rule = d[2]
      return "{ prim: " + s + ", args: [" + rule + "] }"
    }  

  const singleArgKeywordWithParenToJson = d =>
    {
      const s = d[2]
      const rule = d[4]
      return "{ prim: " + s + ", args: [" + rule + "] }"
    }

  const doubleArgKeywordToJson = d => 
    {
      const s = d[0]
      const rule_one = d[2]
      const rule_two = d[4]
      return "{ prim: " + s + ", args: [" + rule_one + ", " + rule_two + "] }"
    }  

  const doubleArgKeywordWithParenToJson = d =>  
    {
      const s = d[2]
      const rule_one = d[4]
      const rule_two = d[6]
      return "{ prim: " + s + ", args: [" + rule_one + ", " + rule_two + "] }"
    }

  const tripleArgKeyWordToJson = d => 
    {
      const s = d[0]
      const rule_one = d[2]
      const rule_two = d[4]
      const rule_three = d[6]
      return "{ prim: " + s + ", args: [" + rule_one + ", " + rule_two + ", " + rule_three + "] }"
    }  

  const tripleArgKeyWordWithParenToJson = d =>  
    {
      const s = d[2]
      const rule_one = d[4]
      const rule_two = d[6]
      return "{ prim: " + s + ", args: [" + rule_one + ", " + rule_two + ", " + rule_three + "] }"
    }  

  const instructionSetToJson = d =>
    {
      const instructions = d[2]
      const instructionsList = instructions.map(x => x[0])
      return instructionsList
    }

  const altInstructionSetToJson = d =>
    {
      const instruction = d[2]
      const instructions = d[3]
      instructions.unshift(instruction)
      const instructionsList = instructions.map(x => x[0])
      return instructionsList
    }  

%}