import 'mocha';
import { expect } from 'chai';

import { TezosLanguageUtil } from "../../../../src/chain/tezos/TezosLanguageUtil";
import * as fs from 'fs';
import * as path from 'path';

describe('Michelson/Micheline official contract tests', async () => {
    const contractSampleRoot = 'test/chain/tezos/lexer/samples';
    const p = new Promise<string[]>((resolve, reject) => {
        fs.readdir(contractSampleRoot, function(err, items) {
            if (!!err) { reject(err); return; }
            resolve([... new Set(items.map(f => path.basename(f, path.extname(f))))]);
        });
    });
    const samples = await p;

    for (let i = 0; i < samples.length; i++) {
        const contractName = samples[i];
        if(!fs.existsSync(`${contractSampleRoot}/${contractName}.michelson`)) { continue; }
        it(`Michelson/Micheline contract test: ${contractName}`, () => {
            /*let michelson = fs.readFileSync(`${contractSampleRoot}/${contractName}.michelson`, 'utf8');
            let micheline = fs.readFileSync(`${contractSampleRoot}/${contractName}.micheline`, 'utf8');
            micheline = micheline.replace(/\n/g, ' ')
                .replace(/ +/g, ' ')
                .replace(/\[{/g, '[ {')
                .replace(/}\]/g, '} ]')
                .replace(/},{/g, '}, {')
                .replace(/\]}/g, '] }');

            let parsedMicheline = TezosLanguageUtil.translateMichelsonToMicheline(michelson);
            expect(parsedMicheline).to.equal(micheline);*/
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
 