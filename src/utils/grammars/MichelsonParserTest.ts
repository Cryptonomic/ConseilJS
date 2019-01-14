const nearley = require("nearley");
const grammar = require("./michelson.js");
const util = require('util');

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

const script_one = "{ CAR; NIL operation; PAIR;}"
const storage_one = "world"
//Note: DIP{ DIP{DUP}, SWAP} IS VALID MICHELSON, BUT DIP{DIP{DUP;}, SWAP;} WILL PARSE EASIER
const script_two = "{ CDR; DUP; NIL operation; DIP{ DIP{DUP;}; SWAP;}; SWAP; DIP{DIP{DIP{DROP;};};}; AMOUNT; NONE mutez; SENDER; SOME; PAIR; LEFT (or mutez (or (pair (option address) (option mutez)) address)); RIGHT (option address); TRANSFER_TOKENS; CONS; PAIR; }"
const storage_two = "(contract (or (option address) (or (pair (option address) (option mutez)) (or mutez (or (pair (option address) (option mutez)) address)))))" //fix
const script_three = "{ DUP ; DIP { CDR; } ; CAR ; DIP { DUP; } ; SWAP ; DUP ; CAR ; SWAP ; DROP ; DIP { DROP ;} ; PUSH nat 1 ;  DIP { DIP { DUP ;} ; SWAP; } ; SWAP ;  DIP { DIP { DIP { DROP ;} } } ;  CDR ;  ADD ;  SWAP ;  PAIR ;  NIL operation ;  PAIR ;} }"
const storage_three = "(pair string nat)"
parser.feed(script_one)

console.log(util.inspect(parser.results, false, null, true));