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
    annot: ["%",":","@"],
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
     'DUUUUUP', 'DUUUUUUP', 'DUUUUUUUP', 'DIIP', 'DIIIP', 'DIIIIP', 'DIIIIIP', 'DIIIIIIP', 'DIIIIIIIP', 'REDUCE', 'CMPLT', 'UNPAIR', 'CMPGT',
     'CMPLE', 'CMPGE', 'UNPAPAIR', 'CAAR', 'CDDDDADR', 'CDDADDR', 'CDADDR', 'CDADAR', 'IFCMPEQ', 'CDDDADR', 'CADAR', 'CDDDAAR',
     'CADDR', 'CDDDDR', 'CDDAAR', 'CDDADAR', 'CDDDDDR', 'CDDDDAAR', 'ASSERT_CMPGE', 'CDAAR', 'CDADR', 'CDDAR', 'CDDDR', 
     'CMPEQ', 'CAAR', 'CAAAR', 'CAAAAR', 'CAAAAAR', 'CAAAAAAR', 'CAAAAAAAR', 'CDDR', 'CDDDR', 'CDDDDR', 'CDDDDDR', 'CDDDDDDR', 'CDDDDDDDR',
     'ASSERT_CMPEQ', 'ASSERT_CMPLT', 'ISNAT', 'IFCMPGT', 'IFCMPGE', 'IFCMPLT', 'IFCMPLE', 'IF_SOME', 'CADR' ],
    data: ['Unit', 'True', 'False', 'Left', 'Right', 'Pair', 'Some', 'None', 'instruction'],
    constantData: ['Unit', 'True', 'False', 'None', 'instruction'],
    singleArgData: ['Left', 'Right', 'Some'],
    doubleArgData: ['Pair'],
    elt: "Elt",
    number: /-?[0-9]+/,
    word: /[a-zA-z_0-9]+/,
    string: /"(?:\\["\\]|[^\n"\\])*"/
});
%}

# Pass your lexer object using the @lexer option:
@lexer lexer

# Main endpoint, parameter, storage, and code are necessary for user usage. Instruction, data, and type are for testing purposes.
main -> instruction {% id %} | data {% id %} | type {% id %} | parameter {% id %} | storage {% id %} | code {% id %} | script {% id %}
script -> parameter _ storage _ code {% scriptToJson %} 

parameter -> "parameter" | "Parameter"
storage -> "Storage" | "storage"
code -> "Code" | "code"

parameter -> parameter _ type _ semicolons {% singleArgKeywordToJson %}
storage -> storage _ type _ semicolons {% singleArgKeywordToJson %}
code -> code _ subInstruction _ semicolons _ {% d => d[2] %}
  | %code _ "{};" {% d => "code {}" %}

# Grammar of a Michelson type
type -> 
    %comparableType {% keywordToJson %} 
  | %constantType {% keywordToJson %} 
  | %singleArgType _ type {% singleArgKeywordToJson %}
  | %lparen _ %singleArgType _ type %rparen {% singleArgKeywordWithParenToJson %}
  | %doubleArgType _ type _ type {% doubleArgKeywordToJson %}
  | %lparen _ %doubleArgType _ type _ type %rparen {% doubleArgKeywordWithParenToJson %}
  | %comparableType (_ %annot (%storage|%string|%word)):+ {% typeKeywordToJson %} 
  | %constantType (_ %annot (%storage|%string|%word)):+ {% typeKeywordToJson %}
  | %lparen _ %comparableType (_ %annot (%storage|%string|%word)):+ _ %rparen {% singleArgTypeKeywordWithParenToJson %}
  | %lparen _ %constantType (_ %annot (%storage|%string|%word)):+ _ %rparen {% singleArgTypeKeywordWithParenToJson %}
  | %lparen _ %singleArgType (_ %annot (%storage|%string|%word)):+ _ type %rparen {% singleArgTypeKeywordWithParenToJson %}
  | %lparen _ %doubleArgType (_ %annot (%storage|%string|%word)):+ _ type _ type %rparen {% doubleArgTypeKeywordWithParenToJson %}
#  | %singleArgType _ type {% singleArgKeywordToJson %}
#  | %lparen _ %singleArgType _ type %rparen {% singleArgKeywordWithParenToJson %}
#  | %doubleArgType _ type _ type {% doubleArgKeywordToJson %}
#  | %lparen _ %doubleArgType _ type _ type %rparen {% doubleArgKeywordWithParenToJson %}  

# Helper pattern for lists of michelson instructions
subInstruction -> %lbrace _ (instruction _ %semicolon _):+ instruction _ %rbrace {% instructionSetToJsonNoSemi %} #If last instruction doesn't have semicolon
  | %lbrace _ (instruction _ %semicolon _):+ %rbrace {% instructionSetToJsonSemi %} #If last instruction has semicolon
  | %lbrace _ instruction _ %rbrace {% d => d[2] %}
  | %lbrace _ %rbrace {% d => "" %}

# Grammar for michelson instruction.   
instruction ->
    subInstruction {% id %}
  | %instruction {% keywordToJson %}
  | %instruction (_ %annot (%parameter|storage|%word|%string)):+ {% typeKeywordToJson %}
  | %instruction _ subInstruction {% singleArgInstrKeywordToJson %}
  | %instruction _ type {% singleArgKeywordToJson %}
  | %instruction _ data {% singleArgKeywordToJson %}
  | %instruction _ type _ type _ subInstruction {% tripleArgKeyWordToJson %}
  | %instruction _ subInstruction _ subInstruction {% doubleArgInstrKeywordToJson %}
  | %instruction _ type _ type {% doubleArgKeywordToJson %}
  | %instruction _ type _ data {% doubleArgKeywordToJson %}
  | %instruction (_ %annot (%parameter|%storage|%word)):+ _ type _ data {% doubleArgTypeKeywordToJson %}


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
    "{" _ (data ";" _):+ "}" {% instructionSetToJsonSemi %}
  | "(" _ (data ";" _):+ ")" {% instructionSetToJsonSemi %}
# Helper grammar for list of pairs of michelson data types.
subElt -> 
    "{" _ (elt ";" _):+ "}" {% instructionSetToJsonSemi %}
  | "(" _ (elt ";" _):+ ")" {% instructionSetToJsonSemi %}
elt -> %elt _ data _ data {% doubleArgKeywordToJson  %}

# Helper grammar for whitespace.
_ -> [\s]:*
# Helper grammar for semicolons.
semicolons -> null | semicolons ";"

@{%

    const truncatedKeywords = new Set(
      ['CAAR', 'CAAAR', 'CAAAAR', 'CAAAAAR', 'CAAAAAAR', 'CAAAAAAAR', 
       'CDDR', 'CDDDR', 'CDDDDR', 'CDDDDDR', 'CDDDDDDR', 'CDDDDDDDR', 
       'DUUP', 'DUUUP', 'DUUUUP', 'DUUUUUP', 'DUUUUUUP', 'DUUUUUUUP',  
       'CMPLT', 'CMPGT', 'CMPEQ', 'ASSERT_CMPGE', 'ASSERT_CMPEQ', 'ASSERT_CMPLT',
       'CMPLE', 'CMPGE', 'UNPAIR', 'UNPAPAIR', 
       'CDAR', 'CDDDDADR', 'CDDADDR', 'CDADDR', 'CDADAR', 'CDDDADR', 'CADAR', 'CDDDAAR', 'CADDR', 'CADR',
       'CDDDDR', 'CDDAAR', 'CDDADAR', 'CDDDDDR', 'CDDDDAAR', 'CDAAR', 'CDADR', 'CDDAR', 'CDDDR', 'FAIL'])   

    //The difference between these and truncated is that these instructions have other instructions as arguments.
    const dipKeywords = new Set(
      [ 'DIIP', 'DIIIP', 'DIIIIP', 'DIIIIIP', 'DIIIIIIP', 'DIIIIIIIP']
    )   

    const ifKeywords = new Set(
      [ 'IFCMPEQ', 'IFCMPGE', 'IFCMPGT', 'IFCMPLE', 'IFCMPLT' ]
    )

    const replicateKeyword = (word, n) => {
      var result = []
      for (i = 0; i < n; i++) {
        result.push(keywordToJson([word]))
      }
      return result
    }   

    const checkC_R = c_r => {
      var pattern = new RegExp('^C(A|D)+R$')
      return pattern.test(c_r)
    }

    const expandC_R = c_r => {return [];}
      //input: C*R
      //remove first and last characters from string
      //A -> keywordToJson(['CAR'])
      //D -> keywordToJson(['CDR'])
      // if annotations, put in last element of array
      //return `${mappedArray}`

    const check_compare = cmp => 
    {
      var pattern = new RegExp('^CMP(NEQ|EQ|GT|LT|GE|LE)$')
      return pattern.test(c_r)
    }

    const expand_cmp = cmp => { return []; }
      //input : CMP*
      //take last characters of string that aren't CMP -> keywordToJson([last])
      // if annotations, put in last element of array
      //return '${[keywordToJson(['COMPARE'])], ^}

    const check_dup = dup =>
    {
      var pattern = new RegExp('^DU+P$')
      return pattern.test(c_r)
    }

    //finish function
    const expand_dup = dup => {
      if (dup == "DUP") {
        return `[${keywordToJson(['DUP'])}]`
      }
      const newDup = dup.substring(0,1) + dup.substring(2)

      var dip = keywordToJson(['DIP']);
      var dips = []

      var swap = keywordToJson(['SWAP']);
      var swaps = []
      for (let i = 0; i < dup.length; i++) {

      }

    }
      //input : D(U*)P
      // DUP -> DUP
      // DU(U+)P -> n = |U+|, repeat n keywordToJson(['DIP']); keywordToJson(['DUP']); repeat n keywordToJson(['SWAP']);
      // // if no annot, return duuuup put annot in swap otherwise

    const check_assert = assert =>
    {
      var pattern = new RegExp('^ASSERT$|^ASSERT_(EQ|NEQ|GT|LT|GE|LE|NONE|SOME|LEFT|RIGHT|CMPEQ|CMPNEQ|CMPGT|CMPLT|CMPGE|CMPLE)$')
      return pattern.test(c_r)
    }

    const expand_assert = assert => {
      //input : ASSERT_CMP**
      //ASSERT -> {"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}
      //ASSERT_* -> same as above, but [] -> expand * (comparison ops, CMP_comparison ops)
      //ASSERT_NONE  =>  IF_NONE {} {FAIL}
      //ASSERT_SOME  =>  IF_NONE {FAIL} {}
      //ASSERT_LEFT  =>  IF_LEFT {} {FAIL}
      //ASSERT_RIGHT  =>  IF_LEFT {FAIL} {}
      // last five characters -> expand_cmp
      // return [expand_cmp, assert]  if no annot, put annot in assert otherwise
      // if annotations, put in last element of array
      switch (assert) {
        case 'ASSERT':
          return `[{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`
        case 'ASSERT_CMPEQ':
          return `[{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`  
        case 'ASSERT_CMPGE':
          return `[{"prim":"COMPARE"},{"prim":"GE"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`  
        case 'ASSERT_CMPGT':
          return `[{"prim":"COMPARE"},{"prim":"GT"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`
        case 'ASSERT_CMPLE':
          return `[{"prim":"COMPARE"},{"prim":"LE"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`  
        case 'ASSERT_CMPLT':
          return `[{"prim":"COMPARE"},{"prim":"LT"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`   
        case 'ASSERT_CMPNEQ': 
          return `[{"prim":"COMPARE"},{"prim":"NEQ"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`
        //put this in cmp function, replace with assert_*
        case 'CMPEQ':
          return `[{"prim":"EQ"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`
        case 'CMPGE':
          return `[{"prim":"GE"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`  
        case 'CMPGT':
          return `[{"prim":"GT"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`
        case 'CMPLE':
          return `[{"prim":"LE"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`  
        case 'CMPLT':
          return `[{"prim":"LT"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`   
        case 'CMPNEQ': 
          return `[{"prim":"NEQ"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`        
      }
    }

    const check_fail = fail => {
      return fail == "FAIL";
    } 

    const expand_fail = fail => {
      // if annotations, put in last element of array, if no annot, put annot in FAILWITH otherwise
      return '[ { "prim": "UNIT" }, { "prim": "FAILWITH"} ]'   
    }

    const check_if = ifStatement => {
      var pattern = new RegExp('^IF(EQ|NEQ|GT|LT|GE|LE|CMPEQ|CMPNEQ|CMPGT|CMPLT|CMPGE|CMPLE)$')
      return pattern.test(c_r)
    }

    const expandIF = (ifInstr, ifTrue, ifFalse) => {
      //IFEQ, IFGE, IFGT, IFLE, IFLT : EXACTLY THE SAME AS IFCMP, JUST REMOVE COMPARE
      // if annotations, put in last element of array
      switch (ifInstr) {
        case 'IFCMPEQ':
          return `[{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]}]`
        case 'IFCMPGE':
          return `[{"prim":"COMPARE"},{"prim":"GE"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]}]`  
        case 'IFCMPGT':
          return `[{"prim":"COMPARE"},{"prim":"GT"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]}]`
        case 'IFCMPLE':
          return `[{"prim":"COMPARE"},{"prim":"LE"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]}]`  
        case 'IFCMPLT':
          return `[{"prim":"COMPARE"},{"prim":"LT"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]}]`   
        case 'IFCMPNEQ': 
          return `[{"prim":"COMPARE"},{"prim":"NEQ"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]}]`
        case 'CMPEQ':
          return `[{"prim":"EQ"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]}]`
        case 'CMPGE':
          return `[{"prim":"GE"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]}]`  
        case 'CMPGT':
          return `[{"prim":"GT"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]}]`
        case 'CMPLE':
          return `[{"prim":"LE"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]}]`  
        case 'CMPLT':
          return `[{"prim":"LT"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]}]`   
        case 'CMPNEQ': 
          return `[{"prim":"NEQ"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]}]`        
      }
    }   

    const check_dip = dip => {
      var pattern = new RegExp('^DI+P$')
      return pattern.test(c_r)
    }

    const expandDIP = (dip, instruction) => { 
      switch (dip) {
        case 'DIIP':
          return `[{ "prim": "DIP", "args": [ [ { "prim": "DIP", "args": [ [ ${instruction} ] ] } ] ] }]`;
      }  

      // ANNOTATION LAST ONE
      // DIP code -> return `{ "prim": "DIP", "args": [ [ ${code} ] ] }`; 
      // DI(I+)P code -> return `{ "prim": "DIP", "args": [ [ ${expandDIP(D(I+)P, instruction)} ] ] }`; 
      /*
      var pattern = new RegExp('^DII+P$')
      if (pattern.test(dip)) {
        var newDip = dip.substring(0,1) + dip.substring(2)
        var innerDip = expandDIP(newDip, instruction)
        return `{ "prim": "DIP", "args": [ [ ${innerDip} ] ] }`; 
      }
      else {
        //add annotation in this branch
        return `{ "prim": "DIP", "args": [ [ ${code} ] ] }`; 
      }
      */
    }

    const expandKeyword = word => {
      switch (word) {
        case 'CAAR':
          return `[${keywordToJson(['CAR'])}, ${keywordToJson(['CAR'])}]`
        case 'CDAR':
          return `[${keywordToJson(['CDR'])}, ${keywordToJson(['CAR'])}]`         
        case 'CMPGT':
          return `[${keywordToJson(['COMPARE'])}, ${keywordToJson(['GT'])}]` 
        case 'CMPGE':
          return `[${keywordToJson(['COMPARE'])}, ${keywordToJson(['GE'])}]`    
        case 'CMPLT':
          return `[${keywordToJson(['COMPARE'])}, ${keywordToJson(['LT'])}]`   
        case 'CMPLE':
          return `[${keywordToJson(['COMPARE'])}, ${keywordToJson(['LE'])}]`  
        case 'CDDR':
          return `[${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}]`   
        //These are equivalent by inspection of tezos node output, replace with more elegant solution later.  
        case 'UNPAIR':
          return '[ [ { "prim": "DUP" }, { "prim": "CAR" }, { "prim": "DIP", "args": [ [ { "prim": "CDR" } ] ] } ] ]'
        case 'UNPAPAIR':
          return `[ [ { "prim": "DUP" },
                     { "prim": "CAR" },
                     { "prim": "DIP", "args": [ [ { "prim": "CDR" } ] ] } ],
                     {"prim":"DIP","args":[[[{"prim":"DUP"},{"prim":"CAR"},{"prim":"DIP","args":[[{"prim":"CDR"}]]}]]]}] `
        case 'FAIL': 
          return '[ { "prim": "UNIT" }, { "prim": "FAILWITH"} ]'  
        case 'DUUUP':
          return `[{"prim":"DIP","args":[[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}]]},{"prim":"SWAP"}]`
        case 'DUUP':
          return `[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}]`   
        case 'CDDADDR':
          return `[${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CAR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}]`  
        case 'CDDAR': 
          return `[${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CAR'])}]` 
        case 'CDDDR': 
          return `[${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}]` 
        case 'CDADAR':
          return `[${keywordToJson(['CDR'])}, ${keywordToJson(['CAR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CAR'])}]`
        case 'CDADDR':
          return `[${keywordToJson(['CDR'])}, ${keywordToJson(['CAR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}]` 
        case 'CDDAAR':  
          return `[${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CAR'])}, ${keywordToJson(['CAR'])}]`
        case 'CDDDADR':
          return `[${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CAR'])}, ${keywordToJson(['CDR'])}]` 
        case 'CADAR':
          return `[${keywordToJson(['CAR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CAR'])}]`
        case 'CDDDAAR':
          return `[${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CAR'])}, ${keywordToJson(['CAR'])}]`
        case 'CADDR':  
          return `[${keywordToJson(['CAR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}]`    
        case 'CDDDDR':
          return `[${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}]`   
        case 'CDDADAR':
          return `[${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CAR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CAR'])}]`   
        case 'CDDDDADR':
          return `[${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CAR'])}, ${keywordToJson(['CDR'])}]`
        case 'CDDDDDR':
          return `[${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}]`  
        case 'CDAAR':
          return `[${keywordToJson(['CDR'])}, ${keywordToJson(['CAR'])}, ${keywordToJson(['CAR'])}]`
        case 'CDADR':
          return `[${keywordToJson(['CDR'])}, ${keywordToJson(['CAR'])}, ${keywordToJson(['CDR'])}]`  
        case 'CADR':
          return `[${keywordToJson(['CAR'])}, ${keywordToJson(['CDR'])}]`     
        case 'CDDDDAAR':
          return `[${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CDR'])}, ${keywordToJson(['CAR'])}, ${keywordToJson(['CAR'])}]`
        case 'ASSERT_CMPGE':
          return `[[{"prim":"COMPARE"},{"prim":"GE"}],{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`   
      }
    }


    

   
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
    const keywordToJson = d => { 
      //console.log(`matching keyword '${d[0]}'`)
      //console.log(truncatedKeywords)
      //console.log(`--t '${truncatedKeywords.has(d[0].toString())}'`)
      const word = `${d[0].toString()}`
      if (truncatedKeywords.has(word)) {//(truncatedKeywords.has(`${d[0].toString()}`)) {
        //console.log(`found expansion ${[expandKeyword(d[0].toString())]}`)
        //console.log([1,2,3])
        return [expandKeyword(d[0].toString())] 
      }
      else {
        //console.log(`found '${d[0]}'`)
        return `{ "prim": "${d[0]}" }`; 
      }
    }

    /**
     * Given a keyword with one argument, convert it to JSON.
     * Example: "option int" -> "{ prim: option, args: [int] }"
     */
    const singleArgKeywordToJson = d => { return `{ "prim": "${d[0]}", "args": [ ${d[2]} ] }`; }

    const singleArgInstrKeywordToJson = d => { 
      const word = `${d[0].toString()}`
      if (dipKeywords.has(word)) {
        return expandDIP(word, d[2])
      }
      else {
        return `{ "prim": "${d[0]}", "args": [ [ ${d[2]} ] ] }`; 
      }
    }

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

    const doubleArgInstrKeywordToJson = d => { 
      const word = `${d[0].toString()}`
      console.log(word)
      if (ifKeywords.has(word)) {
        return expandIF(word, d[2], d[4])
      }
      else {
        return `{ "prim": "${d[0]}", "args": [ [${d[2]}], [${d[4]}] ] }`; 
      }
    }

    /**
     * Given a keyword with two arguments and parentheses, convert it into JSON.
     * Example: "(Pair unit instruction)" -> "{ prim: Pair, args: [{prim: unit}, {prim: instruction}] }"
     */
    const doubleArgKeywordWithParenToJson = d => { return `{ "prim": "${d[2]}", "args": [ ${d[4]}, ${d[6]} ] }`; }

    /**
     * Given a keyword with three arguments, convert it into JSON.
     * Example: "LAMBDA key unit {DIP;}" -> "{ prim: LAMBDA, args: [{prim: key}, {prim: unit}, {prim: DIP}] }"
     */
    const tripleArgKeyWordToJson = d => { return `{ "prim": "${d[0]}", "args": [ ${d[2]}, ${d[4]}, [${d[6]}] ] }`; }

    /**
     * Given a keyword with three arguments and parentheses, convert it into JSON.
     * Example: "(LAMBDA key unit {DIP;})" -> "{ prim: LAMBDA, args: [{prim: key}, {prim: unit}, {prim: DIP}] }"
     */
    const tripleArgKeyWordWithParenToJson = d =>  { return `{ "prim": "${d[0]}", "args": [ ${d[2]}, ${d[4]}, ${d[6]} ] }`; }

    const nestedArrayChecker = x => {
      if (Array.isArray(x)) {
        if (Array.isArray(x[0])) {
          return x[0]
        }
        else {
          return x
        }
      } 
      else {
        return x
      } 
    }

    /**
     * Given a list of michelson instructions, convert it into JSON.
     * Example: "{CAR; NIL operation; PAIR;}" -> 
     * [ '{ prim: CAR }',
     * '{ prim: NIL, args: [{ prim: operation }] }',
     * '{ prim: PAIR }' ]
     */
     const instructionSetToJsonNoSemi = d => { return d[2].map(x => x[0]).concat(d[3]).map(x => nestedArrayChecker(x)); }
     const instructionSetToJsonSemi = d => { return d[2].map(x => x[0]).map(x => nestedArrayChecker(x)); }

    const scriptToJson = d => {
        const parameterJson = d[0];
        const storageJson = d[2];
        const codeJson = `{ "prim": "code", "args": [ [ ${d[4]} ] ] }`;
        return `[ ${parameterJson}, ${storageJson}, ${codeJson} ]`;
    }

    const typeKeywordToJson = d => {   
      const annot = d[1].map(x => `"${x[1] + x[2]}"`)
      return `{ "prim": "${d[0]}", "annots": [${annot}] }`;  
    }

    const singleArgTypeKeywordWithParenToJson = d => {
      const annot = d[3].map(x => `"${x[1] + x[2]}"`)
      return `{ "prim": "${d[2]}", "args": [ ${d[7]} ], "annots": [${annot}]  }`;
    }

    const doubleArgTypeKeywordToJson = d => {
      const annot = d[1].map(x => `"${x[1] + x[2]}"`)
      return `{ "prim": "${d[0]}", "args": [ ${d[4]}, ${d[6]} ], "annots": [${annot}]  }`;
    }

    const doubleArgTypeKeywordWithParenToJson = d => {
      const annot = d[3].map(x => `"${x[1] + x[2]}"`)
      return `{ "prim": "${d[2]}", "args": [ ${d[7]}, ${d[9]} ], "annots": [${annot}]  }`;
    }

%}
