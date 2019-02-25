import { expect } from "chai";
import { TezosMessageCodec } from "../src/chain/tezos/TezosMessageCodec";
import { Operation } from "../src/types/tezos/TezosChainTypes";
import "mocha";

describe("Tezos P2P message decoder test suite", () => {
  it("correctly parse a transaction (send from tz1 to tz1)", () => {
    const result = TezosMessageCodec.parseOperationGroup("86a093501b90e0762f58b15e63c2211827c513fa684554fb833ad8b5fac7d30a0800009fcc83e722c9d9f7a150555e632e6e0f97bfc29bc0843dcf78bc50ac0280897a00006e747386822673001b03dca0eff6cebf7c9cd6e400");

    expect(result[0].kind).to.equal("transaction");
    expect(result[0].source).to.equal("tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2");
    expect(result[0].destination).to.equal("tz1Vi4XPxnKqjN2aS13TY6aAjZvnqmvx8TgH");
    expect(result[0].amount).to.equal('2000000'); // microtez
    expect(result[0].fee).to.equal('1000000'); // microtez
    expect(result[0].gas_limit).to.equal('10300'); // microtez
    expect(result[0].storage_limit).to.equal('300'); // microtez*/
    expect(result[0].counter).to.equal('15439');
  });

  it("correctly parse a transaction (send from kt1 to tz2)", () => {
    const result = TezosMessageCodec.parseOperationGroup("e36fb667c53c97102a0c9ecd55f5222b347bc843bbaf419daf0d990426cd53650801e0820a36f5e26fcd952f1acc08b2b1c974c23b1e00c0843d03bc50ac0280897a000154f5d8f71ce18f9f05bb885a4120e64c667bc1b400");

    expect(result[0].kind).to.equal("transaction");
    expect(result[0].source).to.equal("KT1V3ri4nnNQTsG52ypMQhZsnZpJEDi6gB4J");
    expect(result[0].destination).to.equal("tz2G4TwEbsdFrJmApAxJ1vdQGmADnBp95n9m");
    expect(result[0].amount).to.equal('2000000'); // microtez
    expect(result[0].fee).to.equal('1000000'); // microtez
    expect(result[0].gas_limit).to.equal('10300'); // microtez
    expect(result[0].storage_limit).to.equal('300'); // microtez*/
    expect(result[0].counter).to.equal('3');
  });

  it("correctly parse a reveal", () => {
    let forgedReveal = "97648f6470b21f904cb8d11eaf097f245eb42f5073fa51404d969cdfd4a4579e07000069ef8fb5d47d8a4321c94576a2316a632be8ce890094fe19904e00004c7b0501f6ea08f472b7e88791d3b8da49d64ac1e2c90f93c27e6531473305c6";
    const result = TezosMessageCodec.parseReveal(forgedReveal);
    expect(result.operation.kind).to.equal("reveal");
    expect(result.operation.source).to.equal("tz1VJAdH2HRUZWfohXW59NPYQKFMe1csroaX");
    expect(result.operation.fee).to.equal('0'); // microtez
    expect(result.operation.gas_limit).to.equal('10000'); // microtez
    expect(result.operation.storage_limit).to.equal('0'); // microtez
  });

  it("correctly encode a reveal operation", () => {
    let reveal: Operation = {
      kind: "reveal",
      source: "tz1VJAdH2HRUZWfohXW59NPYQKFMe1csroaX",
      fee: "0",
      counter: "425748",
      storage_limit: "0",
      gas_limit: "10000",
      public_key: "edpkuDuXgPVJi3YK2GKL6avAK3GyjqyvpJjG9gTY5r2y72R7Teo65i"
    };

    const result = TezosMessageCodec.encodeReveal(reveal);
    expect(result).to.equal("07000069ef8fb5d47d8a4321c94576a2316a632be8ce890094fe19904e00004c7b0501f6ea08f472b7e88791d3b8da49d64ac1e2c90f93c27e6531473305c6");
  });

  it("correctly parse a reveal/transaction operation group", () => {
    const result = TezosMessageCodec.parseOperationGroup("7571d2132243697e5bf1d869f4393ec7f45748fc2ba837ffe610c7687b393df10700009fcc83e722c9d9f7a150555e632e6e0f97bfc29b00cd78904e0000e209ae552a19919430ee0e348de437e820bb86fc4c59a5743eb4a7f21e037b3c0800009fcc83e722c9d9f7a150555e632e6e0f97bfc29bc0843dce78bc50ac0280897a0106bca459c3521c6b2e25f1a2143035d28faade8d0000");

    expect(result[0].kind).to.equal("reveal");
    expect(result[0].source).to.equal("tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2");
    expect(result[0].public_key).to.equal("edpkvMmmaxdUNWmxvnRUqbBfcdLLmANe4TUWucrE2GN75E4wMXUgJa");
    expect(result[0].fee).to.equal('0'); // microtez
    expect(result[0].gas_limit).to.equal('10000'); // microtez
    expect(result[0].storage_limit).to.equal('0'); // microtez
    expect(result[0].counter).to.equal('15437');

    expect(result[1].kind).to.equal("transaction");
    expect(result[1].source).to.equal("tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2");
    expect(result[1].destination).to.equal("KT19CPbzVD6MnpatJSKDWR1uShEtsqrHhqvx");
    expect(result[1].amount).to.equal("2000000"); // microtez
    expect(result[1].fee).to.equal('1000000'); // microtez
    expect(result[1].gas_limit).to.equal('10300'); // microtez
    expect(result[1].storage_limit).to.equal('300'); // microtez
    expect(result[1].counter).to.equal('15438');
  });

  it("correctly parse an origination", () => {
    let forgedOrigination = "c98677a5ad30a181889ad0325b5ce4b32d288e2d0397eac9391e20de1ec816f20900009fcc83e722c9d9f7a150555e632e6e0f97bfc29bc0843dd078b04f9502009fcc83e722c9d9f7a150555e632e6e0f97bfc29b8080897affffff006e747386822673001b03dca0eff6cebf7c9cd6e400";
    const result = TezosMessageCodec.parseOperation(forgedOrigination, 'origination');
    expect(result.operation.kind).to.equal("origination");
    expect(result.operation.source).to.equal("tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2");
    expect(result.operation.managerPubkey).to.equal("tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2");
    expect(result.operation.script).to.undefined;
    expect(result.operation.balance).to.equal('256000000'); // microtez
    expect(result.operation.spendable).to.equal(true);
    expect(result.operation.delegatable).to.equal(true);
    expect(result.operation.delegate).to.equal("tz1Vi4XPxnKqjN2aS13TY6aAjZvnqmvx8TgH");
    expect(result.operation.fee).to.equal('1000000'); // microtez
    expect(result.operation.gas_limit).to.equal('10160'); // microtez
    expect(result.operation.storage_limit).to.equal('277'); // microtez
    expect(result.operation.counter).to.equal('15440');
  });

  it("correctly parse an origination with contract", () => {
    let forgedOrigination = "0f9c939d51f90e9435fe2f466058eed68cd7f0624ff439136dfe2dcc3139391c090000b2e1d673031ec0711eacb822cbca4ce95f1e3c0ac09a0c890581d901b04f00b2e1d673031ec0711eacb822cbca4ce95f1e3c0a80897affffff00641d2f258a7fafe9cf1f18720a14dfadba9adb0eff0000001c02000000170500036805010368050202000000080316053d036d03420000000a010000000568656c6c6f15f3cff9210c5287e91a2a9ba65871ed83b7c784ecf42419aa03c7bef02e50cd7916e228f15418ca74b7bb12d42f64cd9dac7e978173ff1360ff4dc7ca7bb501";
    const result = TezosMessageCodec.parseOrigination(forgedOrigination);
    expect(result.operation.kind).to.equal("origination");
    expect(result.operation.source).to.equal("tz1bwsWk3boyGgXf3u7CJGZSTfe14djdRtxG");
    expect(result.operation.managerPubkey).to.equal("tz1bwsWk3boyGgXf3u7CJGZSTfe14djdRtxG");
    expect(result.operation.script).to.exist;
    expect(result.operation.balance).to.equal('2000000'); // microtez
    expect(result.operation.spendable).to.equal(true);
    expect(result.operation.delegatable).to.equal(true);
    expect(result.operation.delegate).to.equal("tz1UmPE44pqWrEgW8sTRs6ED1DgwF7k43ncQ");
    expect(result.operation.fee).to.equal('200000'); // microtez
    expect(result.operation.gas_limit).to.equal('27777'); // microtez
    expect(result.operation.storage_limit).to.equal('10160'); // microtez
    expect(result.operation.counter).to.equal('649');
  });

  it("correctly parse a delegation ", () => {
    let forgedDelegtion = "a76af8bde55501f677bfff412d59dd21a91606f47459288476a6e947766d0e8c0a0180be2031715ea183848c08e2ff59d62e7d255ae500a0c21e03904e00ff00b15b7a2484464ed3228c0ae23d0391f8269de3da";
    const result = TezosMessageCodec.parseDelegation(forgedDelegtion);
    expect(result.operation.kind).to.equal("delegation");
    expect(result.operation.source).to.equal("KT1LKVpVJGP2Rfg4GznEJLcDEoetibs93GvM");
    expect(result.operation.delegate).to.equal("tz1boot1pK9h2BVGXdyvfQSv8kd1LQM6H889");
    expect(result.operation.fee).to.equal('500000'); // microtez
    expect(result.operation.gas_limit).to.equal('10000'); // microtez
    expect(result.operation.storage_limit).to.equal('0'); // microtez
    expect(result.operation.counter).to.equal('3');
  });

  it("correctly parse a reveal/delegation OperationGroup", () => {
    const result = TezosMessageCodec.parseOperationGroup("1ee2414a88e8d64f087464c2706a4031b32f55ee5e52178b9cc39dce3c436d080701e0820a36f5e26fcd952f1acc08b2b1c974c23b1e000001904e0000e209ae552a19919430ee0e348de437e820bb86fc4c59a5743eb4a7f21e037b3c0a01e0820a36f5e26fcd952f1acc08b2b1c974c23b1e00c0843d02904e00ff026fde46af0356a0476dae4e4600172dc9309b3aa4");

    expect(result[0].kind).to.equal("reveal");
    expect(result[0].source).to.equal("KT1V3ri4nnNQTsG52ypMQhZsnZpJEDi6gB4J");
    expect(result[0].public_key).to.equal("edpkvMmmaxdUNWmxvnRUqbBfcdLLmANe4TUWucrE2GN75E4wMXUgJa");
    expect(result[0].fee).to.equal('0'); // microtez
    expect(result[0].gas_limit).to.equal('10000'); // microtez
    expect(result[0].storage_limit).to.equal('0'); // microtez
    expect(result[0].counter).to.equal('1');

    expect(result[1].kind).to.equal("delegation");
    expect(result[1].source).to.equal("KT1V3ri4nnNQTsG52ypMQhZsnZpJEDi6gB4J");
    expect(result[1].delegate).to.equal("tz3WXYtyDUNL91qfiCJtVUX746QpNv5i5ve5");
    expect(result[1].fee).to.equal('1000000'); // microtez
    expect(result[1].gas_limit).to.equal('10000'); // microtez
    expect(result[1].storage_limit).to.equal('0'); // microtez
    expect(result[1].counter).to.equal('2');
  });

  it("fail unsupported operation types", () => {
    expect(() => TezosMessageCodec.parseOperation("c0ffee", "endorsement", true)).to.throw("Unsupported operation type: endorsement");
    expect(() => TezosMessageCodec.parseOperation("c0ffee", "seedNonceRevelation", true)).to.throw("Unsupported operation type: seedNonceRevelation");
    expect(() => TezosMessageCodec.parseOperation("c0ffee", "doubleEndorsementEvidence", true)).to.throw("Unsupported operation type: doubleEndorsementEvidence");
    expect(() => TezosMessageCodec.parseOperation("c0ffee", "doubleBakingEvidence", true)).to.throw("Unsupported operation type: doubleBakingEvidence");
    expect(() => TezosMessageCodec.parseOperation("c0ffee", "accountActivation", true)).to.throw("Unsupported operation type: accountActivation");
    expect(() => TezosMessageCodec.parseOperation("c0ffee", "proposal", true)).to.throw("Unsupported operation type: proposal");
    expect(() => TezosMessageCodec.parseOperation("c0ffee", "ballot", true)).to.throw("Unsupported operation type: ballot");
    expect(() => TezosMessageCodec.parseOperation("c0ffee", "invalid", true)).to.throw("Unsupported operation type: invalid");
  });
});
