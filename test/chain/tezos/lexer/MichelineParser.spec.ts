import 'mocha';
import { expect } from 'chai';

import * as Micheline from '../../../../src/chain/tezos/lexer/Micheline';
import * as nearley from 'nearley';
import * as fs from 'fs';
import * as path from 'path';

function michelineFragmentToHex(code: string): string {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(Micheline));
    parser.feed(code);
    return parser.results.join('');
}

describe('Micheline binary encoding tests', () => {
    it('parse a static int', () => {
        const result = michelineFragmentToHex('{ "int": "42" }');
        expect(result).to.equal('002a');
    });

    it('parse a large static int', () => {
        const result = michelineFragmentToHex('{ "int": "976146032" }');
        expect(result).to.equal('00f09cbbd103');
    });

    it('parse a static string', () => {
        const result = michelineFragmentToHex('{ "string" : "abc" }');
        expect(result).to.equal('0100000003616263');
    });

    it('parse a static array', () => {
        const result = michelineFragmentToHex('[ { "int" : "42" }, { "string": "abc" }, { "string": "def" } ]');
        expect(result).to.equal('0200000012002a01000000036162630100000003646566');
    });

    it('parse stand-alone primitive', () => {
        const result = michelineFragmentToHex('{ "prim": "PUSH" }');
        expect(result).to.equal('0343');
    });

    it('parse primitive with single annotation', () => {
        const result = michelineFragmentToHex('{ "prim": "PUSH", "annots": [ "@cba" ] }');
        expect(result).to.equal('04430000000440636261');
    });

    it('parse primitive with multiple annotations', () => {
        const result = michelineFragmentToHex('{ "prim": "PUSH", "annots": [ "@abc", "@def" ] }');
        expect(result).to.equal('044300000009406162632040646566');
    });

    it('parse primitive with single argument', () => {
        const result = michelineFragmentToHex('{ "prim": "NIL", "args": [ { "prim": "operation" } ] }');
        expect(result).to.equal('053d036d');
    });

    it('parse primitive with two arguments', () => {
        const result = michelineFragmentToHex('{ "prim": "NIL", "args": [ { "prim": "operation" }, { "prim": "operation" } ] }');
        expect(result).to.equal('073d036d036d');
    });

    it('parse primitive with single argument and annotation', () => {
        const result = michelineFragmentToHex('{ "prim": "NIL", "args": [ { "prim": "operation" } ], "annots": [ "@cba" ] }');
        expect(result).to.equal('063d036d0000000440636261');
    });

    it('parse primitive with two arguments and an annotation', () => {
        const result = michelineFragmentToHex('{ "prim": "NIL", "args": [ { "prim": "operation" }, { "prim": "operation" } ], "annots": [ "@cba" ] }');
        expect(result).to.equal('083d036d036d0000000440636261');
    });

    it('parse primitive with an argument array and annotations', () => {
        const result = michelineFragmentToHex('{ "prim": "NIL", "args": [ { "prim": "operation" }, { "prim": "operation" }, { "prim": "operation" } ], "annots": [ "@red", "@green", "@blue" ] }');
        expect(result).to.equal('093d036d036d036d00000011407265642040677265656e2040626c7565');
    });
});

describe('Micheline binary encoding complex tests', () => {
    it('test 0', () => {
        const result = michelineFragmentToHex('[ { "prim": "parameter", "args": [ { "prim": "int" } ] }, { "prim": "storage", "args": [ { "prim": "int" } ] }, { "prim": "code", "args": [ [ { "prim": "CAR" }, { "prim": "PUSH", "args": [ { "prim": "int" }, { "int": "1" } ] }, { "prim": "ADD" }, { "prim": "NIL", "args": [ { "prim": "operation" } ] }, { "prim": "PAIR" } ] ] } ]');
        expect(result).to.equal('020000001f0500035b0501035b0502020000001003160743035b00010312053d036d0342');
    });
});

function michelineToHex (code: string): string {
    return preProcessMicheline(code)
        .map(p => {
            let parser = new nearley.Parser(nearley.Grammar.fromCompiled(Micheline));
            parser.feed(p);
            let result = parser.results.join('');
            return ('0000000' + (result.length / 2).toString(16)).slice(-8) + result;
        }).join('');
}

function preProcessMicheline(code: string): string[] {
    const container = JSON.parse(code);
    let parts: string[] = [];

    parts.push(JSON.stringify(container.script[2], null, 1));
    parts.push(JSON.stringify(container.script[1], null, 1));

    for (let i = 0; i < parts.length; i++) {
        parts[i] = parts[i].replace(/\n/g, ' ').replace(/ +/g, ' ').replace(/\[{/g, '[ {').replace(/}\]/g, '} ]').replace(/},{/g, '}, {').replace(/\]}/g, '] }');
    }

    return parts;
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
        it(`Contract test: ${contractName}`, () => {
            let micheline = fs.readFileSync(`${contractSampleRoot}/${contractName}.micheline`, 'utf8');
            let hexaline = fs.readFileSync(`${contractSampleRoot}/${contractName}.hex`, 'utf8');

            let parsedHex = michelineToHex(micheline);
            expect(parsedHex).to.equal(hexaline);
        });
    }
});