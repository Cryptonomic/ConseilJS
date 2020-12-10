import 'mocha';
import { expect } from 'chai';
import fetch from 'node-fetch';

import * as loglevel from 'loglevel';
import LogSelector from '../../../src/utils/LoggerSelector';
LogSelector.setLogger(loglevel.getLogger('conseiljs'));

import FetchSelector from '../../../src/utils/FetchSelector';
FetchSelector.setFetch(fetch);

import { TezosNodeReader } from '../../../src/chain/tezos/TezosNodeReader';
// import { tezosServer, keys } from '../../TestAssets';

const tezosServer = "https://rpctest.tzbeta.net"

describe('TezosNodeReader integration test suite', () => {
    // it('Get chain head', async () => {
    //     const result = await TezosNodeReader.getBlockHead(tezosServer);

    //     expect(result['header']['level']).to.be.greaterThan(1);
    // });

    // it('Get account counter', async () => {
    //     const result = await TezosNodeReader.getCounterForAccount(tezosServer, keys.publicKeyHash);

    //     expect(result).to.be.greaterThan(1);
    // });

    // it('Get account reveal status', async () => {
    //     const result = await TezosNodeReader.isManagerKeyRevealedForAccount(tezosServer, keys.publicKeyHash);

    //     expect(result).to.be.true;
    // });

    // it('Get account manager key', async () => {
    //     const result = await TezosNodeReader.getAccountManagerForBlock(tezosServer, 'head', keys.publicKeyHash);

    //     expect(result).to.be.equal(keys.publicKey);
    // });

    // it('Get account info', async () => {
    //     const result = await TezosNodeReader.getAccountForBlock(tezosServer, 'head', keys.publicKeyHash);

    //     expect(parseInt(result.balance, 10)).to.be.greaterThan(10000);
    // });

    // it('Get account spendable balance', async () => {
    //     const result = await TezosNodeReader.getSpendableBalanceForAccount(tezosServer, keys.publicKeyHash);

    //     expect(result).to.be.greaterThan(10000);
    // });

    // it('Get account funding burn flag', async () => {
    //     const result = await TezosNodeReader.isImplicitAndEmpty(tezosServer, keys.publicKeyHash);

    //     expect(result).to.be.false;
    // });

    // it('Get head', async () => {
    //     const result = await TezosNodeReader.getBlock(tezosServer);

    //     expect(result.header.level).to.be.greaterThan(1);
    // });

    it('Gets delegate for a delegated implicit account', async () => {
        const result = await TezosNodeReader.getBaker(tezosServer, "tz1PnUd6R31MnjEE8VhfZhZdbGc1hrWQvjnK");
        expect(result).to.not.be.undefined
    });

    it('Gets delegate for a delegated smart contract', async () => {
        const result = await TezosNodeReader.getBaker(tezosServer, "KT1DRJPyaDTgeXrM2cgQdp5siNF8PP5RLS7T");
        expect(result).to.not.be.undefined
    });

    it('Gets delegate for a baker as itself', async () => {
        const baker = "tz1Na5QB98cDA3BC1SQU4w3iiWGVGktU14LE"
        const result = await TezosNodeReader.getBaker(tezosServer, baker);
        expect(result).to.be.equal(baker)
    });

    it('Returns undefined for undelegated implicit account', async () => {
        const result = await TezosNodeReader.getBaker(tezosServer, "tz1fzHtv2UqtXzFUBHuBPh2xXVv5Pv5MTh5Z");
        expect(result).to.be.undefined
    });

    it('Returns undefined for undelegated smart contract', async () => {
        const result = await TezosNodeReader.getBaker(tezosServer, "KT1BipUDR93YFCJjVpghzVFS8N45Lkgigfqs");
        expect(result).to.be.undefined
    });
});
