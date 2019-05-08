import {expect} from "chai";
import {TezosWalletUtil, TezosLedgerWallet} from "../src";
import {HardwareDeviceType} from "../src/types/wallet/HardwareDeviceType";

import {TezosNodeWriter} from "../src";

import {
    blockHead,
    forgedOpGroupList,
    appliedOpList,
    injectOpList,
    accountMockList,
    managerKeyMockList,
    walletInfoLists
} from './TezosOperations.responses';
import mochaAsync from './mochaTestHelper';

const nock = require('nock');
const { unlockFundraiserIdentity } = TezosWalletUtil;
const {
    sendKeyRevealOperation,
    sendTransactionOperation,
    sendAccountOriginationOperation,
    sendDelegationOperation,
} = TezosNodeWriter;

const tezosURL = 'http://conseil.server';
const derivationPathIndex = 0;
const derivationPath = `44'/1729'/0'/0'/` + derivationPathIndex + `'`;

const ktAddress = 'KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM';

let keyStore;
let keyStore1;

let opIndex = 0;
let testCondition = true;

describe('Ledger Test', () => {
    before(async () => {
        keyStore = await TezosLedgerWallet.unlockAddress(HardwareDeviceType.LedgerNanoS, derivationPath).catch(() => false);

        if (!keyStore) { testCondition = false; }
        const info1 = walletInfoLists[1];

        keyStore1 = await unlockFundraiserIdentity(info1.mnemonic.join(' '), info1.email, info1.password, info1.pkh);
        keyStore1.storeType = 'Fundraiser';
        const nockOb = nock(tezosURL);
        nockOb
            .persist()
            .get(`/chains/main/blocks/head`)
            .reply(200, blockHead);

        const accountUrl = `/chains/main/blocks/${blockHead.hash}/context/contracts/${keyStore.publicKeyHash}`;
        nockOb
            .get(accountUrl)
            .reply(200, accountMockList[0]);

        const accountUrl1 = `/chains/main/blocks/${blockHead.hash}/context/contracts/${keyStore1.publicKeyHash}`;
        nockOb
            .get(accountUrl1)
            .reply(200, accountMockList[1]);
        const accountDelegateUrl = `/chains/main/blocks/${blockHead.hash}/context/contracts/${ktAddress}`;
        nockOb
            .get(accountDelegateUrl)
            .reply(200, accountMockList[2]);

        const accountMangerUrl = `/chains/main/blocks/${blockHead.hash}/context/contracts/${keyStore.publicKeyHash}/manager_key`;
        nockOb
            .get(accountMangerUrl)
            .reply(200, managerKeyMockList[0]);
        const nonAccountMangerUrl = `/chains/main/blocks/${blockHead.hash}/context/contracts/${keyStore1.publicKeyHash}/manager_key`;
        nockOb
            .get(nonAccountMangerUrl)
            .reply(200, managerKeyMockList[1]);
        const ktAccountMangerUrl = `/chains/main/blocks/${blockHead.hash}/context/contracts/${ktAddress}/manager_key`;
        nockOb
            .get(ktAccountMangerUrl)
            .reply(200, managerKeyMockList[0]);

    });

    beforeEach(async function () {
        const nockOb2 = nock(tezosURL);
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

        if (!testCondition) {
            this.skip();
        }
    });
    
    it('sendKeyRevealOperation', mochaAsync(async () => {
        const revealResult = await sendKeyRevealOperation(tezosURL, keyStore, 0, derivationPath);
        expect(revealResult).to.exist;
        expect(revealResult.operationGroupID).to.be.a('string');
    }));

    it('sendTransactionOperation', mochaAsync(async () => {
        const toAddress = 'tz1fX6A2miVXjNyReg2dpt2TsXLkZ4w7zRGa';
        const amount = 10000000;
        const fee = 100000;
        const sendResult = await sendTransactionOperation(tezosURL, keyStore, toAddress, amount, fee, derivationPath);

        expect(sendResult).to.exist;
        expect(sendResult.operationGroupID).to.be.a('string');
    }));

    it('sendOriginationOperation', mochaAsync(async () => {
        const bakerAddress = 'tz1db53osfzRqqgQeLtBt4kcFcQoXJwPJJ5G';
        const amount = 10000000;
        const fee = 100000;
        const originationResult = await sendAccountOriginationOperation(tezosURL, keyStore, amount, bakerAddress, true, true, fee, derivationPath);
        expect(originationResult).to.exist;
        expect(originationResult.operationGroupID).to.be.a('string');
    }));

    it('sendDelegationOperation', mochaAsync(async () => {
        keyStore.publicKeyHash = 'KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM';
        const bakerAddress = 'tz3gN8NTLNLJg5KRsUU47NHNVHbdhcFXjjaB';
        const fee = 300000;
        const delegationResult = await sendDelegationOperation(tezosURL, keyStore, bakerAddress, fee, derivationPath);

        expect(delegationResult).to.exist;
        expect(delegationResult.operationGroupID).to.be.a('string');
    }));
});
