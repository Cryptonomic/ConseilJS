import { expect } from "chai";
import { TezosMessageCodec } from "../src/tezos/TezosMessageCodec";
import "mocha";

describe("Tezos P2P message decoder test suite", () => {
  it("correctly parse a transaction", () => {
    //let forgedTransaction = "89617a7437b4d1d8ece623d744b025f3fd0686d637537b5add55dcfc5c5e1b050800008890efbd6ca6bbd7771c116111a2eec4169e0ed88c0bd9bc39bc50ac02140002c2fe98642abd0b7dd4bc0fc42e0a5f7c87ba56fc00";
    let forgedTransaction = "79114cb2e725b0bff32285c2fb1f1f5c18510eb7a5e6a71d0395ac7f001312930800008890efbd6ca6bbd7771c116111a2eec4169e0ed88c0bd9bc39bc50ac02140001823dd85cdf26e43689568436e43c20cc7c89dcb400";
    const result = TezosMessageCodec.parseTransaction(forgedTransaction);
    console.log(result);
    /*expect(result.operation.kind).to.equal("transaction");
    expect(result.operation.source).to.equal("tz1VJAdH2HRUZWfohXW59NPYQKFMe1csroaX");
    expect(result.operation.destination).to.equal("tz1SAAYjCwU5TGHZkigrG8iFSm3uhN2hHzfp");
    expect(result.operation.amount).to.equal('64000000'); // microtez
    expect(result.operation.fee).to.equal('1000000000'); // microtez
    expect(result.operation.gas_limit).to.equal('10300'); // microtez
    expect(result.operation.storage_limit).to.equal('300'); // microtez*/
  });
});