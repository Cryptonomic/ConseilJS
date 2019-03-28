const util =  require('../src/chain/tezos/TezosLanguageUtil')

const script_one = `
parameter unit;
storage string;
code {DROP; 
      PUSH string "Hello Tezos!"; 
      NIL operation; PAIR;};
`

console.log(util.translateMichelsonToMicheline(script_one))

