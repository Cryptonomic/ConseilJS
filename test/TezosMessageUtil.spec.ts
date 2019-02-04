import { expect } from "chai";
import { TezosMessageUtils } from "../src/chain/tezos/TezosMessageUtil";
import "mocha";

describe("Tezos P2P message codec helper tests", () => {
  it("test address read functions", () => {
    let result = TezosMessageUtils.readAddress("0142b419240509ddacd12839700b7f720b4aa55e4e00");
    expect(result).to.equal("KT1EfTusMLoeCAAGd9MZJn5yKzFr6kJU5U91");

    result = TezosMessageUtils.readAddress("000083846eddd5d3c5ed96e962506253958649c84a74");
    expect(result).to.equal("tz1XdRrrqrMfsFKA8iuw53xHzug9ipr6MuHq");

    result = TezosMessageUtils.readAddress("0002193b2b3f6b8f8e1e6b39b4d442fc2b432f6427a8");
    expect(result).to.equal("tz3NdTPb3Ax2rVW2Kq9QEdzfYFkRwhrQRPhX");
  });

  it("test boolean write function", () => {
    let result = TezosMessageUtils.writeBoolean(false);
    expect(result).to.equal("00");

    result = TezosMessageUtils.writeBoolean(true);
    expect(result).to.equal("ff");
  });

  it("test address write functions", () => {
    let result = TezosMessageUtils.writeAddress("tz1Y68Da76MHixYhJhyU36bVh7a8C9UmtvrR");
    expect(result).to.equal("00008890efbd6ca6bbd7771c116111a2eec4169e0ed8");

    result = TezosMessageUtils.writeAddress("tz2LBtbMMvvguWQupgEmtfjtXy77cHgdr5TE");
    expect(result).to.equal("0001823dd85cdf26e43689568436e43c20cc7c89dcb4");

    result = TezosMessageUtils.writeAddress("tz3e75hU4EhDU3ukyJueh5v6UvEHzGwkg3yC");
    expect(result).to.equal("0002c2fe98642abd0b7dd4bc0fc42e0a5f7c87ba56fc");

    result = TezosMessageUtils.writeAddress("tz3e75hU4EhDU3ukyJueh5v6UvEHzGwkg3yC");
    expect(result).to.equal("0002c2fe98642abd0b7dd4bc0fc42e0a5f7c87ba56fc");

    result = TezosMessageUtils.writeAddress("KT1NrjjM791v7cyo6VGy7rrzB3Dg3p1mQki3");
    expect(result).to.equal("019c96e27f418b5db7c301147b3e941b41bd224fe400");
  });

  it("fail unsupported address types", () => {
    expect(() => TezosMessageUtils.readAddress("c0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffee")).to.throw("Unrecognized address type");
  });
});
