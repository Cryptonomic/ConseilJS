import 'mocha';
import {expect} from 'chai';
import * as cq from '../src/utils/ConseilQuery'

describe('getConseilURL()', () => {
    it('should correctly form a Conseil URL', async () => {
        const url = cq.getConseilURL('zeronet', 'blocks/head');
        expect(url).to.equal('http://206.189.230.137:1337/tezos/zeronet/blocks/head');
    });
});

describe('getConseilURL()', () => {
    it('should correctly use custom URLs', async () => {
        const url = cq.getConseilURL('zeronet', 'world', 'hello');
        expect(url).to.equal('hello/world');
    });
});