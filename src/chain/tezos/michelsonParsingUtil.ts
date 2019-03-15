const nearley = require("nearley");
const grammar = require("../../utils/grammars/lexedMichelson.js");
const util = require('util');

export namespace michelsonParsingUtil {

    export function michelsonScriptToJson(script: string): Object {
        const storageRegExp = RegExp("storage", "i")
        const codeRegExp = RegExp("code", "i")
        const m = script.search(storageRegExp)
        const n = script.search(codeRegExp)
        const parameter = script.substring(0, m).replace(/[\n\r\t]/g,'');
        const storage = script.substring(m, n).replace(/[\n\r\t]/g,'');
        const code = script.substring(n).replace(/[\n\r\t]/g,'');
        return michelsonToJson(parameter, storage, code)
    }

    function michelsonToJson(parameter: string, storage: string, code: string): Object {
        //const parameterJson = parameterToJson(parameter)
        //const storageJson = storageToJson(storage)
        //const codeJson = codeToJson(code)
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
        const sanitizedParameter = parameter.replace(/[\n\r\t]/g,'');
        const sanitizedStorage = storage.replace(/[\n\r\t]/g,'');
        const sanitizedCode = code.replace(/[\n\r\t]/g,'');
        const sanitizedScript = sanitizedParameter + sanitizedStorage + sanitizedCode
        parser.feed(sanitizedScript)
        return util.inspect(parser.results[1].map(s => JSON.parse(s)), false, null, true) //parameterJson//, storageJson, codeJson]
    }

    export function storageToJson(storage: string): Object {
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
        const sanitizedStorage = storage.replace(/[\n\r\t]/g,'');
        parser.feed(sanitizedStorage)
        const storageJson = JSON.parse(parser.results)
        return util.inspect(storageJson, false, null, true)
    }

    function oldMichelsonToJson(michelson: string): Array<Object> {
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar), { keepHistory: true});
        const fixedString = michelson.replace(/[\n\r\t]/g,'');
        parser.feed(fixedString)
        const returnValue : Array<Array<string>> = parser.results
        //return util.inspect(JSON.parse(parser.results[0]), false, null, true)
        return util.inspect(returnValue[0].map(t => JSON.parse(t)), false, null, true)
    }

    //In the case of ambiguous parses, a quick hack will be to take the longest length match
    //until the parser is fixed properly.
    function codeHack(code: Array<Array<String>>): Array<string> {
        return []
    }
}