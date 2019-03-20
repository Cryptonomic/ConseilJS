import 'mocha';
import { expect } from 'chai';

import * as Michelson from '../../../../src/chain/tezos/lexer/Michelson';
import * as nearley from 'nearley';
import * as request from 'request-promise';

function michelsonToMicheline(code: string): string {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(Michelson));
    parser.feed(code);
    return parser.results.join(' ');
}

describe('Michelson Micheline transpiler tests', () => {
    it('Contract test 0: src/bin_client/test/contracts/attic/add1.tz', async () => {
        const code = await request.get('https://gitlab.com/nomadic-labs/tezos/raw/master/src/bin_client/test/contracts/attic/add1.tz')
        .then(
            res => res.toString()
        ).catch(err => {
            throw new Error(`Failed to get add1.tz: ${err}`);
        });

        expect(michelsonToMicheline(code)).to.equal('blah');
    });
});
