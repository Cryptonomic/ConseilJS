// Most unit tests are commented out as they can only be run one by one with delays.
// Uncomment specific unit tests to test specific operation logic.
import {expect} from 'chai';
import {TezosOperations} from '../src'
import 'mocha';
import {servers} from "../test/servers";
import {TezosWallet} from "../src";
import {KeyStore} from "../src/types/KeyStore";

const tezosURL = servers.tezosServer;

// const keys = <KeyStore> TezosWallet.unlockFundraiserIdentity(
//     'bomb sing vacant repair illegal category unveil color olive chest wink expand fringe pioneer reward',
//     'efcvoykz.kygxsosz@tezos.example.org',
//     'BFdu9bDJxC'
// );

/*describe('signOperationGroup() and computeOperationHash()', () => {
    it('correctly compute an operation hash for the given operation bytes', async () => {
        const result = to.signOperationGroup(
            '8f90f8f1f79bd69ae7d261252c51a1f5e8910f4fa2712a026f2acadb960416d900020000f10a450269188ebd9d29c6402d186bc381770fae000000000000c3500000001900000026010000000005f5e1000000bad6e61eb7b96f08783a476508e3d83b2bb15e19ff00000002030bb8010000000000000000',
            keys
        );
        expect(result.signature).to.equal('edsigtu4NbVsyomvHbAtstQAMpXFSKkDxH1YoshhQQmJhVe2pyWRUYvQr7dDLetLvyL7Yi78Pe846mG6hBGLx2WJXkuqSCU6Ff2');
        const result2 = to.computeOperationHash(result);
        expect(result2).to.equal('opYgjs8KzFbyPaWpGmkHKSGJX5WeSPjhUs18fxfGqU3SEVjPRWx')
    });
});*/

/*describe('sendTransactionOperation()', () => {
    it('successfully send a Tezos transaction', async () => {
        const result = await TezosOperations.sendTransactionOperation(
            tezosURL,
            keys,
            'TZ1qcvfsY6Wi2zDk7rjaiSiRY2B9Bax7Zm45',
            100000000,
            50000,
            `44'/1729'/0'/0'/0'`
        );
        expect(result.operationGroupID).to.exist
    });
});*/

/*describe('sendTransactionOperation()', () => {
    const childKeyStore = {
        publicKey: keys.publicKey,
        privateKey: keys.privateKey,
        publicKeyHash: 'TZ1qcvfsY6Wi2zDk7rjaiSiRY2B9Bax7Zm45'
    };
    it('successfully send a Tezos transaction from a child account', async () => {
        const result = await TezosOperations.sendTransactionOperation(
            tezosURL,
            childKeyStore,
            keys.publicKeyHash,
            100000000,
            50000,
            `44'/1729'/0'/0'/0'`
        );
        expect(result.operationGroupID).to.exist
    });
});*/


//This test is intentionally commented out to prevent failures with repeat delegation.
//After any changes to the operation logic, the developer should uncomment this test and run it.
/*describe('sendDelegationOperation()', () => {
    const delegatedKeyStore = {
        publicKey: keys.publicKey,
        privateKey: keys.privateKey,
        publicKeyHash: 'TZ1Y9jCkazZEkyW22xfaSy3EZDqSAWFvF6RL'
    };
    it('correctly delegate to a given account', async () => {
        const result = await to.sendDelegationOperation(
            tezosURL,
            delegatedKeyStore,
            'tz1aj32NRPg49jtvSDhkpruQAFevjaewaLew',
            1,
            `44'/1729'/0'/0'/0'`
        );
        console.log(JSON.stringify(result));
        expect(result.operationGroupID).to.exist
    });
});*/

/*describe('sendOriginationOperation()', () => {
    it('originate an account', async () => {
        const result = await TezosOperations.sendOriginationOperation(
            tezosURL,
            keys,
            100,
            keys.publicKeyHash,
            true,
            true,
            1,
            `44'/1729'/0'/0'/0'`
        );
        console.log(JSON.stringify(result));
        expect(result.operationGroupID).to.exist
    });
});*/

/*describe('sendKeyRevealOperation()', () => {
    it('successfully send a Tezos transaction', async () => {
        const result = await TezosOperations.sendKeyRevealOperation(
            tezosURL,
            keys,
            50000,
            `44'/1729'/0'/0'/0'`
        );
        console.log(result)
        expect(result.operationGroupID).to.exist
    });
});*/

/*describe('sendIdentityActivationOperation()', () => {
    it('activate an identity', async () => {
        //const newKeys = TezosWallet.unlockFundraiserIdentity(
        //    'vendor excite awake enroll essay gather mention knife inmate insect agent become alpha desert menu',
        //    'byixpeyi.dofdqvwn@tezos.example.org',
        //    'SU0j4HSgbd'
        //)
        const result = await TezosOperations.sendIdentityActivationOperation(
            tezosURL,
             keys,
            '7e47a409f9baf132ef8c03460aa9eb1fe1878248',
            `44'/1729'/0'/0'/0'`
        );
        console.log(JSON.stringify(result));
        expect(result.operationGroupID).to.exist
    });
});*/

/*describe('Tezos operation functions', () => {
    it('successfully perform operations on a new identity', async () => {
        const mnemonic = TezosWallet.generateMnemonic();
        const newKeys = TezosWallet.unlockIdentityWithMnemonic(
            mnemonic,
            ''
        );
        const result = await TezosOperations.sendTransactionOperation(
            tezosURL,
            keys,
            newKeys.publicKeyHash,
            10000,
            50000,
            `44'/1729'/0'/0'/0'`
        );
        expect(result.operationGroupID).to.exist;
        const result2 = await TezosOperations.sendOriginationOperation(
            tezosURL,
            newKeys,
            100,
            newKeys.publicKeyHash,
            true,
            true,
            1,
            `44'/1729'/0'/0'/0'`
        );
        expect(result2.operationGroupID).to.exist;
        const result3 = await TezosOperations.sendDelegationOperation(
            tezosURL,
            newKeys,
            keys.publicKeyHash,
            1
        );
        expect(result3.operationGroupID).to.exist
    });
})*/

/*describe('isManagerKeyRevealedForAccount()', () => {
    it('should successfully correct report key reveals', async () => {
        const ks = <KeyStore> {
            publicKey: '',
            privateKey: '',
            publicKeyHash: 'tz1XxQPg1wtWHovbiJqAY1NwxYQJPxjJCzCp'
        }
        const result = await TezosOperations.isManagerKeyRevealedForAccount(
            tezosURL,
            ks
        );
        console.log(result)
        expect(result).to.equal(true)
    });
});*/

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

        const mnemonic = TezosWallet.generateMnemonic();
        const newKeys = <KeyStore> TezosWallet.unlockIdentityWithMnemonic(
            mnemonic,
            ''
        );

        const receiveResult = await TezosOperations.sendTransactionOperation(
            tezosURL,
            keys,
            newKeys.publicKeyHash,
            10000,
            50000,
            `44'/1729'/0'/0'/0'`
        );
        expect(receiveResult.operationGroupID).to.exist;

        sleep(33);

        const keyRevealResult = await TezosOperations.sendKeyRevealOperation(
            tezosURL,
            newKeys,
            100,
            `44'/1729'/0'/0'/0'`
        );
        expect(keyRevealResult.operationGroupID).to.exist;

        sleep(33);

        const originationResult = await TezosOperations.sendOriginationOperation(
            tezosURL,
            newKeys,
            100,
            newKeys.publicKeyHash,
            true,
            true,
            1,
            `44'/1729'/0'/0'/0'`
        );
        expect(originationResult.operationGroupID).to.exist;

        sleep(33);

        const delegationResult = await TezosOperations.sendDelegationOperation(
            tezosURL,
            newKeys,
            keys.publicKeyHash,
            1,
            `44'/1729'/0'/0'/0'`
        );
        expect(delegationResult.operationGroupID).to.exist
    });
});