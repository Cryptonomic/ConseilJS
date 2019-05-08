import 'mocha';
import {expect} from 'chai';
import fetch from 'node-fetch';

import FetchSelector from '../src/utils/FetchSelector';
FetchSelector.setFetch(fetch);

import {ConseilMetadataClient} from '../src/reporting/ConseilMetadataClient'
import {servers} from "./servers";

const ConseilV2URL = servers.conseilServer;
const ConseilV2APIKey = servers.conseilApiKey;

describe('ConseilJS API Wrapper for Conseil protocol v2 test suite', () => {
    it('retrieve list of available platforms', async () => {
        const result = await ConseilMetadataClient.getPlatforms({url: ConseilV2URL, apiKey: ConseilV2APIKey});

        expect(result.map((v) => { return v.name})).to.contain('tezos');
    });

    it('retrieve list of available networks given a platform: tezos', async () => {
        const result = await ConseilMetadataClient.getNetworks({url: ConseilV2URL, apiKey: ConseilV2APIKey}, 'tezos');

        expect(result[0].platform).to.equal('tezos')
    });

    it('retrieve list of available entities for a platform/network combination', async () => {
        const result = await ConseilMetadataClient.getEntities({url: ConseilV2URL, apiKey: ConseilV2APIKey}, 'tezos', 'alphanet');

        expect(result.length).to.greaterThan(1);
    });

    it('retrieve list of available attributes for a platform/network/entity combination', async () => {
        const result = await ConseilMetadataClient.getAttributes({url: ConseilV2URL, apiKey: ConseilV2APIKey}, 'tezos', 'alphanet', 'accounts');

        expect(result.length).to.greaterThan(1);
    });

    it('retrieve list of available attribute values for an entity attribute for a platform/network combination', async () => {
        const result = await ConseilMetadataClient.getAttributeValues({url: ConseilV2URL, apiKey: ConseilV2APIKey}, 'tezos', 'alphanet', 'accounts', 'spendable');

        expect(result.length).to.equal(2);
        expect(result[0]).to.oneOf(['f', 't']);
    });
});
