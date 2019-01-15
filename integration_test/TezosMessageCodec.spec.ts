// Most unit tests are commented out as they can only be run one by one with delays.
// Uncomment specific unit tests to test specific operation logic.
import { expect } from "chai";
import { TezosOperations } from "../src";
import { TezosMessageCodec } from "../src/tezos/TezosMessageCodec";
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

describe("signOperationGroup() and computeOperationHash()", () => {
  it("correctly forges a transaction from binary", async () => {
    let forgedTransaction =
      "9cd3aa823667cd8223073d2447c4c012373c99a00df5112b502ee82f5cf95ae408000069ef8fb5d47d8a4321c94576a2316a632be8ce898094ebdc039cfe19bc50ac0280a0c21e00004783ca75ac8736021036aa5ff2a69f116eca759800";
    const result = TezosMessageCodec.parseTransaction(forgedTransaction);
    expect(result.type).to.equal("transaction");
    expect(result.source).to.equal("tz1VJAdH2HRUZWfohXW59NPYQKFMe1csroaX");
    expect(result.target).to.equal("tz1SAAYjCwU5TGHZkigrG8iFSm3uhN2hHzfp");
    expect(result.amount).to.equal(64000000); // microtez
    expect(result.fee).to.equal(1000000000); // microtez
    expect(result.gas).to.equal(10300);
    expect(result.storage).to.equal(300);
  });
});
