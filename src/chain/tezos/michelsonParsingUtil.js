"use strict";
exports.__esModule = true;
var nearley = require("nearley");
var grammar = require("../../utils/grammars/lexedMichelson.js");
var util = require('util');
var michelsonParsingUtil;
(function (michelsonParsingUtil) {
    function michelsonScriptToJson(script) {
        var storageRegExp = RegExp("storage", "i");
        var codeRegExp = RegExp("code", "i");
        var m = script.search(storageRegExp);
        var n = script.search(codeRegExp);
        var parameter = script.substring(0, m).replace(/[\n\r\t]/g, '');
        var storage = script.substring(m, n).replace(/[\n\r\t]/g, '');
        var code = script.substring(n).replace(/[\n\r\t]/g, '');
        return michelsonToJson(parameter, storage, code);
    }
    michelsonParsingUtil.michelsonScriptToJson = michelsonScriptToJson;
    function michelsonToJson(parameter, storage, code) {
        //const parameterJson = parameterToJson(parameter)
        //const storageJson = storageToJson(storage)
        //const codeJson = codeToJson(code)
        var parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar), { keepHistory: true });
        var sanitizedParameter = parameter.replace(/[\n\r\t]/g, '');
        var sanitizedStorage = storage.replace(/[\n\r\t]/g, '');
        var sanitizedCode = code.replace(/[\n\r\t]/g, '');
        var sanitizedScript = sanitizedParameter + sanitizedStorage + sanitizedCode;
        parser.feed(sanitizedScript);
        return util.inspect(parser.results[1].map(function (s) { return JSON.parse(s); }), false, null, true); //parameterJson//, storageJson, codeJson]
    }
    function storageToJson(storage) {
        var parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar), { keepHistory: true });
        var sanitizedStorage = storage.replace(/[\n\r\t]/g, '');
        parser.feed(sanitizedStorage);
        var storageJson = JSON.parse(parser.results);
        return util.inspect(storageJson, false, null, true);
    }
    michelsonParsingUtil.storageToJson = storageToJson;
    function oldMichelsonToJson(michelson) {
        var parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar), { keepHistory: true });
        var fixedString = michelson.replace(/[\n\r\t]/g, '');
        parser.feed(fixedString);
        var returnValue = parser.results;
        //return util.inspect(JSON.parse(parser.results[0]), false, null, true)
        return util.inspect(returnValue[0].map(function (t) { return JSON.parse(t); }), false, null, true);
    }
    //In the case of ambiguous parses, a quick hack will be to take the longest length match
    //until the parser is fixed properly.
    function codeHack(code) {
        return [];
    }
})(michelsonParsingUtil = exports.michelsonParsingUtil || (exports.michelsonParsingUtil = {}));
