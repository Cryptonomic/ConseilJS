import 'mocha';
import {expect} from 'chai';
import {TezosNode} from '../src'

const network = 'zeronet';

describe('getBlockHead()', () => {
    it('should correctly fetch the Tezos block head', async () => {
        const head = await TezosNode.getBlockHead(network);
        expect(head.hash.startsWith('B')).to.equal(true);
    });
});
