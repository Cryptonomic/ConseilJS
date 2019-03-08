import 'mocha';
import {expect} from 'chai';
import nock from 'nock';

import fetch from 'node-fetch';
import FetchSelector from '../src/utils/FetchSelector';
FetchSelector.setFetch(fetch);

import {ConseilMetadataClient} from '../src/reporting/ConseilMetadataClient'

import mochaAsync from '../test/mochaTestHelper';

import {
    platformsResponse, networksResponse, entityResponse, blockAttributeResponse
} from './ConseilMetadataClient.responses';

describe('ConseilJS API Wrapper for Conseil protocol v2 test suite', () => {
    it('retrieve list of available platforms', mochaAsync(async () => {
        const nockedserver = nock('http://conseil.server');
        nockedserver.get('/v2/metadata/platforms').reply(200, platformsResponse);

        const result = await ConseilMetadataClient.getPlatforms({ url: 'http://conseil.server', apiKey: 'c0ffee' });

        expect(result.map((v) => { return v.name})).to.contain('tezos');
    }));

    it('retrieve list of available networks given a platform: tezos', mochaAsync(async () => {
        const nockedserver = nock('http://conseil.server');
        nockedserver.get('/v2/metadata/tezos/networks').reply(200, networksResponse);

        const result = await ConseilMetadataClient.getNetworks({ url: 'http://conseil.server', apiKey: 'c0ffee' }, 'tezos');

        expect(result[0].platform).to.equal('tezos')
    }));

    it('retrieve list of available entities for a platform/network combination', mochaAsync(async () => {
        const nockedserver = nock('http://conseil.server');
        nockedserver.get('/v2/metadata/tezos/alphanet/entities').reply(200, entityResponse);

        const result = await ConseilMetadataClient.getEntities({ url: 'http://conseil.server', apiKey: 'c0ffee' }, 'tezos', 'alphanet');

        expect(result.length).to.greaterThan(1);
    }));

    it('retrieve list of available attributes for a platform/network/entity combination', mochaAsync(async () => {
        const nockedserver = nock('http://conseil.server');
        nockedserver.get('/v2/metadata/tezos/alphanet/blocks/attributes').reply(200, blockAttributeResponse);

        const result = await ConseilMetadataClient.getAttributes({ url: 'http://conseil.server', apiKey: 'c0ffee' }, 'tezos', 'alphanet', 'blocks');

        expect(result.length).to.greaterThan(1);
    }));
});