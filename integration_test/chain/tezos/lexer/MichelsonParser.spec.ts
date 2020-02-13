import 'mocha';
import { expect } from 'chai';

import * as Michelson from '../../../../src/chain/tezos/lexer/Michelson';
import * as nearley from 'nearley';
import * as request from 'request-promise';

function michelsonToMicheline(code: string): string {
    const processedCode = code.trim().split('\n').map(l => l.replace(/\#[\s\S]+$/, '').trim()).join(' ');

    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(Michelson.default));
    parser.feed(processedCode);
    return parser.results.join(' ');
}

const baseURL = 'https://gitlab.com/tezos/tezos/tree/master/src/bin_client/test/contracts/attic';
const officialContractSamples = ['accounts.tz', 'add1.tz', 'add1_list.tz'];
const michelineTranslations = {'accounts.tz': '', 'add1.tz': '', 'add1_list.tz': ''};

/*describe('Michelson/Micheline transpiler tests', () => {
    for (let i = 0; i < officialContractSamples.length; i++) {
        const contractName = officialContractSamples[i];
        it(`Contract test: ${contractName}`, async () => {
            const code = await request.get(`${baseURL}/${contractName}`)
            .then(res => res.toString())
            .catch(err => { throw new Error(`Failed to get ${contractName}: ${err}`); });

            expect(michelsonToMicheline(code)).to.equal(michelineTranslations[contractName]);
        });
    }
});*/
