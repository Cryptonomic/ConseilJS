import 'mocha';
import {expect} from 'chai';
import * as tq from '../src/tezos/TezosQuery'

describe('getBlockHead()', () => {
    it('should fetch the block head', async () => {
        const result = await tq.getBlockHead('zeronet');
        expect(result).to.have.any.keys("hash");
        const result2 = await tq.getBlock('zeronet', result.hash);
        expect(result2.block).to.have.any.keys("hash");
    });
});

