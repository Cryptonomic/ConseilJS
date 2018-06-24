import 'mocha';
import {expect} from 'chai';
import {TezosConseilQuery} from '../src'

const network = 'zeronet';

describe('Block fetchers', () => {
    it('should correctly fetch blocks', async () => {
        const head = await TezosConseilQuery.getBlockHead(network);
        expect(head.hash.startsWith('B')).to.equal(true);
        const aBlock = await TezosConseilQuery.getBlock(network, head.hash);
        expect(aBlock.block.hash).to.equal(head.hash);
    });
});

describe('Operation fetchers', () => {
    it('should correctly fetch operations', async () => {
        const emptyFilter = TezosConseilQuery.getEmptyTezosFilter();
        const opFilter = {...emptyFilter, limit: 10, operation_kind: ['transaction']};
        const ops = await TezosConseilQuery.getOperations(network, opFilter);
        expect(ops.length).to.equal(10);
        const opGroup = await TezosConseilQuery.getOperationGroup(network, ops[0].operationGroupHash);
        expect(opGroup.operation_group.hash).to.equal(ops[0].operationGroupHash);
        const opGroupsFilter = {...emptyFilter, limit: 10, operation_id: [opGroup.operation_group.hash]};
        const opGroups = await TezosConseilQuery.getOperationGroups(network, opGroupsFilter);
        expect(opGroups.length).to.equal(1)
    });
});

describe('Account fetchers', () => {
    it('should correctly fetch accounts', async () => {
        const emptyFilter = TezosConseilQuery.getEmptyTezosFilter();
        const accountsFilter = {...emptyFilter, limit: 10};
        const accounts = await TezosConseilQuery.getAccounts(network, accountsFilter);
        expect(accounts.length).to.equal(10);
        const account = await TezosConseilQuery.getAccount(network, accounts[0].accountId);
        expect(account.account.accountId).to.equal(accounts[0].accountId)
    });
});

describe('Transaction fetchers', () => {
    it('should correctly fetch operations', async () => {
        const emptyFilter = TezosConseilQuery.getEmptyTezosFilter();
        const opFilter = {...emptyFilter, limit: 10, operation_kind: ['transaction']};
        const ops = await TezosConseilQuery.getOperations(network, opFilter);
        expect(ops.length).to.equal(10);
        const account = ops[0].source;
        const transFilter = {...emptyFilter, limit: 10, operation_participant: [account], operation_kind: ['transaction']};
        const transactions = await TezosConseilQuery.getOperations(network, transFilter);
        expect(transactions[0].source == account || transactions[0].destination == account).to.equal(true)
    });
});
