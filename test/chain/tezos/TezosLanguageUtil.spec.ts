import { expect } from 'chai';
import { TezosLanguageUtil } from '../../../src/chain/tezos/TezosLanguageUtil';
import 'mocha';

describe("Tezos P2P message Micheline decoding", () => {
  it('Small int', () => {
    const result = TezosLanguageUtil.hexToMicheline('0006');
    expect(result.code).to.equal('{ "int": "6" }');
  });

  it('Large int', () => {
    const result = TezosLanguageUtil.hexToMicheline('00facdbbb503');
    expect(result.code).to.equal('{ "int": "917432058" }');
  });

  //TODO: negtive number

  it('string', () => {
    const result = TezosLanguageUtil.hexToMicheline('01000000096d696368656c696e65');
    expect(result.code).to.equal('{ "string": "micheline" }');
  });

  it('empty string', () => {
    const result = TezosLanguageUtil.hexToMicheline('0100000000');
    expect(result.code).to.equal('{ "string": "" }');
  });

  it('Mixed static value array', () => {
    const result = TezosLanguageUtil.hexToMicheline('02000000210061010000000574657a6f730100000000010000000b63727970746f6e6f6d6963');
    expect(result.code).to.equal('[ { "int": "97" }, { "string": "tezos" }, { "string": "" }, { "string": "cryptonomic" } ]');
  });

  it('Bare primitive', () => {
    const result = TezosLanguageUtil.hexToMicheline('0343');
    expect(result.code).to.equal('{ "prim": "PUSH" }');
  });

  it('Single primitive with a single annotation', () => {
    const result = TezosLanguageUtil.hexToMicheline('04430000000440636261');
    expect(result.code).to.equal('{ "prim": "PUSH", "annots": [ "@cba" ] }');
  });

  it('Single primitive with a single argument', () => {
    const result = TezosLanguageUtil.hexToMicheline('053d036d');
    expect(result.code).to.equal('{ "prim": "NIL", "args": [ { "prim": "operation" } ] }');
  });

  it('Single primitive with two arguments', () => {
    const result = TezosLanguageUtil.hexToMicheline('063d036d0000000440636261');
    expect(result.code).to.equal('{ "prim": "NIL", "args": [ { "prim": "operation" } ], "annots": [ "@cba" ] }');
  });

  it('Single primitive with two arguments', () => {
    const result = TezosLanguageUtil.hexToMicheline('073d036d036d');
    expect(result.code).to.equal('{ "prim": "NIL", "args": [ { "prim": "operation" }, { "prim": "operation" } ] }');
  });

  it('Single primitive with two arguments and annotation', () => {
    const result = TezosLanguageUtil.hexToMicheline('083d036d036d0000000440636261');
    expect(result.code).to.equal('{ "prim": "NIL", "args": [ { "prim": "operation" }, { "prim": "operation" } ], "annots": [ "@cba" ] }');
  });

  it('Single primitive with more than two arguments and no annotations', () => {
    const result = TezosLanguageUtil.hexToMicheline('093d036d036d036d00000000');
    expect(result.code).to.equal('{ "prim": "NIL", "args": [ { "prim": "operation" }, { "prim": "operation" }, { "prim": "operation" } ] }');
  });

  it('Single primitive with more than two arguments and multiple annotations', () => {
    const result = TezosLanguageUtil.hexToMicheline('093d036d036d036d00000011407265642040677265656e2040626c7565');
    expect(result.code).to.equal('{ "prim": "NIL", "args": [ { "prim": "operation" }, { "prim": "operation" }, { "prim": "operation" }, "annots": [ "@red", "@green", "@blue" ] } ] }');
  });

  it("test various parsing and encoding failures", () => {
    expect(() => TezosLanguageUtil.hexToMicheline('c0ffee')).to.throw('Unknown Micheline field type c0');
  });
});