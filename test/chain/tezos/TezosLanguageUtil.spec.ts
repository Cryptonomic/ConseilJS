import { expect } from 'chai';
import { TezosLanguageUtil } from '../../../src/chain/tezos/TezosLanguageUtil';
import { TezosMessageUtils } from '../../../src/chain/tezos/TezosMessageUtil';
import 'mocha';

import * as fs from 'fs';
import * as path from 'path';

describe("Tezos Micheline fragment decoding", () => {
  it('Small int', () => {
    const result = TezosLanguageUtil.hexToMicheline('0006');
    expect(result.code).to.equal('{ "int": "6" }');
  });

  it('Large int', () => {
    let result = TezosLanguageUtil.hexToMicheline('00facdbbb503').code;
    expect(result).to.equal('{ "int": "917432058" }');
    result = TezosMessageUtils.readInt('facdbbb503') + '';
    expect(result).to.equal('917432058');

    result = TezosLanguageUtil.hexToMicheline('008084af5f').code;
    expect(result).to.equal('{ "int": "200000000" }');
    result = TezosMessageUtils.readInt('8084af5f') + '';
    expect(result).to.equal('200000000');
  });

  //TODO: negative number

  it('string', () => {
    const result = TezosLanguageUtil.hexToMicheline('01000000096d696368656c696e65');
    expect(result.code).to.equal('{ "string": "micheline" }');
  });

  it('empty string', () => {
    const result = TezosLanguageUtil.hexToMicheline('0100000000');
    expect(result.code).to.equal('{ "string": "" }');
  });

  it('bytes', () => {
    const result = TezosLanguageUtil.hexToMicheline('0a000000080123456789abcdef');
    expect(result.code).to.equal('{ "bytes": "0123456789abcdef" }');
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

function preProcessMicheline(code: string): string[] {
    const container = JSON.parse(code);
    let parts: string[] = [];

    parts.push(JSON.stringify(container.script[2], null, 1)); // code
    parts.push(JSON.stringify(container.script[1], null, 1)); // storage

    for (let i = 0; i < parts.length; i++) {
        parts[i] = normalizeWhiteSpace(parts[i]);
    }

    return parts;
}

function preProcessHex(hex: string): string[] {
    let parts: string[] = [];

    let offset = 0;
    while (offset < hex.length) {
        let partlength = parseInt(hex.substring(offset, offset + 8), 16) * 2;
        offset += 8;
        parts.push(hex.substring(offset, offset + partlength));
        offset += partlength;
    }

    return parts;
}

function normalizeWhiteSpace(fragment: string): string {
    return fragment.replace(/\n/g, ' ')
        .replace(/ +/g, ' ')
        .replace(/\[{/g, '[ {')
        .replace(/}\]/g, '} ]')
        .replace(/},{/g, '}, {')
        .replace(/\]}/g, '] }')
        .replace(/":"/g, '": "')
        .replace(/":\[/g, '": [');
}

describe('Micheline/hex official contract tests', async () => {
    const contractSampleRoot = 'test/chain/tezos/lexer/samples';
    const p = new Promise<string[]>((resolve, reject) => {
        fs.readdir(contractSampleRoot, function(err, items) {
            if (!!err) { reject(err); return; }
            resolve([... new Set(items.map(f => path.basename(f, path.extname(f))))]);
        });
    });
    const samples = await p;

    for (let i = 0; i < samples.length; i++) {
        const contractName = samples[i];
        if(!fs.existsSync(`${contractSampleRoot}/${contractName}.micheline`)) { continue; }
        it(`Micheline/hex contract test: ${contractName}`, () => {
            const micheline = fs.readFileSync(`${contractSampleRoot}/${contractName}.micheline`, 'utf8');
            const hexaline = fs.readFileSync(`${contractSampleRoot}/${contractName}.hex`, 'utf8');

            const parsedMicheline = `{ "script": ${preProcessHex(hexaline).map(h => TezosLanguageUtil.hexToMicheline(h).code).join(', ')} }`;
            const expectedMicheline = `{ "script": ${preProcessMicheline(micheline).join(', ')} }`;

            expect(parsedMicheline).to.equal(expectedMicheline);
        });
    }
});