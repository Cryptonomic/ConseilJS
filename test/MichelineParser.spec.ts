import 'mocha';
import { expect } from 'chai';

import * as Micheline from '../src/chain/tezos/lexer/Micheline';
import * as nearley from 'nearley';
const util = require('util');

function michelsonToJson(code: string): string {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(Micheline));
    parser.feed(code);
    return parser.results.join('');
}

describe('Micheline binary encoding tests', () => {
    it('parse a static int', () => {
        const result = michelsonToJson('{ "int": 42 }');
        expect(result).to.equal('002a');
    });

    it('parse a static string', () => {
        const result = michelsonToJson('{ "string" : "abc" }');
        expect(result).to.equal('0100000003616263');
    });

    it('parse a static array', () => {
        const result = michelsonToJson('[ { "int" : 42 }, { "string": "abc" }, { "string": "def" } ]');
        expect(result).to.equal('0200000003002a01000000036162630100000003646566');
    });

    it('parse stand-alone primitive', () => {
        const result = michelsonToJson('{ "prim": "PUSH" }');
        expect(result).to.equal('0343');
    });

    it('parse primitive with single annotation', () => {
        const result = michelsonToJson('{ "prim": "PUSH", "annots": [ "@cba" ] }');
        expect(result).to.equal('04430000000440636261');
    });

    // TODO: multi annotation

    it('parse primitive with single argument', () => {
        const result = michelsonToJson('{ "prim": "NIL", "args": [ { "prim": "operation" } ] }');
        expect(result).to.equal('053d036d');
    });

    it('parse primitive with argument array', () => {
        const result = michelsonToJson('{ "prim": "NIL", "args": [ { "prim": "operation" }, { "prim": "operation" } ] }');
        expect(result).to.equal('073d036d036d');
    });

    it('parse primitive with argument array and annotation', () => {
        const result = michelsonToJson('{ "prim": "NIL", "args": [ { "prim": "operation" } ], "annots": [ "@cba" ] }');
        expect(result).to.equal('063d036d0000000440636261');
    });
});