import 'mocha';
import { expect } from 'chai';

import * as Michelson from '../src/utils/grammars/lexedMichelson';
import * as nearley from 'nearley';
import {michelsonParsingUtil} from "../src/chain/tezos/michelsonParsingUtil"

describe('Parse a contract', () => {
    it('simple contract', () => {
        const result = michelsonParsingUtil.michelsonScriptToJson(`parameter key_hash;
        storage unit;
        code { CAR; DEFAULT_ACCOUNT; 
               DIP{UNIT};             
               PUSH tez "1.00";      
               UNIT;                
               TRANSFER_TOKENS;      
               PAIR; };    
        `);
        expect(result).to.equal([ { prim: 'parameter', args: [ { prim: 'key_hash' } ] },
        { prim: 'storage', args: [ { prim: 'unit' } ] },
        { prim: 'code',
          args:
           [ { prim: 'CAR' },
             { prim: 'DEFAULT_ACCOUNT' },
             { prim: 'DIP', args: [ { prim: 'UNIT' } ] },
             { prim: 'PUSH', args: [ { prim: 'tez' }, { string: '1.00' } ] },
             { prim: 'UNIT' },
             { prim: 'TRANSFER_TOKENS' },
             { prim: 'PAIR' } ] } ]);
    });
});

describe('Parse storage', () => {
    it('storage is hello', () => {
        const result = michelsonParsingUtil.storageToJson("\"hello\"");
        expect(result).to.equal({ string: 'hello' });
    });
});
