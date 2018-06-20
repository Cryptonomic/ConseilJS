import 'mocha';
import {expect} from 'chai';
import {TezosOperations} from '../src/tezos/TezosOperations'
import {TezosWallet} from '../src/tezos/TezosWallet'

const keys = TezosWallet.unlockFundraiserIdentity(
    'vendor excite awake enroll essay gather mention knife inmate insect agent become alpha desert menu',
    'byixpeyi.dofdqvwn@tezos.example.org',
    'SU0j4HSgbd'
);

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
        const result = await to.sendTransactionOperation(
            'zeronet',
            keys,
            'tz1cfwpEiwEssf3W7vuJY2YqNzZFqidwZ1JR',
            100000000,
            50000
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
            'zeronet',
            delegatedKeyStore,
            'tz1aj32NRPg49jtvSDhkpruQAFevjaewaLew',
            1
        );
        console.log(JSON.stringify(result));
        expect(result.operationGroupID).to.exist
    });
});*/

/*describe('sendOriginationOperation()', () => {
    it('originate an account', async () => {
        const result = await to.sendOriginationOperation(
            'zeronet',
            keys,
            100,
            keys.publicKeyHash,
            true,
            true,
            1
        );
        console.log(JSON.stringify(result));
        expect(result.operationGroupID).to.exist
    });
});*/

/*describe('sendKeyRevealOperation()', () => {
    it('successfully send a Tezos transaction', async () => {
        const result = await to.sendKeyRevealOperation(
            'zeronet',
            keys,
            50000
        );
        console.log(result)
        expect(result.operationGroupID).to.exist
    });
});*/

/*describe('sendIdentityActivationOperation()', () => {
    it('activate an identity', async () => {
        const newKeys = tw.unlockFundraiserIdentity(
            'vendor excite awake enroll essay gather mention knife inmate insect agent become alpha desert menu',
            'byixpeyi.dofdqvwn@tezos.example.org',
            'SU0j4HSgbd'
        )
        const result = await to.sendIdentityActivationOperation(
            'zeronet',
            newKeys,
            '83ba3ffc1552cee5dcc392e6cd3413d0c35181df'
        );
        console.log(JSON.stringify(result));
        expect(result.operationGroupID).to.exist
    });
});*/

describe('Tezos operation functions', () => {
    it('successfully perform operations on a new identity', async () => {
        const mnemonic = TezosWallet.generateMnemonic();
        const newKeys = TezosWallet.unlockIdentityWithMnemonic(
            mnemonic,
            ''
        );
        const result = await TezosOperations.sendTransactionOperation(
            'zeronet',
            keys,
            newKeys.publicKeyHash,
            10000,
            50000
        );
        expect(result.operationGroupID).to.exist;
        const result2 = await TezosOperations.sendOriginationOperation(
            'zeronet',
            newKeys,
            100,
            newKeys.publicKeyHash,
            true,
            true,
            1
        );
        expect(result2.operationGroupID).to.exist;
        const result3 = await TezosOperations.sendDelegationOperation(
            'zeronet',
            newKeys,
            keys.publicKeyHash,
            1
        );
        expect(result3.operationGroupID).to.exist
    });
});