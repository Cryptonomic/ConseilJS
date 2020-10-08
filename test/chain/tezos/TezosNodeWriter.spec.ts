import { expect, use } from "chai";
import chaiAsPromised from 'chai-as-promised';
import nock from 'nock';
import fetch from 'node-fetch';
import * as log from 'loglevel';

import { registerFetch, registerLogger } from '../../../src/index';
import { KeyStoreUtils, SoftSigner } from 'conseiljs-softsigner';

import mochaAsync from '../../mochaTestHelper';
import { accounts, contracts, drips } from "../../_staticData/accounts.json";
import * as responses from "../../_staticData/TezosResponses.json";

import { TezosNodeWriter } from "../../../src/chain/tezos/TezosNodeWriter";
import { TezosMessageUtils } from "../../../src/chain/tezos/TezosMessageUtil";
import { KeyStore, Signer } from "../../../src/types/ExternalInterfaces";

use(chaiAsPromised);

describe('TezosNodeWriter tests', () => {
    const serverUrl = 'https://tezos.node';

    let keyStore: KeyStore;
    let signer: Signer;
    let faucetKeyStore: KeyStore;
    let faucetSigner: Signer;

    before(mochaAsync(async () => {
        const logger = log.getLogger('conseiljs');
        logger.setLevel('error', false);
        registerLogger(logger);
        registerFetch(fetch);

        keyStore = await KeyStoreUtils.restoreIdentityFromSecretKey(accounts[0].secretKey);
        signer = await SoftSigner.createSigner(TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'), 0);

        faucetKeyStore = await KeyStoreUtils.restoreIdentityFromFundraiser(drips[0].mnemonic.join(' '), drips[0].email, drips[0].password, drips[0].pkh);
        faucetSigner = await SoftSigner.createSigner(TezosMessageUtils.writeKeyWithHint(faucetKeyStore.secretKey, 'edsk'), 10);
    }));

    it('forgeOperationsRemotely test', mochaAsync(async () => {
        const server = nock(serverUrl);
        server
            .filteringRequestBody(body => '*')
            .post(`/chains/main/blocks/head/helpers/forge/operations`)
                .reply(200, responses[`${accounts[0].publicKeyHash}-forgeOperationsRemotely-success`])

        const transaction = {
            kind: 'transaction',
            source: accounts[0].publicKeyHash,
            fee: '1490',
            counter: '1000',
            gas_limit: '10000',
            storage_limit: '300',
            amount: '1000',
            destination: accounts[1].publicKeyHash,
        }

        const sendResult = await TezosNodeWriter.forgeOperationsRemotely(serverUrl, responses['sendTransactionOperation-blocks/head'].hash, [transaction]);
        expect(sendResult).to.exist;
        expect(sendResult).to.be.a('string');
    }));

    it('sendOperation test', mochaAsync(async () => { }));

    it('queueOperation test', mochaAsync(async () => { }));

    it('getQueueStatus test', mochaAsync(async () => { }));

    it('appendRevealOperation test', mochaAsync(async () => { }));

    it('sendTransactionOperation test', mochaAsync(async () => {
        const server = nock(serverUrl);
        server
            .get(`/chains/main/blocks/head`)
                .reply(200, responses['sendTransactionOperation-blocks/head']);
        server
            .get(`/chains/main/blocks/head/context/contracts/${accounts[0].publicKeyHash}/counter`)
                .reply(200, responses[`chains/main/blocks/head/context/contracts/${accounts[0].publicKeyHash}/counter`])
            .get(`/chains/main/blocks/head/context/contracts/${accounts[0].publicKeyHash}/manager_key`)
                .reply(200, responses[`chains/main/blocks/head/context/contracts/${accounts[0].publicKeyHash}/manager_key`])
            .filteringRequestBody(body => '*')
            .post(`/chains/main/blocks/head/helpers/preapply/operations`)
                .reply(200, responses[`${keyStore.publicKeyHash}-sendTransactionOperation-preapply-success`])
            .post(`/injection/operation?chain=main`)
                .reply(200, responses[`${keyStore.publicKeyHash}-sendTransactionOperation-injection-success`]);

        const destination = 'tz1fX6A2miVXjNyReg2dpt2TsXLkZ4w7zRGa';
        const amount = 1_000;
        const fee = 100_000;

        const sendResult = await TezosNodeWriter.sendTransactionOperation(serverUrl, signer, keyStore, destination, amount, fee);

        expect(sendResult).to.exist;
        expect(sendResult.operationGroupID).to.equal('"onjsJjd5jK6yA3V3g4bQ1UVdeLzBePaVmNybG4yzhePeXyFhPLB"');
    }));

    it('sendTransactionOperation test with Reveal', mochaAsync(async () => {
        const server = nock(serverUrl);
        server
            .get(`/chains/main/blocks/head`)
                .reply(200, responses['sendIdentityActivationOperation-blocks/head'])
            .get(`/chains/main/blocks/head/context/contracts/${faucetKeyStore.publicKeyHash}/counter`)
                .reply(200, responses[`chains/main/blocks/head/context/contracts/${faucetKeyStore.publicKeyHash}/counter`])
            .get(`/chains/main/blocks/head/context/contracts/${faucetKeyStore.publicKeyHash}/manager_key`)
                .reply(200, responses[`chains/main/blocks/head/context/contracts/${faucetKeyStore.publicKeyHash}/manager_key`])
            .filteringRequestBody(body => '*')
            .post(`/chains/main/blocks/head/helpers/preapply/operations`)
                .reply(200, responses[`${faucetKeyStore.publicKeyHash}-sendTransactionOperation-preapply-success`])
            .post(`/injection/operation?chain=main`)
                .reply(200, responses[`${faucetKeyStore.publicKeyHash}-sendTransactionOperation-injection-success`]);

        const destination = accounts[0].publicKeyHash;
        const amount = 1_000;
        const fee = 100_000;

        const sendResult = await TezosNodeWriter.sendTransactionOperation(serverUrl, faucetSigner, faucetKeyStore, destination, amount, fee);

        expect(sendResult).to.exist;
        expect(sendResult.operationGroupID).to.equal('"onot1enXXuvjebJSnp1zAfvpAefmaHidw7U6FEDvUXrP63w6QBc"');
    }));

    it('sendDelegationOperation test', mochaAsync(async () => { }));

    it('sendUndelegationOperation test', mochaAsync(async () => { }));

    it('sendContractOriginationOperation test', mochaAsync(async () => { }));

    it('sendContractInvocationOperation test', mochaAsync(async () => { }));

    it('sendContractPing test', mochaAsync(async () => { }));

    it('sendKeyRevealOperation test', mochaAsync(async () => { }));

    it('sendIdentityActivationOperation test', mochaAsync(async () => {
        const server = nock(serverUrl);
        server
            .get(`/chains/main/blocks/head`)
                .reply(200, responses['sendIdentityActivationOperation-blocks/head'])
            .filteringRequestBody(body => '*')
            .post(`/chains/main/blocks/head/helpers/preapply/operations`)
                .reply(200, responses[`${faucetKeyStore.publicKeyHash}-sendIdentityActivationOperation-preapply-success`])
            .post(`/injection/operation?chain=main`)
                .reply(200, responses[`${faucetKeyStore.publicKeyHash}-sendIdentityActivationOperation-injection-success`]);
                

        const sendResult = await TezosNodeWriter.sendIdentityActivationOperation(serverUrl, faucetSigner, faucetKeyStore, drips[0].secret);

        expect(sendResult).to.exist;
        expect(sendResult.operationGroupID).to.equal('"ooZ5Yc4bzUK76eXh4h5SBAMtMTBXhrHwVQe6McwfJsfrtXbnsPr"');
    }));

    it('parseRPCError test', () => {
        const samples = [{
            in: `[{"contents":[{"kind":"transaction","source":"tz1WMknckDL3NPWN1CCiBv2E9YyC7yiUFufU","fee":"100000","counter":"2005175","gas_limit":"605000","storage_limit":"10000","amount":"0","destination":"KT1FVXpwQnoL4VVk9gxn26VTLz2Aa8zmvAdd","parameters":{"entrypoint":"default","value":{"prim":"Left","args":[{"prim":"Left","args":[{"prim":"Pair","args":[{"int":"311"},{"int":"5"}]}]}]}},"metadata":{"balance_updates":[{"kind":"contract","contract":"tz1WMknckDL3NPWN1CCiBv2E9YyC7yiUFufU","change":"-100000"},{"kind":"freezer","category":"fees","delegate":"tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU","cycle":323,"change":"100000"}],"operation_result":{"status":"backtracked","storage":{"prim":"Pair","args":[{"prim":"Pair","args":[{"prim":"Pair","args":[{"bytes":"0000270c03cf07a0b7d13d71ab280a515ac50b9c8aed"},{"int":"10035000"}]},{"prim":"Pair","args":[[{"prim":"Elt","args":[{"int":"5"},[{"prim":"Elt","args":[{"int":"311"},{"prim":"Pair","args":[{"int":"42849"},[{"bytes":"0000d199a62d3f8468fcc7ad7ab0252d598aecdd74a3"},{"bytes":"00000f0685dd791047c90cc924e12854e903e015ebdd"},{"bytes":"0000759573840c5d74223d8fe9b32fab50edfaf56489"},{"bytes":"0000ed68ed5fa89ffedff2f7271947fb26ea813f0fcc"},{"bytes":"00005c84f0255dc2929a7e6094ad8b1385cc703b334d"},{"bytes":"0000a64fca8426532428e99239e267b7f09f48bfefeb"},{"bytes":"00001de3fdd151392bab8583b89bca12d18cac2dd818"}]]}]},{"prim":"Elt","args":[{"int":"317"},{"prim":"Pair","args":[{"int":"85401"},[{"bytes":"00005c84f0255dc2929a7e6094ad8b1385cc703b334d"}]]}]}]]},{"prim":"Elt","args":[{"int":"10"},[]]},{"prim":"Elt","args":[{"int":"15"},[]]}],[{"prim":"Elt","args":[{"int":"5"},{"int":"5000000"}]},{"prim":"Elt","args":[{"int":"10"},{"int":"3000000"}]},{"prim":"Elt","args":[{"int":"15"},{"int":"1000000"}]}]]}]},{"prim":"Pair","args":[{"prim":"Pair","args":[{"int":"317"},{"int":"175000"}]},{"prim":"Pair","args":[{"int":"1"},[{"prim":"Elt","args":[{"int":"5"},{"int":"50"}]},{"prim":"Elt","args":[{"int":"10"},{"int":"75"}]},{"prim":"Elt","args":[{"int":"15"},{"int":"100"}]}]]}]}]},"consumed_gas":"186565","storage_size":"4614"},"internal_operation_results":[{"kind":"transaction","source":"KT1FVXpwQnoL4VVk9gxn26VTLz2Aa8zmvAdd","nonce":0,"amount":"5000000","destination":"tz1ekHywVUsQJ9wznM6wQPpSv8233MYj8dXV","result":{"status":"backtracked","balance_updates":[{"kind":"contract","contract":"KT1FVXpwQnoL4VVk9gxn26VTLz2Aa8zmvAdd","change":"-5000000"},{"kind":"contract","contract":"tz1ekHywVUsQJ9wznM6wQPpSv8233MYj8dXV","change":"5000000"}],"consumed_gas":"10207"}},{"kind":"transaction","source":"KT1FVXpwQnoL4VVk9gxn26VTLz2Aa8zmvAdd","nonce":1,"amount":"5157500","destination":"tz1M1UeDWKDHazBEjN2gHWxKKmgbEkjXaBAv","result":{"status":"backtracked","balance_updates":[{"kind":"contract","contract":"KT1FVXpwQnoL4VVk9gxn26VTLz2Aa8zmvAdd","change":"-5157500"},{"kind":"contract","contract":"tz1M1UeDWKDHazBEjN2gHWxKKmgbEkjXaBAv","change":"5157500"}],"consumed_gas":"10207"}},{"kind":"transaction","source":"KT1FVXpwQnoL4VVk9gxn26VTLz2Aa8zmvAdd","nonce":2,"amount":"5000000","destination":"tz1WMknckDL3NPWN1CCiBv2E9YyC7yiUFufU","result":{"status":"failed","errors":[{"kind":"temporary","id":"proto.006-PsCARTHA.contract.balance_too_low","contract":"KT1FVXpwQnoL4VVk9gxn26VTLz2Aa8zmvAdd","balance":"4685001","amount":"5000000"}]}},{"kind":"transaction","source":"KT1FVXpwQnoL4VVk9gxn26VTLz2Aa8zmvAdd","nonce":3,"amount":"5000000","destination":"tz1hHLY4AzGXrqzapnA3JYurGrPb5d3RnG7M","result":{"status":"skipped"}},{"kind":"transaction","source":"KT1FVXpwQnoL4VVk9gxn26VTLz2Aa8zmvAdd","nonce":4,"amount":"5000000","destination":"tz1U5E7U225tYk5uuNDpQpcQ2e4hCmekBadh","result":{"status":"skipped"}},{"kind":"transaction","source":"KT1FVXpwQnoL4VVk9gxn26VTLz2Aa8zmvAdd","nonce":5,"amount":"5000000","destination":"tz1aoQSwjDU4pxSwT5AsBiK5Xk15FWgBJoYr","result":{"status":"skipped"}},{"kind":"transaction","source":"KT1FVXpwQnoL4VVk9gxn26VTLz2Aa8zmvAdd","nonce":6,"amount":"5000000","destination":"tz1NN5QooJWkW44KFfrXqLRaxEa5Wxw3f9FF","result":{"status":"skipped"}}]}}],"signature":"edsigtjebZX3vY6D4gCBkdebosUAqpCC8BfcasVR5LmAmyLZnkWXiwoAKYKGDPgLaKDqorJsxLBrayTBKb572r88pv3zRE7taXz"}]`,
            out: 'backtracked, backtracked, backtracked, failed: (temporary: proto.006-PsCARTHA.contract.balance_too_low), skipped, skipped, skipped, skipped'
        }, {
            in: `[{ "contents": [{ "kind": "transaction", "source": "tz1XVJ8bZUXs7r5NV8dHvuiBhzECvLRLR3jW", "fee": "1006930", "counter": "437661", "gas_limit": "69292", "storage_limit": "0", "amount": "0", "destination": "KT1JFF5gnmVvFsYmyVB6Uqyu2LccHf8LZUkA", "parameters": { "entrypoint": "update", "value": [] }, "metadata": { "balance_updates": [{ "kind": "contract", "contract": "tz1XVJ8bZUXs7r5NV8dHvuiBhzECvLRLR3jW", "change": "-1006930" }, { "kind": "freezer", "category": "fees", "delegate": "tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU", "cycle": 291, "change": "1006930" }], "operation_result": { "status": "backtracked", "storage": { "prim": "Pair", "args": [{ "int": "11082" }, { "prim": "Some", "args": [{ "bytes": "01034170a2083dccbc2be253885a8d0e9f7ce859eb370d0c5cae3b6994af4cb9d666" }] }] }, "big_map_diff": [{ "action": "update", "big_map": "11082", "key_hash": "exprtqUntj1ohCsEQCP2ggwU5m5gWJD5aqGZVv8RshXA5zRhUrh3A1", "key": { "string": "BAT-USDC" }, "value": {} }, { "action": "update", "big_map": "11082", "key_hash": "expruDEDcy5nG4V1Up1HToC5wXZGtZXHCYNsYHBgZyUJKA44e2qnhV", "key": { "string": "BTC-USD" }, "value": {} }, { "action": "update", "big_map": "11082", "key_hash": "exprtkNNzcMRGPYAVQbdXkp8UCJbrX1JgFgCBYcrrff5svE3xdu3KY", "key": { "string": "COMP-USD" }, "value": {} }, { "action": "update", "big_map": "11082", "key_hash": "exprus7Hrujrc3xz8RVUfekxTqiDFcG8xRUQUYv3eunLkxruvNBMeD", "key": { "string": "DAI-USDC" }, "value": {} }, { "action": "update", "big_map": "11082", "key_hash": "exprv9NLX1skZHFM1i6eXc7eAazz25T1BVjkDzc47fWEEjn6y2Zsay", "key": { "string": "ETH-USD" }, "value": {} }, { "action": "update", "big_map": "11082", "key_hash": "exprtfywZSkNmyonkwgKvcuiR6xV7X9ymvofbEHwBzMJKA7QxAQLXp", "key": { "string": "KNC-USD" }, "value": {} }, { "action": "update", "big_map": "11082", "key_hash": "expruN2dG6bWSAUNefFCdJ244bEekeGkUMCNhcQGhzJXmAYpcbgnVG", "key": { "string": "LINK-USD" }, "value": {} }, { "action": "update", "big_map": "11082", "key_hash": "expru4Xom8ojhm2xgG7LGHjW3mMemUFErPG81murPbfC4aA45gN9Dh", "key": { "string": "REP-USD" }, "value": {} }, { "action": "update", "big_map": "11082", "key_hash": "exprukkbxD4rqiYFhFNSkLHfyEfbVEMirvDS9naHRjGKbzPsREJfmc", "key": { "string": "XTZ-USD" }, "value": {} }, { "action": "update", "big_map": "11082", "key_hash": "expruhMtUwed1qV2jRCfgdaoVLF4eHWcnE12jhYbqibWLCUeNjKBaH", "key": { "string": "ZRX-USD" }, "value": {} }], "consumed_gas": "69292", "storage_size": "2297" } } }, { "kind": "transaction", "source": "tz1XVJ8bZUXs7r5NV8dHvuiBhzECvLRLR3jW", "fee": "1018036", "counter": "437662", "gas_limit": "180359", "storage_limit": "0", "amount": "0", "destination": "KT1JFF5gnmVvFsYmyVB6Uqyu2LccHf8LZUkA", "parameters": { "entrypoint": "push", "value": { "string": "KT1QskLhCJ4jzRReju3pGkYdtxojWpE8V7vF%update" } }, "metadata": { "balance_updates": [{ "kind": "contract", "contract": "tz1XVJ8bZUXs7r5NV8dHvuiBhzECvLRLR3jW", "change": "-1018036" }, { "kind": "freezer", "category": "fees", "delegate": "tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU", "cycle": 291, "change": "1018036" }], "operation_result": { "status": "backtracked", "storage": { "prim": "Pair", "args": [{ "int": "11082" }, { "prim": "Some", "args": [{ "bytes": "01034170a2083dccbc2be253885a8d0e9f7ce859eb370d0c5cae3b6994af4cb9d666" }] }] }, "big_map_diff": [{ "action": "copy", "source_big_map": "11082", "destination_big_map": "-1" }], "consumed_gas": "80359", "storage_size": "2297" }, "internal_operation_results": [{ "kind": "transaction", "source": "KT1JFF5gnmVvFsYmyVB6Uqyu2LccHf8LZUkA", "nonce": 0, "amount": "0", "destination": "KT1QskLhCJ4jzRReju3pGkYdtxojWpE8V7vF", "parameters": { "entrypoint": "update", "value": { "int": "-1" } }, "result": { "status": "failed", "errors": [{ "kind": "temporary", "id": "proto.006-PsCARTHA.michelson_v1.runtime_error", "contract_handle": "KT1QskLhCJ4jzRReju3pGkYdtxojWpE8V7vF", "contract_code": [] }, { "kind": "temporary", "id": "proto.006-PsCARTHA.gas_exhausted.operation" }] } }] } }], "signature": "edsigteY4kCSadjUNe4KWaZu8zs82YGCzyZS1SkUqmpacRtmBHN1Nf5Zjyw5m2o41a6gtwoeaEwocWKzHC9BZa9FTVC9GDjQPs1" }]`,
            out: 'backtracked, backtracked, failed: (temporary: proto.006-PsCARTHA.michelson_v1.runtime_error), (temporary: proto.006-PsCARTHA.gas_exhausted.operation)'
        }];

        samples.map(s => {
            expect(() => TezosNodeWriter.parseRPCError(s.in)).to.throw().with.property('message', s.out);
        });
        
    });

    it('testContractInvocationOperation test', mochaAsync(async () => { }));

    it('testContractDeployOperation test', mochaAsync(async () => { }));

    it('estimateOperation test', mochaAsync(async () => { }));
});
