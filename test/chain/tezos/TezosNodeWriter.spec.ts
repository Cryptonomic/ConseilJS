import "mocha";
import { expect, use } from "chai";
import chaiAsPromised from 'chai-as-promised';
import nock from 'nock';
import { StackableOperation, Ballot, Transaction, Reveal, Origination, Delegation } from "../../../src/types/tezos/TezosP2PMessageTypes";

import { TezosWalletUtil, TezosNodeWriter, TezosParameterFormat } from "../../../src/";
import mochaAsync from '../../../test/mochaTestHelper';
import {
    blockHead,
    forgedOpGroupList,
    appliedOpList,
    signedOpGroup,
    injectOpList,
    accountMockList,
    managerKeyMockList,
    walletInfoLists
} from '../../TezosOperations.responses';

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

        nockOb.get(`/chains/main/blocks/${blockHead.hash}/context/contracts/${keyStore.publicKeyHash}`).reply(200, accountMockList[0]);
        nockOb.get(`/chains/main/blocks/${blockHead.hash}/context/contracts/${keyStore1.publicKeyHash}`).reply(200, accountMockList[1]);
        nockOb.get(`/chains/main/blocks/${blockHead.hash}/context/contracts/${ktAddress}`).reply(200, accountMockList[2]);
        nockOb.get(`/chains/main/blocks/${blockHead.hash}/context/contracts/${keyStore.publicKeyHash}/manager_key`).reply(200, managerKeyMockList[0]);
        nockOb.get(`/chains/main/blocks/${blockHead.hash}/context/contracts/${keyStore1.publicKeyHash}/manager_key`).reply(200, managerKeyMockList[1]);
        nockOb.get(`/chains/main/blocks/${blockHead.hash}/context/contracts/${ktAddress}/manager_key`).reply(200, managerKeyMockList[0]);
        nockOb.get(`/chains/main/blocks/head/context/contracts/${keyStore.publicKeyHash}/counter`).reply(200, "10");
        nockOb.get(`/chains/main/blocks/head/context/contracts/${ktAddress}/counter`).reply(200, "11");
    }));

    describe('Test Tezos node interactions', () => {
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

        it("correctly encode operations locally", () => {
            let messages: StackableOperation[] = [];
            messages.push({
                kind: "reveal",
                source: "tz1VJAdH2HRUZWfohXW59NPYQKFMe1csroaX",
                fee: "0",
                counter: "425748",
                storage_limit: "0",
                gas_limit: "10000",
                public_key: "edpkuDuXgPVJi3YK2GKL6avAK3GyjqyvpJjG9gTY5r2y72R7Teo65i"
            } as Reveal);
            messages.push({
                kind: "transaction",
                source: "tz1VJAdH2HRUZWfohXW59NPYQKFMe1csroaX",
                fee: "10000",
                counter: "9",
                storage_limit: "10001",
                gas_limit: "10002",
                amount: "10000000",
                destination: "tz2G4TwEbsdFrJmApAxJ1vdQGmADnBp95n9m"
            } as Transaction);
            messages.push({
                kind: "origination",
                source: "tz1VJAdH2HRUZWfohXW59NPYQKFMe1csroaX",
                fee: "10000",
                counter: "9",
                storage_limit: "10001",
                gas_limit: "10002",
                balance: "10003",
                delegate: "tz1VJAdH2HRUZWfohXW59NPYQKFMe1csroaX",
                script: {
                    code: [ { "prim": "parameter", "args": [ { "prim": "string" } ] }, { "prim": "storage", "args": [ { "prim":"string" } ] }, { "prim": "code", "args": [ [ { "prim":"CAR" }, { "prim":"NIL", "args":[ { "prim":"operation" } ] }, { "prim":"PAIR" } ] ] } ],
                    storage: { "string": "Sample" }
                }
            } as Origination);
            messages.push({
                kind: "delegation",
                source: "tz1VJAdH2HRUZWfohXW59NPYQKFMe1csroaX",
                fee: "10000",
                counter: "9",
                storage_limit: "10001",
                gas_limit: "10002",
                delegate: 'tz3WXYtyDUNL91qfiCJtVUX746QpNv5i5ve5'
            } as Delegation);

            const result = TezosNodeWriter.forgeOperations(blockHead.hash, messages);

            expect(result).to.equal('560a037fdd573fcb59a49b5835658fab813b57b3a25e96710ec97aad0614c34f6b0069ef8fb5d47d8a4321c94576a2316a632be8ce890094fe19904e00004c7b0501f6ea08f472b7e88791d3b8da49d64ac1e2c90f93c27e6531473305c66c0069ef8fb5d47d8a4321c94576a2316a632be8ce89904e09924e914e80ade204000154f5d8f71ce18f9f05bb885a4120e64c667bc1b4006d0069ef8fb5d47d8a4321c94576a2316a632be8ce89904e09924e914e934eff0069ef8fb5d47d8a4321c94576a2316a632be8ce890000001c02000000170500036805010368050202000000080316053d036d03420000000b010000000653616d706c656e0069ef8fb5d47d8a4321c94576a2316a632be8ce89904e09924e914eff026fde46af0356a0476dae4e4600172dc9309b3aa4');
        });

        it("correctly encode ballot locally", () => {
            const message: Ballot = {
                kind: 'ballot',
                source: 'tz1VJAdH2HRUZWfohXW59NPYQKFMe1csroaX',
                period: 10,
                proposal: 'Pt24m4xiPbLDhVgVfABUjirbmda3yohdN82Sp9FeuAXJ4eV9otd',
                vote: 0
            };

            const result = TezosNodeWriter.forgeOperations(blockHead.hash, [message]);

            expect(result).to.equal('560a037fdd573fcb59a49b5835658fab813b57b3a25e96710ec97aad0614c34f060069ef8fb5d47d8a4321c94576a2316a632be8ce890000000aab22e46e7872aa13e366e455bb4f5dbede856ab0864e1da7e122554579ee71f800');
        });

        it('signOperationGroup test ---', mochaAsync(async () => {
            const signedOpGroup = await TezosNodeWriter.signOperationGroup(forgedOpGroupList[0], keyStore, '');
            expect(signedOpGroup).to.be.an('object');
            expect(signedOpGroup.signature).to.exist;
        }));

        it('TezosNodeReader.applyOperation test ---', mochaAsync(async () => {
            const appliedOp = await TezosNodeWriter.applyOperation('http://conseil.server', blockHead.hash, blockHead.protocol, [ops], signedOpGroup);
            expect(appliedOp).to.be.an('array');
            expect(appliedOp[0]).to.be.an('object');
            expect(appliedOp[0].contents).to.be.an('array');
        }));

        it('applyOperation test ---', mochaAsync(async () => {
            const appliedOp = await TezosNodeWriter.applyOperation('http://conseil.server', blockHead.hash, blockHead.protocol, ops, signedOpGroup);
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
            const injectOp = await TezosNodeWriter.injectOperation('http://conseil.server', signedOpGroup);
            expect(injectOp).to.exist;
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
            const activeResult = await TezosNodeWriter.sendIdentityActivationOperation('http://conseil.server',keyStore, info0.secret, '');
            expect(activeResult).to.exist;
            expect(activeResult.operationGroupID).to.be.a('string');
        }));

        it('sendKeyRevealOperation', mochaAsync(async () => {
            const revealResult = await TezosNodeWriter.sendKeyRevealOperation(
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
            const sendResult = await TezosNodeWriter.sendTransactionOperation(
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

        it('sendDelegationOperation', mochaAsync(async () => {
            const delegator = 'KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM';
            const bakerAddress = 'tz3gN8NTLNLJg5KRsUU47NHNVHbdhcFXjjaB';
            const fee = 300000;
            const delegationResult = await TezosNodeWriter.sendDelegationOperation('http://conseil.server', keyStore, delegator, bakerAddress, fee, '');
            expect(delegationResult).to.exist;
            expect(delegationResult.operationGroupID).to.be.a('string');
        }));

        it('Ping contract', mochaAsync(async () => {
            let result = await TezosNodeWriter.sendContractInvocationOperation('http://conseil.server', keyStore, 'KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM', 10000, 1000, '', 1000, 1000, undefined, undefined);
            expect(result.operationGroupID).to.equal('opBpn8Uzt1c67jw7a3H5nDkpryDkVF1W9SmiWBHtnnofg8TL7LA');
        }));

        it('Invoke contract', mochaAsync(async () => {
            let result = await TezosNodeWriter.sendContractInvocationOperation('http://conseil.server', keyStore, 'KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM', 10000, 1000, '', 1000, 1000, 'SomeEntryPoint', 'Right (Left Unit)', TezosParameterFormat.Michelson);
            expect(result.operationGroupID).to.equal('opBpn8Uzt1c67jw7a3H5nDkpryDkVF1W9SmiWBHtnnofg8TL7LA');
        }));
    });
});
