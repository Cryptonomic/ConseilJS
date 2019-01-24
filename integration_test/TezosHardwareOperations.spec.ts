import {TezosOperations} from "../src";
import {expect} from "chai";
import {KeyStore} from "../src/types/KeyStore";
import {TezosWallet} from "../src";
import {servers} from "../test/servers";
import {TezosHardwareWallet} from "../src/tezos/TezosHardwareWallet";
import {HardwareDeviceType} from "../src/types/HardwareDeviceType";
import mochaAsync from '../src/utils/mochaTestHelper';

const tezosURL = servers.tezosServer;
const derivationPathIndex = 0;
const derivationPath = `44'/1729'/0'/0'/` + derivationPathIndex + `'`;

function sleep(seconds) {
    const e = new Date().getTime() + (seconds * 1000);
    while (new Date().getTime() <= e) {}
}

describe('Tezos operation functions', () => {
    it('successfully perform operations on a new identity', mochaAsync(async () => {
        // setTimeout(done, 15000);

        // get fields from tezos alphanet faucet
        const fundraiserKeys = <KeyStore> TezosWallet.unlockFundraiserIdentity(
            "catalog swarm security term cherry junk burger solid rhythm law ladder field cluster swarm more",
            "jknpqqnh.ahxlkslh@tezos.example.org",
            "8NhItxrOx0",
            "tz1gjvk1kiNEPzmF6VzGoKepAvvhUnoB5rwV"
        );

        const fundraiserKeySecret = '4996d9e79e744aa0ee42dca5ac94b1e43a62f9f9';

        const mnemonic = TezosWallet.generateMnemonic();
        const randomKeys = <KeyStore> TezosWallet.unlockIdentityWithMnemonic(mnemonic, '');
        const inactiveImplicitAddress = randomKeys.publicKeyHash;
        const anActiveImplicitAddress = fundraiserKeys.publicKeyHash;
        // const randomDelegatedAddress = 'tz1gBffuaQnAqZBbDWgoWhNQNttYeRcXo41o';
        const randomBakerAddress1 = 'tz1gBffuaQnAqZBbDWgoWhNQNttYeRcXo41o';
        // const randomBakerAddress2 = 'tz3WXYtyDUNL91qfiCJtVUX746QpNv5i5ve5';
        // const randomKt1Address = 'KT1HkQP7vjzz7pVUbfvpcXFRLwCaexAWZF1C';

        const deviceKeys = await TezosHardwareWallet.unlockAddress(HardwareDeviceType.Trezor, derivationPath);

        // Send 10tz to Ledger to perform the tests.
        console.log("+++++receiving 10 tez from an active account");
        const receiveResult = await TezosOperations.sendTransactionOperation(
            tezosURL,
            fundraiserKeys,
            deviceKeys.publicKeyHash,
            10000000,
            100000 //Protocol 003 minimum fee for inactive implicit accounts is 1387
        );
        expect(receiveResult.operationGroupID).to.exist;

        // if test Ledger, 
        // TezosOperations.setDeviceType(HardwareDeviceType.Ledger);
        TezosOperations.setDeviceType(HardwareDeviceType.Trezor);

        sleep(10);

        console.log("+++++Sending 1 tez to an inactive implicit account");
        const inactiveImplicitResult = await TezosOperations.sendTransactionOperation(
            tezosURL,
            deviceKeys,
            inactiveImplicitAddress,
            1000000,
            300000, // Protocol 003 minimum fee for inactive implicit accounts is 1387
            derivationPath
        );
        expect(inactiveImplicitResult.operationGroupID).to.exist;

        sleep(10);

        console.log("+++++Sending 1 tez to an active implicit address");
        const activeImplicitResult = await TezosOperations.sendTransactionOperation(
            tezosURL,
            deviceKeys,
            anActiveImplicitAddress,
            1000000,
            300000, // Protocol 003 minimum fee for active implicit accounts is 1100
            derivationPath
        );
        expect(activeImplicitResult.operationGroupID).to.exist;

        sleep(10);

        // console.log("+++++Sending 1 tez to a random delegated address");
        // const delegatedAccountResult = await TezosOperations.sendTransactionOperation(
        //     tezosURL,
        //     deviceKeys,
        //     randomDelegatedAddress,
        //     1000000,
        //     300000, // Protocol 003 minimum fee for active kt1 accounts is 1100
        //     derivationPath
        // );
        // expect(delegatedAccountResult.operationGroupID).to.exist;

        // sleep(33);

        console.log("+++++Origination an account with 1 tez");
        const originationResult = await TezosOperations.sendOriginationOperation(
            tezosURL,
            deviceKeys,
            10000000,
            randomBakerAddress1,
            true,
            true,
            300000, // Protocol 003 minimum fee is 1377 for originations
            derivationPath
        );
        expect(originationResult.operationGroupID).to.exist;

        sleep(10);

        
          // Comment out delegation section in the FIRST run
          // Activate delegation section in the SECOND run.
          // Set delegatedKeyStore.publicKeyHash to the newly originated KT1 address before starting the SECOND run.

        // let delegatedKeyStore = deviceKeys;
        // delegatedKeyStore.publicKeyHash = 'KT1HkQP7vjzz7pVUbfvpcXFRLwCaexAWZF1C';

        // console.log("+++++Sending delegation operation");
        // const delegationResult = await TezosOperations.sendDelegationOperation(
        //     tezosURL,
        //     delegatedKeyStore,
        //     randomBakerAddress2,
        //     300000, // Protocol 003 minimum fee is 1100 for delegations
        //     derivationPath
        // );
        // expect(delegationResult.operationGroupID).to.exist
        
    }));
});
