import { expect } from 'chai';
import { TezosLanguageUtil } from '../../../src/chain/tezos/TezosLanguageUtil';
import 'mocha';

import * as fs from 'fs';
import * as path from 'path';

describe("Tezos Micheline fragment decoding", () => {
    it('Small int', () => {
        let result = TezosLanguageUtil.hexToMicheline('0006');
        expect(result.code).to.equal('{ "int": "6" }');

        result = TezosLanguageUtil.hexToMicheline('0046');
        expect(result.code).to.equal('{ "int": "-6" }');

        result = TezosLanguageUtil.hexToMicheline('003f');
        expect(result.code).to.equal('{ "int": "63" }');

        result = TezosLanguageUtil.hexToMicheline('007f');
        expect(result.code).to.equal('{ "int": "-63" }');
    });

    it('Medium int', () => {
        let result = TezosLanguageUtil.hexToMicheline('00a101');
        expect(result.code).to.equal('{ "int": "97" }');

        result = TezosLanguageUtil.hexToMicheline('00ff01');
        expect(result.code).to.equal('{ "int": "-127" }');

        result = TezosLanguageUtil.hexToMicheline('00840e');
        expect(result.code).to.equal('{ "int": "900" }');

        result = TezosLanguageUtil.hexToMicheline('00c40e');
        expect(result.code).to.equal('{ "int": "-900" }');
    });

    it('Large int', () => {
        let result = TezosLanguageUtil.hexToMicheline('00ba9af7ea06');
        expect(result.code).to.equal('{ "int": "917431994" }');

        result = TezosLanguageUtil.hexToMicheline('00fa9af7ea06');
        expect(result.code).to.equal('{ "int": "-917431994" }');

        result = TezosLanguageUtil.hexToMicheline('00a1d22c');
        expect(result.code).to.equal('{ "int": "365729" }');

        result = TezosLanguageUtil.hexToMicheline('00e1d22c');
        expect(result.code).to.equal('{ "int": "-365729" }');

        result = TezosLanguageUtil.hexToMicheline('0080f9b9d4c723');
        expect(result.code).to.equal('{ "int": "610913435200" }');

        result = TezosLanguageUtil.hexToMicheline('00c0f9b9d4c723');
        expect(result.code).to.equal('{ "int": "-610913435200" }');
    });

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

    it('Mixed literal value array', () => {
        const result = TezosLanguageUtil.hexToMicheline('02000000210061010000000574657a6f730100000000010000000b63727970746f6e6f6d6963');
        expect(result.code).to.equal('[ { "int": "-33" }, { "string": "tezos" }, { "string": "" }, { "string": "cryptonomic" } ]');
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
        const result = TezosLanguageUtil.hexToMicheline('093d00000006036d036d036d00000000');
        expect(result.code).to.equal('{ "prim": "NIL", "args": [ { "prim": "operation" }, { "prim": "operation" }, { "prim": "operation" } ] }');
    });

    it('Single primitive with more than two arguments and multiple annotations', () => {
        const result = TezosLanguageUtil.hexToMicheline('093d00000006036d036d036d00000011407265642040677265656e2040626c7565');
        expect(result.code).to.equal('{ "prim": "NIL", "args": [ { "prim": "operation" }, { "prim": "operation" }, { "prim": "operation" } ], "annots": [ "@red", "@green", "@blue" ] }');
    });

    it("test various parsing and encoding failures", () => {
        expect(() => TezosLanguageUtil.hexToMicheline('c0ffee')).to.throw('Unknown Micheline field type \'c0\'');
        expect(() => TezosLanguageUtil.hexToMicheline('c')).to.throw('Malformed Micheline fragment \'c\'');
    });

    // TODO: pending full local forging
    /*it('Serialize Michelson directly to hex', () => {
        const contract = 'parameter (list int);\nstorage (list int);\ncode { CAR; MAP { PUSH int 1; ADD }; NIL operation; PAIR };'; // add1_list
        const result = TezosLanguageUtil.translateMichelsonToHex(contract);

        expect(result).to.equal('0000001e050202000000170316053802000000080743035b00010312053d036d0342000000060501055f035b');
    });*/
});

function preProcessMicheline(code: string): string[] {
    const container = JSON.parse(code);
    let parts: string[] = [];

    parts.push(JSON.stringify(container.script[indexOfKey(container, 'code')], null, 1));
    parts.push(JSON.stringify(container.script[indexOfKey(container, 'storage')], null, 1));

    for (let i = 0; i < parts.length; i++) {
        parts[i] = TezosLanguageUtil.normalizeMichelineWhiteSpace(parts[i]);
    }

    return parts;
}

function indexOfKey(container: any, key: string): number {
    if (!!!container.script) { throw new Error('script property not found'); }

    for (let i = 0; i < container.script.length; i++) {
        if (container.script[i]['prim'] === key) { return i; }
    }
    
    throw new Error(`${key} key was not found`);
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

describe('Hex to Micheline official contract tests', async () => {
    const contractSampleRoot = 'test/chain/tezos/lexer/samples';
    const p = new Promise<string[]>((resolve, reject) => {
        fs.readdir(contractSampleRoot, function (err, items) {
            if (!!err) { reject(err); return; }
            resolve([... new Set(items.map(f => path.basename(f, path.extname(f))))]);
        });
    });
    const samples = await p;

    for (let i = 0; i < samples.length; i++) {
        const contractName = samples[i];
        if (!fs.existsSync(`${contractSampleRoot}/${contractName}.micheline`)) { continue; }
        it(`Hex/Micheline contract ${contractName}`, () => {
            const micheline = fs.readFileSync(`${contractSampleRoot}/${contractName}.micheline`, 'utf8');
            const hexaline = fs.readFileSync(`${contractSampleRoot}/${contractName}.hex`, 'utf8');

            const parsedMicheline = `{ "script": ${preProcessHex(hexaline).map(h => TezosLanguageUtil.hexToMicheline(h).code).join(', ')} }`;
            const expectedMicheline = `{ "script": ${preProcessMicheline(micheline).join(', ')} }`;

            expect(parsedMicheline).to.equal(expectedMicheline);
        });
    }   
});