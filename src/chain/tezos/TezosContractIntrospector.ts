import { TezosConseilClient } from '../../reporting/tezos/TezosConseilClient';
import { TezosLanguageUtil } from './TezosLanguageUtil';
import { EntryPoint } from '../../types/tezos/ContractIntrospectionTypes';
import { ConseilServerInfo } from '../../types/conseil/QueryTypes';
import * as EntryPointTemplate from './lexer/EntryPointTemplate';
import * as nearley from 'nearley';

/**
 * Functions for performing contract introspection, such as generating the entry points of a smart contract.
 */
export namespace TezosContractIntrospector {
    /**
     * Generates invocation templates given Michelson contract parameter section.
     * 
     * @param {string} params - The parameters section of the smart contract in Michelson format.
     * @returns {EntryPoint[]} Information about the entry points, including name, parameters, structure, and invocation parameter generator.
     */
    export function generateEntryPointsFromParams(params: string): EntryPoint[] {
        const parser: nearley.Parser = new nearley.Parser(nearley.Grammar.fromCompiled(EntryPointTemplate));
        parser.feed(params);
        return parser.results[0];
    }

    /**
     * Generates the entry points of the given smart contract code in Michelson.
     * 
     * @param {string} contractCode - The entire code of the smart contract.
     * @returns {EntryPoint[]} Information about the entry points, including name, parameters, structure, and invocation parameter generator.
     */
    export function generateEntryPointsFromCode(contractCode: string): EntryPoint[] {
        const contractParameter: string = TezosLanguageUtil.preProcessMichelsonScript(contractCode)[0];
        return generateEntryPointsFromParams(contractParameter);
    }



    /**
     * Generates the entry points of the smart contract at the given address.
     * 
     * @param {ConseilServerInfo} conseilServer - Conseil server connection definition.
     * @param {string} network - Tezos network to query, mainnet, alphanet, etc.
     * @param {string} contractAddress - The address of the smart contract.
     * @returns {Promise<EntryPoint[]>} Information about the entry points, including name, parameters, structure, and invocation parameter generator.
     */
    export async function generateEntryPointsFromAddress(conseilServer: ConseilServerInfo, network: string, contractAddress: string): Promise<EntryPoint[]> {
        const account: any[] = await TezosConseilClient.getAccount(conseilServer, network, contractAddress);
        const contractCode: string = account[0].script;
        return generateEntryPointsFromCode(contractCode);
    }
}
