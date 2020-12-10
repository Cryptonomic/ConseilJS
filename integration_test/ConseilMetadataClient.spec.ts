// import 'mocha';
// import { expect } from 'chai';
// import fetch from 'node-fetch';

// import FetchSelector from '../src/utils/FetchSelector';
// FetchSelector.setFetch(fetch);

// import { ConseilMetadataClient } from '../src/reporting/ConseilMetadataClient'
// import { conseilServer } from './TestAssets';

// describe('ConseilJS API Wrapper for Conseil protocol v2 test suite', () => {
//     it('retrieve list of available platforms', async () => {
//         const result = await ConseilMetadataClient.getPlatforms(conseilServer);

//         expect(result.map((v) => { return v.name})).to.contain('tezos');
//     });

//     it('retrieve list of available networks given a platform: tezos', async () => {
//         const result = await ConseilMetadataClient.getNetworks(conseilServer, 'tezos');

//         expect(result[0].platform).to.equal('tezos')
//     });

//     it('retrieve list of available entities for a platform/network combination', async () => {
//         const result = await ConseilMetadataClient.getEntities(conseilServer, 'tezos', conseilServer.network);

//         expect(result.length).to.greaterThan(1);
//     });

//     it('retrieve list of available attributes for a platform/network/entity combination', async () => {
//         const result = await ConseilMetadataClient.getAttributes(conseilServer, 'tezos', conseilServer.network, 'accounts');

//         expect(result.length).to.greaterThan(1);
//     });

//     it('retrieve list of available attribute values for an entity attribute for a platform/network combination', async () => {
//         const result = await ConseilMetadataClient.getAttributeValues(conseilServer, 'tezos', conseilServer.network, 'blocks', 'period_kind');

//         expect(result.length).to.be.greaterThan(0);
//         expect(result[0]).to.oneOf(['proposal', 'testing']);
//     });
// });