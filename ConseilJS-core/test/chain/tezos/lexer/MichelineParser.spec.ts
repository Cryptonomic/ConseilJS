import 'mocha';
import { expect } from 'chai';

import * as Micheline from '../../../../src/chain/tezos/lexer/Micheline';
import * as nearley from 'nearley';
import * as fs from 'fs';
import * as path from 'path';
import glob from 'glob';

import { TezosLanguageUtil } from '../../../../src/chain/tezos/TezosLanguageUtil';

describe('Micheline binary encoding tests', () => {
    it('parse a literal int', () => {
        const result = TezosLanguageUtil.translateMichelineToHex('{ "int": "42" }');
        expect(result).to.equal('002a');
    });

    it('parse a large literal int', () => {
        let result = TezosLanguageUtil.translateMichelineToHex('{ "int": "976146032" }');
        expect(result).to.equal('00b0b9f6a207');

        result = TezosLanguageUtil.translateMichelineToHex('{ "int": "200000000" }');
        expect(result).to.equal('008088debe01');

        result = TezosLanguageUtil.translateMichelineToHex('{ "int": "-897900" }');
        expect(result).to.equal('00eccd6d');
    });

    it('parse a literal string', () => {
        const result = TezosLanguageUtil.translateMichelineToHex('{ "string" : "abc" }');
        expect(result).to.equal('0100000003616263');
    });

    it('parse a literal array', () => {
        const result = TezosLanguageUtil.translateMichelineToHex('[ { "int" : "42" }, { "string": "abc" }, { "string": "def" } ]');
        expect(result).to.equal('0200000012002a01000000036162630100000003646566');
    });

    it('parse stand-alone primitive', () => {
        const result = TezosLanguageUtil.translateMichelineToHex('{ "prim": "PUSH" }');
        expect(result).to.equal('0343');
    });

    it('parse primitive with single annotation', () => {
        const result = TezosLanguageUtil.translateMichelineToHex('{ "prim": "PUSH", "annots": [ "@cba" ] }');
        expect(result).to.equal('04430000000440636261');
    });

    it('parse primitive with multiple annotations', () => {
        const result = TezosLanguageUtil.translateMichelineToHex('{ "prim": "PUSH", "annots": [ "@abc", "@def" ] }');
        expect(result).to.equal('044300000009406162632040646566');
    });

    it('parse primitive with single argument', () => {
        const result = TezosLanguageUtil.translateMichelineToHex('{ "prim": "NIL", "args": [ { "prim": "operation" } ] }');
        expect(result).to.equal('053d036d');
    });

    it('parse primitive with two arguments', () => {
        const result = TezosLanguageUtil.translateMichelineToHex('{ "prim": "NIL", "args": [ { "prim": "operation" }, { "prim": "operation" } ] }');
        expect(result).to.equal('073d036d036d');
    });

    it('parse primitive with single argument and annotation', () => {
        const result = TezosLanguageUtil.translateMichelineToHex('{ "prim": "NIL", "args": [ { "prim": "operation" } ], "annots": [ "@cba" ] }');
        expect(result).to.equal('063d036d0000000440636261');
    });

    it('parse primitive with two arguments and an annotation', () => {
        const result = TezosLanguageUtil.translateMichelineToHex('{ "prim": "NIL", "args": [ { "prim": "operation" }, { "prim": "operation" } ], "annots": [ "@cba" ] }');
        expect(result).to.equal('083d036d036d0000000440636261');
    });

    it('parse primitive with an argument array and annotations', () => {
        const result = TezosLanguageUtil.translateMichelineToHex('{ "prim": "NIL", "args": [ { "prim": "operation" }, { "prim": "operation" }, { "prim": "operation" } ], "annots": [ "@red", "@green", "@blue" ] }');
        expect(result).to.equal('093d00000006036d036d036d00000011407265642040677265656e2040626c7565');
    });
});

describe('Micheline binary encoding complex tests', () => {
    it('test 0', () => {
        const result = TezosLanguageUtil.translateMichelineToHex('[ { "prim": "parameter", "args": [ { "prim": "int" } ] }, { "prim": "storage", "args": [ { "prim": "int" } ] }, { "prim": "code", "args": [ [ { "prim": "CAR" }, { "prim": "PUSH", "args": [ { "prim": "int" }, { "int": "1" } ] }, { "prim": "ADD" }, { "prim": "NIL", "args": [ { "prim": "operation" } ] }, { "prim": "PAIR" } ] ] } ]');
        expect(result).to.equal('020000001f0500035b0501035b0502020000001003160743035b00010312053d036d0342');
    });

    it('test 1', () => {
        const result = TezosLanguageUtil.translateMichelineToHex('[ {  "prim":"CAR" }, [  [  {  "prim":"DUP" }, {  "prim":"CAR" }, {  "prim":"DIP", "args":[  [  {  "prim":"CDR" } ] ] } ] ], {  "prim":"NIL", "args":[  {  "prim":"int" } ] } ]');
        expect(result).to.equal('020000001d03160200000012020000000d03210316051f02000000020317053d035b');
    });
    
});

describe('Micheline to hex contract tests', async () => {
    const contractSampleRoot = 'test/chain/tezos/lexer/samples';
    let samples: string[] = glob.sync(`${contractSampleRoot}/**/*.micheline`);

    for (let i = 0; i < samples.length; i++) {
        const contractName = samples[i];
        const d = path.dirname(contractName);
        const t = path.basename(d, path.extname(d));
        const f = path.basename(contractName, path.extname(contractName));

        if (!fs.existsSync(`${d}${path.sep}${f}.hex`)) { console.log(`Skipping ${t}${path.sep}${f}, missing hex!`); continue; }

        it(`Micheline to hex contract test: ${t}${path.sep}${f}`, () => {
            const micheline = fs.readFileSync(`${d}${path.sep}${f}.micheline`, 'utf8');
            const hexaline = fs.readFileSync(`${d}${path.sep}${f}.hex`, 'utf8');

            const parser = new nearley.Parser(nearley.Grammar.fromCompiled(Micheline.default));
            parser.feed(TezosLanguageUtil.normalizeMichelineWhiteSpace(micheline));
            const result = parser.results.join('');
            const parsedHex = ('0000000' + (result.length / 2).toString(16)).slice(-8) + result; // prefix byte length

            expect(parsedHex).to.equal(hexaline.trim());
        });
    }
});
