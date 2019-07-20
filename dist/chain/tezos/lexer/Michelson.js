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
  - We do not handle instances where parameter, storage, and code are given in a different order
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
        'MAP', 'MEM', 'MUL', 'NEG', 'NEQ', 'NIL', 'NONE', 'NOT', 'NOW', 'OR', 'PACK', 'PAIR', /*'PUSH',*/ 'REDUCE', 'RENAME', 'RIGHT', 'SELF',
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
    elt: "Elt",
    word: /[a-zA-Z_0-9]+/,
    string: /"(?:\\["\\]|[^\n"\\])*"/
});


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

    const check_assert = assert => macroASSERTlist.includes(assert);

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
            default:
                return '';
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

    const expandIF = (ifInstr, ifTrue, ifFalse, annot) => {
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
                return '';
        }
    }

    const check_dip = dip => DIPmatcher.test(dip);

    const expandDIP = (dip, instruction, annot) => {
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

    const checkSetCadr = s => macroSETCADR.test(s);

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
    const intToJson = d => `{ "int": "${parseInt(d[0])}" }`;

    /**
     * Given a string, convert it to JSON.
     * Example: "string" -> "{ "string": "blah" }"
     */
    const stringToJson = d => `{ "string": ${d[0]} }`;

    /**
     * Given a keyword, convert it to JSON.
     * Example: "int" -> "{ "prim" : "int" }"
     */
    const keywordToJson = d => {
        const word = d[0].toString();

        if (d.length == 1) {
            if (checkKeyword(word)) {
                return [expandKeyword(word, null)];
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
            return expandDIP(word, d[2])
        } else {
            return `{ "prim": "${d[0]}", "args": [ [ ${d[2]} ] ] }`;
        }
    }

    const singleArgTypeKeywordToJson = d => {
        const word = `${d[0].toString()}`
        const annot = d[1].map(x => `"${x[1]}"`)
        if (check_dip(word)) {
            return expandDIP(word, d[2], annot)
        } else {
            return `{ "prim": "${d[0]}", "args": [  ${d[3]}  ], "annots": [${annot}] }`;
        }
    }

    /**
     * Given a keyword with one argument and parentheses, convert it to JSON.
     * Example: "(option int)" -> "{ prim: option, args: [{prim: int}] }"
     */
    const singleArgKeywordWithParenToJson = d => `{ "prim": "${d[2]}", "args": [ ${d[4]} ] }`;

    /**
     * Given a keyword with two arguments, convert it into JSON.
     * Example: "Pair unit instruction" -> "{ prim: Pair, args: [{prim: unit}, {prim: instruction}] }"
     */
    const doubleArgKeywordToJson = d => `{ "prim": "${d[0]}", "args": [ ${d[2]}, ${d[4]} ] }`;

    const doubleArgInstrKeywordToJson = d => {
        const word = `${d[0].toString()}`
        if (check_if(word)) {
            return expandIF(word, d[2], d[4])
        } else {
            return `{ "prim": "${d[0]}", "args": [ [${d[2]}], [${d[4]}] ] }`;
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
    const instructionSetToJsonSemi = d => { return d[2].map(x => x[0]).map(x => nestedArrayChecker(x)); }

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
        return `{ "prim": "${d[0]}", "args": [ ${d[3]}, ${d[5]}, ${d[7]} ], "annots": [${annot}]  }`;
    }

    const pushToJson = d => {
        return `{ "prim": "${d[0]}", "args": [${d[2]}, []] }`;
    }

    const pushWithAnnotsToJson = d => {
        const annot = d[1].map(x => `"${x[1]}"`)
        return `{ "prim": "PUSH", "args": [ ${d[3]}, ${d[5]} ], "annots": [${annot}]  }`;
    }

    const subContractToJson = d => `{ "prim":"CREATE_CONTRACT", "args": [ [ ${d[4]}, ${d[6]}, {"prim": "code" , "args":[ [ ${d[8]} ] ] } ] ] }`;

    const instructionListToJson = d => {
        const instructionOne = [d[2]]
        const instructionList = d[3].map(x => x[3])
        return instructionOne.concat(instructionList).map(x => nestedArrayChecker(x))
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
    {"name": "main", "symbols": ["parameterValue"], "postprocess": id},
    {"name": "main", "symbols": ["storageValue"], "postprocess": id},
    {"name": "main", "symbols": ["typeData"], "postprocess": id},
    {"name": "script", "symbols": ["parameter", "_", "storage", "_", "code"], "postprocess": scriptToJson},
    {"name": "parameterValue", "symbols": [(lexer.has("parameter") ? {type: "parameter"} : parameter), "_", "typeData", "_", "semicolons"], "postprocess": singleArgKeywordToJson},
    {"name": "storageValue", "symbols": [(lexer.has("storage") ? {type: "storage"} : storage), "_", "typeData", "_", "semicolons"], "postprocess": singleArgKeywordToJson},
    {"name": "parameter", "symbols": [(lexer.has("parameter") ? {type: "parameter"} : parameter), "_", "type", "_", "semicolons"], "postprocess": singleArgKeywordToJson},
    {"name": "storage", "symbols": [(lexer.has("storage") ? {type: "storage"} : storage), "_", "type", "_", "semicolons"], "postprocess": singleArgKeywordToJson},
    {"name": "code", "symbols": [(lexer.has("code") ? {type: "code"} : code), "_", "subInstruction", "_", "semicolons", "_"], "postprocess": d => d[2]},
    {"name": "code", "symbols": [(lexer.has("code") ? {type: "code"} : code), "_", {"literal":"{};"}], "postprocess": d => "code {}"},
    {"name": "type", "symbols": [(lexer.has("comparableType") ? {type: "comparableType"} : comparableType)], "postprocess": keywordToJson},
    {"name": "type", "symbols": [(lexer.has("constantType") ? {type: "constantType"} : constantType)], "postprocess": keywordToJson},
    {"name": "type", "symbols": [(lexer.has("singleArgType") ? {type: "singleArgType"} : singleArgType), "_", "type"], "postprocess": singleArgKeywordToJson},
    {"name": "type", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("singleArgType") ? {type: "singleArgType"} : singleArgType), "_", "type", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": singleArgKeywordWithParenToJson},
    {"name": "type", "symbols": [(lexer.has("doubleArgType") ? {type: "doubleArgType"} : doubleArgType), "_", "type", "_", "type"], "postprocess": doubleArgKeywordToJson},
    {"name": "type", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("doubleArgType") ? {type: "doubleArgType"} : doubleArgType), "_", "type", "_", "type", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": doubleArgKeywordWithParenToJson},
    {"name": "type$ebnf$1$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$1", "symbols": ["type$ebnf$1$subexpression$1"]},
    {"name": "type$ebnf$1$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$1", "symbols": ["type$ebnf$1", "type$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "type", "symbols": [(lexer.has("comparableType") ? {type: "comparableType"} : comparableType), "type$ebnf$1"], "postprocess": keywordToJson},
    {"name": "type$ebnf$2$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$2", "symbols": ["type$ebnf$2$subexpression$1"]},
    {"name": "type$ebnf$2$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$2", "symbols": ["type$ebnf$2", "type$ebnf$2$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "type", "symbols": [(lexer.has("constantType") ? {type: "constantType"} : constantType), "type$ebnf$2"], "postprocess": keywordToJson},
    {"name": "type$ebnf$3$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$3", "symbols": ["type$ebnf$3$subexpression$1"]},
    {"name": "type$ebnf$3$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$3", "symbols": ["type$ebnf$3", "type$ebnf$3$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "type", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("comparableType") ? {type: "comparableType"} : comparableType), "type$ebnf$3", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": comparableTypeToJson},
    {"name": "type$ebnf$4$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$4", "symbols": ["type$ebnf$4$subexpression$1"]},
    {"name": "type$ebnf$4$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$4", "symbols": ["type$ebnf$4", "type$ebnf$4$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "type", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("constantType") ? {type: "constantType"} : constantType), "type$ebnf$4", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": comparableTypeToJson},
    {"name": "type$ebnf$5$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$5", "symbols": ["type$ebnf$5$subexpression$1"]},
    {"name": "type$ebnf$5$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$5", "symbols": ["type$ebnf$5", "type$ebnf$5$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "type", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("singleArgType") ? {type: "singleArgType"} : singleArgType), "type$ebnf$5", "_", "type", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": singleArgTypeKeywordWithParenToJson},
    {"name": "type$ebnf$6$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$6", "symbols": ["type$ebnf$6$subexpression$1"]},
    {"name": "type$ebnf$6$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$6", "symbols": ["type$ebnf$6", "type$ebnf$6$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "type", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("doubleArgType") ? {type: "doubleArgType"} : doubleArgType), "type$ebnf$6", "_", "type", "_", "type", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": doubleArgTypeKeywordWithParenToJson},
    {"name": "typeData", "symbols": [(lexer.has("singleArgType") ? {type: "singleArgType"} : singleArgType), "_", "typeData"], "postprocess": singleArgKeywordToJson},
    {"name": "typeData", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("singleArgType") ? {type: "singleArgType"} : singleArgType), "_", "typeData", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": singleArgKeywordWithParenToJson},
    {"name": "typeData", "symbols": [(lexer.has("doubleArgType") ? {type: "doubleArgType"} : doubleArgType), "_", "typeData", "_", "typeData"], "postprocess": doubleArgKeywordToJson},
    {"name": "typeData", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("doubleArgType") ? {type: "doubleArgType"} : doubleArgType), "_", "typeData", "_", "typeData", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": doubleArgKeywordWithParenToJson},
    {"name": "typeData", "symbols": ["subTypeData"], "postprocess": id},
    {"name": "typeData", "symbols": ["subTypeElt"], "postprocess": id},
    {"name": "typeData", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": intToJson},
    {"name": "typeData", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": stringToJson},
    {"name": "typeData", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": d => []},
    {"name": "data", "symbols": [(lexer.has("constantData") ? {type: "constantData"} : constantData)], "postprocess": keywordToJson},
    {"name": "data", "symbols": [(lexer.has("singleArgData") ? {type: "singleArgData"} : singleArgData), "_", "data"], "postprocess": singleArgKeywordToJson},
    {"name": "data", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("singleArgData") ? {type: "singleArgData"} : singleArgData), "_", "data", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": singleArgKeywordWithParenToJson},
    {"name": "data", "symbols": [(lexer.has("doubleArgData") ? {type: "doubleArgData"} : doubleArgData), "_", "data", "_", "data"], "postprocess": doubleArgKeywordToJson},
    {"name": "data", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("doubleArgData") ? {type: "doubleArgData"} : doubleArgData), "_", "data", "_", "data", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": doubleArgKeywordWithParenToJson},
    {"name": "data", "symbols": ["subData"], "postprocess": id},
    {"name": "data", "symbols": ["subElt"], "postprocess": id},
    {"name": "data", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": intToJson},
    {"name": "data", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": stringToJson},
    {"name": "subTypeData", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": d => "[]"},
    {"name": "subTypeData$ebnf$1$subexpression$1$ebnf$1", "symbols": [{"literal":";"}], "postprocess": id},
    {"name": "subTypeData$ebnf$1$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "subTypeData$ebnf$1$subexpression$1", "symbols": ["data", "subTypeData$ebnf$1$subexpression$1$ebnf$1", "_"]},
    {"name": "subTypeData$ebnf$1", "symbols": ["subTypeData$ebnf$1$subexpression$1"]},
    {"name": "subTypeData$ebnf$1$subexpression$2$ebnf$1", "symbols": [{"literal":";"}], "postprocess": id},
    {"name": "subTypeData$ebnf$1$subexpression$2$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "subTypeData$ebnf$1$subexpression$2", "symbols": ["data", "subTypeData$ebnf$1$subexpression$2$ebnf$1", "_"]},
    {"name": "subTypeData$ebnf$1", "symbols": ["subTypeData$ebnf$1", "subTypeData$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subTypeData", "symbols": [{"literal":"{"}, "_", "subTypeData$ebnf$1", {"literal":"}"}], "postprocess": instructionSetToJsonSemi},
    {"name": "subTypeData$ebnf$2$subexpression$1$ebnf$1", "symbols": [{"literal":";"}], "postprocess": id},
    {"name": "subTypeData$ebnf$2$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "subTypeData$ebnf$2$subexpression$1", "symbols": ["data", "subTypeData$ebnf$2$subexpression$1$ebnf$1", "_"]},
    {"name": "subTypeData$ebnf$2", "symbols": ["subTypeData$ebnf$2$subexpression$1"]},
    {"name": "subTypeData$ebnf$2$subexpression$2$ebnf$1", "symbols": [{"literal":";"}], "postprocess": id},
    {"name": "subTypeData$ebnf$2$subexpression$2$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "subTypeData$ebnf$2$subexpression$2", "symbols": ["data", "subTypeData$ebnf$2$subexpression$2$ebnf$1", "_"]},
    {"name": "subTypeData$ebnf$2", "symbols": ["subTypeData$ebnf$2", "subTypeData$ebnf$2$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subTypeData", "symbols": [{"literal":"("}, "_", "subTypeData$ebnf$2", {"literal":")"}], "postprocess": instructionSetToJsonSemi},
    {"name": "subTypeElt", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": d => "[]"},
    {"name": "subTypeElt$ebnf$1$subexpression$1", "symbols": ["typeElt", {"literal":";"}, "_"]},
    {"name": "subTypeElt$ebnf$1", "symbols": ["subTypeElt$ebnf$1$subexpression$1"]},
    {"name": "subTypeElt$ebnf$1$subexpression$2", "symbols": ["typeElt", {"literal":";"}, "_"]},
    {"name": "subTypeElt$ebnf$1", "symbols": ["subTypeElt$ebnf$1", "subTypeElt$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subTypeElt", "symbols": [{"literal":"{"}, "_", "subTypeElt$ebnf$1", {"literal":"}"}], "postprocess": instructionSetToJsonSemi},
    {"name": "subTypeElt$ebnf$2$subexpression$1", "symbols": ["typeElt", {"literal":";"}, "_"]},
    {"name": "subTypeElt$ebnf$2", "symbols": ["subTypeElt$ebnf$2$subexpression$1"]},
    {"name": "subTypeElt$ebnf$2$subexpression$2", "symbols": ["typeElt", {"literal":";"}, "_"]},
    {"name": "subTypeElt$ebnf$2", "symbols": ["subTypeElt$ebnf$2", "subTypeElt$ebnf$2$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subTypeElt", "symbols": [{"literal":"("}, "_", "subTypeElt$ebnf$2", {"literal":")"}], "postprocess": instructionSetToJsonSemi},
    {"name": "typeElt", "symbols": [(lexer.has("elt") ? {type: "elt"} : elt), "_", "typeData", "_", "typeData"], "postprocess": doubleArgKeywordToJson},
    {"name": "subInstruction", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": d => ""},
    {"name": "subInstruction", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "instruction", "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": d => d[2]},
    {"name": "subInstruction$ebnf$1$subexpression$1", "symbols": ["instruction", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"]},
    {"name": "subInstruction$ebnf$1", "symbols": ["subInstruction$ebnf$1$subexpression$1"]},
    {"name": "subInstruction$ebnf$1$subexpression$2", "symbols": ["instruction", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"]},
    {"name": "subInstruction$ebnf$1", "symbols": ["subInstruction$ebnf$1", "subInstruction$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subInstruction", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "subInstruction$ebnf$1", "instruction", "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": instructionSetToJsonNoSemi},
    {"name": "subInstruction$ebnf$2$subexpression$1", "symbols": ["instruction", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"]},
    {"name": "subInstruction$ebnf$2", "symbols": ["subInstruction$ebnf$2$subexpression$1"]},
    {"name": "subInstruction$ebnf$2$subexpression$2", "symbols": ["instruction", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"]},
    {"name": "subInstruction$ebnf$2", "symbols": ["subInstruction$ebnf$2", "subInstruction$ebnf$2$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subInstruction", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "subInstruction$ebnf$2", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": instructionSetToJsonSemi},
    {"name": "instructions", "symbols": [(lexer.has("baseInstruction") ? {type: "baseInstruction"} : baseInstruction)]},
    {"name": "instructions", "symbols": [(lexer.has("macroCADR") ? {type: "macroCADR"} : macroCADR)]},
    {"name": "instructions", "symbols": [(lexer.has("macroDIP") ? {type: "macroDIP"} : macroDIP)]},
    {"name": "instructions", "symbols": [(lexer.has("macroDUP") ? {type: "macroDUP"} : macroDUP)]},
    {"name": "instructions", "symbols": [(lexer.has("macroSETCADR") ? {type: "macroSETCADR"} : macroSETCADR)]},
    {"name": "instructions", "symbols": [(lexer.has("macroASSERTlist") ? {type: "macroASSERTlist"} : macroASSERTlist)]},
    {"name": "instruction", "symbols": ["instructions"], "postprocess": keywordToJson},
    {"name": "instruction$ebnf$1$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$1", "symbols": ["instruction$ebnf$1$subexpression$1"]},
    {"name": "instruction$ebnf$1$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$1", "symbols": ["instruction$ebnf$1", "instruction$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "instruction", "symbols": ["instructions", "instruction$ebnf$1", "_"], "postprocess": keywordToJson},
    {"name": "instruction", "symbols": ["instructions", "_", "subInstruction"], "postprocess": singleArgInstrKeywordToJson},
    {"name": "instruction$ebnf$2$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$2", "symbols": ["instruction$ebnf$2$subexpression$1"]},
    {"name": "instruction$ebnf$2$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$2", "symbols": ["instruction$ebnf$2", "instruction$ebnf$2$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "instruction", "symbols": ["instructions", "instruction$ebnf$2", "_", "subInstruction"], "postprocess": singleArgTypeKeywordToJson},
    {"name": "instruction", "symbols": ["instructions", "_", "type"], "postprocess": singleArgKeywordToJson},
    {"name": "instruction$ebnf$3$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$3", "symbols": ["instruction$ebnf$3$subexpression$1"]},
    {"name": "instruction$ebnf$3$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$3", "symbols": ["instruction$ebnf$3", "instruction$ebnf$3$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "instruction", "symbols": ["instructions", "instruction$ebnf$3", "_", "type"], "postprocess": singleArgTypeKeywordToJson},
    {"name": "instruction", "symbols": ["instructions", "_", "data"], "postprocess": singleArgKeywordToJson},
    {"name": "instruction$ebnf$4$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$4", "symbols": ["instruction$ebnf$4$subexpression$1"]},
    {"name": "instruction$ebnf$4$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$4", "symbols": ["instruction$ebnf$4", "instruction$ebnf$4$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "instruction", "symbols": ["instructions", "instruction$ebnf$4", "_", "data"], "postprocess": singleArgTypeKeywordToJson},
    {"name": "instruction", "symbols": ["instructions", "_", "type", "_", "type", "_", "subInstruction"], "postprocess": tripleArgKeyWordToJson},
    {"name": "instruction$ebnf$5$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$5", "symbols": ["instruction$ebnf$5$subexpression$1"]},
    {"name": "instruction$ebnf$5$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$5", "symbols": ["instruction$ebnf$5", "instruction$ebnf$5$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "instruction", "symbols": ["instructions", "instruction$ebnf$5", "_", "type", "_", "type", "_", "subInstruction"], "postprocess": tripleArgTypeKeyWordToJson},
    {"name": "instruction", "symbols": ["instructions", "_", "subInstruction", "_", "subInstruction"], "postprocess": doubleArgInstrKeywordToJson},
    {"name": "instruction$ebnf$6$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$6", "symbols": ["instruction$ebnf$6$subexpression$1"]},
    {"name": "instruction$ebnf$6$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$6", "symbols": ["instruction$ebnf$6", "instruction$ebnf$6$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "instruction", "symbols": ["instructions", "instruction$ebnf$6", "_", "subInstruction", "_", "subInstruction"], "postprocess": doubleArgTypeKeywordToJson},
    {"name": "instruction", "symbols": ["instructions", "_", "type", "_", "type"], "postprocess": doubleArgKeywordToJson},
    {"name": "instruction$ebnf$7$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$7", "symbols": ["instruction$ebnf$7$subexpression$1"]},
    {"name": "instruction$ebnf$7$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$7", "symbols": ["instruction$ebnf$7", "instruction$ebnf$7$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "instruction", "symbols": ["instructions", "instruction$ebnf$7", "_", "type", "_", "type"], "postprocess": doubleArgTypeKeywordToJson},
    {"name": "instruction", "symbols": [{"literal":"PUSH"}, "_", "type", "_", "data"], "postprocess": doubleArgKeywordToJson},
    {"name": "instruction", "symbols": [{"literal":"PUSH"}, "_", "type", "_", (lexer.has("lbrace") ? {type: "lbrace"} : lbrace), (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": pushToJson},
    {"name": "instruction$ebnf$8$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$8", "symbols": ["instruction$ebnf$8$subexpression$1"]},
    {"name": "instruction$ebnf$8$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$8", "symbols": ["instruction$ebnf$8", "instruction$ebnf$8$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "instruction", "symbols": [{"literal":"PUSH"}, "instruction$ebnf$8", "_", "type", "_", "data"], "postprocess": pushWithAnnotsToJson},
    {"name": "instruction", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": d => ""},
    {"name": "instruction", "symbols": [{"literal":"CREATE_CONTRACT"}, "_", (lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "parameter", "_", "storage", "_", "code", "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": subContractToJson},
    {"name": "subData", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": d => "[]"},
    {"name": "subData$ebnf$1$subexpression$1", "symbols": ["data", {"literal":";"}, "_"]},
    {"name": "subData$ebnf$1", "symbols": ["subData$ebnf$1$subexpression$1"]},
    {"name": "subData$ebnf$1$subexpression$2", "symbols": ["data", {"literal":";"}, "_"]},
    {"name": "subData$ebnf$1", "symbols": ["subData$ebnf$1", "subData$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subData", "symbols": [{"literal":"{"}, "_", "subData$ebnf$1", {"literal":"}"}], "postprocess": instructionSetToJsonSemi},
    {"name": "subData$ebnf$2$subexpression$1", "symbols": ["data", {"literal":";"}, "_"]},
    {"name": "subData$ebnf$2", "symbols": ["subData$ebnf$2$subexpression$1"]},
    {"name": "subData$ebnf$2$subexpression$2", "symbols": ["data", {"literal":";"}, "_"]},
    {"name": "subData$ebnf$2", "symbols": ["subData$ebnf$2", "subData$ebnf$2$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subData", "symbols": [{"literal":"("}, "_", "subData$ebnf$2", {"literal":")"}], "postprocess": instructionSetToJsonSemi},
    {"name": "subElt", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": d => "[]"},
    {"name": "subElt$ebnf$1$subexpression$1$ebnf$1", "symbols": [{"literal":";"}], "postprocess": id},
    {"name": "subElt$ebnf$1$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "subElt$ebnf$1$subexpression$1", "symbols": ["elt", "subElt$ebnf$1$subexpression$1$ebnf$1", "_"]},
    {"name": "subElt$ebnf$1", "symbols": ["subElt$ebnf$1$subexpression$1"]},
    {"name": "subElt$ebnf$1$subexpression$2$ebnf$1", "symbols": [{"literal":";"}], "postprocess": id},
    {"name": "subElt$ebnf$1$subexpression$2$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "subElt$ebnf$1$subexpression$2", "symbols": ["elt", "subElt$ebnf$1$subexpression$2$ebnf$1", "_"]},
    {"name": "subElt$ebnf$1", "symbols": ["subElt$ebnf$1", "subElt$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subElt", "symbols": [{"literal":"{"}, "_", "subElt$ebnf$1", {"literal":"}"}], "postprocess": instructionSetToJsonSemi},
    {"name": "subElt$ebnf$2$subexpression$1$ebnf$1", "symbols": [{"literal":";"}], "postprocess": id},
    {"name": "subElt$ebnf$2$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "subElt$ebnf$2$subexpression$1", "symbols": ["elt", "subElt$ebnf$2$subexpression$1$ebnf$1", "_"]},
    {"name": "subElt$ebnf$2", "symbols": ["subElt$ebnf$2$subexpression$1"]},
    {"name": "subElt$ebnf$2$subexpression$2$ebnf$1", "symbols": [{"literal":";"}], "postprocess": id},
    {"name": "subElt$ebnf$2$subexpression$2$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "subElt$ebnf$2$subexpression$2", "symbols": ["elt", "subElt$ebnf$2$subexpression$2$ebnf$1", "_"]},
    {"name": "subElt$ebnf$2", "symbols": ["subElt$ebnf$2", "subElt$ebnf$2$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subElt", "symbols": [{"literal":"("}, "_", "subElt$ebnf$2", {"literal":")"}], "postprocess": instructionSetToJsonSemi},
    {"name": "elt", "symbols": [(lexer.has("elt") ? {type: "elt"} : elt), "_", "data", "_", "data"], "postprocess": doubleArgKeywordToJson},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"]},
    {"name": "semicolons$ebnf$1", "symbols": [/[;]/], "postprocess": id},
    {"name": "semicolons$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "semicolons", "symbols": ["semicolons$ebnf$1"]}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
