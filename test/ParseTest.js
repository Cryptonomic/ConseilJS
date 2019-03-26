const util =  require('../src/chain/tezos/lexer/Michelson')

const script_one = `
parameter unit;
storage string;
code {DROP; 
      PUSH string "Hello Tezos!"; 
      NIL operation; PAIR;};
`

const storage_one = "\"world\""

console.log(util.michelsonScriptToJson(script_one))
console.log(util.storageToJson(storage_test_one))

