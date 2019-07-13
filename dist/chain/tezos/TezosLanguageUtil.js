"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Micheline = __importStar(require("./lexer/Micheline"));
const Michelson = __importStar(require("./lexer/Michelson"));
const MichelsonParameters = __importStar(require("./lexer/MichelsonParameters"));
const nearley = __importStar(require("nearley"));
const TezosMessageUtil_1 = require("./TezosMessageUtil");
const MichelineKeywords = ['"parameter"', '"storage"', '"code"', '"False"', '"Elt"', '"Left"', '"None"', '"Pair"', '"Right"', '"Some"', '"True"', '"Unit"', '"PACK"', '"UNPACK"', '"BLAKE2B"', '"SHA256"', '"SHA512"', '"ABS"', '"ADD"', '"AMOUNT"', '"AND"', '"BALANCE"', '"CAR"', '"CDR"', '"CHECK_SIGNATURE"', '"COMPARE"', '"CONCAT"', '"CONS"', '"CREATE_ACCOUNT"', '"CREATE_CONTRACT"', '"IMPLICIT_ACCOUNT"', '"DIP"', '"DROP"', '"DUP"', '"EDIV"', '"EMPTY_MAP"', '"EMPTY_SET"', '"EQ"', '"EXEC"', '"FAILWITH"', '"GE"', '"GET"', '"GT"', '"HASH_KEY"', '"IF"', '"IF_CONS"', '"IF_LEFT"', '"IF_NONE"', '"INT"', '"LAMBDA"', '"LE"', '"LEFT"', '"LOOP"', '"LSL"', '"LSR"', '"LT"', '"MAP"', '"MEM"', '"MUL"', '"NEG"', '"NEQ"', '"NIL"', '"NONE"', '"NOT"', '"NOW"', '"OR"', '"PAIR"', '"PUSH"', '"RIGHT"', '"SIZE"', '"SOME"', '"SOURCE"', '"SENDER"', '"SELF"', '"STEPS_TO_QUOTA"', '"SUB"', '"SWAP"', '"TRANSFER_TOKENS"', '"SET_DELEGATE"', '"UNIT"', '"UPDATE"', '"XOR"', '"ITER"', '"LOOP_LEFT"', '"ADDRESS"', '"CONTRACT"', '"ISNAT"', '"CAST"', '"RENAME"', '"bool"', '"contract"', '"int"', '"key"', '"key_hash"', '"lambda"', '"list"', '"map"', '"big_map"', '"nat"', '"option"', '"or"', '"pair"', '"set"', '"signature"', '"string"', '"bytes"', '"mutez"', '"timestamp"', '"unit"', '"operation"', '"address"', '"SLICE"', '"DEFAULT_ACCOUNT"', '"tez"'];
var TezosLanguageUtil;
(function (TezosLanguageUtil) {
    function hexToMicheline(hex) {
        if (hex.length < 2) {
            throw new Error(`Malformed Micheline fragment '${hex}'`);
        }
        let code = '';
        let offset = 0;
        let fieldType = hex.substring(offset, offset + 2);
        offset += 2;
        switch (fieldType) {
            case '00': {
                const value = TezosMessageUtil_1.TezosMessageUtils.findInt(hex.substring(offset), 0, true);
                code += `{ "int": "${value.value}" }`;
                offset += value.length;
                break;
            }
            case '01': {
                const stringEnvelope = michelineHexToString(hex.substring(offset));
                code += `{ "string": "${stringEnvelope.code}" }`;
                offset += stringEnvelope.consumed;
                break;
            }
            case '02': {
                const length = parseInt(hex.substring(offset, offset + 8), 16);
                offset += 8;
                let buffer = [];
                let consumed = 0;
                while (consumed < length) {
                    let envelope = hexToMicheline(hex.substring(offset));
                    buffer.push(envelope.code);
                    consumed += envelope.consumed / 2;
                    offset += envelope.consumed;
                }
                if (length === 0) {
                    code += '[]';
                }
                else {
                    code += `[ ${buffer.join(', ')} ]`;
                }
                break;
            }
            case '03': {
                code += `{ "prim": ${michelineHexToKeyword(hex, offset)} }`;
                offset += 2;
                break;
            }
            case '04': {
                code += `{ "prim": ${michelineHexToKeyword(hex, offset)}, `;
                offset += 2;
                const annEnvelope = michelineHexToAnnotations(hex.substring(offset));
                code += `"annots": [ ${annEnvelope.code} ] }`;
                offset += annEnvelope.consumed;
                break;
            }
            case '05': {
                code += `{ "prim": ${michelineHexToKeyword(hex, offset)}, `;
                offset += 2;
                const envelope = hexToMicheline(hex.substring(offset));
                code += `"args": [ ${envelope.code} ] }`;
                offset += envelope.consumed;
                break;
            }
            case '06': {
                code += `{ "prim": ${michelineHexToKeyword(hex, offset)}, `;
                offset += 2;
                const args = hexToMicheline(hex.substring(offset));
                code += `"args": [ ${args.code} ], `;
                offset += args.consumed;
                const anns = michelineHexToAnnotations(hex.substring(offset));
                code += `"annots": [ ${anns.code} ] }`;
                offset += anns.consumed;
                break;
            }
            case '07': {
                code += `{ "prim": ${michelineHexToKeyword(hex, offset)}, `;
                offset += 2;
                let buffer = [];
                let envelope = hexToMicheline(hex.substring(offset));
                buffer.push(envelope.code);
                offset += envelope.consumed;
                envelope = hexToMicheline(hex.substring(offset));
                buffer.push(envelope.code);
                offset += envelope.consumed;
                code += `"args": [ ${buffer.join(', ')} ] }`;
                break;
            }
            case '08': {
                code += `{ "prim": ${michelineHexToKeyword(hex, offset)}, `;
                offset += 2;
                const arg0 = hexToMicheline(hex.substring(offset));
                offset += arg0.consumed;
                const arg1 = hexToMicheline(hex.substring(offset));
                offset += arg1.consumed;
                code += `"args": [ ${arg0.code}, ${arg1.code} ], `;
                const anns = michelineHexToAnnotations(hex.substring(offset));
                code += `"annots": [ ${anns.code} ] }`;
                offset += anns.consumed;
                break;
            }
            case '09': {
                code += `{ "prim": ${michelineHexToKeyword(hex, offset)}, `;
                offset += 2;
                let envelope = hexToMicheline('02' + hex.substring(offset));
                code += `"args": ${envelope.code}`;
                offset += envelope.consumed - 2;
                if (hex.substring(offset, offset + 8) !== '00000000') {
                    const annEnvelope = michelineHexToAnnotations(hex.substring(offset));
                    if (annEnvelope.code.length > 2) {
                        code += `, "annots": [ ${annEnvelope.code} ] }`;
                    }
                    offset += annEnvelope.consumed;
                }
                else {
                    code += ' }';
                    offset += 8;
                }
                break;
            }
            case '0a': {
                const length = parseInt(hex.substring(offset, offset + 8), 16);
                offset += 8;
                code += `{ "bytes": "${hex.substring(offset, offset + length * 2)}" }`;
                offset += length * 2;
                break;
            }
            default: {
                throw new Error(`Unknown Micheline field type '${fieldType}'`);
            }
        }
        return { code: code, consumed: offset };
    }
    TezosLanguageUtil.hexToMicheline = hexToMicheline;
    function translateMichelsonToMicheline(code) {
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(Michelson));
        preProcessMichelsonScript(code).forEach(p => { parser.feed(p); });
        return parser.results[0];
    }
    TezosLanguageUtil.translateMichelsonToMicheline = translateMichelsonToMicheline;
    function translateMichelsonParametersToMicheline(code) {
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(MichelsonParameters));
        preProcessMichelsonScript(code).forEach(p => { parser.feed(p); });
        return parser.results[0];
    }
    TezosLanguageUtil.translateMichelsonParametersToMicheline = translateMichelsonParametersToMicheline;
    function translateMichelsonToHex(code) {
        return preProcessMicheline(translateMichelsonToMicheline(code))
            .map(p => { var c = normalizeMichelineWhiteSpace(p); return c; })
            .map(p => translateMichelineToHex(p))
            .reduce((m, p) => { return m += ('0000000' + (p.length / 2).toString(16)).slice(-8) + p; }, '');
    }
    TezosLanguageUtil.translateMichelsonToHex = translateMichelsonToHex;
    function preProcessMicheline(code) {
        const container = JSON.parse(code);
        let parts = [];
        parts.push(getSection(container, 'code'));
        parts.push(getSection(container, 'storage'));
        return parts;
    }
    function getSection(container, key) {
        let root = container;
        if (!!container.script) {
            root = container.script;
        }
        for (let i = 0; i < root.length; i++) {
            if (root[i]['prim'] === key) {
                return JSON.stringify(root[i], null, 1);
            }
        }
        throw new Error(`${key} key was not found`);
    }
    function translateMichelineToHex(code) {
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(Micheline));
        parser.feed(normalizeMichelineWhiteSpace(code));
        return parser.results.join('');
    }
    TezosLanguageUtil.translateMichelineToHex = translateMichelineToHex;
    function michelineHexToString(hex) {
        let offset = 0;
        const length = parseInt(hex.substring(offset, offset + 8), 16);
        offset += 8;
        const text = Buffer.from(hex.substring(offset, offset + length * 2), 'hex').toString();
        offset += length * 2;
        return { code: text, consumed: offset };
    }
    function michelineHexToKeyword(hex, offset) {
        return MichelineKeywords[parseInt(hex.substring(offset, offset + 2), 16)];
    }
    function michelineHexToAnnotations(hex) {
        const stringEnvelope = michelineHexToString(hex);
        return { code: stringEnvelope.code.split(' ').map(s => `"${s}"`).join(', '), consumed: stringEnvelope.consumed };
    }
    function preProcessMichelsonScript(code) {
        let sections = new Map();
        sections['parameter'] = code.search(/parameter/),
            sections['storage'] = code.search(/storage/),
            sections['code'] = code.search(/code/);
        const boundaries = Object.values(sections).sort((a, b) => Number(a) - Number(b));
        sections[Object.keys(sections).find(key => sections[key] === boundaries[0]) + ''] = code.substring(boundaries[0], boundaries[1]);
        sections[Object.keys(sections).find(key => sections[key] === boundaries[1]) + ''] = code.substring(boundaries[1], boundaries[2]);
        sections[Object.keys(sections).find(key => sections[key] === boundaries[2]) + ''] = code.substring(boundaries[2]);
        const parts = [sections['parameter'], sections['storage'], sections['code']];
        return parts.map(p => p.trim().split('\n').map(l => l.replace(/\#[\s\S]+$/, '').trim()).filter(v => v.length > 0).join(' '));
    }
    TezosLanguageUtil.preProcessMichelsonScript = preProcessMichelsonScript;
    function normalizeMichelineWhiteSpace(fragment) {
        return fragment.replace(/\n/g, ' ')
            .replace(/ +/g, ' ')
            .replace(/\[{/g, '[ {')
            .replace(/}\]/g, '} ]')
            .replace(/},{/g, '}, {')
            .replace(/\]}/g, '] }')
            .replace(/":"/g, '": "')
            .replace(/":\[/g, '": [')
            .replace(/{"/g, '{ "')
            .replace(/"}/g, '" }')
            .replace(/","/g, '", "')
            .replace(/\[\[/g, '[ [')
            .replace(/\]\]/g, '] ]')
            .replace(/\["/g, '\[ "')
            .replace(/"\]/g, '" \]');
    }
    TezosLanguageUtil.normalizeMichelineWhiteSpace = normalizeMichelineWhiteSpace;
})(TezosLanguageUtil = exports.TezosLanguageUtil || (exports.TezosLanguageUtil = {}));
//# sourceMappingURL=TezosLanguageUtil.js.map