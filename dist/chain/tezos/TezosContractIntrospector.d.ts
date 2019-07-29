import { TezosParameterFormat } from '../../types/tezos/TezosChainTypes';
import { EntryPoint } from '../../types/tezos/ContractIntrospectionTypes';
import { ConseilServerInfo } from '../../types/conseil/QueryTypes';
export declare namespace TezosContractIntrospector {
    function generateEntryPointsFromCode(contractCode: string, parameterFormat?: TezosParameterFormat): Promise<EntryPoint[]>;
    function generateEntryPointsFromAddress(conseilServer: ConseilServerInfo, network: string, contractAddress: string, parameterFormat?: TezosParameterFormat): Promise<EntryPoint[]>;
}
