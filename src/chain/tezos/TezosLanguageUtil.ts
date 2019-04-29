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
        if (hex.length < 2) { throw new Error(`Malformed Micheline fragment '${hex}'`); }
        let code = '';
        let offset = 0;
        let fieldType = hex.substring(offset, offset + 2);
        offset += 2;

        switch (fieldType) {
            case '00': { // literal natural int
                const value = TezosMessageUtils.findInt(hex.substring(offset), 0, true);
                code += `{ "int": "${value.value}" }`;
                offset += value.length;
                break;
            }
            case '01': { // literal string
                const stringEnvelope = michelineHexToString(hex.substring(offset));
                code += `{ "string": "${stringEnvelope.code}" }`;
                offset += stringEnvelope.consumed;
                break;
            }
            case '02': { // array
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
                if (length === 0) {
                    code += '[]';
                } else {
                    code += `[ ${buffer.join(', ')} ]`;
                }
                break;
            }
            case '03': { // bare primitive
                code += `{ "prim": ${michelineHexToKeyword(hex, offset)} }`;
                offset += 2;
                break;
            }
            case '04': { // primitive with a set of annotations
                code += `{ "prim": ${michelineHexToKeyword(hex, offset)}, `;
                offset += 2;

                const annEnvelope = michelineHexToAnnotations(hex.substring(offset));
                code += `"annots": [ ${annEnvelope.code} ] }`;
                offset += annEnvelope.consumed;
                break;
            }
            case '05': { // primitive with an argument
                code += `{ "prim": ${michelineHexToKeyword(hex, offset)}, `;
                offset += 2;
                const envelope = hexToMicheline(hex.substring(offset));
                code += `"args": [ ${envelope.code} ] }`;
                offset += envelope.consumed;
                break;
            }
            case '06': { // primitive with an argument an a set of annotations
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
            case '07': { // primitive with two arguments
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
            case '08': { // primitive with two arguments and an anotation set
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
            case '09': { // primitive with an argument array and an optional anotation set
                code += `{ "prim": ${michelineHexToKeyword(hex, offset)}, `;
                offset += 2;

                let envelope = hexToMicheline('02' + hex.substring(offset)); // fake an array to re-use the parsing code
                code += `"args": ${envelope.code}`;
                offset += envelope.consumed - 2; // account for the inserted '02' above

                if (hex.substring(offset, offset + 8) !== '00000000') {
                    const annEnvelope = michelineHexToAnnotations(hex.substring(offset));
                    if (annEnvelope.code.length > 2) { // more than empty quotes
                        code += `, "annots": [ ${annEnvelope.code} ] }`;
                    }
                    offset += annEnvelope.consumed;
                } else {
                    code += ' }';
                    offset += 8;
                }
                break;
            }
            case '0a': { // raw bytes
                const length = parseInt(hex.substring(offset, offset + 8), 16);
                offset += 8;
                code += `{ "bytes": "${hex.substring(offset, offset + length * 2)}" }`;
                offset += length * 2;
                break;
            }
            default: { throw new Error(`Unknown Micheline field type '${fieldType}'`); }
        }

        return { code: code, consumed: offset };
    }

    /**
     * Converts Michelson to Micheline and wraps the result in a script property.
     */
    export function translateMichelsonToMicheline(code: string): string {
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(Michelson));
        preProcessMichelsonScript(code).forEach(p => { parser.feed(p); });
        //parser.results[0] is a workaround to a bug which causes duplicate matches
        return `{ "script": ${parser.results[0]} }`;
    }

    /**
     * Convenience function to take Michelson code straight to hex, calls translateMichelsonToMicheline() then translateMichelineToHex() internally.
     * 
     * @param {string} code Michelson code string
     * @returns {string} hex-encoded contract content
     */
    export function translateMichelsonToHex(code: string): string {
        return preProcessMicheline(translateMichelsonToMicheline(code))
            .map(p => normalizeMichelineWhiteSpace(p))
            .map(p => {
                const result = translateMichelineToHex(p);
                return ('0000000' + (result.length / 2).toString(16)).slice(-8) + result; // prefix byte length
            }).join('');
    }

    function preProcessMicheline(code: string): string[] {
        const container = JSON.parse(code);
        let parts: string[] = [];

        parts.push(JSON.stringify(container.script[indexOfKey(container, 'code')], null, 1));
        parts.push(JSON.stringify(container.script[indexOfKey(container, 'storage')], null, 1));

        return parts;
    }
    
    function indexOfKey(container: any, key: string): number {
        for (let i = 0; i < container.script.length; i++) {
            if (container.script[i]['prim'] === key) { return i; }
        }

        throw new Error(`${key} key was not found`);
    }

    /**
     * Translate Micheline fragment into hex. Resulting hex string may need to be processed further before being submitted to the server.
     */
    export function translateMichelineToHex(code: string): string {
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(Micheline));
        parser.feed(normalizeMichelineWhiteSpace(code));
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
     * Translates hex-encoded stream into a collection of annotations. Determines the length internally. Annotations are prefixed with ':', '@', or '%' for type, variable, and field annotations.
     * 
     * @param {string} hex Hex-encoded contract fragment to process
     * @returns {codeEnvelope} Parsed annotations and the number of consumed bytes.
     * * @see [Michelson Annotations]{@link https://tezos.gitlab.io/master/whitedoc/michelson.html#annotations}
     */
    function michelineHexToAnnotations(hex: string): codeEnvelope {
        const stringEnvelope = michelineHexToString(hex);
        return { code: stringEnvelope.code.split(' ').map(s => `"${s}"`).join(', '), consumed: stringEnvelope.consumed };
    }

    /**
     * Reformats the Michelson code into the order the parser will understand. Input is expected to contains parameter, storage and code sections.
     */
    export function preProcessMichelsonScript(code: string): string[] {
        let sections = new Map<string, any>();
        sections['parameter'] = code.search(/parameter/),
        sections['storage'] = code.search(/storage/),
        sections['code'] = code.search(/code/)

        const boundaries = Object.values(sections).sort((a, b) => Number(a) - Number(b) );
        sections[Object.keys(sections).find(key => sections[key] === boundaries[0]) + ''] = code.substring(boundaries[0], boundaries[1]);
        sections[Object.keys(sections).find(key => sections[key] === boundaries[1]) + ''] = code.substring(boundaries[1], boundaries[2]);
        sections[Object.keys(sections).find(key => sections[key] === boundaries[2]) + ''] = code.substring(boundaries[2]);

        const parts: string[] = [sections['parameter'], sections['storage'], sections['code']];

        return parts.map(p => p.trim().split('\n').map(l => l.replace(/\#[\s\S]+$/, '').trim()).filter(v => v.length > 0).join(' '));
    }

    export function normalizeMichelineWhiteSpace(fragment: string): string {
        return fragment.replace(/\n/g, ' ')
            .replace(/ +/g, ' ')
            .replace(/\[{/g, '[ {')
            .replace(/}\]/g, '} ]')
            .replace(/},{/g, '}, {')
            .replace(/\]}/g, '] }')
            .replace(/":"/g, '": "')
            .replace(/":\[/g, '": [')
            .replace(/{"/g, '{ "')
            .replace(/","/g, '", "')
            .replace(/"}/g, '" }');
    }

    interface codeEnvelope {
        code: string,
        consumed: number
    }
}
