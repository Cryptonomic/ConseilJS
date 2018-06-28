import 'mocha';
import {expect} from 'chai';
import {TezosNode} from '../src'

// Point this unit test to a Tezos node to get it working!
const tezosURL = '{Insert Conseil Server URL here}';

describe('getBlockHead()', () => {
    it('should correctly fetch the Tezos block head', async () => {
        const head = await TezosNode.getBlockHead(tezosURL);
        expect(head.hash.startsWith('B')).to.equal(true);
    });
});
