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
  - We do not handle instances where parameter, storage, and code are given in a separate order
  - There is a function called CREATE_CONTRACT which can create a contract inside of a contract, including the parameter,
    storage, and code definitions. We do not handle this nesting, as we do a lot of preprocessing outside of the grammar.
  - There may not be an exhaustive handling of annotations for types, but it should be covered for instructions
*/


const macroCADR = /C[AD]+R/;
const macroSETCADR = /SET_C[AD]+R/;
const macroDIP = /DII+P/;
const macroDUP = /DUU+P/;
const DIPmatcher = new RegExp(macroDIP);
const DUPmatcher = new RegExp(macroDUP);
const macroASSERTlist = ['ASSERT', 'ASSERT_EQ', 'ASSERT_NEQ', 'ASSERT_GT', 'ASSERT_LT', 'ASSERT_GE', 'ASSERT_LE', 'ASSERT_NONE', 'ASSERT_SOME', 'ASSERT_LEFT', 'ASSERT_RIGHT', 'ASSERT_CMPEQ', 'ASSERT_CMPNEQ', 'ASSERT_CMPGT', 'ASSERT_CMPLT', 'ASSERT_CMPGE', 'ASSERT_CMPLE'];
const macroIFCMPlist = ['IFCMPEQ', 'IFCMPNEQ', 'IFCMPLT', 'IFCMPGT', 'IFCMPLE', 'IFCMPGE'];
const macroCMPlist = ['CMPEQ', 'CMPNEQ', 'CMPLT', 'CMPGT', 'CMPLE', 'CMPGE'];
const macroIFlist = ['IFEQ', 'IFNEQ', 'IFLT', 'IFGT', 'IFLE', 'IFGE'];

/*
  Lexer to parse keywords more efficiently.
*/
const lexer = moo.compile({
    annot: /[\@\%\:][a-z_A-Z0-9]+/,
    lparen: '(',
    rparen: ')',
    lbrace: '{',
    rbrace: '}',
    ws: /[ \t]+/,
    semicolon: ";",
    number: /-?[0-9]+/,
    parameter: [ 'parameter' , 'Parameter'],
    storage: ['Storage', 'storage'],
    code: ['Code', 'code'],
    comparableType: ['int', 'nat', 'string', 'bytes', 'mutez', 'bool', 'key_hash', 'timestamp'],
    constantType: ['key', 'unit', 'signature', 'operation', 'address'],
    singleArgType: ['option', 'list', 'set', 'contract'],
    doubleArgType: ['pair', 'or', 'lambda', 'map', 'big_map'],
    baseInstruction: ['ABS', 'ADD', 'ADDRESS', 'AMOUNT', 'AND', 'BALANCE', 'BLAKE2B', 'CAR', 'CAST', 'CDR', 'CHECK_SIGNATURE',
        'COMPARE', 'CONCAT', 'CONS', 'CONTRACT', 'CREATE_ACCOUNT', 'CREATE_CONTRACT', 'DIP', 'DROP', 'DUP', 'EDIV', 'EMPTY_MAP',
        'EMPTY_SET', 'EQ', 'EXEC', 'FAIL', 'FAILWITH', 'GE', 'GET', 'GT', 'HASH_KEY', 'IF', 'IF_CONS', 'IF_LEFT', 'IF_NONE',
        'IF_RIGHT', 'IMPLICIT_ACCOUNT', 'INT', 'ISNAT', 'ITER', 'LAMBDA', 'LE', 'LEFT', 'LOOP', 'LOOP_LEFT', 'LSL', 'LSR', 'LT',
        'MAP', 'MEM', 'MUL', 'NEG', 'NEQ', 'NIL', 'NONE', 'NOT', 'NOW', 'OR', 'PACK', 'PAIR', 'REDUCE', 'RENAME', 'RIGHT', 'SELF',
        'SENDER', 'SET_DELEGATE', 'SHA256', 'SHA512', 'SIZE', 'SLICE', 'SOME', 'SOURCE', 'STEPS_TO_QUOTA', 'SUB', 'SWAP',
        'TRANSFER_TOKENS', 'UNIT', 'UNPACK', 'UPDATE', 'XOR',
        'UNPAIR', 'UNPAPAIR', // TODO: macro
        'IF_SOME', // TODO: macro
        'IFCMPEQ', 'IFCMPNEQ', 'IFCMPLT', 'IFCMPGT', 'IFCMPLE', 'IFCMPGE', 'CMPEQ', 'CMPNEQ', 'CMPLT', 'CMPGT', 'CMPLE',
        'CMPGE', 'IFEQ', 'NEQ', 'IFLT', 'IFGT', 'IFLE', 'IFGE' // TODO: should be separate
        ],
    macroCADR: macroCADR,
    macroDIP: macroDIP,
    macroDUP: macroDUP,
    macroSETCADR: macroSETCADR,
    macroASSERTlist: macroASSERTlist,
    constantData: ['Unit', 'True', 'False', 'None', 'instruction'],
    singleArgData: ['Left', 'Right', 'Some'],
    doubleArgData: ['Pair'],
    singleArgTypeData: ['Left', 'Right', 'Some'],
    doubleArgTypeData: ['Pair'],
    elt: "Elt",
    word: /[a-zA-Z_0-9]+/,
    string: /"(?:\\["\\]|[^\n"\\])*"/
});
%}

# Pass your lexer object using the @lexer option:
@lexer lexer

# Main endpoint, parameter, storage, and code are necessary for user usage. Instruction, data, and type are for testing purposes.
main -> instruction {% id %} | data {% id %} | type {% id %} | parameter {% id %} | storage {% id %} | code {% id %} | script {% id %} | parameterValue {% id %} | storageValue {% id %} | typeData {% id %}
script -> parameter _ storage _ code {% scriptToJson %}

#parameter -> "parameter" | "Parameter"
#storage -> "Storage" | "storage"
#code -> "Code" | "code"

parameterValue -> %parameter _ typeData _ semicolons {% singleArgKeywordToJson %}
storageValue -> %storage _ typeData _ semicolons {% singleArgKeywordToJson %}

parameter -> %parameter _ type _ semicolons {% singleArgKeywordToJson %}
storage -> %storage _ type _ semicolons {% singleArgKeywordToJson %}
code -> %code _ subInstruction _ semicolons _ {% d => d[2] %}
  | %code _ "{};" {% d => "code {}" %}

# Grammar of a Michelson type
type ->
    %comparableType {% keywordToJson %}
  | %constantType {% keywordToJson %}
  | %singleArgType _ type {% singleArgKeywordToJson %}
  | %lparen _ %singleArgType _ type _ %rparen {% singleArgKeywordWithParenToJson %}
  | %doubleArgType _ type _ type {% doubleArgKeywordToJson %}
  | %lparen _ %doubleArgType _ type _ type _ %rparen {% doubleArgKeywordWithParenToJson %}
  | %comparableType (_ %annot):+ {% keywordToJson %}
  | %constantType (_ %annot):+ {% keywordToJson %}
  | %lparen _ %comparableType (_ %annot):+ _ %rparen {% comparableTypeToJson %}
  | %lparen _ %constantType (_ %annot):+ _ %rparen {% comparableTypeToJson %}
  | %lparen _ %singleArgType (_ %annot):+ _ type %rparen {% singleArgTypeKeywordWithParenToJson %}
  | %lparen _ %doubleArgType (_ %annot):+ _ type _ type %rparen {% doubleArgTypeKeywordWithParenToJson %}
#  | %singleArgType _ type {% singleArgKeywordToJson %}
#  | %lparen _ %singleArgType _ type %rparen {% singleArgKeywordWithParenToJson %}
#  | %doubleArgType _ type _ type {% doubleArgKeywordToJson %}
#  | %lparen _ %doubleArgType _ type _ type %rparen {% doubleArgKeywordWithParenToJson %}

typeData ->
    (%singleArgTypeData|%singleArgType) _ typeData {% singleArgKeywordToJson %}
  | %lparen _ (%singleArgTypeData|%singleArgType) _ typeData _ %rparen {% singleArgKeywordWithParenToJson %}
  | (%doubleArgTypeData|%doubleArgType) _ typeData _ typeData {% doubleArgKeywordToJson %}
  | %lparen _ (%doubleArgTypeData|%doubleArgType) _ typeData _ typeData _ %rparen {% doubleArgKeywordWithParenToJson %}
  | (%constantData|%singleArgData|%doubleArgData) {% keywordToJson %}
  | (%constantData|%singleArgData|%doubleArgData) _ typeData {% singleArgKeywordToJson %}
  | (%constantData|%singleArgData|%doubleArgData) _ typeData _ typeData {% doubleArgKeywordToJson %}
  | subTypeData {% id %}
  | subTypeElt {% id %}
  | %number {% intToJson %}
  | %string {% stringToJson %}
#  | %word {% stringToJson %}
  #| %lbrace _ %rbrace {% d => [] %}
# Helper grammar for list of michelson data types.
subTypeData ->
    "{" _ (data ";":? _):+ "}" {% instructionSetToJsonSemi %}
  | "(" _ (data ";":? _):+ ")" {% instructionSetToJsonSemi %}
# Helper grammar for list of pairs of michelson data types.
subTypeElt ->
    "{" _ (typeElt ";" _):+ "}" {% instructionSetToJsonSemi %}
  | "(" _ (typeElt ";" _):+ ")" {% instructionSetToJsonSemi %}
typeElt -> %elt _ typeData _ typeData {% doubleArgKeywordToJson  %}

# Helper pattern for lists of michelson instructions
subInstruction -> %lbrace _ (instruction _ %semicolon _):+ instruction _ %rbrace {% instructionSetToJsonNoSemi %} #If last instruction doesn't have semicolon
  | %lbrace _ (instruction _ %semicolon _):+ %rbrace {% instructionSetToJsonSemi %} #If last instruction has semicolon
  | %lbrace _ instruction _ %rbrace {% d => d[2] %}
  | %lbrace _ %rbrace {% d => "" %}

instructions -> %baseInstruction | %macroCADR | %macroDIP | %macroDUP | %macroSETCADR | %macroASSERTlist

# Grammar for michelson instruction.
instruction ->
    subInstruction {% id %}
  | instructions {% keywordToJson %}
  | instructions (_ %annot):+ _ {% keywordToJson %}
  | instructions _ subInstruction {% singleArgInstrKeywordToJson %}
  | instructions (_ %annot):+ _ subInstruction {% singleArgTypeKeywordToJson %}
  | instructions _ type {% singleArgKeywordToJson %}
  | instructions (_ %annot):+ _ type {% singleArgTypeKeywordToJson %}
  | instructions _ data {% singleArgKeywordToJson %}
  | instructions (_ %annot):+ _ data {% singleArgTypeKeywordToJson %}
  | instructions _ type _ type _ subInstruction {% tripleArgKeyWordToJson %}
  | instructions (_ %annot):+ _ type _ type _ subInstruction {% tripleArgTypeKeyWordToJson %}
  | instructions _ subInstruction _ subInstruction {% doubleArgInstrKeywordToJson %}
  | instructions (_ %annot):+ _ subInstruction _ subInstruction {% doubleArgTypeKeywordToJson %}
  | instructions _ type _ type {% doubleArgKeywordToJson %}
  | instructions (_ %annot):+ _ type _ type {% doubleArgTypeKeywordToJson %}
  | "PUSH" _ type _ data {% doubleArgKeywordToJson %}
  | "PUSH" _ type _ %lbrace %rbrace {% pushToJson %}
  | "PUSH" (_ %annot):+ _ type _ data {% pushWithAnnotsToJson %}
  | %lbrace _ %rbrace {% d => "" %}

# Grammar for michelson data.
data ->
    (%constantData|%singleArgData|%doubleArgData) {% keywordToJson %}
  | (%constantData|%singleArgData|%doubleArgData) _ data {% singleArgKeywordToJson %}
  | (%constantData|%singleArgData|%doubleArgData) _ data _ data {% doubleArgKeywordToJson  %}
  | %lparen _ (%constantData|%singleArgData|%doubleArgData) _ data _ data _ %rparen {% doubleArgKeywordWithParenToJson %}
  | subData {% id %}
  | subElt {% id %}
  | %number {% intToJson %}
  | %string {% stringToJson %}
#  | %word {% stringToJson %}
  #| %lbrace _ %rbrace {% d => [] %}
# Helper grammar for list of michelson data types.
subData ->
    "{" _ (data ";" _):+ "}" {% instructionSetToJsonSemi %}
  | "(" _ (data ";" _):+ ")" {% instructionSetToJsonSemi %}
# Helper grammar for list of pairs of michelson data types.
subElt ->
    "{" _ (elt ";":? _):+ "}" {% instructionSetToJsonSemi %}
  | "(" _ (elt ";":? _):+ ")" {% instructionSetToJsonSemi %}
elt -> %elt _ data _ data {% doubleArgKeywordToJson %}


# Helper grammar for whitespace.
_ -> [\s]:*
# Helper grammar for semicolons.
semicolons -> null | semicolons ";"

@{%
    const checkC_R = c_r => {
      var pattern = new RegExp('^C(A|D)(A|D)+R$'); // TODO
      return pattern.test(c_r);
    }

    const expandC_R = (c_r, annot) => {
      var as_and_ds = c_r.substring(1, c_r.length-1)
      var expandedC_R = as_and_ds.split('').map(c => (c === 'A' ? '{ "prim": "CAR" }' : '{ "prim": "CDR" }'));
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
      return `[${expandedC_R}]`;
    }

      //input: C*R
      //remove first and last characters from string
      //A -> keywordToJson(['CAR'])
      //D -> keywordToJson(['CDR'])
      // if annotations, put in last element of array
      //return `${mappedArray}`

    const check_compare = cmp => macroCMPlist.includes(cmp);

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

    const check_dup = dup => DUPmatcher.test(dup);

    //currently does not handle annotations
    const expand_dup = (dup, annot) => {
        let t = '';
        if (DUPmatcher.test(dup)) {
            const c = dup.length - 3;
            for (let i = 0; i < c; i++) { t += '[{ "prim": "DIP", "args": [ '; }

            if (annot == null) {
                t += `[{ "prim": "DUP" }]`;
            } else {
                t += `[{ "prim": "DUP", "annots": [${annot}] }]`;
            }

            for (let i = 0; i < c; i++) { t += ' ] },{"prim":"SWAP"}]'; }
            return t;
        }
        throw new Error(``);
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

    const check_assert = assert => macroASSERTlist.includes(assert);

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

    const check_fail = fail => fail === "FAIL";

    const expand_fail = (fail, annot) => {
      // if annotations, put in last element of array, if no annot, put annot in FAILWITH otherwise
      if (annot == null) {
        return `[ { "prim": "UNIT" }, { "prim": "FAILWITH"} ]`
      }
      else {
        return `[ { "prim": "UNIT" }, { "prim": "FAILWITH", "annots": [${annot}]} ]`
      }
    }

    const check_if = ifStatement => (macroIFCMPlist.includes(ifStatement) || macroIFlist.includes(ifStatement) || ifStatement === 'IF_SOME'); // TODO: IF_SOME

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
        case 'IF_SOME':
          if (annot == null) {
            return `[{"prim":"IF_NONE","args":[ [${ifFalse}], [${ifTrue}]]}]`
          }
          else {
            return `[{"prim":"IF_NONE","args":[ [${ifFalse}], [${ifTrue}] ], "annots": [${annot}]}]`
          }
      }
    }

    const check_dip = dip => DIPmatcher.test(dip);

    const expandDIP = (dip, instruction, annot) => {
      //switch (dip) {
      //  case 'DIIP':
      //    return `[{ "prim": "DIP", "args": [ [ { "prim": "DIP", "args": [ [ ${instruction} ] ] } ] ] }]`;
      //}

      // ANNOTATION LAST ONE
      // DIP code -> return `{ "prim": "DIP", "args": [ [ ${code} ] ] }`;
      // DI(I+)P code -> return `{ "prim": "DIP", "args": [ [ ${expandDIP(D(I+)P, instruction)} ] ] }`;

      let t = '';
        if (DIPmatcher.test(dip)) {
            const c = dip.length - 2;;
            for (let i = 0; i < c; i++) { t += '[{ "prim": "DIP", "args": [ '; }
            t = `${t} [ ${instruction} ] ]`;
            if (!!annot) { t = `${t}, "annots": [${annot}]`; }
            t += ' }]';
            for (let i = 0; i < c - 1; i++) { t += ' ] }]'; }
            return t;
        }
        throw new Error(``);
    }

    const check_other = word => (word == "UNPAIR" || word == "UNPAPAIR"); // TODO: dynamic matching

    //UNPAIR and annotations follows a nonstandard format described in docs, and is dependent on the number of
    //annotations given to the command, right now we're hard coding to fix the multisig contract swiftly, but a
    //more general solution is required in the longterm.
    const expand_other = (word, annot) => {
      if (word == 'UNPAIR') {
        if (annot == null) {
          return '[ [ { "prim": "DUP" }, { "prim": "CAR" }, { "prim": "DIP", "args": [ [ { "prim": "CDR" } ] ] } ] ]'
        }
        else if (annot.length == 1) {
          return `[ [ { "prim": "DUP" }, { "prim": "CAR", "annots": [${annot}] }, { "prim": "DIP", "args": [ [ { "prim": "CDR" } ] ]  } ] ]`
        }
        else if (annot.length == 2) {
          return `[ [ { "prim": "DUP" }, { "prim": "CAR", "annots": [${annot[0]}] }, { "prim": "DIP", "args": [ [ { "prim": "CDR", "annots": [${annot[1]}] } ] ]  } ] ]`
        }
        else {
          return ``
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
        const annot = d[1].map(x => `"${x[1]}"`)
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
      const annot = d[3].map(x => `"${x[1]}"`)
      return `{ "prim": "${d[2]}", "annots": [${annot}]  }`;
    }

    const singleArgTypeKeywordWithParenToJson = d => {
      const annot = d[3].map(x => `"${x[1]}"`)
      return `{ "prim": "${d[2]}", "args": [ ${d[5]} ], "annots": [${annot}]  }`;
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
      const annot = d[1].map(x => `"${x[1]}"`)
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
    const tripleArgKeyWordWithParenToJson = d => { return `{ "prim": "${d[0]}", "args": [ ${d[2]}, ${d[4]}, ${d[6]} ] }`; }

    const nestedArrayChecker = x => {
        if (Array.isArray(x) && Array.isArray(x[0])) {
            return x[0];
        } else {
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
      const annot = d[1].map(x => `"${x[1]}"`)
      return `{ "prim": "${d[0]}", "args": [ ${d[4]}, ${d[6]} ], "annots": [${annot}]  }`;
    }

    const doubleArgTypeKeywordWithParenToJson = d => {
      const annot = d[3].map(x => `"${x[1]}"`)
      return `{ "prim": "${d[2]}", "args": [ ${d[5]}, ${d[7]} ], "annots": [${annot}]  }`;
    }

    const tripleArgTypeKeyWordToJson = d => {
      const annot = d[1].map(x => `"${x[1]}"`)
      return `{ "prim": "${d[0]}", "args": [ ${d[3]}, ${d[5]}, ${d[7]} ], "annots": [${annot}]  }`;
    }

    const pushToJson = d => {
      return `{ "prim": "${d[0]}", "args": [${d[2]}, []] }`;
    }

    const pushWithAnnotsToJson = d => {
      const annot = d[1].map(x => `"${x[1]}"`)
      return `{ "prim": "PUSH", "args": [ ${d[3]}, ${d[5]} ], "annots": [${annot}]  }`;
    }
%}
