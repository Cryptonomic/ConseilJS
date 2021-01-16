// Generated automatically by nearley, version 2.19.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var parameter: any;
declare var storage: any;
declare var code: any;
declare var comparableType: any;
declare var constantType: any;
declare var singleArgType: any;
declare var lparen: any;
declare var rparen: any;
declare var doubleArgType: any;
declare var annot: any;
declare var number: any;
declare var string: any;
declare var lbrace: any;
declare var rbrace: any;
declare var constantData: any;
declare var singleArgData: any;
declare var doubleArgData: any;
declare var bytes: any;
declare var elt: any;
declare var semicolon: any;
declare var baseInstruction: any;
declare var macroCADR: any;
declare var macroDIP: any;
declare var macroDUP: any;
declare var macroSETCADR: any;
declare var macroASSERTlist: any;

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
    comparableType: ['int', 'nat', 'string', 'bytes', 'mutez', 'bool', 'key_hash', 'timestamp', 'chain_id'],
    constantType: ['key', 'unit', 'signature', 'operation', 'address'],
    singleArgType: ['option', 'list', 'set', 'contract'],
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
        /*'DIG',*/ /*'DUG',*/ 'EMPTY_BIG_MAP', 'APPLY', 'CHAIN_ID'
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
    const intToJson = d => `{ "int": "${parseInt(d[0])}" }`;

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
                This handles the case where a blank {} for %subInstuction should be blank, but for %data they should be an empty array
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

interface NearleyToken {  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: NearleyToken) => string;
  has: (tokenType: string) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
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
    {"name": "type", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("singleArgType") ? {type: "singleArgType"} : singleArgType), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "type", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen), "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": singleArgKeywordWithParenToJson},
    {"name": "type", "symbols": [(lexer.has("doubleArgType") ? {type: "doubleArgType"} : doubleArgType), "_", "type", "_", "type"], "postprocess": doubleArgKeywordToJson},
    {"name": "type", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("doubleArgType") ? {type: "doubleArgType"} : doubleArgType), "_", "type", "_", "type", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": doubleArgKeywordWithParenToJson},
    {"name": "type$ebnf$1$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$1", "symbols": ["type$ebnf$1$subexpression$1"]},
    {"name": "type$ebnf$1$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$1", "symbols": ["type$ebnf$1", "type$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "type", "symbols": [(lexer.has("comparableType") ? {type: "comparableType"} : comparableType), "type$ebnf$1"], "postprocess": keywordToJson},
    {"name": "type$ebnf$2$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$2", "symbols": ["type$ebnf$2$subexpression$1"]},
    {"name": "type$ebnf$2$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$2", "symbols": ["type$ebnf$2", "type$ebnf$2$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "type", "symbols": [(lexer.has("constantType") ? {type: "constantType"} : constantType), "type$ebnf$2"], "postprocess": keywordToJson},
    {"name": "type$ebnf$3$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$3", "symbols": ["type$ebnf$3$subexpression$1"]},
    {"name": "type$ebnf$3$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$3", "symbols": ["type$ebnf$3", "type$ebnf$3$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "type", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("comparableType") ? {type: "comparableType"} : comparableType), "type$ebnf$3", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": comparableTypeToJson},
    {"name": "type$ebnf$4$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$4", "symbols": ["type$ebnf$4$subexpression$1"]},
    {"name": "type$ebnf$4$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$4", "symbols": ["type$ebnf$4", "type$ebnf$4$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "type", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("constantType") ? {type: "constantType"} : constantType), "type$ebnf$4", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": comparableTypeToJson},
    {"name": "type$ebnf$5$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$5", "symbols": ["type$ebnf$5$subexpression$1"]},
    {"name": "type$ebnf$5$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$5", "symbols": ["type$ebnf$5", "type$ebnf$5$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "type", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("singleArgType") ? {type: "singleArgType"} : singleArgType), "type$ebnf$5", "_", "type", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": singleArgTypeKeywordWithParenToJson},
    {"name": "type$ebnf$6$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$6", "symbols": ["type$ebnf$6$subexpression$1"]},
    {"name": "type$ebnf$6$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$6", "symbols": ["type$ebnf$6", "type$ebnf$6$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
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
    {"name": "data", "symbols": [(lexer.has("doubleArgData") ? {type: "doubleArgData"} : doubleArgData), "_", "data", "_", (lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": doubleArgKeywordToJson},
    {"name": "data", "symbols": [(lexer.has("doubleArgData") ? {type: "doubleArgData"} : doubleArgData), "_", "data", "_", "data"], "postprocess": doubleArgKeywordToJson},
    {"name": "data", "symbols": [(lexer.has("doubleArgData") ? {type: "doubleArgData"} : doubleArgData), "_", "data", "_", "subInstruction"], "postprocess": doubleArgKeywordToJson},
    {"name": "data", "symbols": ["subData"], "postprocess": id},
    {"name": "data", "symbols": ["subElt"], "postprocess": id},
    {"name": "data", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": stringToJson},
    {"name": "data", "symbols": [(lexer.has("bytes") ? {type: "bytes"} : bytes)], "postprocess": bytesToJson},
    {"name": "data", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": intToJson},
    {"name": "subData", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": d => "[]"},
    {"name": "subData$ebnf$1$subexpression$1", "symbols": ["data", "_"]},
    {"name": "subData$ebnf$1", "symbols": ["subData$ebnf$1$subexpression$1"]},
    {"name": "subData$ebnf$1$subexpression$2", "symbols": ["data", "_"]},
    {"name": "subData$ebnf$1", "symbols": ["subData$ebnf$1", "subData$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "subData", "symbols": [{"literal":"("}, "_", "subData$ebnf$1", {"literal":")"}], "postprocess": instructionSetToJsonSemi},
    {"name": "subData$ebnf$2$subexpression$1$ebnf$1", "symbols": [{"literal":";"}], "postprocess": id},
    {"name": "subData$ebnf$2$subexpression$1$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "subData$ebnf$2$subexpression$1", "symbols": ["data", "_", "subData$ebnf$2$subexpression$1$ebnf$1", "_"]},
    {"name": "subData$ebnf$2", "symbols": ["subData$ebnf$2$subexpression$1"]},
    {"name": "subData$ebnf$2$subexpression$2$ebnf$1", "symbols": [{"literal":";"}], "postprocess": id},
    {"name": "subData$ebnf$2$subexpression$2$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "subData$ebnf$2$subexpression$2", "symbols": ["data", "_", "subData$ebnf$2$subexpression$2$ebnf$1", "_"]},
    {"name": "subData$ebnf$2", "symbols": ["subData$ebnf$2", "subData$ebnf$2$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "subData", "symbols": [{"literal":"{"}, "_", "subData$ebnf$2", {"literal":"}"}], "postprocess": dataListToJsonSemi},
    {"name": "subElt", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": d => "[]"},
    {"name": "subElt$ebnf$1$subexpression$1$ebnf$1", "symbols": [{"literal":";"}], "postprocess": id},
    {"name": "subElt$ebnf$1$subexpression$1$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "subElt$ebnf$1$subexpression$1", "symbols": ["elt", "subElt$ebnf$1$subexpression$1$ebnf$1", "_"]},
    {"name": "subElt$ebnf$1", "symbols": ["subElt$ebnf$1$subexpression$1"]},
    {"name": "subElt$ebnf$1$subexpression$2$ebnf$1", "symbols": [{"literal":";"}], "postprocess": id},
    {"name": "subElt$ebnf$1$subexpression$2$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "subElt$ebnf$1$subexpression$2", "symbols": ["elt", "subElt$ebnf$1$subexpression$2$ebnf$1", "_"]},
    {"name": "subElt$ebnf$1", "symbols": ["subElt$ebnf$1", "subElt$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "subElt", "symbols": [{"literal":"{"}, "_", "subElt$ebnf$1", {"literal":"}"}], "postprocess": dataListToJsonSemi},
    {"name": "elt", "symbols": [(lexer.has("elt") ? {type: "elt"} : elt), "_", "data", "_", "data"], "postprocess": doubleArgKeywordToJson},
    {"name": "subTypeData", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": d => "[]"},
    {"name": "subTypeData$ebnf$1$subexpression$1$ebnf$1", "symbols": [{"literal":";"}], "postprocess": id},
    {"name": "subTypeData$ebnf$1$subexpression$1$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "subTypeData$ebnf$1$subexpression$1", "symbols": ["data", "subTypeData$ebnf$1$subexpression$1$ebnf$1", "_"]},
    {"name": "subTypeData$ebnf$1", "symbols": ["subTypeData$ebnf$1$subexpression$1"]},
    {"name": "subTypeData$ebnf$1$subexpression$2$ebnf$1", "symbols": [{"literal":";"}], "postprocess": id},
    {"name": "subTypeData$ebnf$1$subexpression$2$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "subTypeData$ebnf$1$subexpression$2", "symbols": ["data", "subTypeData$ebnf$1$subexpression$2$ebnf$1", "_"]},
    {"name": "subTypeData$ebnf$1", "symbols": ["subTypeData$ebnf$1", "subTypeData$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "subTypeData", "symbols": [{"literal":"{"}, "_", "subTypeData$ebnf$1", {"literal":"}"}], "postprocess": instructionSetToJsonSemi},
    {"name": "subTypeData$ebnf$2$subexpression$1$ebnf$1", "symbols": [{"literal":";"}], "postprocess": id},
    {"name": "subTypeData$ebnf$2$subexpression$1$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "subTypeData$ebnf$2$subexpression$1", "symbols": ["data", "subTypeData$ebnf$2$subexpression$1$ebnf$1", "_"]},
    {"name": "subTypeData$ebnf$2", "symbols": ["subTypeData$ebnf$2$subexpression$1"]},
    {"name": "subTypeData$ebnf$2$subexpression$2$ebnf$1", "symbols": [{"literal":";"}], "postprocess": id},
    {"name": "subTypeData$ebnf$2$subexpression$2$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "subTypeData$ebnf$2$subexpression$2", "symbols": ["data", "subTypeData$ebnf$2$subexpression$2$ebnf$1", "_"]},
    {"name": "subTypeData$ebnf$2", "symbols": ["subTypeData$ebnf$2", "subTypeData$ebnf$2$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "subTypeData", "symbols": [{"literal":"("}, "_", "subTypeData$ebnf$2", {"literal":")"}], "postprocess": instructionSetToJsonSemi},
    {"name": "subTypeElt", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": d => "[]"},
    {"name": "subTypeElt$ebnf$1$subexpression$1$ebnf$1", "symbols": [{"literal":";"}], "postprocess": id},
    {"name": "subTypeElt$ebnf$1$subexpression$1$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "subTypeElt$ebnf$1$subexpression$1", "symbols": ["typeElt", "subTypeElt$ebnf$1$subexpression$1$ebnf$1", "_"]},
    {"name": "subTypeElt$ebnf$1", "symbols": ["subTypeElt$ebnf$1$subexpression$1"]},
    {"name": "subTypeElt$ebnf$1$subexpression$2$ebnf$1", "symbols": [{"literal":";"}], "postprocess": id},
    {"name": "subTypeElt$ebnf$1$subexpression$2$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "subTypeElt$ebnf$1$subexpression$2", "symbols": ["typeElt", "subTypeElt$ebnf$1$subexpression$2$ebnf$1", "_"]},
    {"name": "subTypeElt$ebnf$1", "symbols": ["subTypeElt$ebnf$1", "subTypeElt$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "subTypeElt", "symbols": [{"literal":"[{"}, "_", "subTypeElt$ebnf$1", {"literal":"}]"}], "postprocess": instructionSetToJsonSemi},
    {"name": "subTypeElt$ebnf$2$subexpression$1$ebnf$1", "symbols": [{"literal":";"}], "postprocess": id},
    {"name": "subTypeElt$ebnf$2$subexpression$1$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "subTypeElt$ebnf$2$subexpression$1", "symbols": ["typeElt", "_", "subTypeElt$ebnf$2$subexpression$1$ebnf$1", "_"]},
    {"name": "subTypeElt$ebnf$2", "symbols": ["subTypeElt$ebnf$2$subexpression$1"]},
    {"name": "subTypeElt$ebnf$2$subexpression$2$ebnf$1", "symbols": [{"literal":";"}], "postprocess": id},
    {"name": "subTypeElt$ebnf$2$subexpression$2$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "subTypeElt$ebnf$2$subexpression$2", "symbols": ["typeElt", "_", "subTypeElt$ebnf$2$subexpression$2$ebnf$1", "_"]},
    {"name": "subTypeElt$ebnf$2", "symbols": ["subTypeElt$ebnf$2", "subTypeElt$ebnf$2$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "subTypeElt", "symbols": [{"literal":"[{"}, "_", "subTypeElt$ebnf$2", {"literal":"}]"}], "postprocess": instructionSetToJsonSemi},
    {"name": "typeElt", "symbols": [(lexer.has("elt") ? {type: "elt"} : elt), "_", "typeData", "_", "typeData"], "postprocess": doubleArgKeywordToJson},
    {"name": "subInstruction", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": d => ""},
    {"name": "subInstruction", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "instruction", "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": d => d[2]},
    {"name": "subInstruction$ebnf$1$subexpression$1", "symbols": ["instruction", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"]},
    {"name": "subInstruction$ebnf$1", "symbols": ["subInstruction$ebnf$1$subexpression$1"]},
    {"name": "subInstruction$ebnf$1$subexpression$2", "symbols": ["instruction", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"]},
    {"name": "subInstruction$ebnf$1", "symbols": ["subInstruction$ebnf$1", "subInstruction$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "subInstruction", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "subInstruction$ebnf$1", "instruction", "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": instructionSetToJsonNoSemi},
    {"name": "subInstruction$ebnf$2$subexpression$1", "symbols": ["instruction", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"]},
    {"name": "subInstruction$ebnf$2", "symbols": ["subInstruction$ebnf$2$subexpression$1"]},
    {"name": "subInstruction$ebnf$2$subexpression$2", "symbols": ["instruction", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"]},
    {"name": "subInstruction$ebnf$2", "symbols": ["subInstruction$ebnf$2", "subInstruction$ebnf$2$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "subInstruction", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "subInstruction$ebnf$2", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": instructionSetToJsonSemi},
    {"name": "instructions", "symbols": [(lexer.has("baseInstruction") ? {type: "baseInstruction"} : baseInstruction)]},
    {"name": "instructions", "symbols": [(lexer.has("macroCADR") ? {type: "macroCADR"} : macroCADR)]},
    {"name": "instructions", "symbols": [(lexer.has("macroDIP") ? {type: "macroDIP"} : macroDIP)]},
    {"name": "instructions", "symbols": [(lexer.has("macroDUP") ? {type: "macroDUP"} : macroDUP)]},
    {"name": "instructions", "symbols": [(lexer.has("macroSETCADR") ? {type: "macroSETCADR"} : macroSETCADR)]},
    {"name": "instructions", "symbols": [(lexer.has("macroASSERTlist") ? {type: "macroASSERTlist"} : macroASSERTlist)]},
    {"name": "instruction", "symbols": ["instructions"], "postprocess": keywordToJson},
    {"name": "instruction", "symbols": ["subInstruction"], "postprocess": id},
    {"name": "instruction$ebnf$1$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$1", "symbols": ["instruction$ebnf$1$subexpression$1"]},
    {"name": "instruction$ebnf$1$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$1", "symbols": ["instruction$ebnf$1", "instruction$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "instruction", "symbols": ["instructions", "instruction$ebnf$1", "_"], "postprocess": keywordToJson},
    {"name": "instruction", "symbols": ["instructions", "_", "subInstruction"], "postprocess": singleArgInstrKeywordToJson},
    {"name": "instruction$ebnf$2$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$2", "symbols": ["instruction$ebnf$2$subexpression$1"]},
    {"name": "instruction$ebnf$2$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$2", "symbols": ["instruction$ebnf$2", "instruction$ebnf$2$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "instruction", "symbols": ["instructions", "instruction$ebnf$2", "_", "subInstruction"], "postprocess": singleArgTypeKeywordToJson},
    {"name": "instruction", "symbols": ["instructions", "_", "type"], "postprocess": singleArgKeywordToJson},
    {"name": "instruction$ebnf$3$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$3", "symbols": ["instruction$ebnf$3$subexpression$1"]},
    {"name": "instruction$ebnf$3$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$3", "symbols": ["instruction$ebnf$3", "instruction$ebnf$3$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "instruction", "symbols": ["instructions", "instruction$ebnf$3", "_", "type"], "postprocess": singleArgTypeKeywordToJson},
    {"name": "instruction", "symbols": ["instructions", "_", "data"], "postprocess": singleArgKeywordToJson},
    {"name": "instruction$ebnf$4$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$4", "symbols": ["instruction$ebnf$4$subexpression$1"]},
    {"name": "instruction$ebnf$4$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$4", "symbols": ["instruction$ebnf$4", "instruction$ebnf$4$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "instruction", "symbols": ["instructions", "instruction$ebnf$4", "_", "data"], "postprocess": singleArgTypeKeywordToJson},
    {"name": "instruction", "symbols": ["instructions", "_", "type", "_", "type", "_", "subInstruction"], "postprocess": tripleArgKeyWordToJson},
    {"name": "instruction$ebnf$5$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$5", "symbols": ["instruction$ebnf$5$subexpression$1"]},
    {"name": "instruction$ebnf$5$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$5", "symbols": ["instruction$ebnf$5", "instruction$ebnf$5$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "instruction", "symbols": ["instructions", "instruction$ebnf$5", "_", "type", "_", "type", "_", "subInstruction"], "postprocess": tripleArgTypeKeyWordToJson},
    {"name": "instruction", "symbols": ["instructions", "_", "subInstruction", "_", "subInstruction"], "postprocess": doubleArgInstrKeywordToJson},
    {"name": "instruction$ebnf$6$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$6", "symbols": ["instruction$ebnf$6$subexpression$1"]},
    {"name": "instruction$ebnf$6$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$6", "symbols": ["instruction$ebnf$6", "instruction$ebnf$6$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "instruction", "symbols": ["instructions", "instruction$ebnf$6", "_", "subInstruction", "_", "subInstruction"], "postprocess": doubleArgTypeKeywordToJson},
    {"name": "instruction", "symbols": ["instructions", "_", "type", "_", "type"], "postprocess": doubleArgKeywordToJson},
    {"name": "instruction$ebnf$7$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$7", "symbols": ["instruction$ebnf$7$subexpression$1"]},
    {"name": "instruction$ebnf$7$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$7", "symbols": ["instruction$ebnf$7", "instruction$ebnf$7$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "instruction", "symbols": ["instructions", "instruction$ebnf$7", "_", "type", "_", "type"], "postprocess": doubleArgTypeKeywordToJson},
    {"name": "instruction", "symbols": [{"literal":"PUSH"}, "_", "type", "_", "data"], "postprocess": doubleArgKeywordToJson},
    {"name": "instruction", "symbols": [{"literal":"PUSH"}, "_", "type", "_", (lexer.has("lbrace") ? {type: "lbrace"} : lbrace), (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": pushToJson},
    {"name": "instruction$ebnf$8$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$8", "symbols": ["instruction$ebnf$8$subexpression$1"]},
    {"name": "instruction$ebnf$8$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$8", "symbols": ["instruction$ebnf$8", "instruction$ebnf$8$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "instruction", "symbols": [{"literal":"PUSH"}, "instruction$ebnf$8", "_", "type", "_", "data"], "postprocess": pushWithAnnotsToJson},
    {"name": "instruction$ebnf$9", "symbols": [/[0-9]/]},
    {"name": "instruction$ebnf$9", "symbols": ["instruction$ebnf$9", /[0-9]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "instruction", "symbols": [{"literal":"DIP"}, "_", "instruction$ebnf$9", "_", "subInstruction"], "postprocess": dipnToJson},
    {"name": "instruction$ebnf$10", "symbols": [/[0-9]/]},
    {"name": "instruction$ebnf$10", "symbols": ["instruction$ebnf$10", /[0-9]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "instruction", "symbols": [{"literal":"DUP"}, "_", "instruction$ebnf$10"], "postprocess": dupnToJson},
    {"name": "instruction", "symbols": [{"literal":"DUP"}], "postprocess": keywordToJson},
    {"name": "instruction$ebnf$11$subexpression$1", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$11", "symbols": ["instruction$ebnf$11$subexpression$1"]},
    {"name": "instruction$ebnf$11$subexpression$2", "symbols": ["_", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$11", "symbols": ["instruction$ebnf$11", "instruction$ebnf$11$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "instruction", "symbols": [{"literal":"DUP"}, "instruction$ebnf$11", "_"], "postprocess": keywordToJson},
    {"name": "instruction$ebnf$12", "symbols": [/[0-9]/]},
    {"name": "instruction$ebnf$12", "symbols": ["instruction$ebnf$12", /[0-9]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "instruction", "symbols": [{"literal":"DIG"}, "_", "instruction$ebnf$12"], "postprocess": dignToJson},
    {"name": "instruction$ebnf$13", "symbols": [/[0-9]/]},
    {"name": "instruction$ebnf$13", "symbols": ["instruction$ebnf$13", /[0-9]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "instruction", "symbols": [{"literal":"DUG"}, "_", "instruction$ebnf$13"], "postprocess": dignToJson},
    {"name": "instruction$ebnf$14", "symbols": [/[0-9]/]},
    {"name": "instruction$ebnf$14", "symbols": ["instruction$ebnf$14", /[0-9]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "instruction", "symbols": [{"literal":"DROP"}, "_", "instruction$ebnf$14"], "postprocess": dropnToJson},
    {"name": "instruction", "symbols": [{"literal":"DROP"}], "postprocess": keywordToJson},
    {"name": "instruction", "symbols": [{"literal":"CREATE_CONTRACT"}, "_", (lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "parameter", "_", "storage", "_", "code", "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": subContractToJson},
    {"name": "instruction", "symbols": [{"literal":"EMPTY_MAP"}, "_", "type", "_", "type"], "postprocess": doubleArgKeywordToJson},
    {"name": "instruction", "symbols": [{"literal":"EMPTY_MAP"}, "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "type", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen), "_", "type"], "postprocess": doubleArgParenKeywordToJson},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "_", "symbols": ["_$ebnf$1"]},
    {"name": "semicolons$ebnf$1", "symbols": [/[;]/], "postprocess": id},
    {"name": "semicolons$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "semicolons", "symbols": ["semicolons$ebnf$1"]}
  ],
  ParserStart: "main",
};

export default grammar;
