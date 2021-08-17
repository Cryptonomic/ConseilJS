import {KeyStore, Signer} from '../../../../types/ExternalInterfaces';
import * as TezosTypes from '../../../../types/tezos/TezosChainTypes';
import {TezosNodeReader} from '../../TezosNodeReader';
import {TezosNodeWriter} from '../../TezosNodeWriter';
import {TezosContractUtils} from '../TezosContractUtils';
import {Transaction} from '../../../../types/tezos/TezosP2PMessageTypes';
import {TezosMessageUtils} from '../../TezosMessageUtil';

export namespace Comptroller {
    /*
     * Description
     *
     * @param address Address of the CToken to update
     */
    export interface UpdateAssetPricePair {
        address: string;
    }

    /*
     * Description
     *
     * @param
     */
    export function UpdateAssetPriceMicheline(updateAssetPrice: UpdateAssetPricePair): string {
        return `{ "bytes": "${TezosMessageUtils.writeAddress(updateAssetPrice.address)}" }`
    }

    /*
     * Description
     *
     * @param
     */
    export function UpdateAssetPriceMichelson(updateAssetPrice: UpdateAssetPricePair): string {
        return `0x${TezosMessageUtils.writeAddress(updateAssetPrice.address)}`;
    }

    /*
     * Returns the operation for invoking the UpdateAssetPrice entry point of the comptroller contract
     *
     * @param
     */
    export function UpdateAssetPriceOperation(updateAssetPrice: UpdateAssetPricePair, counter: number, comptrollerAddress: string, keystore: KeyStore, fee: number,  gas: number = 800_000, freight: number = 20_000): Transaction {
        const entrypoint = 'updateAssetPrice';
        const parameters = UpdateAssetPriceMicheline(updateAssetPrice);
        return TezosNodeWriter.constructContractInvocationOperation(keystore.publicKeyHash, counter, comptrollerAddress, 0, fee, freight, gas, entrypoint, parameters, TezosTypes.TezosParameterFormat.Micheline);
    }

    /*
     * Description
     *
     * @param address Address of the account to update
     */
    export interface UpdateAccountLiquidityPair {
        address: string;
    }

    /*
     * Description
     *
     * @param
     */
    export function UpdateAccountLiquidityMicheline(updateAccountLiquidity: UpdateAssetPricePair): string {
        return `{ "bytes": "${TezosMessageUtils.writeAddress(updateAccountLiquidity.address)}" }`
    }

    /*
     * Description
     *
     * @param
     */
    export function UpdateAccountLiquidityMichelson(updateAccountLiquidity: UpdateAccountLiquidityPair): string {
        return `0x${TezosMessageUtils.writeAddress(updateAccountLiquidity.address)}`;
    }

    /*
     * Returns the operation for invoking the UpdateAssetPrice entry point of the comptroller contract
     *
     * @param
     */
    export function UpdateAccountLiquidityOperation(updateAccountLiquidity: UpdateAccountLiquidityPair, counter: number, comptrollerAddress: string, keystore: KeyStore, fee: number,  gas: number = 800_000, freight: number = 20_000): Transaction {
        const entrypoint = 'updateAccountLiquidity';
        const parameters = UpdateAccountLiquidityMicheline(updateAccountLiquidity);
        return TezosNodeWriter.constructContractInvocationOperation(keystore.publicKeyHash, counter, comptrollerAddress, 0, fee, freight, gas, entrypoint, parameters, TezosTypes.TezosParameterFormat.Micheline);
    }

    /*
     * Description
     *
     * @param cTokens List of cToken contract addresses to use as collateral.
     */
    export interface EnterMarketsPair {
        cTokens: string[];
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

