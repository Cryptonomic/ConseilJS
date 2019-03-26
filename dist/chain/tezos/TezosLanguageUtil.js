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
const nearley = __importStar(require("nearley"));
const TezosMessageUtil_1 = require("./TezosMessageUtil");
const MichelineKeywords = ['"parameter"', '"storage"', '"code"', '"False"', '"Elt"', '"Left"', '"None"', '"Pair"', '"Right"', '"Some"', '"True"', '"Unit"', '"PACK"', '"UNPACK"', '"BLAKE2B"', '"SHA256"', '"SHA512"', '"ABS"', '"ADD"', '"AMOUNT"', '"AND"', '"BALANCE"', '"CAR"', '"CDR"', '"CHECK_SIGNATURE"', '"COMPARE"', '"CONCAT"', '"CONS"', '"CREATE_ACCOUNT"', '"CREATE_CONTRACT"', '"IMPLICIT_ACCOUNT"', '"DIP"', '"DROP"', '"DUP"', '"EDIV"', '"EMPTY_MAP"', '"EMPTY_SET"', '"EQ"', '"EXEC"', '"FAILWITH"', '"GE"', '"GET"', '"GT"', '"HASH_KEY"', '"IF"', '"IF_CONS"', '"IF_LEFT"', '"IF_NONE"', '"INT"', '"LAMBDA"', '"LE"', '"LEFT"', '"LOOP"', '"LSL"', '"LSR"', '"LT"', '"MAP"', '"MEM"', '"MUL"', '"NEG"', '"NEQ"', '"NIL"', '"NONE"', '"NOT"', '"NOW"', '"OR"', '"PAIR"', '"PUSH"', '"RIGHT"', '"SIZE"', '"SOME"', '"SOURCE"', '"SENDER"', '"SELF"', '"STEPS_TO_QUOTA"', '"SUB"', '"SWAP"', '"TRANSFER_TOKENS"', '"SET_DELEGATE"', '"UNIT"', '"UPDATE"', '"XOR"', '"ITER"', '"LOOP_LEFT"', '"ADDRESS"', '"CONTRACT"', '"ISNAT"', '"CAST"', '"RENAME"', '"bool"', '"contract"', '"int"', '"key"', '"key_hash"', '"lambda"', '"list"', '"map"', '"big_map"', '"nat"', '"option"', '"or"', '"pair"', '"set"', '"signature"', '"string"', '"bytes"', '"mutez"', '"timestamp"', '"unit"', '"operation"', '"address"', '"SLICE"', '"DEFAULT_ACCOUNT"', '"tez"'];
var TezosLanguageUtil;
(function (TezosLanguageUtil) {
    function hexToMicheline(hex) {
        let code = '';
        let offset = 0;
        let fieldType = hex.substring(offset, offset + 2);
        offset += 2;
        switch (fieldType) {
            case '00': {
                const value = TezosMessageUtil_1.TezosMessageUtils.findInt(hex.substring(offset), 0);
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
                code += `[ ${buffer.join(', ')} ]`;
                offset += consumed;
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
                if (anns.code.length > 2) {
                    code += `"annots": [ ${anns.code} ] }`;
                }
                else {
                    code += ' }';
                }
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
                let buffer = [];
                while (offset !== hex.length) {
                    let envelope = hexToMicheline(hex.substring(offset));
                    buffer.push(envelope.code);
                    offset += envelope.consumed;
                    if (hex.substring(offset, offset + 2) === '00') {
                        const annEnvelope = michelineHexToAnnotations(hex.substring(offset));
                        if (annEnvelope.code.length > 2) {
                            buffer.push(`"annots": [ ${annEnvelope.code} ] }`);
                        }
                        offset += annEnvelope.consumed;
                    }
                }
                code += `"args": [ ${buffer.join(', ')} ] }`;
                break;
            }
            case '10': {
                throw new Error('Micheline binary fields are not yet supported');
                break;
            }
            default: {
                throw new Error(`Unknown Micheline field type ${fieldType}`);
            }
        }
        return { code: code, consumed: offset };
    }
    TezosLanguageUtil.hexToMicheline = hexToMicheline;
    function translateMichelsonToMicheline(code) {
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(Michelson));
        preProcessMichelson(code).forEach(p => { parser.feed(p); });
        return postProcessMicheline(parser.results.join(' '));
    }
    TezosLanguageUtil.translateMichelsonToMicheline = translateMichelsonToMicheline;
    function translateMichelsonToHex(code) {
        return translateMichelineToHex(translateMichelsonToMicheline(code));
    }
    TezosLanguageUtil.translateMichelsonToHex = translateMichelsonToHex;
    function translateMichelineToHex(code) {
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(Micheline));
        parser.feed(preProcessMicheline(code));
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
        return { code: stringEnvelope.code.split(' @').map((s, i) => i > 0 ? `"@${s}"` : `"${s}"`).join(', '), consumed: stringEnvelope.consumed };
    }
    function preProcessMichelson(code) {
        const pi = code.search(/parameter/);
        const si = code.search(/storage/);
        const ci = code.search(/code/);
        let parts = [];
        if (pi < si && si < ci) {
            parts[0] = code.substring(pi, si);
            parts[1] = code.substring(si, ci);
            parts[2] = code.substring(ci);
        }
        for (let i = 0; i < 3; i++) {
            parts[i] = parts[i].trim().split('\n').map(l => l.replace(/\#[\s\S]+$/, '').trim()).filter(v => v.length > 0).join(' ');
        }
        return parts;
    }
    function postProcessMicheline(code) {
        const inner = code.replace(/\[{/g, '[ {').replace(/}\]/g, '} ]').replace(/},{/g, '}, {').replace(/\]}/g, '] }');
        return `{ "script": ${inner} }`;
    }
    function preProcessMicheline(fragment) {
        return fragment.replace(/\n/g, ' ')
            .replace(/ +/g, ' ')
            .replace(/\[{/g, '[ {')
            .replace(/}\]/g, '} ]')
            .replace(/},{/g, '}, {')
            .replace(/\]}/g, '] }');
    }
})(TezosLanguageUtil = exports.TezosLanguageUtil || (exports.TezosLanguageUtil = {}));
//# sourceMappingURL=TezosLanguageUtil.js.map