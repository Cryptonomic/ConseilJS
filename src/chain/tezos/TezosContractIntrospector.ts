import { TezosConseilClient } from '../../reporting/tezos/TezosConseilClient';
import { TezosParameterFormat } from '../../types/tezos/TezosChainTypes';
import { Entrypoint } from '../../types/ContractIntrospectionTypes';
import { ConseilServerInfo } from '../../types/conseil/QueryTypes';
import * as EntrypointTemplate from './lexer/EntrypointTemplate';
import * as nearley from 'nearley';

export namespace TezosContractIntrospector {
    /**
     * 
     * @param contractCode 
     * @param parameterFormat 
     */
    export async function generateEntrypointsFromCode(contractCode: string, parameterFormat: TezosParameterFormat = TezosParameterFormat.Michelson): Promise<Entrypoint[]> {
        const contractParameter: string = retrieveParameter(contractCode);
        const parser: nearley.Parser = new nearley.Parser(nearley.Grammar.fromCompiled(EntrypointTemplate));
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
    export async function generateEntrypointsFromAddress(conseilServer: ConseilServerInfo, network: string, contractAddress: string, parameterFormat: TezosParameterFormat = TezosParameterFormat.Michelson): Promise<Entrypoint[]> {
        const account: any[] = await TezosConseilClient.getAccount(conseilServer, network, contractAddress);
        const contractCode = account[0].script;
        return generateEntrypointsFromCode(contractCode);
    }

    function retrieveParameter(contractCode: string): string {
        const parameterStartIndex: number = contractCode.indexOf('parameter');
        const parameterEndIndex: number = contractCode.indexOf(';', parameterStartIndex) + 1;
        return contractCode.substring(parameterStartIndex, parameterEndIndex).replace(/\s+/gm, ' ');
    }
}