import 'mocha';
import { expect } from 'chai';
import fetch from 'node-fetch';

import * as loglevel from 'loglevel';
import LogSelector from '../../../src/utils/LoggerSelector';
LogSelector.setLogger(loglevel.getLogger('conseiljs'));
LogSelector.setLevel('debug');

import FetchSelector from '../../../src/utils/FetchSelector';
FetchSelector.setFetch(fetch);

import { TezosConseilClient } from '../../../src/reporting/tezos/TezosConseilClient';
import { TezosProtocolHelper } from '../../../src/chain/tezos/TezosProtocolHelper';
import { tezosServer, conseilServer, keys, bakerAddress } from '../../TestAssets';

describe('TezosProtocolHelper integration test suite', () => {
    it('Deploy manager.tz P005 "upgrade" contract', async () => {
        const nodeResult = await TezosProtocolHelper.deployManagerContract(tezosServer, keys, bakerAddress, 20000, 500000);
        expect(nodeResult["operationGroupID"]).to.exist;

        const groupid = nodeResult["operationGroupID"].replace(/\"/g, '').replace(/\n/, '');
        await TezosConseilClient.awaitOperationConfirmation(conseilServer, conseilServer.network, groupid, 5, 31);
    });

    it('Set a delegate on the "upgrade" contract', async () => {
        const nodeResult = await TezosProtocolHelper.setDelegate(tezosServer, keys, 'KT1PxkYcmUqjM6Giqu8WKhPyMB5mCVkvWrXg', 'tz3Q67aMz7gSMiQRcW729sXSfuMtkyAHYfqc', 20000);
        expect(nodeResult["operationGroupID"]).to.exist;

        const groupid = nodeResult["operationGroupID"].replace(/\"/g, '').replace(/\n/, '');
        await TezosConseilClient.awaitOperationConfirmation(conseilServer, conseilServer.network, groupid, 5, 31);
    });

    it('Clear the delegate on the "upgrade" contract', async () => {
        const nodeResult = await TezosProtocolHelper.unSetDelegate(tezosServer, keys, 'KT1PxkYcmUqjM6Giqu8WKhPyMB5mCVkvWrXg', 20000);
        expect(nodeResult["operationGroupID"]).to.exist;

        const groupid = nodeResult["operationGroupID"].replace(/\"/g, '').replace(/\n/, '');
        await TezosConseilClient.awaitOperationConfirmation(conseilServer, conseilServer.network, groupid, 5, 31);
    });

    it('Return delegated funds to the "manager" account', async () => {
        const nodeResult = await TezosProtocolHelper.withdrawDelegatedFunds(tezosServer, keys, 'KT1PxkYcmUqjM6Giqu8WKhPyMB5mCVkvWrXg', 20000, 250000);
        expect(nodeResult["operationGroupID"]).to.exist;

        const groupid = nodeResult["operationGroupID"].replace(/\"/g, '').replace(/\n/, '');
        await TezosConseilClient.awaitOperationConfirmation(conseilServer, conseilServer.network, groupid, 5, 31);
    });

    it('Deposit additional funds into the "upgrade" contract', async () => {
        const nodeResult = await TezosProtocolHelper.depositDelegatedFunds(tezosServer, keys, 'KT1PxkYcmUqjM6Giqu8WKhPyMB5mCVkvWrXg', 20000, 250000)
        expect(nodeResult["operationGroupID"]).to.exist;

        const groupid = nodeResult["operationGroupID"].replace(/\"/g, '').replace(/\n/, '');
        await TezosConseilClient.awaitOperationConfirmation(conseilServer, conseilServer.network, groupid, 5, 31);
    });
});
