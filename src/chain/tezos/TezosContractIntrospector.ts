import { TezosConseilClient } from '../../reporting/tezos/TezosConseilClient';
import { TezosParameterFormat } from '../../types/tezos/TezosChainTypes';
import { EntryPoint } from '../../types/tezos/ContractIntrospectionTypes';
import { ConseilServerInfo } from '../../types/conseil/QueryTypes';
import * as EntryPointTemplate from './lexer/EntryPointTemplate';
import * as nearley from 'nearley';

/**
 * Functions for performing contract introspection, such as generating the entry points of a smart contract.
 */
export namespace TezosContractIntrospector {
    /**
     * Generates the entry points of the given smart contract code.
     * 
     * @param {string} contractCode - The entire code of the smart contract.
     * @param {TezosParameterFormat} parameterFormat - The format of the parameter.
     * @returns {Promise<EntryPoint[]>} Information about the entry points, including name, parameters, structure, and invocation parameter generator.
     */
    export async function generateEntryPointsFromCode(contractCode: string, parameterFormat: TezosParameterFormat = TezosParameterFormat.Michelson): Promise<EntryPoint[]> {
        const contractParameter: string = extractParameter(contractCode);
        const parser: nearley.Parser = new nearley.Parser(nearley.Grammar.fromCompiled(EntryPointTemplate));
        parser.feed(contractParameter);
        return parser.results[0];
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

    /**
     * Extracts the parameter definition from smart contract code.
     * 
     * @param {string} contractCode - The entire Michelson code of the smart contract.
     * @returns {string} The parameter definition of the smart contract.
     */
    function extractParameter(contractCode: string): string {
        let sections = new Map<string, any>();
        sections['parameter'] = contractCode.search(/parameter/),
        sections['storage'] = contractCode.search(/storage/),
        sections['code'] = contractCode.search(/code/)

        const boundaries = Object.values(sections).sort((a, b) => Number(a) - Number(b) );
        sections[Object.keys(sections).find(key => sections[key] === boundaries[0]) + ''] = contractCode.substring(boundaries[0], boundaries[1]);
        sections[Object.keys(sections).find(key => sections[key] === boundaries[1]) + ''] = contractCode.substring(boundaries[1], boundaries[2]);
        sections[Object.keys(sections).find(key => sections[key] === boundaries[2]) + ''] = contractCode.substring(boundaries[2]);

        const parts: string[] = [sections['parameter'], sections['storage'], sections['code']];

        const processedParts = parts.map(p => p.trim().split('\n').map(l => l.replace(/\#[\s\S]+$/, '').trim()).filter(v => v.length > 0).join(' '));
        return processedParts[0];
    }
}