import 'mocha';
import {expect} from 'chai';
import {TezosConseilQuery} from '../src/tezos/TezosConseilQuery'

describe('getBlockHead()', () => {
    it('should fetch the block head', async () => {
        const result = await TezosConseilQuery.getBlockHead('zeronet');
        expect(result).to.have.any.keys("hash");
        const result2 = await TezosConseilQuery.getBlock('zeronet', result.hash);
        expect(result2.block).to.have.any.keys("hash");
    });
});

