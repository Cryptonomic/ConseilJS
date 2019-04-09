import 'mocha';
import { expect } from 'chai';

import { TezosLanguageUtil } from "../../../../src/chain/tezos/TezosLanguageUtil";
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'url';

describe('Michelson/Micheline official contract tests', async () => {
    const contractSampleRoot = 'test/chain/tezos/lexer/samples';
    const p = new Promise<string[]>((resolve, reject) => {
        fs.readdir(contractSampleRoot, function(err, items) {
            if (!!err) { reject(err); return; }
            resolve([... new Set(items.map(f => path.basename(f, path.extname(f))))]);
        });
    });
    const samples = await p;

    //samples.length (let i = 0; i < samples.length; i++) (let i = 2; i < 3; i++)
    for (let i = 0; i < samples.length; i++) {
        const contractName = samples[i];
        if(!fs.existsSync(`${contractSampleRoot}/${contractName}.michelson`)) { continue; }
          it(`Michelson/Micheline contract test: ${contractName}`, () => {
            let michelson = fs.readFileSync(`${contractSampleRoot}/${contractName}.michelson`, 'utf8');
            let micheline = fs.readFileSync(`${contractSampleRoot}/${contractName}.micheline`, 'utf8');
            
            let michelineObject = JSON.parse(micheline)
            delete michelineObject.storage
            delete michelineObject.input
            delete michelineObject.amount
            let trimmedMicheline = JSON.stringify(michelineObject)

            trimmedMicheline = trimmedMicheline.replace(/[\n\r\t\s]/g,'');

            /*trimmedMicheline = trimmedMicheline.replace(/\n/g, ' ')
                .replace(/ +/g, ' ')
                .replace(/\[{/g, '[ {')
                .replace(/}\]/g, '} ]')
                .replace(/},{/g, '}, {')
                .replace(/\]}/g, '] }');*/

            //let parsedMicheline = TezosLanguageUtil.translateMichelsonToMicheline(michelson);
            //parsedMicheline = parsedMicheline.replace(/[\n\r\t\s]/g,'');
            //expect(parsedMicheline).to.equal(trimmedMicheline);
        });
    }
});

describe('Michelson/Micheline transpiler tests', () => {
    it('Simple contract test', () => {
        //const result = TezosLanguageUtil.translateMichelsonToMicheline('parameter string;storage string;code {CAR; NIL operation; PAIR;};');
        //const known = '{ "script": [ { "prim": "parameter", "args": [ { "prim": "string" } ] }, { "prim": "storage", "args": [ { "prim": "string" } ] }, { "prim": "code", "args": [ [ { "prim": "CAR" }, { "prim": "NIL", "args": [ { "prim": "operation" } ] }, { "prim": "PAIR" } ] ] } ] }';

        //expect(result).to.equal(known);
    });
});
 