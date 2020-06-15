import { expect } from 'chai';

import { TezosLanguageUtil } from "../../../../src/chain/tezos/TezosLanguageUtil";
import * as fs from 'fs';
import * as path from 'path';
import glob from 'glob';

describe('Michelson/Micheline snippet tests', () => {
    it('convert a pair with a map', () => {
        const result = TezosLanguageUtil.translateMichelsonToMicheline('Pair (Some "value") { Elt "abc" (Pair 0 (Pair 0 (Pair 0 (Pair 0 (Pair 0 (Pair 0 0)))))); Elt "def" (Pair 0 (Pair 0 (Pair 0 (Pair 0 (Pair 0 (Pair 0 0)))))); Elt "ghi" (Pair 0 (Pair 0 (Pair 0 (Pair 0 (Pair 0 (Pair 0 0)))))); }');
        expect(result).to.equal('{ "prim": "Pair", "args": [ { "prim": "Some", "args": [ { "string": "value" } ] }, [ { "prim": "Elt", "args": [ { "string": "abc" }, { "prim": "Pair", "args": [ { "int": "0" }, { "prim": "Pair", "args": [ { "int": "0" }, { "prim": "Pair", "args": [ { "int": "0" }, { "prim": "Pair", "args": [ { "int": "0" }, { "prim": "Pair", "args": [ { "int": "0" }, { "prim": "Pair", "args": [ { "int": "0" }, { "int": "0" } ] } ] } ] } ] } ] } ] } ] },{ "prim": "Elt", "args": [ { "string": "def" }, { "prim": "Pair", "args": [ { "int": "0" }, { "prim": "Pair", "args": [ { "int": "0" }, { "prim": "Pair", "args": [ { "int": "0" }, { "prim": "Pair", "args": [ { "int": "0" }, { "prim": "Pair", "args": [ { "int": "0" }, { "prim": "Pair", "args": [ { "int": "0" }, { "int": "0" } ] } ] } ] } ] } ] } ] } ] },{ "prim": "Elt", "args": [ { "string": "ghi" }, { "prim": "Pair", "args": [ { "int": "0" }, { "prim": "Pair", "args": [ { "int": "0" }, { "prim": "Pair", "args": [ { "int": "0" }, { "prim": "Pair", "args": [ { "int": "0" }, { "prim": "Pair", "args": [ { "int": "0" }, { "prim": "Pair", "args": [ { "int": "0" }, { "int": "0" } ] } ] } ] } ] } ] } ] } ] } ] ] }');
    });

    it('convert a map', () => {
        const result = TezosLanguageUtil.translateMichelsonToMicheline('{Elt "btc-usd" (Pair "spsig1J5pAPREQCGiYwLofVwxEdUEpdvzoSSXW479S838XSKZj54wgqazZ8zYsAWwcLGpdJzVxyd9fygpWipzbfZGv4AhTpa5qP" (Pair 1591080000 (Pair 1591080060 (Pair 10090000000 (Pair 10092390000 (Pair 10088000000 (Pair 10092380000 3323367)))))));Elt "xtz-usd" (Pair "spsig1KqL61EMYdu8PWEeqTx4AVULDF5DxyXJcgMyVix7VV5XiNMM7AtHppYPpBDyDRYiwU5GmQdaHkLNRxB37oqQMgzvPyLEDM" (Pair 1591080000 (Pair 1591080060 (Pair 2971600 (Pair 2972300 (Pair 2969600 (Pair 2972300 428740000)))))));}');
        expect(result).to.equal('[ { "prim": "Elt", "args": [ { "string": "btc-usd" }, { "prim": "Pair", "args": [ { "string": "spsig1J5pAPREQCGiYwLofVwxEdUEpdvzoSSXW479S838XSKZj54wgqazZ8zYsAWwcLGpdJzVxyd9fygpWipzbfZGv4AhTpa5qP" }, { "prim": "Pair", "args": [ { "int": "1591080000" }, { "prim": "Pair", "args": [ { "int": "1591080060" }, { "prim": "Pair", "args": [ { "int": "10090000000" }, { "prim": "Pair", "args": [ { "int": "10092390000" }, { "prim": "Pair", "args": [ { "int": "10088000000" }, { "prim": "Pair", "args": [ { "int": "10092380000" }, { "int": "3323367" } ] } ] } ] } ] } ] } ] } ] } ] },{ "prim": "Elt", "args": [ { "string": "xtz-usd" }, { "prim": "Pair", "args": [ { "string": "spsig1KqL61EMYdu8PWEeqTx4AVULDF5DxyXJcgMyVix7VV5XiNMM7AtHppYPpBDyDRYiwU5GmQdaHkLNRxB37oqQMgzvPyLEDM" }, { "prim": "Pair", "args": [ { "int": "1591080000" }, { "prim": "Pair", "args": [ { "int": "1591080060" }, { "prim": "Pair", "args": [ { "int": "2971600" }, { "prim": "Pair", "args": [ { "int": "2972300" }, { "prim": "Pair", "args": [ { "int": "2969600" }, { "prim": "Pair", "args": [ { "int": "2972300" }, { "int": "428740000" } ] } ] } ] } ] } ] } ] } ] } ] } ]');
    });

    it('convert a map as part of params', () => {
        const result = TezosLanguageUtil.translateParameterMichelsonToMicheline('Left { Elt "xtz-btc" (Pair "spsig1Wd1evf5BGSqouVYsHu5aXRys6FgVxVs8JgAEB6ZyeeEmzVu3xK86KmNgR2QjTMyGDvrBRmimYuhgwgH5ZwkwWgEH9sz5v" (Pair "xtz-btc" (Pair 1590930900 (Pair 1590930960 (Pair 307 (Pair 307 (Pair 307 (Pair 307 255000000))))))));Elt "xtz-usd" (Pair "spsig1YncAhCisEzw7LCTQXG3aBbRuLoff2Q1MgxhbgdfAD4ZbMsEW83c5LKDf2PGqcsnouyxTmNpXQeGCWtoLxRpamjggPUoNd" (Pair "xtz-usd" (Pair 1590930960 (Pair 1590931020 (Pair 2930200 (Pair 2930200 (Pair 2929600 (Pair 2929600 58740000)))))))) }');
        expect(result).to.equal('{ "prim": "Left", "args": [ [ { "prim": "Elt", "args": [ { "string": "xtz-btc" }, { "prim": "Pair", "args": [ { "string": "spsig1Wd1evf5BGSqouVYsHu5aXRys6FgVxVs8JgAEB6ZyeeEmzVu3xK86KmNgR2QjTMyGDvrBRmimYuhgwgH5ZwkwWgEH9sz5v" }, { "prim": "Pair", "args": [ { "string": "xtz-btc" }, { "prim": "Pair", "args": [ { "int": "1590930900" }, { "prim": "Pair", "args": [ { "int": "1590930960" }, { "prim": "Pair", "args": [ { "int": "307" }, { "prim": "Pair", "args": [ { "int": "307" }, { "prim": "Pair", "args": [ { "int": "307" }, { "prim": "Pair", "args": [ { "int": "307" }, { "int": "255000000" } ] } ] } ] } ] } ] } ] } ] } ] } ] },{ "prim": "Elt", "args": [ { "string": "xtz-usd" }, { "prim": "Pair", "args": [ { "string": "spsig1YncAhCisEzw7LCTQXG3aBbRuLoff2Q1MgxhbgdfAD4ZbMsEW83c5LKDf2PGqcsnouyxTmNpXQeGCWtoLxRpamjggPUoNd" }, { "prim": "Pair", "args": [ { "string": "xtz-usd" }, { "prim": "Pair", "args": [ { "int": "1590930960" }, { "prim": "Pair", "args": [ { "int": "1590931020" }, { "prim": "Pair", "args": [ { "int": "2930200" }, { "prim": "Pair", "args": [ { "int": "2930200" }, { "prim": "Pair", "args": [ { "int": "2929600" }, { "prim": "Pair", "args": [ { "int": "2929600" }, { "int": "58740000" } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] ] }');
    });
});

describe('Michelson/Micheline contract tests', async () => {
    const contractSampleRoot = 'test/chain/tezos/lexer/samples';
    let samples: string[] = glob.sync(`${contractSampleRoot}/**/*.michelson`);

    for (let i = 0; i < samples.length; i++) {
        const contractName = samples[i];
        const d = path.dirname(contractName);
        const t = path.basename(d, path.extname(d));
        const f = path.basename(contractName, path.extname(contractName));

        if (!fs.existsSync(`${d}${path.sep}${f}.micheline`)) { console.log(`Skipping ${t}${path.sep}${f}, missing micheline.`); continue; }

        it(`Michelson/Micheline contract test: ${t}${path.sep}${f}`, () => {
            const michelson = fs.readFileSync(`${d}${path.sep}${f}.michelson`, 'utf8');
            const micheline = fs.readFileSync(`${d}${path.sep}${f}.micheline`, 'utf8');

            let michelineObject = JSON.parse(micheline);
            delete michelineObject.storage;
            delete michelineObject.input;
            delete michelineObject.amount;
            const trimmedMicheline = JSON.stringify(michelineObject).replace(/[\n\r\t\s]/g,'');
            const parsedMicheline = TezosLanguageUtil.translateMichelsonToMicheline(michelson).replace(/[\n\r\t\s]/g,'');

            expect(parsedMicheline).to.equal(trimmedMicheline);
        });
    }
});
