// All unit tests are commented out as they can only be run one by one with delays.
// Uncomment specific unit tests to test specific operation logic.
import {expect} from 'chai';
import {TezosOperations} from '../src/tezos/TezosOperations'
import {TezosWallet} from '../src/tezos/TezosWallet'
import {KeyStore} from "../src/types/KeyStore";
import 'mocha';
import {servers} from "./servers";

const tezosURL = servers.tezosServer;

  const keys = <KeyStore> TezosWallet.unlockFundraiserIdentity(
     'obscure arena boat lyrics among fresh film age gallery annual diagram mask visual borrow antique',
     'chcgzbvw.joidhxxi@tezos.example.org',
     'VEZr3mSVjv',
      'tz1RmD3Tvmm4fWepP2dUUMvUcrwpZ8EeoXo6'
  );

/*describe('signOperationGroup() and computeOperationHash()', () => {
    it('correctly compute an operation hash for the given operation bytes', async () => {
        const result = TezosOperations.signOperationGroup(
            '8f90f8f1f79bd69ae7d261252c51a1f5e8910f4fa2712a026f2acadb960416d900020000f10a450269188ebd9d29c6402d186bc381770fae000000000000c3500000001900000026010000000005f5e1000000bad6e61eb7b96f08783a476508e3d83b2bb15e19ff00000002030bb8010000000000000000',
            keys
        );
        expect(result.signature).to.equal('edsigtu4NbVsyomvHbAtstQAMpXFSKkDxH1YoshhQQmJhVe2pyWRUYvQr7dDLetLvyL7Yi78Pe846mG6hBGLx2WJXkuqSCU6Ff2');
        const result2 = TezosOperations.computeOperationHash(result);
        expect(result2).to.equal('opYgjs8KzFbyPaWpGmkHKSGJX5WeSPjhUs18fxfGqU3SEVjPRWx')
    });
});*/

/*describe('sendTransactionOperation()', () => {
    it('successfully send a Tezos transaction', async () => {
        const result = await TezosOperations.sendTransactionOperation(
            tezosURL,
            keys,
            'tz1XxQPg1wtWHovbiJqAY1NwxYQJPxjJCzCp',
            100000000,
            50000
        );
        expect(result.operationGroupID).to.exist
    });
});*/


/*describe('sendDelegationOperation()', () => {
    it('correctly delegate to a given account', async () => {
        const result = await TezosOperations.sendDelegationOperation(
            tezosURL,
            keys,
            'tz1boot3mLsohEn4pV9Te3hQihH6N8U3ks59',
            1
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
            'tz1boot3mLsohEn4pV9Te3hQihH6N8U3ks59',
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
        const result = await TezosOperations.sendKeyRevealOperation(
            tezosURL,
            keys,
            50000
        );
        console.log(result)
        expect(result.operationGroupID).to.exist
    });
});*/

/*describe('sendIdentityActivationOperation()', () => {
    it('activate an identity', async () => {
        const result = await TezosOperations.sendIdentityActivationOperation(
            tezosURL,
             keys,
            '4d909b2d72fac25351cf893c647b0d1134f2407a'
        );
        console.log(JSON.stringify(result));
        expect(result.operationGroupID).to.exist
    });
});*/

/*describe('Tezos operation functions', () => {
    it('successfully perform operations on a new identity', async () => {
        const mnemonic = TezosWallet.generateMnemonic();
        const newKeys = <KeyStore> TezosWallet.unlockFundraiserIdentity(
            'obscure arena boat lyrics among fresh film age gallery annual diagram mask visual borrow antique',
            'chcgzbvw.joidhxxi@tezos.example.org',
            'VEZr3mSVjv',
            'tz1RmD3Tvmm4fWepP2dUUMvUcrwpZ8EeoXo6'
        );
        const result = await TezosOperations.sendTransactionOperation(
            tezosURL,
            keys,
            newKeys.publicKeyHash,
            10000,
            50000
        );
        expect(result.operationGroupID).to.exist;
        const result2 = await TezosOperations.sendOriginationOperation(
            tezosURL,
            newKeys,
            100,
            newKeys.publicKeyHash,
            true,
            true,
            1
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