import 'mocha';
import {expect} from 'chai';
import * as nq from '../src/utils/NautilusQuery'

describe('getTezosNodeURL()', () => {
    it('should correctly form a Tezos node URL', async () => {
        const url = nq.getTezosNodeURL('zeronet', '');
        expect(url).to.equal('http://159.89.186.115:8732//');
    });
});

describe('getTezosNodeURL()', () => {
    it('should correctly use custom URLs', async () => {
        const url = nq.getTezosNodeURL('zeronet', '', 'hello');
        expect(url).to.equal('hello/');
    });
});
