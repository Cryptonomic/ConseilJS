import 'mocha';
import { expect } from 'chai';
import fetch from 'node-fetch';

import * as loglevel from 'loglevel';
import LogSelector from '../../../src/utils/LoggerSelector';
LogSelector.setLogger(loglevel.getLogger('conseiljs'));

import FetchSelector from '../../../src/utils/FetchSelector';
FetchSelector.setFetch(fetch);

import { TezosNodeReader } from '../../../src/chain/tezos/TezosNodeReader';
import { tezosServer, conseilServer, faucetAccount, keys, transferAddress, bakerAddress, contractAddress } from '../../TestAssets.zeronet';

describe('TezosNodeReader integration test suite', () => {
    it('Get chain head', async () => {
        const result = await TezosNodeReader.getBlockHead(tezosServer);

        expect(result['header']['level']).to.be.greaterThan(1);
    });

    it('Get account counter', async () => {
        const result = await TezosNodeReader.getCounterForAccount(tezosServer, keys.publicKeyHash);

        expect(result).to.be.greaterThan(1);
    });

    it('Get account reveal status', async () => {
        const result = await TezosNodeReader.isManagerKeyRevealedForAccount(tezosServer, keys.publicKeyHash);

        expect(result).to.be.true;
    });

    it('Get account manager key', async () => {
        const result = await TezosNodeReader.getAccountManagerForBlock(tezosServer, 'head', keys.publicKeyHash);

        expect(result).to.be.equal(keys.publicKey);
    });

    it('Get account info', async () => {
        const result = await TezosNodeReader.getAccountForBlock(tezosServer, 'head', keys.publicKeyHash);

        expect(parseInt(result.balance, 10)).to.be.greaterThan(10000);
    });

    it('Get account spendable balance', async () => {
        const result = await TezosNodeReader.getSpendableBalanceForAccount(tezosServer, keys.publicKeyHash);

        expect(result).to.be.greaterThan(10000);
    });

    it('Get account funding burn flag', async () => {
        const result = await TezosNodeReader.isImplicitAndEmpty(tezosServer, keys.publicKeyHash);

        expect(result).to.be.false;
    });

    it('Get head', async () => {
        const result = await TezosNodeReader.getBlock(tezosServer);

        expect(result.header.level).to.be.greaterThan(1);
    });
});
