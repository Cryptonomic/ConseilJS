// import 'mocha';
// import { expect } from 'chai';
// import fetch from 'node-fetch';

// import * as loglevel from 'loglevel';
// import LogSelector from '../../../src/utils/LoggerSelector';
// LogSelector.setLogger(loglevel.getLogger('conseiljs'));
// LogSelector.setLevel('debug');

// import FetchSelector from '../../../src/utils/FetchSelector';
// FetchSelector.setFetch(fetch);

// import { ConseilQueryBuilder } from '../../../src/reporting/ConseilQueryBuilder';
// import { ConseilOperator, ConseilSortDirection } from '../../../src/types/conseil/QueryTypes'
// import { TezosConseilClient } from '../../../src/reporting/tezos/TezosConseilClient'
// import { OperationKindType } from '../../../src/types/tezos/TezosChainTypes';
// import { conseilServer } from '../../TestAssets';

// describe('Tezos date interface test suite', () => {
//     it('retrieve top block', async () => {
//         const result = await TezosConseilClient.getBlockHead(conseilServer, conseilServer.network);

//         expect(result['level']).to.be.greaterThan(52466, 'this may vary as the network changes');
//         expect(result['baker'].length).to.be.greaterThan(0)
//     });

//     it('retrieve a block by hash', async () => {
//         const result = await TezosConseilClient.getBlock(conseilServer, conseilServer.network, 'BKnMKWCeJwRtetQwuY5HRtbrsXPLyACFrygdwnM8jxAYcYEVkdd');

//         expect(result.length).to.equal(1);
//     });

//     it('retrieve an operation group by hash', async () => {
//         const result = await TezosConseilClient.getOperationGroup(conseilServer, conseilServer.network, 'ooH1GMyC7zHRP7SJgqnjzoxs5DshEUrYNehAQm9j5PUxMA4TdeP');

//         expect(result.length).to.equal(1);
//     });

//     //TODO: getOperationGroups

//     it('retrieve an operation group by hash', async () => {
//         let query = ConseilQueryBuilder.blankQuery();
//         query = ConseilQueryBuilder.addPredicate(query, 'operation_group_hash', ConseilOperator.EQ, ['ooH1GMyC7zHRP7SJgqnjzoxs5DshEUrYNehAQm9j5PUxMA4TdeP'], false);
//         query = ConseilQueryBuilder.setLimit(query, 10);

//         const result = await TezosConseilClient.getOperations(conseilServer, conseilServer.network, query);

//         expect(result.length).to.equal(1);
//     });

//     it('retrieve some blocks', async () => {
//         let q = ConseilQueryBuilder.blankQuery();
//         q = ConseilQueryBuilder.addPredicate(q, 'level', ConseilOperator.LT, [1000], true);
//         q = ConseilQueryBuilder.addOrdering(q, 'level', ConseilSortDirection.ASC);
//         q = ConseilQueryBuilder.setLimit(q, 10);

//         const result = await TezosConseilClient.getBlocks(conseilServer, conseilServer.network, q);

//         expect(result.length).to.equal(10);
//         expect(parseInt(result[9]['level'])).to.greaterThan(parseInt(result[1]['level']));
//         expect(result[9]['predecessor']).to.equal(result[8]['hash']);
//     });

//     it('retrieve a single an account', async () => {
//         var result = await TezosConseilClient.getAccount(conseilServer, conseilServer.network, 'tz1bwSatfnvehPG8v5razwMJ7KzJXDBRtxwk');

//         expect(result.length).to.equal(1);
//         expect(result[0]['account_id']).to.equal('tz1XErrAm8vFBzu69UU74JUSbvsmvXiQBy6e', 'this may vary as the network changes');
//     });

//     it('retrieve accounts for a manager address', async () => {
//         let accountsquery = ConseilQueryBuilder.blankQuery();
//         accountsquery = ConseilQueryBuilder.addPredicate(accountsquery, 'manager', ConseilOperator.EQ, ['tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2'], false);
//         accountsquery = ConseilQueryBuilder.addPredicate(accountsquery, 'account_id', ConseilOperator.EQ, ['tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2'], true);
//         accountsquery = ConseilQueryBuilder.addOrdering(accountsquery, 'block_level', ConseilSortDirection.DESC);
//         accountsquery = ConseilQueryBuilder.setLimit(accountsquery, 300);
//         const result = await TezosConseilClient.getAccounts(conseilServer, conseilServer.network, accountsquery);

//         expect(result.length).to.be.greaterThan(1, 'this may vary as the network changes');
//         expect(result[0]['account_id']).to.equal('KT1SJdeXcP4KkVFF13SYEDFixunJBP7Nwmum', 'this may vary as the network changes');
//     });

//     it('retrieve transactions for an account', async () => {
//         let origin = ConseilQueryBuilder.blankQuery();
//         origin = ConseilQueryBuilder.addPredicate(origin, 'kind', ConseilOperator.IN, ['transaction', 'activate_account', 'reveal', 'origination', 'delegation'], false);
//         origin = ConseilQueryBuilder.addPredicate(origin, 'source', ConseilOperator.EQ, ['tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2'], false);
//         origin = ConseilQueryBuilder.addOrdering(origin, 'block_level', ConseilSortDirection.DESC);
//         origin = ConseilQueryBuilder.setLimit(origin, 300);

//         let target = ConseilQueryBuilder.blankQuery();
//         target = ConseilQueryBuilder.addPredicate(target, 'kind', ConseilOperator.IN, ['transaction', 'activate_account', 'reveal', 'origination', 'delegation'], false);
//         target = ConseilQueryBuilder.addPredicate(target, 'destination', ConseilOperator.EQ, ['tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2'], false);
//         target = ConseilQueryBuilder.addOrdering(target, 'block_level', ConseilSortDirection.DESC);
//         target = ConseilQueryBuilder.setLimit(target, 300);

//         var result = await Promise.all([target, origin].map(q => TezosConseilClient.getOperations(conseilServer, conseilServer.network, q)))
//             .then(responses => responses.reduce((result, r) => { r.forEach(rr => result.push(rr)); return result; }));

//         expect(result.length).to.be.greaterThan(10, 'this may vary as the network changes');
//     });

//     it('calculate average fees for transaction type operations', async () => {
//         let operationFeesQuery = ConseilQueryBuilder.blankQuery();
//         operationFeesQuery = ConseilQueryBuilder.addFields(operationFeesQuery, 'fee');
//         operationFeesQuery = ConseilQueryBuilder.addPredicate(operationFeesQuery, 'kind', ConseilOperator.EQ, ['transaction'], false);
//         operationFeesQuery = ConseilQueryBuilder.addOrdering(operationFeesQuery, 'block_level', ConseilSortDirection.DESC);
//         operationFeesQuery = ConseilQueryBuilder.setLimit(operationFeesQuery, 1000);

//         const fees = await TezosConseilClient.getOperations(conseilServer, conseilServer.network, operationFeesQuery);
//         const sortedfees = fees.map(f => parseInt(f['fee'])).filter(i => !isNaN(i)).sort((a, b) => a - b);

//         const lowAverageFee = sortedfees.slice(0, 300).reduce((s, c) => s + c) / 300;
//         const mediumAverageFee = sortedfees.slice(300, 700).reduce((s, c) => s + c) / 400;
//         const highAverageFee = sortedfees.slice(700).reduce((s, c) => s + c) / 300;

//         expect(lowAverageFee).to.lessThan(mediumAverageFee + 1);
//         expect(mediumAverageFee).to.lessThan(highAverageFee + 1);
//     });

//     it('retrieve average fees for transaction type operations', async () => {
//         let operationFeesQuery = ConseilQueryBuilder.blankQuery();
//         operationFeesQuery = ConseilQueryBuilder.addFields(operationFeesQuery, 'low', 'medium', 'high');
//         operationFeesQuery = ConseilQueryBuilder.addPredicate(operationFeesQuery, 'kind', ConseilOperator.EQ, ['transaction'], false);
//         operationFeesQuery = ConseilQueryBuilder.addOrdering(operationFeesQuery, 'timestamp', ConseilSortDirection.DESC);
//         operationFeesQuery = ConseilQueryBuilder.setLimit(operationFeesQuery, 1);

//         const fees = await TezosConseilClient.getTezosEntityData(conseilServer, conseilServer.network, 'fees', operationFeesQuery);

//         expect(fees[0]['low']).to.lessThan(fees[0]['medium']);
//         expect(fees[0]['medium']).to.lessThan(fees[0]['high']);
//     });

//     it('retrieve fee statistics for transaction type operations', async () => {
//         let operationFeesQuery = ConseilQueryBuilder.blankQuery();
//         operationFeesQuery = ConseilQueryBuilder.addFields(operationFeesQuery, 'low', 'medium', 'high');
//         operationFeesQuery = ConseilQueryBuilder.addPredicate(operationFeesQuery, 'kind', ConseilOperator.EQ, ['transaction'], false);
//         operationFeesQuery = ConseilQueryBuilder.addOrdering(operationFeesQuery, 'timestamp', ConseilSortDirection.DESC);
//         operationFeesQuery = ConseilQueryBuilder.setLimit(operationFeesQuery, 1);

//         const fees = await TezosConseilClient.getFeeStatistics(conseilServer, conseilServer.network, OperationKindType.Transaction);

//         expect(fees[0]['low']).to.lessThan(fees[0]['medium']);
//         expect(fees[0]['medium']).to.lessThan(fees[0]['high']);
//     });
// });
