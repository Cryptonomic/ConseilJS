import 'mocha';
import { expect } from 'chai';

import * as Michelson from '../../../../src/chain/tezos/lexer/Michelson';
import * as nearley from 'nearley';
import * as fs from 'fs';
import * as path from 'path';


function michelsonToMicheline(code: string): string {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(Michelson));
    parser.feed(preProcessMichelson(code));
    return postProcessMicheline(parser.results.join(' '));
}

function preProcessMichelson(code: string): string {
    return code.trim().split('\n').map(l => l.replace(/\#[\s\S]+$/, '').trim()).join(' ');
  }

function postProcessMicheline(code: string): string {
    return code.replace(/\[{/g, '[ {').replace(/}\]/g, '} ]').replace(/},{/g, '}, {').replace(/\]}/g, '] }');
}

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
        it(`Contract test: ${contractName}`, async () => {
            let michelson = fs.readFileSync(`${contractSampleRoot}/${contractName}.michelson`, 'utf8');
            let micheline = fs.readFileSync(`${contractSampleRoot}/${contractName}.micheline`, 'utf8');

            let parsedMicheline = michelsonToMicheline(michelson);
            expect(parsedMicheline).to.equal(micheline);
        });
    }
});

describe('Michelson/Micheline transpiler tests', () => {
    it('Simple contract test', () => {
        const result = michelsonToMicheline('parameter string;storage string;code {CAR; NIL operation; PAIR;};');
        const known = '[ { "prim": "parameter", "args": [ { "prim": "string" } ] }, { "prim": "storage", "args": [ { "prim": "string" } ] }, { "prim": "code", "args": [ [ { "prim": "CAR" }, { "prim": "NIL", "args": [ { "prim": "operation" } ] }, { "prim": "PAIR" } ] ] } ]';

        expect(result).to.equal(known);
    });
});
 