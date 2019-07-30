import { TezosConseilClient } from '../../reporting/tezos/TezosConseilClient';
import { TezosParameterFormat } from '../../types/tezos/TezosChainTypes';
import { EntryPoint } from '../../types/tezos/ContractIntrospectionTypes';
import { ConseilServerInfo } from '../../types/conseil/QueryTypes';
import * as EntryPointTemplate from './lexer/EntryPointTemplate';
import * as nearley from 'nearley';

/**
 * Functions for performing contract introspection, such as identifying the entry points and parameters of a smart contract
 */
export namespace TezosContractIntrospector {
    /**
     * 
     * @param contractCode - The 
     * @param parameterFormat - The
     */
    export async function generateEntryPointsFromCode(contractCode: string, parameterFormat: TezosParameterFormat = TezosParameterFormat.Michelson): Promise<EntryPoint[]> {
        const contractParameter: string = retrieveParameter(contractCode);
        const parser: nearley.Parser = new nearley.Parser(nearley.Grammar.fromCompiled(EntryPointTemplate));
        parser.feed(contractParameter);
        return parser.results[0];
    }

    /**
     * 
     * @param conseilServer 
     * @param network 
     * @param contractAddress 
     * @param parameterFormat 
     */
    export async function generateEntryPointsFromAddress(conseilServer: ConseilServerInfo, network: string, contractAddress: string, parameterFormat: TezosParameterFormat = TezosParameterFormat.Michelson): Promise<EntryPoint[]> {
        const account: any[] = await TezosConseilClient.getAccount(conseilServer, network, contractAddress);
        const contractCode = account[0].script;
        return generateEntryPointsFromCode(contractCode);
    }

    /**
     * 
     * @param contractCode - The
     */
    function retrieveParameter(contractCode: string): string {
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