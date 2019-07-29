import { TezosParameterFormat } from '../../types/tezos/TezosChainTypes';
import { Entrypoint } from '../../types/ContractIntrospectionTypes';
import { ConseilServerInfo } from '../../types/conseil/QueryTypes';
export declare namespace TezosContractIntrospector {
    function generateEntrypointsFromCode(contractCode: string, parameterFormat?: TezosParameterFormat): Promise<Entrypoint[]>;
    function generateEntrypointsFromAddress(conseilServer: ConseilServerInfo, network: string, contractAddress: string, parameterFormat?: TezosParameterFormat): Promise<Entrypoint[]>;
}
