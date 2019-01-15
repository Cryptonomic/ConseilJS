// Most unit tests are commented out as they can only be run one by one with delays.
// Uncomment specific unit tests to test specific operation logic.
import { expect } from "chai";
import { TezosOperations } from "../src";
import * as TezosMessageCodec from "../src/tezos/TezosMessageCodec";
import "mocha";
import { servers } from "../test/servers";
import { TezosWallet } from "../src";
import { KeyStore } from "../src/types/KeyStore";

const tezosURL = servers.tezosServer;

//Software tezos operations do not require a valid derivation path
const invalidDerivationPath = "ighiehgieh";

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
            invalidDerivationPath
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
            invalidDerivationPath
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
            invalidDerivationPath
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
            invalidDerivationPath
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
            invalidDerivationPath
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
            invalidDerivationPath
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
            invalidDerivationPath
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
            invalidDerivationPath
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

function sleep(seconds) {
  const e = new Date().getTime() + seconds * 1000;
  while (new Date().getTime() <= e) {}
}

describe("Tezos operation functions", () => {
  it("successfully perform operations on a new identity", async () => {
    const fundraiserKeys = <KeyStore>(
      await TezosWallet.unlockFundraiserIdentity(
        "major cannon mistake disorder bachelor depart jazz pudding worry attract scrap element uncover tide jump",
        "vttufpvh.xgbzugwn@tezos.example.org",
        "Wz41fjtUHJ",
        "tz1bwsWk3boyGgXf3u7CJGZSTfe14djdRtxG"
      )
    );

    const fundraiserKeySecret = "6da483843eba2526ea6d2c08aa39dd00efa99521";

    const mnemonic = await TezosWallet.generateMnemonic();
    const randomKeys = <KeyStore>(
      await TezosWallet.unlockIdentityWithMnemonic(mnemonic, "")
    );
    const inactiveImplicitAddress = randomKeys.publicKeyHash;
    const anActiveImplicitAddress = "tz1is75whxxkVvw2cF2FuRo5ANxZwwJ5nEbc";
    const randomDelegatedAddress = "KT1N5t39Lw7zivvgBN9HJJzUuk64GursRzyc";
    const randomBakerAddress1 = "tz1UmPE44pqWrEgW8sTRs6ED1DgwF7k43ncQ";
    const randomBakerAddress2 = "tz1boot2oCjTjUN6xDNoVmtCLRdh8cc92P1u";

    /*       
        //Activate this section in FIRST run to activate the fundraiser account
        //Comment this section out in SECOND round.
        console.log("+++++Activating account");
        const activationResult = await TezosOperations.sendIdentityActivationOperation(
            tezosURL,
            fundraiserKeys,
            fundraiserKeySecret,
            invalidDerivationPath
        );
        expect(activationResult.operationGroupID).to.exist;
        sleep(33);
//*/

    // console.log("+++++Sending 1 tez to an inactive implicit account");
    // const inactiveImplicitResult = await TezosOperations.sendTransactionOperation(
    //   tezosURL,
    //   fundraiserKeys,
    //   inactiveImplicitAddress,
    //   100000000,
    //   2000000, // Protocol 003 minimum fee for inactive implicit accounts is 1387
    //   invalidDerivationPath
    // );
    // expect(inactiveImplicitResult.operationGroupID).to.exist;

    // sleep(33);

    console.log("+++++Sending 1 tez to an active implicit address");
    const activeImplicitResult = await TezosOperations.sendTransactionOperation(
      tezosURL,
      fundraiserKeys,
      "KT1Dcv5sfBrLWybqNY6gz7TxjQ6UmDbpKMim",
      //   anActiveImplicitAddress,
      20000000,
      2000000, // Protocol 003 minimum fee for active implicit accounts is 1100
      invalidDerivationPath
    );
    expect(activeImplicitResult.operationGroupID).to.exist;

    // sleep(33);

    // console.log('+++++Sending 1 tez to a random delegated address');
    // const delegatedAccountResult = await TezosOperations.sendTransactionOperation(
    //   tezosURL,
    //   fundraiserKeys,
    //   randomDelegatedAddress,
    //   20000000,
    //   2000000, // Protocol 003 minimum fee for active kt1 accounts is 1100
    //   invalidDerivationPath
    // );
    // expect(delegatedAccountResult.operationGroupID).to.exist;

    // sleep(33);

    // console.log('+++++Originating a contract from manager address');
    // const contractOriginationResult = await TezosOperations.sendContractOriginationOperation(
    //   [
    //     {
    //       prim: 'parameter',
    //       args: [
    //         {
    //           prim: 'string'
    //         }
    //       ]
    //     },
    //     {
    //       prim: 'storage',
    //       args: [
    //         {
    //           prim: 'string'
    //         }
    //       ]
    //     },
    //     {
    //       prim: 'code',
    //       args: [
    //         [
    //           {
    //             prim: 'CAR'
    //           },
    //           {
    //             prim: 'NIL',
    //             args: [
    //               {
    //                 prim: 'operation'
    //               }
    //             ]
    //           },
    //           {
    //             prim: 'PAIR'
    //           }
    //         ]
    //       ]
    //     }
    //   ],
    //   {
    //     string: 'hello'
    //   },
    //   tezosURL,
    //   fundraiserKeys,
    //   2000000,
    //   randomBakerAddress1,
    //   true,
    //   true,
    //   200000, // Protocol 003 minimum fee is 1377 for originations
    //   invalidDerivationPath,
    //   '10160',
    //   '27777' // "consumed_gas":"11262"
    // );
    // expect(contractOriginationResult['operationGroupID']).to.exist;

    // **** THIS WILL SHOW THE ERRORS RETURNED FROM THE BLOCKCHAIN
    // console.log(
    //   contractOriginationResult.results.contents[0].metadata['operation_result']
    //     .errors
    // );

    //     console.log('+++++Originating an account with 1 tez');
    //     const originationResult = await TezosOperations.sendOriginationOperation(
    //       tezosURL,
    //       fundraiserKeys,
    //       20000000,
    //       randomBakerAddress1,
    //       true,
    //       true,
    //       2000000, // Protocol 003 minimum fee is 1377 for originations
    //       invalidDerivationPath
    //     );
    //     console.log('ORIGINATION RESULT', originationResult);
    //     // expect(originationResult.operationGroupID).to.exist;

    //     sleep(33);

    //     /*
    //         // Comment out this section in the FIRST run
    //         // Activate this section in the SECOND run.
    //         // Set delegatedKeyStore.publicKeyHash to the newly originated KT1 address before starting the SECOND run.
    // */
    //     let delegatedKeyStore = randomKeys;
    //     //delegatedKeyStore.publicKeyHash = 'KT1RiR3A1nkcZuHEXSUb97SwEMxMGF39GTZq';

    //     console.log('+++++Sending delegation operation');
    //     const delegationResult = await TezosOperations.sendDelegationOperation(
    //       tezosURL,
    //       delegatedKeyStore,
    //       randomBakerAddress2,
    //       2000000, // Protocol 003 minimum fee is 1100 for delegations
    //       invalidDerivationPath
    //     );
    //     expect(delegationResult.operationGroupID).to.exist;
    //     console.log('DELEGATION RESULT', delegationResult);

    //     sleep(33);
  });
});
