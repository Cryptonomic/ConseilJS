export declare namespace TezosLanguageUtil {
    function hexToMicheline(hex: string): codeEnvelope;
    function translateMichelsonToMicheline(code: string): string;
    function translateMichelsonToHex(code: string): string;
    function translateMichelineToHex(code: string): string;
    function preProcessMichelsonScript(code: string): string[];
    function normalizeMichelineWhiteSpace(fragment: string): string;
    interface codeEnvelope {
        code: string;
        consumed: number;
    }
}
