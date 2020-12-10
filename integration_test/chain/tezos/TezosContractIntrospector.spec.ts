// import 'mocha';
// import { expect } from 'chai';
// import fetch from 'node-fetch';

// import * as loglevel from 'loglevel';
// import LogSelector from '../../../src/utils/LoggerSelector';
// LogSelector.setLogger(loglevel.getLogger('conseiljs'));

// import FetchSelector from '../../../src/utils/FetchSelector';
// FetchSelector.setFetch(fetch);

// import { TezosContractIntrospector } from '../../../src/chain/tezos/TezosContractIntrospector';
// import { TezosLanguageUtil } from '../../../src/chain/tezos/TezosLanguageUtil'
// import { EntryPoint } from '../../../src/types/tezos/ContractIntrospectionTypes';
// import { ConseilQueryBuilder } from '../../../src/reporting/ConseilQueryBuilder';
// import { ConseilOperator, ConseilFunction, ConseilSortDirection } from '../../../src/types/conseil/QueryTypes';
// import { ConseilDataClient } from '../../../src/reporting/ConseilDataClient';
// import { conseilServer } from '../../TestAssets';

// describe('TezosContractIntrospector integration test suite', () => {
//     it('Process on-chain contracts', async () => {
//         const cap = 500;
//         let contractQuery = ConseilQueryBuilder.blankQuery();
//         contractQuery = ConseilQueryBuilder.addFields(contractQuery, 'account_id', 'script');
//         contractQuery = ConseilQueryBuilder.addPredicate(contractQuery, 'account_id', ConseilOperator.STARTSWITH, ['KT1']);
//         contractQuery = ConseilQueryBuilder.addPredicate(contractQuery, 'script', ConseilOperator.ISNULL, [], true);
//         contractQuery = ConseilQueryBuilder.addAggregationFunction(contractQuery, 'account_id', ConseilFunction.count);
//         contractQuery = ConseilQueryBuilder.addOrdering(contractQuery, 'count_account_id', ConseilSortDirection.DESC);
//         contractQuery = ConseilQueryBuilder.setLimit(contractQuery, cap);

//         const contractList = await ConseilDataClient.executeEntityQuery(conseilServer, 'tezos', conseilServer.network, 'accounts', contractQuery);

//         const total = contractList.length;
//         let skipped = 0;
//         contractList.forEach(r => {
//             if (r['script'].startsWith('Unparsable code:')) { skipped++; return; } // accounting for invalid Conseil results

//             try {
//                 let p = TezosContractIntrospector.generateEntryPointsFromCode(r['script']);
//                 console.log(`processed ${TezosLanguageUtil.preProcessMichelsonScript(r['script'])[0]}`);
//                 if (p.length === 0) { 
//                     console.log('no entry points found');
//                 } else {
//                     console.log(`entry point${p.length === 1 ? '' : 's' }:`);
//                     p.forEach(e => { console.log(`  ${formatEntryPoint(e)}`); });
//                 }
//             } catch (error) {
//                 console.log(`error ${error}\n----\n${r['script']}\n----\n`);
//             }
//         });

//         console.log(`found ${total} contracts${skipped ? ', skipped ' + skipped : ''}${cap === total ? ', more may be available' : ''}`);
//     });
// });

// function formatEntryPoint(entryPoint: EntryPoint){
//     let f = entryPoint.name ? `${entryPoint.name}: ` : '' ;

//     let args = entryPoint.structure;
//     for (let i = 0 ; i < entryPoint.parameters.length; i++) {
//         let param = entryPoint.parameters[i];
//         args = args.replace('$PARAM', `${param.type}${param.name ? ' %' + param.name : ''}`);
//     }

//     return f + args;
// }