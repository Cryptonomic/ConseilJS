import {TezosOperations} from "../../src/tezos/TezosOperations";
import {expect} from "chai";
import {KeyStore, StoreType} from "../../src/types/KeyStore";
import {TezosWallet} from "../../src";
import {servers} from "../servers";
import {TezosHardwareWallet} from "../../src/tezos/TezosHardwareWallet";
import {HardwareDeviceType} from "../../src/types/HardwareDeviceType";

const tezosURL = servers.tezosServer;

function sleep(seconds)
{
    var e = new Date().getTime() + (seconds * 1000);
    while (new Date().getTime() <= e) {}
}

describe('Tezos operation functions', () => {

    it('successfully perform operations on a new identity', async (done) => {

        setTimeout(done, 15000)

        const keys = <KeyStore> TezosWallet.unlockFundraiserIdentity(
            'rare comic flag oppose poem palace myth round trade day room iron gap hint enjoy',
            'yizqurzn.jyrwcidl@tezos.example.org',
            'P2rwZYgJBL',
            'tz1aDfd8nDvobpBS3bzruqPbQcv7uq2ZyPxu'
        );

        const newKeys = await TezosHardwareWallet.unlockAddress(HardwareDeviceType.Ledger, `44'/1729'/0'/0'/0'`)

        const receiveResult = await TezosOperations.sendTransactionOperation(
            tezosURL,
            keys,
            newKeys.publicKeyHash,
            10000,
            50000
        );
        expect(receiveResult.operationGroupID).to.exist;

        sleep(33)

        /* Can't reveal twice, commented out for testing purposes
        const keyRevealResult = await TezosOperations.sendKeyRevealOperation(
            tezosURL,
            newKeys,
            100
        )
        expect(keyRevealResult.operationGroupID).to.exist;

        sleep(33)
        */
        const originationResult = await TezosOperations.sendOriginationOperation(
            tezosURL,
            newKeys,
            100,
            newKeys.publicKeyHash,
            true,
            true,
            1
        );
        expect(originationResult.operationGroupID).to.exist;

        sleep(33)

        const delegationResult = await TezosOperations.sendDelegationOperation(
            tezosURL,
            newKeys,
            keys.publicKeyHash,
            1
        );
        expect(delegationResult.operationGroupID).to.exist
    });
})