import 'mocha';
import {expect} from 'chai';
import * as to from '../src/tezos/TezosOperations'
import * as tw from '../src/tezos/TezosWallet'
import {KeyStore} from "../src/types/KeyStore";

const keys: KeyStore = {
    publicKey: 'edpkv3azzeq9vL869TujYhdQY5FKiQH4CGwJEzqG7m6PoX7VEpdPc9',
    privateKey: 'edskS5owtVaAtWifnCNo8tUpAw2535AXEDY4RXBRV1NHbQ58RDdpaWz2KyrvFXE4SuCTbHU8exUecW33GRqkAfLeNLBS5sPyoi',
    publicKeyHash: 'tz1hcXqtiMYFhvuirD4guE7ts4yDuCAmtD95'
};

function countErrorsInOperationResult(result: to.OperationResult) {
    return result.results.operation_results.filter(res => {
        if(typeof res.errors === "undefined") return false;
        else return res.errors.length > 0
    }).length
}

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
        const keys2: KeyStore = {
            publicKey: 'edpkvHoQiRjLbDE7V9KqozzMr9xdvJSDmcbLfz78FNdkbd6rR6R3HB',
            privateKey: 'edskRz5B24SdcgA7DAgF9UStho4zgva6CTg2re6ZWduHguqu6EMBMWiLdFDkoo5wW8sgtMcTD62QgXqVAPCcGc5PcXXsuCsTNW',
            publicKeyHash: 'tz1fstxP1dJuodWoVD2sDecDDVQkV8gaygcR'
        };
        const result = await to.sendTransactionOperation(
            'zeronet',
            keys,
            'tz1cfwpEiwEssf3W7vuJY2YqNzZFqidwZ1JR',
            100000000,
            50000
        );
        expect(countErrorsInOperationResult(result)).to.equal(0);
    });
});*/


//This test is intentionally commented out to prevent failures with repeat delegation.
//After any changes to the operation logic, the developer should uncomment this test and run it.
/*describe('sendDelegationOperation()', () => {
    const delegatedKeyStore = {
        publicKey: keys.publicKey,
        privateKey: keys.privateKey,
        publicKeyHash: 'TZ1a46yKWbK2GwwmvuoLCKWcNgwiGLVcg1qW'
    };
    it('correctly delegate to a given account', async () => {
        const result = await to.sendDelegationOperation(
            'zeronet',
            delegatedKeyStore,
            'tz1cfwpEiwEssf3W7vuJY2YqNzZFqidwZ1JR',
            1
        );
        console.log(JSON.stringify(result));
        expect(countErrorsInOperationResult(result)).to.equal(0);
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
        expect(countErrorsInOperationResult(result)).to.equal(0);
    });
});*/

/*describe('sendIdentityActivationOperation()', () => {
    it('activate an identity', async () => {
        const newKeys = tw.unlockFundraiserIdentity(
            'blue wolf erupt base space agent evil spoon modify wrap universe flower charge betray quarter',
            'sffbfrsq.omniocfd@tezos.example.org',
            'ur5HTFncP0'
        )
        const result = await to.sendIdentityActivationOperation(
            'zeronet',
            newKeys,
            '3c706b349ad1439b0dcec29b14d258b92ee32437'
        );
        console.log(JSON.stringify(result));
        expect(countErrorsInOperationResult(result)).to.equal(0);
    });
});*/

