"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nearley = require("nearley");
const grammar = require("../../utils/grammars/lexedMichelson.js");
const util = require('util');
var michelsonParsingUtil;
(function (michelsonParsingUtil) {
    function michelsonScriptToJson(script) {
        const storageRegExp = RegExp("storage", "i");
        const codeRegExp = RegExp("code", "i");
        const m = script.search(storageRegExp);
        const n = script.search(codeRegExp);
        const parameter = script.substring(0, m).replace(/[\n\r\t]/g, '');
        const storage = script.substring(m, n).replace(/[\n\r\t]/g, '');
        const code = script.substring(n).replace(/[\n\r\t]/g, '');
        return michelsonToJson(parameter, storage, code);
    }
    michelsonParsingUtil.michelsonScriptToJson = michelsonScriptToJson;
    function michelsonToJson(parameter, storage, code) {
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
        const sanitizedParameter = parameter.replace(/[\n\r\t]/g, '');
        const sanitizedStorage = storage.replace(/[\n\r\t]/g, '');
        const sanitizedCode = code.replace(/[\n\r\t]/g, '');
        const sanitizedScript = sanitizedParameter + sanitizedStorage + sanitizedCode;
        parser.feed(sanitizedScript);
        return util.inspect(parser.results[1].map(s => JSON.parse(s)), false, null, true);
    }
    function storageToJson(storage) {
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
        const sanitizedStorage = storage.replace(/[\n\r\t]/g, '');
        parser.feed(sanitizedStorage);
        const storageJson = JSON.parse(parser.results);
        return util.inspect(storageJson, false, null, true);
    }
    michelsonParsingUtil.storageToJson = storageToJson;
    function oldMichelsonToJson(michelson) {
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar), { keepHistory: true });
        const fixedString = michelson.replace(/[\n\r\t]/g, '');
        parser.feed(fixedString);
        const returnValue = parser.results;
        return util.inspect(returnValue[0].map(t => JSON.parse(t)), false, null, true);
    }
    function codeHack(code) {
        return [];
    }
})(michelsonParsingUtil = exports.michelsonParsingUtil || (exports.michelsonParsingUtil = {}));
//# sourceMappingURL=michelsonParsingUtil.js.map