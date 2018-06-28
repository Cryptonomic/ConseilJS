import 'mocha';
import {expect} from 'chai';
import {TezosConseilQuery} from '../src'

// Point this unit test to a Conseil server to get it working!
// Information about Conseil may be found at https://github.com/Cryptonomic/Conseil.
const conseilURL = '{Insert Conseil Server URL here}';
const conseilApiKey = '{Insert Conseil API key here}';

describe('Block fetchers', () => {
    it('should correctly fetch blocks', async () => {
        const head = await TezosConseilQuery.getBlockHead(conseilURL, conseilApiKey);
        expect(head.hash.startsWith('B')).to.equal(true);
        const aBlock = await TezosConseilQuery.getBlock(conseilURL, conseilApiKey, head.hash);
        expect(aBlock.block.hash).to.equal(head.hash);
    });
});

describe('Operation fetchers', () => {
    it('should correctly fetch operations', async () => {
        const emptyFilter = TezosConseilQuery.getEmptyTezosFilter();
        const opFilter = {...emptyFilter, limit: 10, operation_kind: ['transaction']};
        const ops = await TezosConseilQuery.getOperations(conseilURL, opFilter, conseilApiKey);
        expect(ops.length).to.equal(10);
        const opGroup = await TezosConseilQuery.getOperationGroup(conseilURL, ops[0].operationGroupHash, conseilApiKey);
        expect(opGroup.operation_group.hash).to.equal(ops[0].operationGroupHash);
        const opGroupsFilter = {...emptyFilter, limit: 10, operation_id: [opGroup.operation_group.hash]};
        const opGroups = await TezosConseilQuery.getOperationGroups(conseilURL, opGroupsFilter, conseilApiKey);
        expect(opGroups.length).to.equal(1)
    });
});

describe('Account fetchers', () => {
    it('should correctly fetch accounts', async () => {
        const emptyFilter = TezosConseilQuery.getEmptyTezosFilter();
        const accountsFilter = {...emptyFilter, limit: 10};
        const accounts = await TezosConseilQuery.getAccounts(conseilURL, accountsFilter, conseilApiKey);
        expect(accounts.length).to.equal(10);
        const account = await TezosConseilQuery.getAccount(conseilURL, accounts[0].accountId, conseilApiKey);
        expect(account.account.accountId).to.equal(accounts[0].accountId)
    });
});

describe('Transaction fetchers', () => {
    it('should correctly fetch operations', async () => {
        const emptyFilter = TezosConseilQuery.getEmptyTezosFilter();
        const opFilter = {...emptyFilter, limit: 10, operation_kind: ['transaction']};
        const ops = await TezosConseilQuery.getOperations(conseilURL, opFilter, conseilApiKey);
        expect(ops.length).to.equal(10);
        const account = ops[0].source;
        const transFilter = {...emptyFilter, limit: 10, operation_participant: [account], operation_kind: ['transaction']};
        const transactions = await TezosConseilQuery.getOperations(conseilURL, transFilter, conseilApiKey);
        expect(transactions[0].source == account || transactions[0].destination == account).to.equal(true)
    });
});
