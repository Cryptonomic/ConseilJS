import 'mocha';
import {expect} from 'chai';
import {ConseilMetadataClient} from '../../src/utils/v2/ConseilMetadataClient'

//https://conseil-dev.cryptonomic-infra.tech:443
//https://tezos-dev.cryptonomic-infra.tech:443/chains/main/blocks/head
const ConseilV2URL = "https://conseil-dev.cryptonomic-infra.tech:443";
const ConseilV2APIKey = "hooman";

describe('ConseilJS API Wrapper for Conseil protocol v2', () => {
    it('retrieve list of available platforms', async () => {
        const result = await ConseilMetadataClient.getPlatforms(ConseilV2URL, ConseilV2APIKey);

        expect(result.map((v, i) => { return v.name})).to.contain('tezos');
    });

    it('retrieve list of available networks given a platform: tezos', async () => {
        const result = await ConseilMetadataClient.getNetworks(ConseilV2URL, ConseilV2APIKey, "tezos");

        expect(result[0].platform).to.equal('tezos')
    });

    it('retrieve list of available entities for a platform/network combination', async () => {
        const result = await ConseilMetadataClient.getEntities(ConseilV2URL, ConseilV2APIKey, "tezos", "alphanet");

        expect(result.length).to.greaterThan(1);
    });

    it('retrieve list of available attributes for a platform/network/entity combination', async () => {
        const result = await ConseilMetadataClient.getAttributes(ConseilV2URL, ConseilV2APIKey, "tezos", "alphanet", "accounts");

        expect(result.length).to.greaterThan(1);
    });

    it('retrieve list of available attribute values for an entity attribute for a platform/network combination', async () => {
        const result = await ConseilMetadataClient.getAttributeValues(ConseilV2URL, ConseilV2APIKey, "tezos", "alphanet", "accounts", "spendable");

        expect(result.length).to.equal(2);
        expect(result[0]).to.oneOf(['f', 't']);
    });
});
