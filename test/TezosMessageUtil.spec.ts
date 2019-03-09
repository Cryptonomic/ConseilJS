import { expect } from 'chai';
import { TezosMessageUtils } from '../src/chain/tezos/TezosMessageUtil';
import 'mocha';

describe('Tezos P2P message codec helper tests', () => {
  it('test address read functions', () => {
    let result = TezosMessageUtils.readAddress('0142b419240509ddacd12839700b7f720b4aa55e4e00');
    expect(result).to.equal('KT1EfTusMLoeCAAGd9MZJn5yKzFr6kJU5U91');

    result = TezosMessageUtils.readAddressWithHint(Buffer.from('42b419240509ddacd12839700b7f720b4aa55e4e', 'hex'), 'kt1');
    expect(result).to.equal('KT1EfTusMLoeCAAGd9MZJn5yKzFr6kJU5U91');

    result = TezosMessageUtils.readAddress('000083846eddd5d3c5ed96e962506253958649c84a74');
    expect(result).to.equal('tz1XdRrrqrMfsFKA8iuw53xHzug9ipr6MuHq');

    result = TezosMessageUtils.readAddressWithHint(Buffer.from('83846eddd5d3c5ed96e962506253958649c84a74', 'hex'), 'tz1');
    expect(result).to.equal('tz1XdRrrqrMfsFKA8iuw53xHzug9ipr6MuHq');

    result = TezosMessageUtils.readAddressWithHint(Buffer.from('2fcb1d9307f0b1f94c048ff586c09f46614c7e90', 'hex'), 'tz2');
    expect(result).to.equal('tz2Cfwk4ortcaqAGcVJKSxLiAdcFxXBLBoyY');

    result = TezosMessageUtils.readAddress('0002193b2b3f6b8f8e1e6b39b4d442fc2b432f6427a8');
    expect(result).to.equal('tz3NdTPb3Ax2rVW2Kq9QEdzfYFkRwhrQRPhX');

    result = TezosMessageUtils.readAddressWithHint(Buffer.from('193b2b3f6b8f8e1e6b39b4d442fc2b432f6427a8', 'hex'), 'tz3');
    expect(result).to.equal('tz3NdTPb3Ax2rVW2Kq9QEdzfYFkRwhrQRPhX');
  });

  it('test address write functions', () => {
    let result = TezosMessageUtils.writeAddress('tz1Y68Da76MHixYhJhyU36bVh7a8C9UmtvrR');
    expect(result).to.equal('00008890efbd6ca6bbd7771c116111a2eec4169e0ed8');

    result = TezosMessageUtils.writeAddress('tz2LBtbMMvvguWQupgEmtfjtXy77cHgdr5TE');
    expect(result).to.equal('0001823dd85cdf26e43689568436e43c20cc7c89dcb4');

    result = TezosMessageUtils.writeAddress('tz3e75hU4EhDU3ukyJueh5v6UvEHzGwkg3yC');
    expect(result).to.equal('0002c2fe98642abd0b7dd4bc0fc42e0a5f7c87ba56fc');

    result = TezosMessageUtils.writeAddress('tz3e75hU4EhDU3ukyJueh5v6UvEHzGwkg3yC');
    expect(result).to.equal('0002c2fe98642abd0b7dd4bc0fc42e0a5f7c87ba56fc');

    result = TezosMessageUtils.writeAddress('KT1NrjjM791v7cyo6VGy7rrzB3Dg3p1mQki3');
    expect(result).to.equal('019c96e27f418b5db7c301147b3e941b41bd224fe400');
  });

  it('test boolean write function', () => {
    let result = TezosMessageUtils.writeBoolean(false);
    expect(result).to.equal('00');

    result = TezosMessageUtils.writeBoolean(true);
    expect(result).to.equal('ff');
  });

  it('test boolean read function', () => {
    let result = TezosMessageUtils.readBoolean('00');
    expect(result).to.equal(false);

    result = TezosMessageUtils.readBoolean('ff');
    expect(result).to.equal(true);
  });

  it('test int read function', () => {
    let result = TezosMessageUtils.readInt('05');
    expect(result).to.equal(5);

    result = TezosMessageUtils.readInt('1e');
    expect(result).to.equal(30);

    result = TezosMessageUtils.readInt('fe1f');
    expect(result).to.equal(4094);
  });

  it('test int write function', () => {
    let result = TezosMessageUtils.writeInt(7);
    expect(result).to.equal('07');

    result = TezosMessageUtils.writeInt(32);
    expect(result).to.equal('20');

    result = TezosMessageUtils.writeInt(4096);
    expect(result).to.equal('8020');
  });

  it('test int read function', () => {
    let result = TezosMessageUtils.findInt('d3dade57fae2', 0);

    expect(result.value).to.equal(184003923);
    expect(result.length).to.equal(8);
  });

  it("test various parsing and encoding failures", () => {
    expect(() => TezosMessageUtils.readAddress('c0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffee')).to.throw('Unrecognized address type');
    expect(() => TezosMessageUtils.readAddress('c0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ff')).to.throw('Incorrect hex length to parse an address');
    expect(() => TezosMessageUtils.readAddressWithHint(Buffer.from('c0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffee', 'hex'), 'zz9')).to.throw('Unrecognized address hint, \'zz9\'');
    expect(() => TezosMessageUtils.readPublicKey('c0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffee')).to.throw('Unrecognized key type');
    expect(() => TezosMessageUtils.readPublicKey('c0ffee')).to.throw('Incorrect hex length, 6 to parse a key');
    expect(() => TezosMessageUtils.writePublicKey('c0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffee')).to.throw('Unrecognized key type');
    expect(() => TezosMessageUtils.readKeyWithHint(Buffer.from('c0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffee', 'hex'), 'kkkk')).to.throw('Unrecognized key hint, \'kkkk\'');
    expect(() => TezosMessageUtils.writeKeyWithHint('c0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffee', 'kkkk')).to.throw('Unrecognized key hint, \'kkkk\'');
    expect(() => TezosMessageUtils.readKeyWithHint(Buffer.from('c0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffee', 'hex'), 'sssss')).to.throw('Unrecognized key hint, \'sssss\'');
    expect(() => TezosMessageUtils.readBufferWithHint(Buffer.from('c0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffee', 'hex'), 'bb')).to.throw('Unsupported hint, \'bb\'');
    expect(() => TezosMessageUtils.readBranch('c0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ff')).to.throw('Incorrect hex length to parse a branch hash');
    expect(() => TezosMessageUtils.readSignatureWithHint(Buffer.from('c0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ff', 'hex'), '')).to.throw('Unrecognized signature hint, \'\'');
  });
});

