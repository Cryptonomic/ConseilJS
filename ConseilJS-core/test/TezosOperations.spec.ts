import "mocha";
import { expect, use } from "chai";
import chaiAsPromised from 'chai-as-promised';
import nock from 'nock';

import { TezosNodeReader, TezosWalletUtil } from "../src";
import mochaAsync from '../test/mochaTestHelper';
import {
    blockHead,
    forgedOpGroupList,
    appliedOpList,
    injectOpList,
    accountMockList,
    managerKeyMockList,
    walletInfoLists
} from './TezosOperations.responses';

use(chaiAsPromised);

const { unlockFundraiserIdentity } = TezosWalletUtil;

let keyStore;
let keyStore1;
let ops;
let opIndex = 0;
const [info0, info1] = walletInfoLists;

const ktAddress = 'KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM';

describe('Tezos Operations Test', () => {
    before(mochaAsync(async () => {
        keyStore = await unlockFundraiserIdentity(info0.mnemonic.join(' '), info0.email, info0.password, info0.pkh);
        keyStore.storeType = 'Fundraiser';

        keyStore1 = await unlockFundraiserIdentity(info1.mnemonic.join(' '), info1.email, info1.password, info1.pkh);
        keyStore1.storeType = 'Fundraiser';

        const nockOb = nock('http://conseil.server');
        nockOb.persist().get(`/chains/main/blocks/head`).reply(200, blockHead);

        const accountUrl = `/chains/main/blocks//context/contracts/${keyStore.publicKeyHash}`;
        nockOb.get(accountUrl).reply(200, accountMockList[0]);

        const accountHeadUrl = `/chains/main/blocks/head/context/contracts/${keyStore.publicKeyHash}`;
        nockOb.get(accountHeadUrl).reply(200, accountMockList[0]);

        const accountUrl1 = `/chains/main/blocks/${blockHead.hash}/context/contracts/${keyStore1.publicKeyHash}`;
        nockOb.get(accountUrl1).reply(200, accountMockList[1]);

        const accountHeadUrl1 = `/chains/main/blocks/head/context/contracts/${keyStore1.publicKeyHash}`;
        nockOb.get(accountHeadUrl1).reply(200, accountMockList[1]);

        const accountDelegateUrl = `/chains/main/blocks/${blockHead.hash}/context/contracts/${ktAddress}`;
        nockOb.get(accountDelegateUrl).reply(200, accountMockList[2]);

        const accountMangerUrl = `/chains/main/blocks/${blockHead.hash}/context/contracts/${keyStore.publicKeyHash}/manager_key`;
        nockOb.get(accountMangerUrl).reply(200, managerKeyMockList[0]);
        
        const nonAccountMangerUrl = `/chains/main/blocks/${blockHead.hash}/context/contracts/${keyStore1.publicKeyHash}/manager_key`;
        nockOb.get(nonAccountMangerUrl).reply(200, managerKeyMockList[1]);

        const ktAccountMangerUrl = `/chains/main/blocks/${blockHead.hash}/context/contracts/${ktAddress}/manager_key`;
        nockOb.get(ktAccountMangerUrl).reply(200, managerKeyMockList[0]);
    }));
    describe('Some Base Operations Test', () => {
        before(async () => {
            const activation = {
                kind: 'activate_account',
                pkh: keyStore.publicKeyHash,
                secret: info0.secret
            };
            ops = [activation];
            const nockOb1 = nock('http://conseil.server');
            nockOb1
                .persist()
                .filteringRequestBody(body => '*')
                .post(`/chains/main/blocks/head/helpers/forge/operations`, '*')
                .reply(200, forgedOpGroupList[0])
                .post(`/chains/main/blocks/head/helpers/preapply/operations`, '*')
                .reply(200, appliedOpList[0])
                .post(`/injection/operation?chain=main`, '*')
                .reply(200, injectOpList[0]);
        });

        it('TezosNodeReader.getBlockHead test ---', mochaAsync(async () => {
            const block = await TezosNodeReader.getBlockHead('http://conseil.server');
            expect(block).to.be.an('object');
            expect(block.hash).to.exist;
        }));

        it('TezosNode.getAccountForBlock', mochaAsync(async () => {
            const account = await TezosNodeReader.getAccountForBlock('http://conseil.server', blockHead.hash, keyStore.publicKeyHash);
            expect(account).to.be.an('object');
        }));

        it('TezosNode.getAccountManagerForBlock', mochaAsync(async () => {
            const managerKey = await TezosNodeReader.getAccountManagerForBlock('http://conseil.server', blockHead.hash, keyStore.publicKeyHash);
            expect(managerKey).to.be.a('string');
        }));

        it('isManagerKeyRevealedForAccount should be true', mochaAsync(async () => {
            const isManagerRevealed = await TezosNodeReader.isManagerKeyRevealedForAccount('http://conseil.server', keyStore.publicKeyHash);
            expect(isManagerRevealed).to.be.true;
        }));

        it('isManagerKeyRevealedForAccount should be false', mochaAsync(async () => {
            const isManagerRevealed = await TezosNodeReader.isManagerKeyRevealedForAccount('http://conseil.server', keyStore1.publicKeyHash);
            expect(isManagerRevealed).to.be.false;
        }));

        it('isImplicitAndEmpty should be true', mochaAsync(async () => {
            const isImplicit = await TezosNodeReader.isImplicitAndEmpty('http://conseil.server', keyStore1.publicKeyHash);
            expect(isImplicit).to.be.true;
        }));

        it('isImplicitAndEmpty should be false', mochaAsync(async () => {
            const isImplicit = await TezosNodeReader.isImplicitAndEmpty('http://conseil.server', keyStore.publicKeyHash);
            expect(isImplicit).to.be.false;
        }));
    });

    describe('Main Operations Test', () => {
        beforeEach(async () => {
            const nockOb2 = nock('http://conseil.server');
            nockOb2
                .persist()
                .filteringRequestBody(body => '*')
                .post(`/chains/main/blocks/head/helpers/forge/operations`, '*')
                .reply(200, forgedOpGroupList[opIndex])
                .post(`/chains/main/blocks/head/helpers/preapply/operations`, '*')
                .reply(200, appliedOpList[opIndex])
                .post(`/injection/operation?chain=main`, '*')
                .reply(200, injectOpList[opIndex]);
            opIndex ++;
        });
    });

    describe('Errors Test', () => {
        it('test error paths', mochaAsync(async () => {
            const nockedserver = nock('http://conseil.server');
            nock.cleanAll();

            nockedserver.get(`/chains/main/blocks/head`).reply(404, blockHead);
            await expect(TezosNodeReader.getBlockHead('http://conseil.server')).to.be.rejected;
        }));
    });
});
