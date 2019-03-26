import * as Micheline from './lexer/Micheline';
import * as Michelson from './lexer/Michelson';
import * as nearley from 'nearley';

import { TezosMessageUtils } from './TezosMessageUtil';

// TODO: share this with the parser somehow
const MichelineKeywords = ['"parameter"', '"storage"', '"code"', '"False"', '"Elt"', '"Left"', '"None"', '"Pair"', '"Right"', '"Some"', '"True"', '"Unit"', '"PACK"', '"UNPACK"', '"BLAKE2B"', '"SHA256"', '"SHA512"', '"ABS"', '"ADD"', '"AMOUNT"', '"AND"', '"BALANCE"', '"CAR"', '"CDR"', '"CHECK_SIGNATURE"', '"COMPARE"', '"CONCAT"', '"CONS"', '"CREATE_ACCOUNT"', '"CREATE_CONTRACT"', '"IMPLICIT_ACCOUNT"', '"DIP"', '"DROP"', '"DUP"', '"EDIV"', '"EMPTY_MAP"', '"EMPTY_SET"', '"EQ"', '"EXEC"', '"FAILWITH"', '"GE"', '"GET"', '"GT"', '"HASH_KEY"', '"IF"', '"IF_CONS"', '"IF_LEFT"', '"IF_NONE"', '"INT"', '"LAMBDA"', '"LE"', '"LEFT"', '"LOOP"', '"LSL"', '"LSR"', '"LT"', '"MAP"', '"MEM"', '"MUL"', '"NEG"', '"NEQ"', '"NIL"', '"NONE"', '"NOT"', '"NOW"', '"OR"', '"PAIR"', '"PUSH"', '"RIGHT"', '"SIZE"', '"SOME"', '"SOURCE"', '"SENDER"', '"SELF"', '"STEPS_TO_QUOTA"', '"SUB"', '"SWAP"', '"TRANSFER_TOKENS"', '"SET_DELEGATE"', '"UNIT"', '"UPDATE"', '"XOR"', '"ITER"', '"LOOP_LEFT"', '"ADDRESS"', '"CONTRACT"', '"ISNAT"', '"CAST"', '"RENAME"', '"bool"', '"contract"', '"int"', '"key"', '"key_hash"', '"lambda"', '"list"', '"map"', '"big_map"', '"nat"', '"option"', '"or"', '"pair"', '"set"', '"signature"', '"string"', '"bytes"', '"mutez"', '"timestamp"', '"unit"', '"operation"', '"address"', '"SLICE"', '"DEFAULT_ACCOUNT"', '"tez"'];

/**
 * A collection of functions to encode and decode Michelson and Micheline code
 */
export namespace TezosLanguageUtil {
    /**
     * 
     * @param {string} hex 
     * @returns {string} xxx
     */
    export function hexToMicheline(hex: string): codeEnvelope {
        let code = '';
        let offset = 0;
        let fieldType = hex.substring(offset, offset + 2);
        offset += 2;

        switch (fieldType) {
            case '00': {
                const value = TezosMessageUtils.findInt(hex.substring(offset), 0);
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
                let buffer: string[] = [];
                let consumed = 0;
                while (consumed < length) {
                    let envelope = hexToMicheline(hex.substring(offset));
                    buffer.push(envelope.code);
                    consumed += envelope.consumed / 2; // plain bytes
                    offset += envelope.consumed; // hex-encoded two-char bytes
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
                if (anns.code.length > 2) { // more than empty quotes
                    code += `"annots": [ ${anns.code} ] }`;
                } else {
                    code += ' }';
                }
                break;
            }
            case '07': {
                code += `{ "prim": ${michelineHexToKeyword(hex, offset)}, `;
                offset += 2;

                let buffer: string[] = [];
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

                let buffer: string[] = [];
                while (offset !== hex.length) {
                    let envelope = hexToMicheline(hex.substring(offset));
                    buffer.push(envelope.code);
                    offset += envelope.consumed;
                    if (hex.substring(offset, offset + 2) === '00') {
                        const annEnvelope = michelineHexToAnnotations(hex.substring(offset));
                        if (annEnvelope.code.length > 2) { // more than empty quotes
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
            default: { throw new Error(`Unknown Micheline field type ${fieldType}`); }
        }

        return { code: code, consumed: offset };
    }

    /**
     * 
     * @param {string} code 
     * @returns {string} xxx
     */
    export function translateMichelsonToMicheline(code: string): string {
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(Michelson));
        preProcessMichelson(code).forEach(p => { parser.feed(p); });
        return postProcessMicheline(parser.results.join(' '));
    }

    /**
     * Convenience function to take Michelson code straight to hex, calls translateMichelsonToMicheline() then translateMichelineToHex() internally.
     * 
     * @param {string} code Michelson code string
     * @returns {string} hex-encoded contract content
     */
    export function translateMichelsonToHex(code: string): string {
        return translateMichelineToHex(translateMichelsonToMicheline(code));
    }

    /**
     * 
     * @param {string} code 
     * @returns {string} xxx
     */
    export function translateMichelineToHex(code: string): string {
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(Micheline));
        parser.feed(preProcessMicheline(code));
        return parser.results.join('');
    }

    /**
     * Converts a Micheline-encoded ASCII string from hex. First 4 bytes are treated as length, followed by n-byte string.
     */
    function michelineHexToString(hex: string): codeEnvelope {
        let offset = 0;
        const length = parseInt(hex.substring(offset, offset + 8), 16);
        offset += 8;
        const text = Buffer.from(hex.substring(offset, offset + length * 2), 'hex').toString();
        offset += length * 2
        return { code: text, consumed: offset };
    }

    /**
     * Translated a plain hex-encoded int into a Michelson/Micheline keyword.
     * 
     * @param hex Hex-encoded contract to process
     * @param offset Offset to read one byte from
     * @returns {string} Michelson/Micheline keyword
     */
    function michelineHexToKeyword(hex: string, offset: number): string {
        return MichelineKeywords[parseInt(hex.substring(offset, offset + 2), 16)];
    }

    /**
     * Translates hex-encoded stream into a collection of annotations. Determines the length internally.
     * 
     * @param {string} hex Hex-encoded contract fragment to process
     * @returns {codeEnvelope} Parsed annotations and the number of consumed bytes.
     */
    function michelineHexToAnnotations(hex: string): codeEnvelope {
        const stringEnvelope = michelineHexToString(hex);
        return { code: stringEnvelope.code.split(' @').map((s, i) => i > 0 ? `"@${s}"` : `"${s}"`).join(', '), consumed: stringEnvelope.consumed };
    }

    /**
     * 
     * @param code 
     */
    function preProcessMichelson(code: string): string[] {
        const pi = code.search(/parameter/);
        const si = code.search(/storage/);
        const ci = code.search(/code/);
        let parts: string[] = [];
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

    function postProcessMicheline(code: string): string {
        const inner = code.replace(/\[{/g, '[ {').replace(/}\]/g, '} ]').replace(/},{/g, '}, {').replace(/\]}/g, '] }');
        return `{ "script": ${inner} }`;
    }

    function preProcessMicheline(fragment: string): string {
        return fragment.replace(/\n/g, ' ')
            .replace(/ +/g, ' ')
            .replace(/\[{/g, '[ {')
            .replace(/}\]/g, '} ]')
            .replace(/},{/g, '}, {')
            .replace(/\]}/g, '] }');
    }

    interface codeEnvelope {
        code: string,
        consumed: number
    }
}
