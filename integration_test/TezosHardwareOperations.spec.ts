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
console.log("Derivation path: ", derivationPath)

function sleep(seconds)
{
    const e = new Date().getTime() + (seconds * 1000);
    while (new Date().getTime() <= e) {}
}

describe('Tezos operation functions', () => {

    it('successfully perform operations on a new identity', async (done) => {

        setTimeout(done, 15000);

        //zeronet
        const keys = <KeyStore> TezosWallet.unlockFundraiserIdentity(
            'rare comic flag oppose poem palace myth round trade day room iron gap hint enjoy',
            'yizqurzn.jyrwcidl@tezos.example.org',
            'P2rwZYgJBL',
            'tz1aDfd8nDvobpBS3bzruqPbQcv7uq2ZyPxu'
        );
        const alphanetKeys = <KeyStore> TezosWallet.unlockFundraiserIdentity(
            'addict prevent buyer exist forum left area lizard pair join arrest main lucky cable lunar',
            'nuckwdqr.armjikzp@tezos.example.org',
            'RFvXUWNdJQ',
            'tz1LNEdR5FHvLXtSRyXH8UKzLPCBwJZqqB67'
        )
        //get fields from tezos alphanet faucet
        //activate account using function from Tezos Operations (delete after)

        /*
        const activateAccount = await TezosOperations.sendIdentityActivationOperation(tezosURL, alphanetKeys, '24b215e6afde600560bba37ce8502e55c5e40624', derivationPath)
        expect(activateAccount.operationGroupID).to.exist;
        console.log("activated account: ", activateAccount)*/


        const newKeys = await TezosHardwareWallet.unlockAddress(HardwareDeviceType.Ledger, derivationPath);
        console.log("newKeys: ", newKeys)

        const receiveResult = await TezosOperations.sendTransactionOperation(
            tezosURL,
            alphanetKeys, 
            newKeys.publicKeyHash,
            1000000,
            0,
            derivationPath
        );
        expect(receiveResult.operationGroupID).to.exist;

        sleep(33);

        console.log("Beginning origination: ")
        const originationResult = await TezosOperations.sendOriginationOperation(
            tezosURL,
            newKeys,
            100000,
            "tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9",
            true,
            true,
            0,
            derivationPath
        );
        expect(originationResult.operationGroupID).to.exist;

        sleep(33);

        console.log("Beginning delegation: ")
        const delegationResult = await TezosOperations.sendDelegationOperation(
            tezosURL,
            newKeys,
            "tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9",
            0,
            derivationPath,
        );
        expect(delegationResult.operationGroupID).to.exist;

        sleep(33);

        const sendResult = await TezosOperations.sendTransactionOperation(
            tezosURL,
            newKeys,
            alphanetKeys.publicKeyHash,
            100,
            0,
            derivationPath
        );
        expect(sendResult.operationGroupID).to.exist;
    });
});