// Most unit tests are commented out as they can only be run one by one with delays.
// Uncomment specific unit tests to test specific operation logic.
import { expect } from "chai";
import { TezosNodeWriter } from "../src";
import * as TezosMessageCodec from "../src/chain/tezos/TezosMessageCodec";
import "mocha";
import { servers } from "./servers";
import { TezosWalletUtil } from "../src";
import { KeyStore } from "../src/types/wallet/KeyStore";

const tezosURL = servers.tezosServer;

//Software tezos operations do not require a valid derivation path
const invalidDerivationPath = "ighiehgieh";

function sleep(seconds) {
  const e = new Date().getTime() + seconds * 1000;
  while (new Date().getTime() <= e) {}
}

describe("Tezos operation functions", () => {
  it("successfully perform operations on a new identity", async () => {
    const fundraiserKeys = <KeyStore>(
      await TezosWalletUtil.unlockFundraiserIdentity(
        "major cannon mistake disorder bachelor depart jazz pudding worry attract scrap element uncover tide jump",
        "vttufpvh.xgbzugwn@tezos.example.org",
        "Wz41fjtUHJ",
        "tz1bwsWk3boyGgXf3u7CJGZSTfe14djdRtxG"
      )
    );

    const fundraiserKeySecret = "6da483843eba2526ea6d2c08aa39dd00efa99521";

    const mnemonic = await TezosWalletUtil.generateMnemonic();
    const randomKeys = <KeyStore>(
      await TezosWalletUtil.unlockIdentityWithMnemonic(mnemonic, "")
    );
    const inactiveImplicitAddress = randomKeys.publicKeyHash;
    const anActiveImplicitAddress = "tz1is75whxxkVvw2cF2FuRo5ANxZwwJ5nEbc";
    const randomDelegatedAddress = "KT1N5t39Lw7zivvgBN9HJJzUuk64GursRzyc";
    const randomBakerAddress1 = "tz1UmPE44pqWrEgW8sTRs6ED1DgwF7k43ncQ";
    const randomBakerAddress2 = "tz1boot2oCjTjUN6xDNoVmtCLRdh8cc92P1u";
    const randomBakerAddress3 = 'tz1YCABRTa6H8PLKx2EtDWeCGPaKxUhNgv47'; //alphanet
    sleep(33);

    const contractCode = "parameter string; storage string; code {CAR; NIL operation; PAIR;};"
    const contractStorage = `"hello"`
    //const codeJSON = michelsonScriptToJson(contractCode);
    //const storageJSON = michelsonToJson(contractStorage);
    /*
    console.log('+++++Originating a contract from manager address');
    const contractOriginationResult = await TezosNodeWriter.sendContractOriginationOperation(
      tezosURL,
      fundraiserKeys,
      2000000,
      randomBakerAddress3,
      true,
      true,
      200000, // Protocol 003 minimum fee is 1377 for originations
      invalidDerivationPath,
      '10160',
      '27777',
      contractCode,  // Change to code: codeJSON
      contractStorage, // Change to storage: storageJSON
    );
    expect(contractOriginationResult['operationGroupID']).to.exist;

    */
    // **** THIS WILL SHOW THE ERRORS RETURNED FROM THE BLOCKCHAIN
    // console.log(
    //   contractOriginationResult.results.contents[0].metadata['operation_result']
    //     .errors
    // );

    const contractInvocationResult = await TezosNodeWriter.sendContractInvocationOperation(
      tezosURL,
      fundraiserKeys,
      "KT1Wb4LE19jCNDuhp8Md7YpEDYmW9rhLTHsW",
      100000, // Amount sent
      100000, // Protocol 003 minimum fee for inactive implicit accounts is 1387
      invalidDerivationPath,
      "1000", // Storage Limit
      "100000", // Gas Limit
      { string: "Cryptonomicon" }
    );
    expect(contractInvocationResult["operationGroupID"]).to.exist;

    console.log('+++++Originating an account with contract');
    const originationResult = await TezosNodeWriter.sendContractOriginationOperation(
           tezosURL,
           fundraiserKeys,
           20000000,
           randomBakerAddress1,
           true,
           true,
           2000000, // Protocol 003 minimum fee is 1377 for originations
           invalidDerivationPath,
           "500000",
           "500000",
           `parameter string;
           storage string;
           code {CAR; NIL operation; PAIR;};`,
           "storage: before;"
         );
    console.log('ORIGINATION RESULT', originationResult);
    expect(originationResult.operationGroupID).to.exist;
  });
});
