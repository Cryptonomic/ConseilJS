const nearley = require("nearley");
const grammar = require("./lexedMichelson.js");
//const grammar = require("./test.js");
const util = require('util');

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

export function michelsonToJson(michelson: string): string {
    const fixedString = michelson.replace(/[\n\r\t]/g,'');
    parser.feed(fixedString)
    return util.inspect(parser.results, false, null, true)
}