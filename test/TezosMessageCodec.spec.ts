import { expect } from "chai";
import { TezosMessageCodec } from "../src/tezos/TezosMessageCodec";
import "mocha";

describe("signOperationGroup() and computeOperationHash()", () => {
  it("correctly parse a transaction from binary", () => {
    let forgedTransaction = "9cd3aa823667cd8223073d2447c4c012373c99a00df5112b502ee82f5cf95ae408000069ef8fb5d47d8a4321c94576a2316a632be8ce898094ebdc039cfe19bc50ac0280a0c21e00004783ca75ac8736021036aa5ff2a69f116eca759800";
    const result = TezosMessageCodec.parseTransaction(forgedTransaction);
    expect(result.operation.kind).to.equal("transaction");
    expect(result.operation.source).to.equal("tz1VJAdH2HRUZWfohXW59NPYQKFMe1csroaX");
    expect(result.operation.destination).to.equal("tz1SAAYjCwU5TGHZkigrG8iFSm3uhN2hHzfp");
    expect(result.operation.amount).to.equal(64000000); // microtez
    expect(result.operation.fee).to.equal(1000000000); // microtez
    expect(result.operation.gas_limit).to.equal(10300); // microtez
    expect(result.operation.storage_limit).to.equal(300); // microtez
  });

  it("correctly forges a transaction reveal from binary", () => {
    let forgedReveal = "97648f6470b21f904cb8d11eaf097f245eb42f5073fa51404d969cdfd4a4579e07000069ef8fb5d47d8a4321c94576a2316a632be8ce890094fe19904e00004c7b0501f6ea08f472b7e88791d3b8da49d64ac1e2c90f93c27e6531473305c6";
    const result = TezosMessageCodec.parseReveal(forgedReveal);
    expect(result.operation.kind).to.equal("reveal");
    expect(result.operation.source).to.equal("tz1VJAdH2HRUZWfohXW59NPYQKFMe1csroaX");
    expect(result.operation.fee).to.equal(0); // microtez
    expect(result.operation.gas_limit).to.equal(10000); // microtez
    expect(result.operation.storage_limit).to.equal(0); // microtez
  });

  it("correctly forges an operation group from binary", () => {
    let forgedGroup = "25827bef27daa0f8f0b6709bef72bbbcc76864fcaca9f892c77b16942f848acb08000069ef8fb5d47d8a4321c94576a2316a632be8ce898080897a9dfe19bc50ac028080c8d00701e7e3aecd3f15d831dee12179fc8063ccfe781e1f0000";
    const result = TezosMessageCodec.parseOperationGroup(forgedGroup);
    expect(result[0].kind).to.equal("transaction");
    expect(result[0].source).to.equal("tz1VJAdH2HRUZWfohXW59NPYQKFMe1csroaX");
    expect(result[0].destination).to.equal("KT1VitQkugUTFgMBaHbcEbwV1CjHmt5J8nFp");
    expect(result[0].amount).to.equal(2048000000); // microtez
    expect(result[0].fee).to.equal(256000000); // microtez
    expect(result[0].gas_limit).to.equal(10300); // microtez
    expect(result[0].storage_limit).to.equal(300); // microtez
  });
});
