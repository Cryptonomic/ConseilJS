"use strict";
exports.__esModule = true;
var nearley = require("nearley");
var grammar = require("./lexedMichelson.js");
//const grammar = require("./test.js");
var util = require('util');
var parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
function michelsonToJson(michelson) {
    var fixedString = michelson.replace(/[\n\r\t]/g, '');
    parser.feed(fixedString);
    return util.inspect(parser.results, false, null, true);
}
exports.michelsonToJson = michelsonToJson;
//For debugging purposes
//console.log(util.inspect(parser.results, false, null, true));
//console.log(michelsonToJson("world"))
