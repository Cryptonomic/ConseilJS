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
  - Issue: Some macros are still not implemented: http://tezos.gitlab.io/mainnet/whitedoc/michelson.html#macros
  - Issue: There is an ambiguous parsing between commands LE and LEFT.
  - Issue: In general, if you have multiple Michelson instructions in a code block, all of them, no matter how nested, 
    need to have a semicolon at the end, unless it's a singleton code block. In regular Michelson, you can have the very
    last instruction in a code block not have a semicolon. A workaround has been made, but this sometimes results
    in multiple parse results that are equivalent. In this case, we postprocess to get a single entry instead
  - Postprocessor functions and grammar definitions could use a proper refactor
  - While the lexer has achieved a significant speedup, certain macros are defined by a grammar, and as such, have an infinitude
  - of inputs, accounting for that in the lexer is necessary
  - PUSH <type> <data>, data can be empty, but fixing this causes bugs elsewhere for unknown reasons
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
    instruction: ['DROP', 'DUP', 'SWAP', 'SOME', 'NONE', 'UNIT', 'IF_NONE', 'PAIR', 'CAR', 'CDR', 'LEFT', 'RIGHT', 'IF_LEFT', 'IF_RIGHT', 
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
  | %comparableType (_ %annot (%storage|%string|%word)):+ {% keywordToJson %} 
  | %constantType (_ %annot (%storage|%string|%word)):+ {% keywordToJson %}
  | %lparen _ %comparableType (_ %annot (%storage|%string|%word)):+ _ %rparen {% comparableTypeToJson %}
  | %lparen _ %constantType (_ %annot (%storage|%string|%word)):+ _ %rparen {% comparableTypeToJson %}
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
  | %instruction (_ %annot (%parameter|storage|%word|%string)):+ {% keywordToJson %}
  | %instruction _ subInstruction {% singleArgInstrKeywordToJson %}
  | %instruction (_ %annot (%parameter|storage|%word|%string)):+ _ subInstruction {% singleArgTypeKeywordToJson %} 
  | %instruction _ type {% singleArgKeywordToJson %}
  | %instruction (_ %annot (%parameter|storage|%word|%string)):+ _ type {% singleArgTypeKeywordToJson %} 
  | %instruction _ data {% singleArgKeywordToJson %}
  | %instruction (_ %annot (%parameter|storage|%word|%string)):+ _ data {% singleArgTypeKeywordToJson %} 
  | %instruction _ type _ type _ subInstruction {% tripleArgKeyWordToJson %}
  | %instruction (_ %annot (%parameter|storage|%word|%string)):+ _ type _ type _ subInstruction {% tripleArgTypeKeyWordToJson %}
  | %instruction _ subInstruction _ subInstruction {% doubleArgInstrKeywordToJson %}
  | %instruction (_ %annot (%parameter|storage|%word|%string)):+ _ subInstruction _ subInstruction {% doubleArgTypeKeywordToJson %}
  | %instruction _ type _ type {% doubleArgKeywordToJson %}
  | %instruction (_ %annot (%parameter|storage|%word|%string)):+ _ type _ type {% doubleArgTypeKeywordToJson %}
  | "PUSH" _ type _ data {% doubleArgKeywordToJson %}
 # | %instruction _ type _ %lbrace %rbrace {% pushToJson %} 
  | "PUSH" (_ %annot (%parameter|%storage|%word)):+ _ type _ data {% pushWithAnnotsToJson %}
  | %lbrace _ %rbrace {% d => "" %}

# Grammar for michelson data.
data ->
    %data {% keywordToJson %}
  | %data _ data {% singleArgKeywordToJson %}
  | %data _ data _ data {% doubleArgKeywordWithParenToJson %}
  | subData {% id %}
  | subElt {% id %}
  | %number {% intToJson %}
  | %string {% stringToJson %}
  #| %lbrace _ %rbrace {% d => [] %}
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

    const checkC_R = c_r => {
      var pattern = new RegExp('^C(A|D)(A|D)+R$')
      return pattern.test(c_r)
    }

    const mapper = a_or_d => {
      switch(a_or_d) {
        case "A":
          return keywordToJson(['CAR'])
        case "D":
          return keywordToJson(['CDR'])
      }
    }

    const expandC_R = (c_r, annot) => {
      var as_and_ds = c_r.substring(1,c_r.length-1) 
      var expandedC_R = as_and_ds.split('').map(x => mapper(x))
      //if annotations, put in last element of array
      if (annot != null) {
        const lastChar = as_and_ds[as_and_ds.length-1]
        if (lastChar == 'A') {
          expandedC_R[expandedC_R.length-1] = `{ "prim": "CAR", "annots": [${annot}] }`
        }
        if (lastChar == 'D') {
          expandedC_R[expandedC_R.length-1] = `{ "prim": "CDR", "annots": [${annot}] }`
        }
      }
      return `[${expandedC_R}]`
    }

      //input: C*R
      //remove first and last characters from string
      //A -> keywordToJson(['CAR'])
      //D -> keywordToJson(['CDR'])
      // if annotations, put in last element of array
      //return `${mappedArray}`

    const check_compare = cmp => 
    {
      var pattern = new RegExp('^CMP(NEQ|EQ|GT|LT|GE|LE)$')
      return pattern.test(cmp)
    }

    const expand_cmp = (cmp, annot) => { 
      var op = cmp.substring(3)
      var binary_op = keywordToJson([`${op}`])
      var compare = keywordToJson(['COMPARE'])
      if (annot != null) {
        binary_op = `{ "prim": "${op}", "annots": [${annot}] }`;
      }
      var result = [compare, binary_op]
      return `[${result}]`
    }
      //input : CMP*
      //take last characters of string that aren't CMP -> keywordToJson([last])
      // if annotations, put in last element of array
      //return '${[keywordToJson(['COMPARE'])], ^}

    const check_dup = dup =>
    {
      var pattern = new RegExp('^DUU+P$')
      return pattern.test(dup)
    }

    //currently does not handle annotations
    const expand_dup = (dup, annot) => {
      var pattern = new RegExp('^DUU+P$')
      if (pattern.test(dup)) {
        var newDup = dup.substring(0,1) + dup.substring(2)
        var innerDup = expand_dup(newDup, annot)
        return `[{ "prim": "DIP", "args": [  ${innerDup}  ] },{"prim":"SWAP"}]`; 
      }
      else {
        if (annot == null) {
          return `[{ "prim": "DUP" }]`; 
        }
        else {
          return `[{ "prim": "DUP", "annots": [${annot}] }]`; 
        }
      }
      /*

      if (dup == "DUP") {
          return `{ "prim": "${dup}" }`;
  
      }

      if (dup == "DUUP") {
        if (annot == null) {

        }
        else {

        }  
      }


      const newDup = dup.substring(1,dup.length-1)

      const dip = keywordToJson(['DIP']);
      var dips = []

      const swap = keywordToJson(['SWAP']);
      var finalSwap = swap
      if (annot != null) {
        finalSwap = `{ "prim": "SWAP", "annots": [${annot}] }`
      }
      var swaps = []

      for (let i = 0; i < newDup.length; i++) {
        dips.push(dip);
        swaps.push(swap);
      }

      swaps[swaps.length-1] = finalSwap

      return `[${dips}, ${[keywordToJson(['DUP'])]}, ${swaps}]`
      */

    }
      //input : D(U*)P
      // DUP -> DUP
      // DU(U+)P -> n = |U+|, repeat n keywordToJson(['DIP']); keywordToJson(['DUP']); repeat n keywordToJson(['SWAP']);
      // // if no annot, return duuuup put annot in swap otherwise

    const check_assert = assert =>
    {
      var pattern = new RegExp('^ASSERT$|^ASSERT_(EQ|NEQ|GT|LT|GE|LE|NONE|SOME|LEFT|RIGHT|CMPEQ|CMPNEQ|CMPGT|CMPLT|CMPGE|CMPLE)$')
      return pattern.test(assert)
    }

    const expand_assert = (assert, annot) => {
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
          if (annot == null) {
            return `[{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`
          }
          else {
            return `[{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH", "annots": [${annot}]}]]]}]`
          }
        case 'ASSERT_CMPEQ':
          if (annot == null) {
            return `[[{"prim":"COMPARE"},{"prim":"EQ"}],{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`  
          }
          else {
            return `[[{"prim":"COMPARE"},{"prim":"EQ"}],{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH", "annots": [${annot}]}]]]}]`  
          }
        case 'ASSERT_CMPGE':
          if (annot == null) {
            return `[[{"prim":"COMPARE"},{"prim":"GE"}],{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`  
          }
          else {
            return `[[{"prim":"COMPARE"},{"prim":"GE"}],{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH", "annots": [${annot}]}]]]}]`  
          }
        case 'ASSERT_CMPGT':
          if (annot == null) {
            return `[[{"prim":"COMPARE"},{"prim":"GT"}],{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`
          }
          else {
            return `[[{"prim":"COMPARE"},{"prim":"GT"}],{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH", "annots": [${annot}]}]]]}]`            
          }
        case 'ASSERT_CMPLE':
          if (annot == null) {
            return `[[{"prim":"COMPARE"},{"prim":"LE"}],{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`  
          }
          else {
            return `[[{"prim":"COMPARE"},{"prim":"LE"}],{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH", "annots": [${annot}]}]]]}]`              
          }
        case 'ASSERT_CMPLT':
          if (annot == null) {
            return `[[{"prim":"COMPARE"},{"prim":"LT"}],{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`   
          }
          else {
            return `[[{"prim":"COMPARE"},{"prim":"LT"}],{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH", "annots": [${annot}]}]]]}]`                 
          }
        case 'ASSERT_CMPNEQ': 
          if (annot == null) {
            return `[[{"prim":"COMPARE"},{"prim":"NEQ"}],{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`
          }
          else {
            return `[[{"prim":"COMPARE"},{"prim":"NEQ"}],{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH", "annots": [${annot}]}]]]}]`            
          }
        case 'ASSERT_EQ':
          if (annot == null) {
            return `[{"prim":"EQ"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]]`
          }
          else {
            return `[{"prim":"EQ"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH", "annots": [${annot}]}]]]}]`          
          }
        case 'ASSERT_GE':
          if (annot == null) {
            return `[{"prim":"GE"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`  
          }
          else {
            return `[{"prim":"GE"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH", "annots": [${annot}]}]]]}]`              
          }
        case 'ASSERT_GT':
          if (annot == null) {
            return `[{"prim":"GT"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`
          }
          else {
            return `[{"prim":"GT"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH", "annots": [${annot}]}]]]}]`
          }
        case 'ASSERT_LE':
          if (annot == null) {
            return `[{"prim":"LE"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`
          }
          else {
            return `[{"prim":"LE"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH", "annots": [${annot}]}]]]}]`          
          }
        case 'ASSERT_LT':
          if (annot == null) {
            return `[{"prim":"LT"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`   
          }
          else {
            return `[{"prim":"LT"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH", "annots": [${annot}]}]]]}]`               
          }
        case 'ASSERT_NEQ':
          if (annot == null) {
            return `[{"prim":"NEQ"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]`        
          }
          else {
            return `[{"prim":"NEQ"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH", "annots": [${annot}]}]]]}]`                    
          } 
      }
    }

    const check_fail = fail => {
      return fail == "FAIL";
    } 

    const expand_fail = (fail, annot) => {
      // if annotations, put in last element of array, if no annot, put annot in FAILWITH otherwise
      if (annot == null) {
        return `[ { "prim": "UNIT" }, { "prim": "FAILWITH"} ]`   
      }
      else {
        return `[ { "prim": "UNIT" }, { "prim": "FAILWITH", "annots": [${annot}]} ]`  
      } 
    }

    const check_if = ifStatement => {
      var pattern = new RegExp('^IF(EQ|NEQ|GT|LT|GE|LE|CMPEQ|CMPNEQ|CMPGT|CMPLT|CMPGE|CMPLE)$')
      return pattern.test(ifStatement)
    }

    const expandIF = (ifInstr, ifTrue, ifFalse, annot) => {
      //IFEQ, IFGE, IFGT, IFLE, IFLT : EXACTLY THE SAME AS IFCMP, JUST REMOVE COMPARE
      // if annotations, put in last element of array
      switch (ifInstr) {
        case 'IFCMPEQ':
          if (annot == null) {
            return `[{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]}]`
          }
          else {
            return `[{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]], "annots": [${annot}]}]`
          }
        case 'IFCMPGE':
          if (annot == null) {
            return `[{"prim":"COMPARE"},{"prim":"GE"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]}]`  
          }
          else {
            return `[{"prim":"COMPARE"},{"prim":"GE"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]], "annots": [${annot}]}]`            
          }
        case 'IFCMPGT':
          if (annot == null) {
            return `[{"prim":"COMPARE"},{"prim":"GT"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]}]`
          }
          else {
            return `[{"prim":"COMPARE"},{"prim":"GT"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]], "annots": [${annot}]}]`         
          }
        case 'IFCMPLE':
          if (annot == null) {
            return `[{"prim":"COMPARE"},{"prim":"LE"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]}]`  
          }
          else {
            return `[{"prim":"COMPARE"},{"prim":"LE"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]], "annots": [${annot}]}]`            
          }       
        case 'IFCMPLT':
          if (annot == null) {
            return `[{"prim":"COMPARE"},{"prim":"LT"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]}]`   
          }
          else {
            return `[{"prim":"COMPARE"},{"prim":"LT"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]], "annots": [${annot}]}]`             
          }        
        case 'IFCMPNEQ': 
          if (annot == null) {
            return `[{"prim":"COMPARE"},{"prim":"NEQ"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]}]`
          }
          else {
            return `[{"prim":"COMPARE"},{"prim":"NEQ"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]], "annots": [${annot}]}]`            
          }        
        case 'IFEQ':
          if (annot == null) {
            return `[{"prim":"EQ"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]}]`
          }
          else {
            return `[{"prim":"EQ"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]], "annots": [${annot}]}]`            
          }        
        case 'IFGE':
          if (annot == null) {
            return `[{"prim":"GE"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]}]`  
          }
          else {
            return `[{"prim":"GE"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]], "annots": [${annot}]}]`              
          }        
        case 'IFGT':
          if (annot == null) {
            return `[{"prim":"GT"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]}]`
          }
          else {
            return `[{"prim":"GT"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]], "annots": [${annot}]}]`          
          }        
        case 'IFLE':
          if (annot == null) {
            return `[{"prim":"LE"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]}]`  
          }
          else {
           return `[{"prim":"LE"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]], "annots": [${annot}]}]`              
          }        
        case 'IFLT':
          if (annot == null) {
            return `[{"prim":"LT"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]}]`   
          }
          else {
            return `[{"prim":"LT"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]], "annots": [${annot}]}]`              
          }        
        case 'IFNEQ': 
          if (annot == null) {
            return `[{"prim":"NEQ"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]}]`        
          }
          else {
            return `[{"prim":"NEQ"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]], "annots": [${annot}]}]`                  
          }        
      }
    }   

    const check_dip = dip => {
      var pattern = new RegExp('^DII+P$')
      return pattern.test(dip)
    }

    const expandDIP = (dip, instruction, annot) => { 
      //switch (dip) {
      //  case 'DIIP':
      //    return `[{ "prim": "DIP", "args": [ [ { "prim": "DIP", "args": [ [ ${instruction} ] ] } ] ] }]`;
      //}  

      // ANNOTATION LAST ONE
      // DIP code -> return `{ "prim": "DIP", "args": [ [ ${code} ] ] }`; 
      // DI(I+)P code -> return `{ "prim": "DIP", "args": [ [ ${expandDIP(D(I+)P, instruction)} ] ] }`; 
      
      var pattern = new RegExp('^DII+P$')
      if (pattern.test(dip)) {
        var newDip = dip.substring(0,1) + dip.substring(2)
        var innerDip = expandDIP(newDip, instruction, annot)
        return `[{ "prim": "DIP", "args": [  ${innerDip}  ] }]`; 
      }
      else {
        //add annotation in this branch
        if (annot == null) {
          return `[{ "prim": "DIP", "args": [ [ ${instruction} ] ] }]`; 
        }
        else {
          return `[{ "prim": "DIP", "args": [ [ ${instruction} ] ], "annots": [${annot}] }]`; 
        }
      }
      
    }

    //until we have proper checks for these cases
    const check_other = word => {
      return word == "UNPAIR" || word == "UNPAPAIR"  
    }

    const expand_other = (word, annot) => {
      if (word == 'UNPAIR') {
        if (annot == null) {
          return '[ [ { "prim": "DUP" }, { "prim": "CAR" }, { "prim": "DIP", "args": [ [ { "prim": "CDR" } ] ] } ] ]'
        }
        else {
          return `[ [ { "prim": "DUP" }, { "prim": "CAR" }, { "prim": "DIP", "args": [ [ { "prim": "CDR" } ] ], "annots": [${annot}]  } ] ]`
        }
      }
      if (word == 'UNPAPAIR') {
        if (annot == null) {
          return `[ [ { "prim": "DUP" },
                     { "prim": "CAR" },
                     { "prim": "DIP", "args": [ [ { "prim": "CDR" } ] ] } ],
                     {"prim":"DIP","args":[[[{"prim":"DUP"},{"prim":"CAR"},{"prim":"DIP","args":[[{"prim":"CDR"}]]}]]]}] `
        }
        else {
          return `[ [ { "prim": "DUP" },
                     { "prim": "CAR" },
                     { "prim": "DIP", "args": [ [ { "prim": "CDR" } ] ] } ],
                     {"prim":"DIP","args":[[[{"prim":"DUP"},{"prim":"CAR"},{"prim":"DIP","args":[[{"prim":"CDR"}]],"annots": [${annot}]}]]]}] `
        }
      }
    }

    const checkKeyword = word => {
      return check_assert(word) 
             || check_compare(word)
             || check_dip(word)
             || check_dup(word)
             || check_fail(word)
             || check_if(word)
             || checkC_R(word)
             || check_other(word)
    }

    const expandKeyword = (word, annot) => {
      if (checkC_R(word)) {
        return expandC_R(word, annot)
      }
      if (check_assert(word)) {
        return expand_assert(word, annot)
      }
      if (check_compare(word)) {
        return expand_cmp(word, annot)
      }
      if (check_dip(word)) {
        return expandDIP(word, annot)
      }
      if (check_dup(word)) {
        return expand_dup(word, annot)
      }
      if (check_fail(word)) {
        return expand_fail(word, annot)
      }
      if (check_if(word)) {
        return expandIF(word, annot)
      }
      if (check_other(word)) {
        return expand_other(word, annot)
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
      const word = d[0].toString()
      if (d.length == 1) {
        if (checkKeyword(word)) {
          return [expandKeyword(word, null)] 
        }
        else {
          return `{ "prim": "${d[0]}" }`; 
        }
      }
      else {
        const annot = d[1].map(x => `"${x[1] + x[2]}"`)
        if (checkKeyword(word)) {
          return [expandKeyword(word, annot)] 
        }
        else {
          return `{ "prim": "${d[0]}", "annots": [${annot}] }`;  
        }
      }
    }

    /*
    const typeKeywordToJson = d => {   
      const annot = d[1].map(x => `"${x[1] + x[2]}"`)
      return `{ "prim": "${d[0]}", "annots": [${annot}] }`;  
    }
    */

    /**
     * Given a keyword with one argument, convert it to JSON.
     * Example: "option int" -> "{ prim: option, args: [int] }"
     */
    const singleArgKeywordToJson = d => { return `{ "prim": "${d[0]}", "args": [ ${d[2]} ] }`; }
    //changed 5 secs ago

    const comparableTypeToJson = d => {
      const annot = d[3].map(x => `"${x[1] + x[2]}"`)
      return `{ "prim": "${d[2]}", "annots": [${annot}]  }`;
    }

    const singleArgTypeKeywordWithParenToJson = d => {
      const annot = d[3].map(x => `"${x[1] + x[2]}"`)
      return `{ "prim": "${d[2]}", "args": [ [ ${d[7]} ] ], "annots": [${annot}]  }`;
    }

    const singleArgInstrKeywordToJson = d => { 
      const word = `${d[0].toString()}`
      if (check_dip(word)) {
        return expandDIP(word, d[2])
      }
      else {
        return `{ "prim": "${d[0]}", "args": [ [ ${d[2]} ] ] }`; 
      }
    }

    const singleArgTypeKeywordToJson = d => {
      const word = `${d[0].toString()}`
      const annot = d[1].map(x => `"${x[1] + x[2]}"`)
      if (check_dip(word)) {
        return expandDIP(word, d[2], annot)
      }
      else {
        return `{ "prim": "${d[0]}", "args": [  ${d[3]}  ], "annots": [${annot}] }`; 
      }  
    }

    /**
     * Given a keyword with one argument and parentheses, convert it to JSON.
     * Example: "(option int)" -> "{ prim: option, args: [{prim: int}] }"
     */
    const singleArgKeywordWithParenToJson = d => { return `{ "prim": "${d[2]}", "args": [ ${d[4]} ] }`; }
    //changed 5 secs ago
    /**
     * Given a keyword with two arguments, convert it into JSON.
     * Example: "Pair unit instruction" -> "{ prim: Pair, args: [{prim: unit}, {prim: instruction}] }"
     */
    const doubleArgKeywordToJson = d => { return `{ "prim": "${d[0]}", "args": [${d[2]}, ${d[4]}] }`; }

    const doubleArgInstrKeywordToJson = d => { 
      const word = `${d[0].toString()}`
      if (check_if(word)) {
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

    const doubleArgTypeKeywordToJson = d => {
      const annot = d[1].map(x => `"${x[1] + x[2]}"`)
      return `{ "prim": "${d[0]}", "args": [ ${d[4]}, ${d[6]} ], "annots": [${annot}]  }`;
    }

    const doubleArgTypeKeywordWithParenToJson = d => {
      const annot = d[3].map(x => `"${x[1] + x[2]}"`)
      return `{ "prim": "${d[2]}", "args": [ ${d[5]}, ${d[7]} ], "annots": [${annot}]  }`;
    }

    const tripleArgTypeKeyWordToJson = d => {
      const annot = d[1].map(x => `"${x[1] + x[2]}"`)
      return `{ "prim": "${d[0]}", "args": [ ${d[3]}, ${d[5]}, ${d[7]} ], "annots": [${annot}]  }`;  
    }

    const pushToJson = d => {
      return `{ "prim": "${d[0]}", "args": [${d[2]}, []] }`;
    }

    const pushWithAnnotsToJson = d => {
      const annot = d[1].map(x => `"${x[1] + x[2]}"`)
      return `{ "prim": "PUSH", "args": [ ${d[3]}, ${d[5]} ], "annots": [${annot}]  }`;
    }

%}
