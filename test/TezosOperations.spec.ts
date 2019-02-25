import "mocha";
import { expect } from "chai";
import nock from 'nock';

import { TezosNodeReader, TezosWalletUtil, TezosNodeWriter } from "../src";
import mochaAsync from '../test/mochaTestHelper';
import {
    blockHead,
    forgedOpGroupList,
    appliedOpList,
    signedOpGroup,
    injectOpList,
    accountMockList,
    managerKeyMockList,
    walletInfoLists
} from './TezosOperations.responses';

const { unlockFundraiserIdentity } = TezosWalletUtil;
const {
    signOperationGroup,
    forgeOperations,
    applyOperation,
    injectOperation,
    sendIdentityActivationOperation,
    sendKeyRevealOperation,
    sendTransactionOperation,
    sendAccountOriginationOperation,
    sendDelegationOperation,
    isManagerKeyRevealedForAccount,
    isImplicitAndEmpty
} = TezosNodeWriter;

let keyStore;
let keyStore1;
let ops;
let opIndex = 0;
const [info0, info1] = walletInfoLists;

const ktAddress = 'KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM';

describe('Tezos Operations Test', () => {
    before(async () => {
        keyStore = await unlockFundraiserIdentity(info0.seed, info0.email, info0.password, info0.pkh);
        keyStore.storeType = 'Fundraiser';

        keyStore1 = await unlockFundraiserIdentity(info1.seed, info1.email, info1.password, info1.pkh);
        keyStore1.storeType = 'Fundraiser';
        const nockOb = nock('http://conseil.server');
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

        it('TezosNodeReader.forgeOperation test ---', mochaAsync(async () => {
            const payload = { branch: blockHead.hash, contents: ops };
            const forgeOp = await TezosNodeReader.forgeOperation('http://conseil.server', payload);
            expect(forgeOp).to.be.a('string');
        }));

        it('forgeOperations test ----', mochaAsync(async () => {
            const forgedOperationGroup = await forgeOperations('http://conseil.server', blockHead, ops);
            expect(forgedOperationGroup).to.be.a('string');
        }));

        it('signOperationGroup test ---', mochaAsync(async () => {
            const signedOpGroup = await signOperationGroup(forgedOpGroupList[0], keyStore, '');
            expect(signedOpGroup).to.be.an('object');
            expect(signedOpGroup.signature).to.exist;
        }));

        it('TezosNodeReader.applyOperation test ---', mochaAsync(async () => {
            const payload = [{
                protocol: blockHead.protocol,
                branch: blockHead.hash,
                contents: ops,
                signature: signedOpGroup.signature
            }];
            const appliedOp = await TezosNodeReader.applyOperation('http://conseil.server', payload);
            expect(appliedOp).to.be.an('array');
            expect(appliedOp[0]).to.be.an('object');
            expect(appliedOp[0].contents).to.be.an('array');
        }));

        it('applyOperation test ---', mochaAsync(async () => {
            const appliedOp = await applyOperation('http://conseil.server', blockHead, ops, signedOpGroup);
            expect(appliedOp).to.be.an('array');
            expect(appliedOp[0]).to.be.an('object');
            expect(appliedOp[0].contents).to.be.an('array');
        }));

        it('TezosNode.injectOperation test ---', mochaAsync(async () => {
            const payload = signedOpGroup.bytes.toString('hex');
            const injectOp = await TezosNodeReader.injectOperation('http://conseil.server', payload);
            expect(injectOp).to.be.a('string');
        }));

        it('injectOperation test ---', mochaAsync(async () => {
            const injectOp = await injectOperation('http://conseil.server', signedOpGroup);
            expect(injectOp).to.exist;
        }));

        it('TezosNode.getAccountForBlock', mochaAsync(async () => {
            const account = await TezosNodeReader.getAccountForBlock('http://conseil.server', blockHead.hash, keyStore.publicKeyHash);
            expect(account).to.be.an('object');
            expect(account.manager).to.be.a('string');
        }));

        it('TezosNode.getAccountManagerForBlock', mochaAsync(async () => {
            const managerKey = await TezosNodeReader.getAccountManagerForBlock('http://conseil.server', blockHead.hash, keyStore.publicKeyHash);
            expect(managerKey).to.be.an('object');
            expect(managerKey.manager).to.be.a('string');
        }));

        it('isManagerKeyRevealedForAccount should be true', mochaAsync(async () => {
            const isManagerRevealed = await isManagerKeyRevealedForAccount('http://conseil.server', keyStore);
            expect(isManagerRevealed).to.be.true;
        }));

        it('isManagerKeyRevealedForAccount should be false', mochaAsync(async () => {
            const isManagerRevealed = await isManagerKeyRevealedForAccount('http://conseil.server', keyStore1);
            expect(isManagerRevealed).to.be.false;
        }));

        it('isImplicitAndEmpty should be true', mochaAsync(async () => {
            const isImplicit = await isImplicitAndEmpty('http://conseil.server', keyStore1.publicKeyHash);
            expect(isImplicit).to.be.true;
        }));
        
        it('isImplicitAndEmpty should be false', mochaAsync(async () => {
            const isImplicit = await isImplicitAndEmpty('http://conseil.server', keyStore.publicKeyHash);
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
        it('sendIdentityActivationOperation', mochaAsync(async () => {
            const activeResult = await sendIdentityActivationOperation('http://conseil.server',keyStore, info0.secret, '');
            expect(activeResult).to.exist;
            expect(activeResult.operationGroupID).to.be.a('string');
        }));

        it('sendKeyRevealOperation', mochaAsync(async () => {
            const revealResult = await sendKeyRevealOperation(
                'http://conseil.server',
                keyStore,
                0,
                ''
            );
            expect(revealResult).to.exist;
            expect(revealResult.operationGroupID).to.be.a('string');
        }));

        it('sendTransactionOperation', mochaAsync(async () => {
            const toAddress = 'tz1fX6A2miVXjNyReg2dpt2TsXLkZ4w7zRGa';
            const amount = 10000000;
            const fee = 100000;
            const sendResult = await sendTransactionOperation(
                'http://conseil.server',
                keyStore,
                toAddress,
                amount,
                fee,
                ''
            );
            expect(sendResult).to.exist;
            expect(sendResult.operationGroupID).to.be.a('string');
        }));

        it('sendOriginationOperation', mochaAsync(async () => {
            const bakerAddress = 'tz1db53osfzRqqgQeLtBt4kcFcQoXJwPJJ5G';
            const amount = 10000000;
            const fee = 100000;
            const originationResult = await sendAccountOriginationOperation(
                'http://conseil.server',
                keyStore,
                amount,
                bakerAddress,
                true,
                true, 
                fee, 
                ''
            );
            expect(originationResult).to.exist;
            expect(originationResult.operationGroupID).to.be.a('string');
        }));

        it('sendDelegationOperation', mochaAsync(async () => {
            keyStore.publicKeyHash = 'KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM';
            const bakerAddress = 'tz3gN8NTLNLJg5KRsUU47NHNVHbdhcFXjjaB';
            const fee = 300000;
            const delegationResult = await sendDelegationOperation(
                'http://conseil.server',
                keyStore,
                bakerAddress,
                fee, 
                ''
            );
            expect(delegationResult).to.exist;
            expect(delegationResult.operationGroupID).to.be.a('string');
        }));
    });
});
