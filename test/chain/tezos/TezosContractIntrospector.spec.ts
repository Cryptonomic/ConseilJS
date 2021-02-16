import { expect, use } from "chai";
import chaiAsPromised from 'chai-as-promised';
import nock from 'nock';
import fetch from 'node-fetch';
import * as log from 'loglevel';

import { registerFetch, registerLogger } from '../../../src/index';

import mochaAsync from '../../mochaTestHelper';
import * as responses from "../../_staticData/ConseilResponses.json";

import { TezosContractIntrospector } from '../../../src/chain/tezos/TezosContractIntrospector';

use(chaiAsPromised);

describe("TezosContractIntrospector test", () => {
    const serverConfig = { url: 'https://conseil.server', apiKey: 'key', network: 'mainnet' };
    
    before(mochaAsync(async () => {
        const logger = log.getLogger('conseiljs');
        logger.setLevel('error', false);
        registerLogger(logger);
        registerFetch(fetch);
    }));

    it('default/string test', mochaAsync(async () => {
        const server = nock(serverConfig.url);
        server
            .filteringRequestBody(body => '*')
            .post(`/v2/data/tezos/mainnet/accounts`)
                .reply(200, responses['KT1UvS7eBoNoP7qmGkfPtTGM7s7pYxLnkUzR-/v2/data/tezos/mainnet/accounts']);

        const result = await TezosContractIntrospector.generateEntryPointsFromAddress(serverConfig, 'mainnet', 'KT1UvS7eBoNoP7qmGkfPtTGM7s7pYxLnkUzR');

        expect(result).to.exist;
        expect(result.length).to.equal(1);
        expect(result[0].name).to.equal('default');
    }));
});
