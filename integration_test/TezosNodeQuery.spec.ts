import 'mocha';
import {expect} from 'chai';
import {TezosNode} from '../src'
import {servers} from "../test/servers";

const tezosURL = servers.tezosServer;

describe('getBlockHead()', () => {
    it('should correctly fetch the Tezos block head', async () => {
        const head = await TezosNode.getBlockHead(tezosURL);
        expect(head.hash.startsWith('B')).to.equal(true);
    });
});
