import 'mocha';
import {expect} from 'chai';
import * as ledgerUtils from '../src/utils/LedgerUtils';

describe('getTezosPublicKey()', () => {
    it('should correctly fetch the root key', async () => {
        const result = await ledgerUtils.getTezosPublicKey("44'/1729'/0'/0'/0'");

        expect(result).to.be.a('string')
    });
});

describe('signTezosOperation()', () => {
    it('should correctly sign an operation', async () => {
        const result = await ledgerUtils.signTezosOperation(
            "44'/1729'/0'/0'/0'",
            '0342397c7a82e1f7509513642e573020aeb0aea36ac087139085e42d480cd08520070000d2e495a7ab40156d0a7c35b73d2530a3470fc8700002000000cda3081bd81219ec494b29068dcfd19e427fed9a66abcdc9e9e99ca6478f60e9080000d2e495a7ab40156d0a7c35b73d2530a3470fc870d0860303c80100c0ba99060000e7670f32038107a59a2b9cfefae36ea21f5aa63c00');

        expect(result).to.be.a('Uint8Array')
    });
});


