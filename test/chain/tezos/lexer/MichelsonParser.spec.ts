import 'mocha';
import { expect } from 'chai';

import { TezosLanguageUtil } from "../../../../src/chain/tezos/TezosLanguageUtil";
import * as fs from 'fs';
import * as path from 'path';
import glob from 'glob';

describe('Michelson/Micheline contract tests', async () => {
    const contractSampleRoot = 'test/chain/tezos/lexer/samples';
    let samples: string[] = glob.sync(`${contractSampleRoot}/**/*.michelson`);

    for (let i = 0; i < samples.length; i++) {
        const contractName = samples[i];
        const d = path.dirname(contractName);
        const t = path.basename(d, path.extname(d));
        const f = path.basename(contractName, path.extname(contractName));

        it(`Michelson/Micheline contract test: ${t}${path.sep}${f}`, () => {
            let michelson = fs.readFileSync(`${d}${path.sep}${f}.michelson`, 'utf8');
            let micheline = fs.readFileSync(`${d}${path.sep}${f}.micheline`, 'utf8');

            let michelineObject = JSON.parse(micheline)
            delete michelineObject.storage
            delete michelineObject.input
            delete michelineObject.amount
            const trimmedMicheline = JSON.stringify(michelineObject).replace(/[\n\r\t\s]/g,'');

            let parsedMicheline = `{"script":${TezosLanguageUtil.translateMichelsonToMicheline(michelson)}}`;
            parsedMicheline = parsedMicheline.replace(/[\n\r\t\s]/g,'');
            expect(parsedMicheline).to.equal(trimmedMicheline);
        });
    }
});
