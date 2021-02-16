@preprocessor typescript

@{%
const moo = require("moo");

/*
  Michelson references:
  https://tezos.gitlab.io/whitedoc/michelson.html#full-grammar
  https://michelson.nomadic-labs.com/
*/

const macroCADRconst = /C[AD]+R/;
const macroSETCADRconst = /SET_C[AD]+R/;
const macroDIPconst = /DII+P/;
const macroDUPconst = /DUU+P/;
const DIPmatcher = new RegExp(macroDIPconst);
const DUPmatcher = new RegExp(macroDUPconst);
const macroASSERTlistConst = ['ASSERT', 'ASSERT_EQ', 'ASSERT_NEQ', 'ASSERT_GT', 'ASSERT_LT', 'ASSERT_GE', 'ASSERT_LE', 'ASSERT_NONE', 'ASSERT_SOME', 'ASSERT_LEFT', 'ASSERT_RIGHT', 'ASSERT_CMPEQ', 'ASSERT_CMPNEQ', 'ASSERT_CMPGT', 'ASSERT_CMPLT', 'ASSERT_CMPGE', 'ASSERT_CMPLE'];
const macroIFCMPlist = ['IFCMPEQ', 'IFCMPNEQ', 'IFCMPLT', 'IFCMPGT', 'IFCMPLE', 'IFCMPGE'];
const macroCMPlist = ['CMPEQ', 'CMPNEQ', 'CMPLT', 'CMPGT', 'CMPLE', 'CMPGE'];
const macroIFlist = ['IFEQ', 'IFNEQ', 'IFLT', 'IFGT', 'IFLE', 'IFGE'];

const lexer = moo.compile({
    annot: /[\@\%\:][a-z_A-Z0-9]+/,
    lparen: '(',
    rparen: ')',
    lbrace: '{',
    rbrace: '}',
    ws: /[ \t]+/,
    semicolon: ";",
    bytes: /0x[0-9a-fA-F]+/,
    number: /-?[0-9]+(?!x)/,
    parameter: [ 'parameter' , 'Parameter'],
    storage: ['Storage', 'storage'],
    code: ['Code', 'code'],
    comparableType: ['int', 'nat', 'string', 'bytes', 'mutez', 'bool', 'key_hash', 'timestamp', 'chain_id', /* Edo types*/ 'never'],
    constantType: ['key', 'unit', 'signature', 'operation', 'address', /* Edo types */ 'bls12_381_fr', 'bls12_381_g1', 'bls12_381_g2'],
    singleArgType: ['option', 'list', 'set', 'contract', 'ticket'],
    doubleArgType: ['pair', 'or', 'lambda', 'map', 'big_map'],
    baseInstruction: ['ABS', 'ADD', 'ADDRESS', 'AMOUNT', 'AND', 'BALANCE', 'BLAKE2B', 'CAR', 'CAST', 'CDR', 'CHECK_SIGNATURE',
        'COMPARE', 'CONCAT', 'CONS', 'CONTRACT', /*'CREATE_CONTRACT',*/ 'DIP', /*'DROP',*/ /*'DUP',*/ 'EDIV', /*'EMPTY_MAP',*/
        'EMPTY_SET', 'EQ', 'EXEC', 'FAIL', 'FAILWITH', 'GE', 'GET', 'GT', 'HASH_KEY', 'IF', 'IF_CONS', 'IF_LEFT', 'IF_NONE',
        'IF_RIGHT', 'IMPLICIT_ACCOUNT', 'INT', 'ISNAT', 'ITER', 'LAMBDA', 'LE', 'LEFT', 'LOOP', 'LOOP_LEFT', 'LSL', 'LSR', 'LT',
        'MAP', 'MEM', 'MUL', 'NEG', 'NEQ', 'NIL', 'NONE', 'NOT', 'NOW', 'OR', 'PACK', 'PAIR', /*'PUSH',*/ 'REDUCE', 'RENAME', 'RIGHT', 'SELF',
        'SENDER', 'SET_DELEGATE', 'SHA256', 'SHA512', 'SIZE', 'SLICE', 'SOME', 'SOURCE', 'STEPS_TO_QUOTA', 'SUB', 'SWAP',
        'TRANSFER_TOKENS', 'UNIT', 'UNPACK', 'UPDATE', 'XOR',
        'UNPAIR', 'UNPAPAIR', // TODO: macro
        'IF_SOME', // TODO: macro
        'IFCMPEQ', 'IFCMPNEQ', 'IFCMPLT', 'IFCMPGT', 'IFCMPLE', 'IFCMPGE', 'CMPEQ', 'CMPNEQ', 'CMPLT', 'CMPGT', 'CMPLE',
        'CMPGE', 'IFEQ', 'NEQ', 'IFLT', 'IFGT', 'IFLE', 'IFGE', // TODO: should be separate
        /*'DIG',*/ /*'DUG',*/ 'EMPTY_BIG_MAP', 'APPLY', 'CHAIN_ID',
        // Edo instructions
        'KECCAK', 'SHA3', 'PAIRING_CHECK', 'SAPLING_EMPTY_STATE', 'SAPLING_VERIFY_UPDATE', 'GET_AND_UPDATE', 'NEVER', 'VOTING_POWER', 'TOTAL_VOTING_POWER', 'TICKET', 'READ_TICKET', 'SPLIT_TICKET', 'JOIN_TICKETS', 'SELF_ADDRESS', 'LEVEL'
        ],
    macroCADR: macroCADRconst,
    macroDIP: macroDIPconst,
    macroDUP: macroDUPconst,
    macroSETCADR: macroSETCADRconst,
    macroASSERTlist: macroASSERTlistConst,
    constantData: ['Unit', 'True', 'False', 'None', 'instruction'],
    singleArgData: ['Left', 'Right', 'Some'],
    doubleArgData: ['Pair'],
    elt: "Elt",
    word: /[a-zA-Z_0-9]+/,
    string: /"(?:\\["\\]|[^\n"\\])*"/s
});
%}

# Pass your lexer object using the @lexer option:
@lexer lexer

# Main endpoint, parameter, storage, and code are necessary for user usage. Instruction, data, and type are for testing purposes.
main -> instruction {% id %} | data {% id %} | type {% id %} | parameter {% id %} | storage {% id %} | code {% id %} | script {% id %} | parameterValue {% id %} | storageValue {% id %} | typeData {% id %}
script -> parameter _ storage _ code {% scriptToJson %}

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
  | %lparen _ %singleArgType _ %lparen _ type _ %rparen _ %rparen {% singleArgKeywordWithParenToJson %}
  | %doubleArgType _ type _ type {% doubleArgKeywordToJson %}
  | %lparen _ %doubleArgType _ type _ type _ %rparen {% doubleArgKeywordWithParenToJson %}
  | %comparableType (_ %annot):+ {% keywordToJson %}
  | %constantType (_ %annot):+ {% keywordToJson %}
  | %lparen _ %comparableType (_ %annot):+ _ %rparen {% comparableTypeToJson %}
  | %lparen _ %constantType (_ %annot):+ _ %rparen {% comparableTypeToJson %}
  | %lparen _ %singleArgType (_ %annot):+ _ type %rparen {% singleArgTypeKeywordWithParenToJson %}
  | %lparen _ %doubleArgType (_ %annot):+ _ type _ type %rparen {% doubleArgTypeKeywordWithParenToJson %}
  | %lparen _ "sapling_state" (_ %annot):+ _ %number %rparen {% saplingToJson %}
  | %lparen _ "sapling_transaction" (_ %annot):+ _ %number %rparen {% saplingToJson %}
  | %lparen _ "sapling_state" _ %number %rparen {% saplingToJson %}
  | %lparen _ "sapling_transaction" _ %number %rparen {% saplingToJson %}

typeData ->
    %singleArgType _ typeData {% singleArgKeywordToJson %}
  | %lparen _ %singleArgType _ typeData _ %rparen {% singleArgKeywordWithParenToJson %}
  | %doubleArgType _ typeData _ typeData {% doubleArgKeywordToJson %}
  | %lparen _ %doubleArgType _ typeData _ typeData _ %rparen {% doubleArgKeywordWithParenToJson %}
  | subTypeData {% id %}
  | subTypeElt {% id %}
  | %number {% intToJson %}
  | %string {% stringToJson %}
  | %lbrace _ %rbrace {% d => [] %}

# Grammar for michelson data.
data ->
    %constantData {% keywordToJson %}
  | %singleArgData _ data {% singleArgKeywordToJson %}
  | %doubleArgData _ data _ %lbrace _ %rbrace {% doubleArgKeywordToJson %}
  | %doubleArgData _ data _ data {% doubleArgKeywordToJson  %}
  | %doubleArgData _ data _ subInstruction {% doubleArgKeywordToJson  %}
  | subData {% id %}
  | subElt {% id %}
  | %string {% stringToJson %}
  | %bytes {% bytesToJson %}
  | %number {% intToJson %}

# Helper grammar for list of michelson data types.
subData ->
    %lbrace _ %rbrace {% d => "[]" %}
  | "(" _ (data _):+ ")" {% instructionSetToJsonSemi %}
  | "{" _ (data _ ";":? _):+ "}" {% dataListToJsonSemi %}

# Helper grammar for list of pairs of michelson data types.
subElt ->
    %lbrace _ %rbrace {% d => "[]" %}
  | "{" _ (elt ";":? _):+ "}" {% dataListToJsonSemi %}
elt -> %elt _ data _ data {% doubleArgKeywordToJson %}

# Helper grammar for list of michelson data types.
subTypeData ->
    %lbrace _ %rbrace {% d => "[]" %}
  | "{" _ (data ";":? _):+ "}" {% instructionSetToJsonSemi %}
  | "(" _ (data ";":? _):+ ")" {% instructionSetToJsonSemi %}

# Helper grammar for list of pairs of michelson data types.
subTypeElt ->
    %lbrace _ %rbrace {% d => "[]" %}
  | "[{" _ (typeElt ";":? _):+ "}]" {% instructionSetToJsonSemi %}
  | "[{" _ (typeElt _ ";":? _):+ "}]" {% instructionSetToJsonSemi %}

typeElt -> %elt _ typeData _ typeData {% doubleArgKeywordToJson  %}

# Helper pattern for lists of michelson instructions
subInstruction ->
    %lbrace _ %rbrace {% d => "" %} # see TODO about double-wrapping
  | %lbrace _ instruction _ %rbrace {% d => d[2] %}
  | %lbrace _ (instruction _ %semicolon _):+ instruction _ %rbrace {% instructionSetToJsonNoSemi %} #If last instruction doesn't have semicolon
  | %lbrace _ (instruction _ %semicolon _):+ %rbrace {% instructionSetToJsonSemi %} #If last instruction has semicolon
  # %lbrace _ instruction (_ ";" _ instruction):* _ ";":? _ %rbrace {% instructionListToJson %}

instructions -> %baseInstruction | %macroCADR | %macroDIP | %macroDUP | %macroSETCADR | %macroASSERTlist

# Grammar for michelson instruction.
instruction ->
    instructions {% keywordToJson %}
  | subInstruction {% id %}
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
  | "DIP" _ [0-9]:+ _ subInstruction {% dipnToJson %}
  | "DUP" _ [0-9]:+ {% dupnToJson %}
  | "DUP" {% keywordToJson %}
  | "DUP" (_ %annot):+ _ {% keywordToJson %}
  | "DIG" _ [0-9]:+ {% dignToJson %}
  | "DUG" _ [0-9]:+ {% dignToJson %}
  | "DROP" _ [0-9]:+ {% dropnToJson %}
  | "DROP" {% keywordToJson %}
  | "CREATE_CONTRACT" _ %lbrace _ parameter _ storage _ code _ %rbrace {% subContractToJson %}
  | "EMPTY_MAP" _ type _ type {% doubleArgKeywordToJson %}
  | "EMPTY_MAP" _ %lparen _ type _ %rparen _ type {% doubleArgParenKeywordToJson %}

# Helper grammar for whitespace.
_ -> [\s]:*

# Helper grammar for semicolons.
semicolons -> [;]:?

@{%
    const checkC_R = c_r => {
        var pattern = new RegExp('^C(A|D)(A|D)+R$'); // TODO
        return pattern.test(c_r);
    }

    const expandC_R = (word, annot) => {
        var expandedC_R = word.slice(1, -1).split('').map(c => (c === 'A' ? '{ "prim": "CAR" }' : '{ "prim": "CDR" }'));

        if (annot != null) {
            const lastChar = word.slice(-2, -1);
            if (lastChar === 'A') {
                expandedC_R[expandedC_R.length-1] = `{ "prim": "CAR", "annots": [${annot}] }`
            } else if (lastChar === 'D') {
                expandedC_R[expandedC_R.length-1] = `{ "prim": "CDR", "annots": [${annot}] }`
            }
        }

        return `[${expandedC_R.join(', ')}]`;
    }

    const check_compare = cmp => macroCMPlist.includes(cmp);

    const expand_cmp = (cmp, annot) => {
        var op = cmp.substring(3)
        var binary_op = keywordToJson([`${op}`])
        var compare = keywordToJson(['COMPARE'])
        if (annot != null) {
            binary_op = `{ "prim": "${op}", "annots": [${annot}] }`;
        }

        return `[${compare}, ${binary_op}]`;
    }

    const check_dup = dup => DUPmatcher.test(dup);

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

        throw new Error('');
    }

    const check_assert = assert => macroASSERTlistConst.includes(assert);

    const expand_assert = (assert, annot) => {
        const annotation = !!annot ? `, "annots": [${annot}]` : '';
        switch (assert) {
            case 'ASSERT':
                return `[{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"${annotation}}]]]}]`;
            case 'ASSERT_CMPEQ':
                return `[[{"prim":"COMPARE"},{"prim":"EQ"}],{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"${annotation}}]]]}]`;
            case 'ASSERT_CMPGE':
                return `[[{"prim":"COMPARE"},{"prim":"GE"}],{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"${annotation}}]]]}]`;
            case 'ASSERT_CMPGT':
                return `[[{"prim":"COMPARE"},{"prim":"GT"}],{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"${annotation}}]]]}]`;
            case 'ASSERT_CMPLE':
                return `[[{"prim":"COMPARE"},{"prim":"LE"}],{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"${annotation}}]]]}]`;
            case 'ASSERT_CMPLT':
                return `[[{"prim":"COMPARE"},{"prim":"LT"}],{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"${annotation}}]]]}]`;
            case 'ASSERT_CMPNEQ':
                return `[[{"prim":"COMPARE"},{"prim":"NEQ"}],{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"${annotation}}]]]}]`;
            case 'ASSERT_EQ':
                return `[{"prim":"EQ"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"${annotation}}]]]]`;
            case 'ASSERT_GE':
                return `[{"prim":"GE"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"${annotation}}]]]}]`;
            case 'ASSERT_GT':
                return `[{"prim":"GT"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"${annotation}}]]]}]`;
            case 'ASSERT_LE':
                return `[{"prim":"LE"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"${annotation}}]]]}]`;
            case 'ASSERT_LT':
                return `[{"prim":"LT"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"${annotation}}]]]}]`;
            case 'ASSERT_NEQ':
                return `[{"prim":"NEQ"},{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"${annotation}}]]]}]`;
            case 'ASSERT_NONE': // IF_NONE {} {FAIL}
                return '[{"prim":"IF_NONE","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}]';
            case 'ASSERT_SOME': // IF_NONE {FAIL} {RENAME @x}
                return '[{"prim":"IF_NONE","args":[[[{"prim":"UNIT"},{"prim":"FAILWITH"}]],[]]}]';
            case 'ASSERT_LEFT': // IF_LEFT {RENAME @x} {FAIL}
                return '';
            case 'ASSERT_RIGHT': // IF_LEFT {FAIL} {RENAME @x}
                return '';
            default:
                throw new Error(`Could not process ${assert}`);
        }
    }

    const check_fail = fail => fail === "FAIL";

    const expand_fail = (fail, annot) => {
        if (annot == null) {
            return '[ { "prim": "UNIT" }, { "prim": "FAILWITH" } ]';
        } else {
            return `[ { "prim": "UNIT" }, { "prim": "FAILWITH", "annots": [${annot}] } ]`;
        }
    }

    const check_if = ifStatement => (macroIFCMPlist.includes(ifStatement) || macroIFlist.includes(ifStatement) || ifStatement === 'IF_SOME'); // TODO: IF_SOME

    const expandIF = (ifInstr, ifTrue, ifFalse?, annot?) => {
        const annotation = !!annot ? `, "annots": [${annot}]` : '';

        switch (ifInstr) {
            case 'IFCMPEQ':
                return `[{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]${annotation}}]`;
            case 'IFCMPGE':
                return `[{"prim":"COMPARE"},{"prim":"GE"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]${annotation}}]`;
            case 'IFCMPGT':
                return `[{"prim":"COMPARE"},{"prim":"GT"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]${annotation}}]`;
            case 'IFCMPLE':
                return `[{"prim":"COMPARE"},{"prim":"LE"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]${annotation}}]`;
            case 'IFCMPLT':
                return `[{"prim":"COMPARE"},{"prim":"LT"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]${annotation}}]`;
            case 'IFCMPNEQ':
                return `[{"prim":"COMPARE"},{"prim":"NEQ"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]${annotation}}]`;
            case 'IFEQ':
                return `[{"prim":"EQ"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]${annotation}}]`;
            case 'IFGE':
                return `[{"prim":"GE"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]${annotation}}]`;
            case 'IFGT':
                return `[{"prim":"GT"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]${annotation}}]`;
            case 'IFLE':
                return `[{"prim":"LE"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]${annotation}}]`;
            case 'IFLT':
                return `[{"prim":"LT"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]${annotation}}]`;
            case 'IFNEQ':
                return `[{"prim":"NEQ"},{"prim":"IF","args":[ [${ifTrue}] , [${ifFalse}]]${annotation}}]`;
            case 'IF_SOME':
                return `[{"prim":"IF_NONE","args":[ [${ifFalse}], [${ifTrue}]]${annotation}}]`;
            default:
                throw new Error(`Could not process ${ifInstr}`);
        }
    }

    const check_dip = dip => DIPmatcher.test(dip);

    const expandDIP = (dip, instruction, annot?) => {
        let t = '';
        if (DIPmatcher.test(dip)) {
            const c = dip.length - 2;
            for (let i = 0; i < c; i++) { t += '[{ "prim": "DIP", "args": [ '; }
            t = `${t} [ ${instruction} ] ]`;
            if (!!annot) { t = `${t}, "annots": [${annot}]`; }
            t += ' }]';
            for (let i = 0; i < c - 1; i++) { t += ' ] }]'; }
            return t;
        }

        throw new Error(`Unexpected parameter for DIP processing: ${dip}`);
    }

    const check_other = word => (word == "UNPAIR" || word == "UNPAPAIR"); // TODO: dynamic matching

    //UNPAIR and annotations follows a nonstandard format described in docs, and is dependent on the number of
    //annotations given to the command, right now we're hard coding to fix the multisig contract swiftly, but a
    //more general solution is required in the longterm.
    const expand_other = (word, annot) => {
        if (word == 'UNPAIR') {
            if (annot == null) {
                return '[ [ { "prim": "DUP" }, { "prim": "CAR" }, { "prim": "DIP", "args": [ [ { "prim": "CDR" } ] ] } ] ]'
            } else if (annot.length == 1) {
                return `[ [ { "prim": "DUP" }, { "prim": "CAR", "annots": [${annot}] }, { "prim": "DIP", "args": [ [ { "prim": "CDR" } ] ]  } ] ]`
            } else if (annot.length == 2) {
                return `[ [ { "prim": "DUP" }, { "prim": "CAR", "annots": [${annot[0]}] }, { "prim": "DIP", "args": [ [ { "prim": "CDR", "annots": [${annot[1]}] } ] ]  } ] ]`
            } else {
                return '';
            }
        }

        if (word == 'UNPAPAIR') {
            if (annot == null) {
                return `[ [ { "prim": "DUP" },
                            { "prim": "CAR" },
                            { "prim": "DIP", "args": [ [ { "prim": "CDR" } ] ] } ],
                            {"prim":"DIP","args":[[[{"prim":"DUP"},{"prim":"CAR"},{"prim":"DIP","args":[[{"prim":"CDR"}]]}]]]}]`;
            } else {
                return `[ [ { "prim": "DUP" },
                            { "prim": "CAR" },
                            { "prim": "DIP", "args": [ [ { "prim": "CDR" } ] ] } ],
                            {"prim":"DIP","args":[[[{"prim":"DUP"},{"prim":"CAR"},{"prim":"DIP","args":[[{"prim":"CDR"}]],"annots": [${annot}]}]]]}]`;
            }
        }
    }

    const checkSetCadr = s => macroSETCADRconst.test(s);

    const expandSetCadr = (word, annot) => nestSetCadr(word.slice(5, -1));

    const nestSetCadr = r => {
        if (r.length === 0) { return ''; }

        const c = r.charAt(0);
        if (r.length === 1) {
            if (c === 'A') {
                return '[{"prim": "CDR","annots":["@%%"]}, {"prim": "SWAP"}, {"prim": "PAIR","annots":["%","%@"]}]';
            } else if (c === 'D'){
                return '[{"prim": "CAR","annots":["@%%"]}, {"prim": "PAIR","annots":["%@","%"]}]';
            }
        }

        if (c === 'A') {
            return `[{"prim": "DUP"}, {"prim": "DIP", "args": [[{"prim": "CAR","annots":["@%%"]}, ${nestSetCadr(r.slice(1))}]]}, {"prim": "CDR","annots":["@%%"]}, {"prim": "SWAP"}, {"prim": "PAIR","annots":["%@","%@"]}]`;
        } else if (c === 'D') {
            return `[{"prim": "DUP"}, {"prim": "DIP", "args": [[{"prim": "CDR","annots":["@%%"]}, ${nestSetCadr(r.slice(1))}]]}, {"prim": "CAR","annots":["@%%"]}, {"prim": "PAIR","annots":["%@","%@"]}]`;
        }
    }

    const checkKeyword = word => {
        if (check_assert(word)) { return true; }
        if (check_compare(word)) { return true; }
        if (check_dip(word)) { return true; }
        if (check_dup(word)) { return true; }
        if (check_fail(word)) { return true; }
        if (check_if(word)) { return true; }
        if (checkC_R(word)) { return true; }
        if (check_other(word)) { return true; }
        if (checkSetCadr(word)) { return true; }
    }

    const expandKeyword = (word, annot) => {
        if (checkC_R(word)) { return expandC_R(word, annot); }
        if (check_assert(word)) { return expand_assert(word, annot); }
        if (check_compare(word)) { return expand_cmp(word, annot); }
        if (check_dip(word)) { return expandDIP(word, annot); }
        if (check_dup(word)) { return expand_dup(word, annot); }
        if (check_fail(word)) { return expand_fail(word, annot); }
        if (check_if(word)) { return expandIF(word, annot); }
        if (check_other(word)) { return expand_other(word, annot); }
        if (checkSetCadr(word)) { return expandSetCadr(word, annot); }
    }

    /**
     * Given a int, convert it to JSON.
     * Example: "3" -> { "int": "3" }
     */
    const intToJson = d => `{ "int": "${d[0]}" }`;

    /**
     * Given a string, convert it to JSON.
     * Example: "string" -> "{ "string": "blah" }"
     */
    const stringToJson = d => `{ "string": ${d[0]} }`;

    /**
    */
    const bytesToJson = d => `{ "bytes": "${d[0].toString().slice(2)}" }`;

    /**
     * Given a keyword, convert it to JSON.
     * Example: "int" -> "{ "prim" : "int" }"
     */
    const keywordToJson = d => {
        const word = d[0].toString();

        if (d.length == 1) {
            if (checkKeyword(word)) {
                return expandKeyword(word, null);
            } else {
                return `{ "prim": "${d[0]}" }`;
            }
        } else {
            const annot = d[1].map(x => `"${x[1]}"`);
            if (checkKeyword(word)) {
                return [expandKeyword(word, annot)];
            } else {
                return `{ "prim": "${d[0]}", "annots": [${annot}] }`;
            }
        }
    }

    /**
     * Given a keyword with one argument, convert it to JSON.
     * Example: "option int" -> "{ prim: option, args: [int] }"
     */
    const singleArgKeywordToJson = d => `{ "prim": "${d[0]}", "args": [ ${d[2]} ] }`;

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
            return expandDIP(word, d[2]);
        } else {
            return `{ "prim": "${d[0]}", "args": [ [ ${d[2]} ] ] }`; /*TODO: [] double-wrapping here is Bad*/
        }
    }

    const singleArgTypeKeywordToJson = d => {
        const word = `${d[0].toString()}`
        const annot = d[1].map(x => `"${x[1]}"`)
        if (check_dip(word)) {
            return expandDIP(word, d[2], annot)
        } else {
            return `{ "prim": "${d[0]}", "args": [ ${d[3]} ], "annots": [${annot}] }`;
        }
    }

    /**
     * Given a keyword with one argument and parentheses, convert it to JSON.
     * Example: "(option int)" -> "{ prim: option, args: [{prim: int}] }"
     * Also: (option (mutez))
     */
    const singleArgKeywordWithParenToJson = d => `{ "prim": "${d[2]}", "args": [ ${d[(4 + ((d.length === 7) ? 0 : 2))]} ] }`;

    /**
     * Given a keyword with two arguments, convert it into JSON.
     * Example: "Pair Unit <instruction>" -> "{ prim: Pair, args: [{prim: Unit}, {prim: instruction}] }"
     */
    const doubleArgKeywordToJson = d => {
        if (d.length === 7) {
            /*
                This handles the case where a blank {} for %subInstruction should be blank, but for %data they should be an empty array, see TODO about double-wrapping
            */
            return `{ "prim": "${d[0]}", "args": [ ${d[2]}, [] ] }`;
        } else {
            return `{ "prim": "${d[0]}", "args": [ ${d[2]}, ${d[4]} ] }`;
        }
    };
    const doubleArgParenKeywordToJson = d => `{ "prim": "${d[0]}", "args": [ ${d[4]}, ${d[8]} ] }`;

    const doubleArgInstrKeywordToJson = d => {
        const word = `${d[0].toString()}`
        if (check_if(word)) {
            return expandIF(word, d[2], d[4])
        } else {
            return `{ "prim": "${d[0]}", "args": [ [${d[2]}], [${d[4]}] ] }`; /*TODO: [] double-wrapping here is Bad*/
        }
    }

    /**
     * Given a keyword with two arguments and parentheses, convert it into JSON.
     * Example: "(Pair unit instruction)" -> "{ prim: Pair, args: [{prim: unit}, {prim: instruction}] }"
     */
    const doubleArgKeywordWithParenToJson = d => `{ "prim": "${d[2]}", "args": [ ${d[4]}, ${d[6]} ] }`;

    /**
     * Given a keyword with three arguments, convert it into JSON.
     * Example: "LAMBDA key unit {DIP;}" -> "{ prim: LAMBDA, args: [{prim: key}, {prim: unit}, {prim: DIP}] }"
     */
    const tripleArgKeyWordToJson = d => `{ "prim": "${d[0]}", "args": [ ${d[2]}, ${d[4]}, [${d[6]}] ] }`;

    /**
     * Given a keyword with three arguments and parentheses, convert it into JSON.
     * Example: "(LAMBDA key unit {DIP;})" -> "{ prim: LAMBDA, args: [{prim: key}, {prim: unit}, {prim: DIP}] }"
     */
    const tripleArgKeyWordWithParenToJson = d => `{ "prim": "${d[0]}", "args": [ ${d[2]}, ${d[4]}, ${d[6]} ] }`;

    const nestedArrayChecker = x => {
        if (Array.isArray(x) && Array.isArray(x[0])) { // handles double array nesting
            return x[0];
        } else {
            return x;
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
    const instructionSetToJsonSemi = d => { return `${d[2].map(x => x[0]).map(x => nestedArrayChecker(x))}`; }
    const dataListToJsonSemi = d => { return `[ ${d[2].map(x => x[0]).map(x => nestedArrayChecker(x))} ]`; }

    /**
     * parameter, storage, code
     */
    const scriptToJson = d => `[ ${d[0]}, ${d[2]}, { "prim": "code", "args": [ [ ${d[4]} ] ] } ]`;

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
        return `{ "prim": "${d[0]}", "args": [ ${d[3]}, ${d[5]}, ${d[7]} ], "annots": [${annot}] }`;
    }

    const pushToJson = d => {
        return `{ "prim": "${d[0]}", "args": [${d[2]}, []] }`;
    }

    const pushWithAnnotsToJson = d => {
        const annot = d[1].map(x => `"${x[1]}"`)
        return `{ "prim": "PUSH", "args": [ ${d[3]}, ${d[5]} ], "annots": [${annot}]  }`;
    }

    const saplingToJson = d => {
        if (d.length == 7) { // if there exists an annotation
            const annot = d[3].map(x => `"${x[1]}"`);
            return `{ "prim": "${d[2]}", "args": [ { "int": "${d[5]}" } ], "annots": [${annot}] }`;
        } else
            return `{ "prim": "${d[2]}", "args": [ { "int": "${d[4]}" } ] }`;
    }

    const dipnToJson = d => (d.length > 4) ? `{ "prim": "${d[0]}", "args": [ { "int": "${d[2]}" }, [ ${d[4]} ] ] }` : `{ "prim": "${d[0]}", "args": [ ${d[2]} ] }`;

    const dupnToJson = d => {
        const n = Number(d[2]);

        if (n === 1) {
            return '{ "prim": "DUP" }';
        } else if (n === 2) {
            return '[{ "prim": "DIP", "args": [[ {"prim": "DUP"} ]] }, { "prim": "SWAP" }]';
        } else {
            return `[{ "prim": "DIP", "args": [ {"int": "${n - 1}"}, [{ "prim": "DUP" }] ] }, { "prim": "DIG", "args": [ {"int": "${n}"} ] }]`;
        }
    };

    const dignToJson = d => `{ "prim": "${d[0]}", "args": [ { "int": "${d[2]}" } ] }`;

    const dropnToJson = d => `{ "prim": "${d[0]}", "args": [ { "int": "${d[2]}" } ] }`;

    const subContractToJson = d => `{ "prim": "CREATE_CONTRACT", "args": [ [ ${d[4]}, ${d[6]}, { "prim": "code" , "args": [ [ ${d[8]} ] ] } ] ] }`;

    const instructionListToJson = d => {
        const instructionOne = [d[2]];
        const instructionList = d[3].map(x => x[3]);
        return instructionOne.concat(instructionList).map(x => nestedArrayChecker(x));
    }
%}
