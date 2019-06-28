import "mocha";
import { expect, use } from "chai";
import chaiAsPromised from 'chai-as-promised';
import nock from 'nock';
import { Operation, Ballot } from "../src/types/tezos/TezosChainTypes";

import { TezosNodeReader, TezosWalletUtil, TezosNodeWriter } from "../src";
import { TezosMessageUtils } from '../src/chain/tezos/TezosMessageUtil';
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

use(chaiAsPromised);

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
    sendContractInvocationOperation
} = TezosNodeWriter;

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

        it("correctly encode operations locally", () => {
            let messages: any = [];
            messages.push({
                kind: "reveal",
                source: "tz1VJAdH2HRUZWfohXW59NPYQKFMe1csroaX",
                fee: "0",
                counter: "425748",
                storage_limit: "0",
                gas_limit: "10000",
                public_key: "edpkuDuXgPVJi3YK2GKL6avAK3GyjqyvpJjG9gTY5r2y72R7Teo65i"
            } as Operation);
            messages.push({
                kind: "transaction",
                source: "tz1VJAdH2HRUZWfohXW59NPYQKFMe1csroaX",
                fee: "10000",
                counter: "9",
                storage_limit: "10001",
                gas_limit: "10002",
                amount: "10000000",
                destination: "tz2G4TwEbsdFrJmApAxJ1vdQGmADnBp95n9m"
            } as Operation);
            messages.push({
                kind: "origination",
                source: "tz1VJAdH2HRUZWfohXW59NPYQKFMe1csroaX",
                fee: "10000",
                counter: "9",
                storage_limit: "10001",
                gas_limit: "10002",
                manager_pubkey: "tz1VJAdH2HRUZWfohXW59NPYQKFMe1csroaX",
                balance: "10003",
                spendable: true,
                delegatable: true,
                delegate: "tz1VJAdH2HRUZWfohXW59NPYQKFMe1csroaX"
            } as Operation);
            messages.push({
                kind: "delegation",
                source: "tz1VJAdH2HRUZWfohXW59NPYQKFMe1csroaX",
                fee: "10000",
                counter: "9",
                storage_limit: "10001",
                gas_limit: "10002",
                delegate: 'tz3WXYtyDUNL91qfiCJtVUX746QpNv5i5ve5'
            } as Operation);

            const result = forgeOperations(blockHead, messages);

            expect(result).to.equal('560a037fdd573fcb59a49b5835658fab813b57b3a25e96710ec97aad0614c34f07000069ef8fb5d47d8a4321c94576a2316a632be8ce890094fe19904e00004c7b0501f6ea08f472b7e88791d3b8da49d64ac1e2c90f93c27e6531473305c608000069ef8fb5d47d8a4321c94576a2316a632be8ce89904e09924e914e80ade204000154f5d8f71ce18f9f05bb885a4120e64c667bc1b40009000069ef8fb5d47d8a4321c94576a2316a632be8ce89904e09924e914e0069ef8fb5d47d8a4321c94576a2316a632be8ce89934effffff0069ef8fb5d47d8a4321c94576a2316a632be8ce89000a000069ef8fb5d47d8a4321c94576a2316a632be8ce89904e09924e914eff026fde46af0356a0476dae4e4600172dc9309b3aa4');
        });

        it("correctly encode ballot locally", () => {
            const message: Ballot = {
                source: 'tz1VJAdH2HRUZWfohXW59NPYQKFMe1csroaX',
                period: 10,
                proposal: 'Pt24m4xiPbLDhVgVfABUjirbmda3yohdN82Sp9FeuAXJ4eV9otd',
                vote: 0
            };

            const result = forgeOperations(blockHead, [message]);

            expect(result).to.equal('560a037fdd573fcb59a49b5835658fab813b57b3a25e96710ec97aad0614c34f060069ef8fb5d47d8a4321c94576a2316a632be8ce890000000aab22e46e7872aa13e366e455bb4f5dbede856ab0864e1da7e122554579ee71f800');
        });

        it('signOperationGroup test ---', mochaAsync(async () => {
            const signedOpGroup = await signOperationGroup(forgedOpGroupList[0], keyStore, '');
            expect(signedOpGroup).to.be.an('object');
            expect(signedOpGroup.signature).to.exist;

            const opGroupHash = TezosMessageUtils.computeOperationHash(signedOpGroup);
            expect(opGroupHash).to.equal('opBpn8Uzt1c67jw7a3H5nDkpryDkVF1W9SmiWBHtnnofg8TL7LA');
        }));

        it('TezosNodeReader.applyOperation test ---', mochaAsync(async () => {
            const appliedOp = await TezosNodeWriter.applyOperation('http://conseil.server', blockHead, [ops], signedOpGroup);
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
            const payload = signedOpGroup;
            const injectOp = await TezosNodeWriter.injectOperation('http://conseil.server', payload);
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
            const delegator = 'KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM';
            const bakerAddress = 'tz3gN8NTLNLJg5KRsUU47NHNVHbdhcFXjjaB';
            const fee = 300000;
            const delegationResult = await sendDelegationOperation('http://conseil.server', keyStore, delegator, bakerAddress, fee, '');
            expect(delegationResult).to.exist;
            expect(delegationResult.operationGroupID).to.be.a('string');
        }));

        it('sendContractInvocationOperation', mochaAsync(async () => {
            let result = await sendContractInvocationOperation('http://conseil.server', keyStore, 'KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM', 10000, 1000, '', 1000, 1000);
            expect(result.operationGroupID).to.equal('opBpn8Uzt1c67jw7a3H5nDkpryDkVF1W9SmiWBHtnnofg8TL7LA');

            // TODO: pending full local forging
            //result = await sendContractInvocationOperation('http://conseil.server', keyStore, 'KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM', 10000, 1000, '', 1000, 1000, 'Right (Left Unit)');
            //expect(result.operationGroupID).to.equal('opBpn8Uzt1c67jw7a3H5nDkpryDkVF1W9SmiWBHtnnofg8TL7LA');
        }));
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
