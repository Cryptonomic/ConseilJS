"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nearley = require("nearley");
const grammar = require("./lexedMichelson.js");
const util = require('util');
const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
function michelsonToJson(michelson) {
    const fixedString = michelson.replace(/[\n\r\t]/g, '');
    parser.feed(fixedString);
    return util.inspect(parser.results, false, null, true);
}
exports.michelsonToJson = michelsonToJson;
//# sourceMappingURL=michelsonParsingUtil.js.map