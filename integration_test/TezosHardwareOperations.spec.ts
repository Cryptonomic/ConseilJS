import {TezosOperations} from "../src";
import {expect} from "chai";
import {KeyStore} from "../src/types/KeyStore";
import {TezosWallet} from "../src";
import {servers} from "../test/servers";
import {TezosHardwareWallet} from "../src/tezos/TezosHardwareWallet";
import {HardwareDeviceType} from "../src/types/HardwareDeviceType";

const tezosURL = servers.tezosServer;
const derivationPathIndex = Math.floor(Math.random()*10).toString();
const derivationPath = `44'/1729'/0'/0'/` + derivationPathIndex + `'`;
console.log("DPATH: " + derivationPath)

function sleep(seconds)
{
    const e = new Date().getTime() + (seconds * 1000);
    while (new Date().getTime() <= e) {}
}

describe('Tezos operation functions', () => {

    it('successfully perform operations on a new identity', async (done) => {

        setTimeout(done, 15000);

        const keys = <KeyStore> TezosWallet.unlockFundraiserIdentity(
            'rare comic flag oppose poem palace myth round trade day room iron gap hint enjoy',
            'yizqurzn.jyrwcidl@tezos.example.org',
            'P2rwZYgJBL',
            'tz1aDfd8nDvobpBS3bzruqPbQcv7uq2ZyPxu'
        );

        const newKeys = await TezosHardwareWallet.unlockAddress(HardwareDeviceType.Ledger, derivationPath);
        console.log("newKeys: " + newKeys.toString)

        const receiveResult = await TezosOperations.sendTransactionOperation(
            tezosURL,
            keys,
            newKeys.publicKeyHash,
            10000,
            50000,
            derivationPath
        );
        expect(receiveResult.operationGroupID).to.exist;

        sleep(33);

        const originationResult = await TezosOperations.sendOriginationOperation(
            tezosURL,
            newKeys,
            100,
            newKeys.publicKeyHash,
            true,
            true,
            1,
            derivationPath
        );
        expect(originationResult.operationGroupID).to.exist;

        sleep(33);

        const delegationResult = await TezosOperations.sendDelegationOperation(
            tezosURL,
            newKeys,
            "tz1aDfd8nDvobpBS3bzruqPbQcv7uq2ZyPxu",//keys.publicKeyHash,
            1,
            derivationPath
        );
        expect(delegationResult.operationGroupID).to.exist;
    });
});