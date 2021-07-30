import {KeyStore, Signer} from '../../../../types/ExternalInterfaces';
import * as TezosTypes from '../../../../types/tezos/TezosChainTypes';
import {TezosNodeReader} from '../../TezosNodeReader';
import {TezosNodeWriter} from '../../TezosNodeWriter';
import {TezosContractUtils} from '../TezosContractUtils';

export namespace Comptroller {
    /*
     * Description
     *
     * @param
     */
    export interface EnterMarketsPair {

    }

    /*
     * Description
     *
     * @param
     */
    export function EnterMarketsPairToMichelson(enterMarkets: EnterMarketsPair): string {
        return "";
    }

    /*
     * Description
     *
     * @param
     */
    export async function EnterMarkets(server: string, address: string, signer: Signer, keystore: KeyStore, enterMarkets: EnterMarketsPair, fee: number,  gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'enterMarkets';
        const parameters = EnterMarketsPairToMichelson(enterMarkets);
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    /*
     * Description
     *
     * @param
     */
    export interface ExitMarketsPair {

    }

    /*
     * Description
     *
     * @param
     */
    export function ExitMarketsPairToMichelson(exitMarkets: ExitMarketsPair): string {
        return "";
    }

    /*
     * Description
     *
     * @param
     */
    export async function ExitMarkets(server: string, address: string, signer: Signer, keystore: KeyStore, exitMarkets: ExitMarketsPair, fee: number,  gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'exitMarkets';
        const parameters = ExitMarketsPairToMichelson(exitMarkets);
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }
}

