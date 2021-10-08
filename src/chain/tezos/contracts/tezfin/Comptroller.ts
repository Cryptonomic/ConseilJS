import { JSONPath } from 'jsonpath-plus';
import * as TezosP2PMessageTypes from '../../../../types/tezos/TezosP2PMessageTypes';
import {KeyStore, Signer} from '../../../../types/ExternalInterfaces';
import * as TezosTypes from '../../../../types/tezos/TezosChainTypes';
import {TezosNodeReader} from '../../TezosNodeReader';
import {TezosNodeWriter} from '../../TezosNodeWriter';
import {TezosContractUtils} from '../TezosContractUtils';
import {Transaction} from '../../../../types/tezos/TezosP2PMessageTypes';
import {TezosMessageUtils} from '../../TezosMessageUtil';
import {FToken} from './FToken';
import FetchSelector from '../../../../utils/FetchSelector'
import LogSelector from '../../../../utils/LoggerSelector';
import {TezFinHelper} from './TezFinHelper';

const log = LogSelector.log;
const fetch = FetchSelector.fetch;

export namespace Comptroller {
    /*
     * @description
     *
     * @param
     */
    export interface Storage {
        accountAssetsMapId: number;
        accountLiquidity: number;
        administrator: string;
        closeFactorMantissa: number;
        expScale: number;
        halfExpScale: number;
        liquidationIncentiveMantissa: number;
        liquidityPeriodRelevance: number;
        markets: TezFinHelper.MarketMetadata;
        oracleAddress: string;
        pendingAdministrator: string | undefined;
        pricePeriodRelevance: number;
        transferPaused: boolean;
    }

    /*
     * @description
     *
     * @param server The Tezos node to communicate with
     * @param address
     */
    export async function GetStorage(address: string, server: string): Promise<Storage> {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);
        return {
            accountAssetsMapId: JSONPath({path: '$.args[0].args[0].args[0].args[0].args[0].int', json: storageResult })[0],
            accountLiquidity: JSONPath({path: '$.args[0].args[0].args[0].args[0].args[1].int', json: storageResult })[0],
            administrator: JSONPath({path: '$.args[0].args[0].args[0].args[2].string', json: storageResult })[0],
            closeFactorMantissa: JSONPath({path: '$.args[0].args[0].args[1].args[1].int', json: storageResult })[0],
            expScale: JSONPath({path: '$.args[0].args[0].args[2].int', json: storageResult })[0],
            halfExpScale: JSONPath({path: '$.args[0].args[0].args[3].int', json: storageResult })[0],
            liquidationIncentiveMantissa: JSONPath({path: '$.args[0].args[1].args[0].args[0].int', json: storageResult })[0],
            liquidityPeriodRelevance: JSONPath({path: '$.args[0].args[1].args[0].args[1].int', json: storageResult })[0],
            markets: {} as TezFinHelper.MarketMetadata, // $.args[0].args[1].args[2]
            oracleAddress: JSONPath({path: '$.args[0].args[2].args[0].string', json: storageResult })[0],
            pendingAdministrator: JSONPath({path: '$.args[0].args[2].args[1].prim', json: storageResult })[0],
            pricePeriodRelevance: JSONPath({path: '$.args[0].args[3].int', json: storageResult })[0],
            transferPaused: JSONPath({path: '$.args[0].args[4].prim', json: storageResult })[0], // fix boolean
        };
    }

    /**
     * @description Return the list of collateralized markets for address
     *
     * @param server
     * @param mapId
     * @param address
     */
    export async function GetCollaterals(address: string, comptroller: Storage, protocolAddresses: TezFinHelper.ProtocolAddresses, server: string): Promise<FToken.AssetType[]> {
        const packedAccountKey = TezosMessageUtils.encodeBigMapKey(
            Buffer.from(TezosMessageUtils.writePackedData(`0x${TezosMessageUtils.writeAddress(address)}`, '', TezosTypes.TezosParameterFormat.Michelson), 'hex')
        );

        try {
            const assetsResult = await TezosNodeReader.getValueForBigMapKey(server, comptroller.accountAssetsMapId, packedAccountKey);
            const fTokenAddresses: FToken.AssetType[] = assetsResult.map((json) => json['string']);
            return fTokenAddresses.map((fTokenAddress) => protocolAddresses.fTokensReverse[fTokenAddress]);
        } catch (err) {
            log.error(`${address} has no collateralized assets`);
            return [];
        }
    }


    /*
     * Description
     *
     * @param address Address of the FToken to update
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
     * @description
     *
     * @param
     */
    export async function UpdateAssetPrice(updateAssetPrice: UpdateAssetPricePair, server: string, comptrollerAddress: string, signer: Signer, keystore: KeyStore, fee: number,  gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entrypoint = 'updateAccountLiquidity';
        const parameters = UpdateAccountLiquidityMicheline(updateAssetPrice);
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, comptrollerAddress, 0, fee, freight, gas, entrypoint, parameters, TezosTypes.TezosParameterFormat.Micheline);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
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
        return `{ "bytes": "${TezosMessageUtils.writeAddress(updateAccountLiquidity.address)}" }`;
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
     * @description
     *
     * @param
     */
    export async function UpdateAccountLiquidity(updateAccountLiquidity: UpdateAccountLiquidityPair, server: string, comptrollerAddress: string, signer: Signer, keystore: KeyStore, fee: number,  gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entrypoint = 'updateAccountLiquidity';
        const parameters = UpdateAccountLiquidityMicheline(updateAccountLiquidity);
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, comptrollerAddress, 0, fee, freight, gas, entrypoint, parameters, TezosTypes.TezosParameterFormat.Micheline);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    /*
     * Add the required operations for entrypoints that invoke transferOut. This requires updating the comptroller contract's accounting.
     *
     * @param params The parameters for invoking the FToken entrypoint
     * @param counter Current account counter
     * @param keystore
     * @param fee
     * @param gas
     * @param freight
     */
    export function DataRelevanceOperations(collaterals: FToken.AssetType[], protocolAddresses: TezFinHelper.ProtocolAddresses, counter: number, keystore: KeyStore, fee: number,  gas: number = 800_000, freight: number = 20_000): Transaction[] {
        let ops: TezosP2PMessageTypes.Transaction[] = [];
        // updateAssetPrice for every collateralized market
        for (const collateral of collaterals) {
            const updateAssetPrice: Comptroller.UpdateAssetPricePair = { address: protocolAddresses.fTokens[collateral] };
            const updateAssetPriceOp = Comptroller.UpdateAssetPriceOperation(updateAssetPrice, counter, protocolAddresses.comptroller, keystore, fee,  gas, freight);
            ops.push(updateAssetPriceOp);
        }
        // updateAccountLiquidity
        const updateAccountLiquidity: Comptroller.UpdateAccountLiquidityPair = { address: keystore.publicKeyHash };
        const updateAccountLiquidityOp = Comptroller.UpdateAccountLiquidityOperation(updateAccountLiquidity, counter, protocolAddresses.comptroller, keystore, fee,  gas, freight);
        ops.push(updateAccountLiquidityOp);
        return ops;
    }
    /*
     * Add the required operations for entrypoints that invoke transferOut. This requires updating the comptroller contract's accounting.
     *
     * @param params The parameters for invoking the FToken entrypoint
     * @param counter Current account counter
     * @param keystore
     * @param fee
     * @param gas
     * @param freight
     */
    export async function DataRelevance(collaterals: FToken.AssetType[], protocolAddresses: TezFinHelper.ProtocolAddresses, server: string, signer: Signer, keystore: KeyStore, fee: number,  gas: number = 800_000, freight: number = 20_000): Promise<string> {
        // get account counter
        const counter = await TezosNodeReader.getCounterForAccount(server, keystore.publicKeyHash);
        let ops: TezosP2PMessageTypes.Transaction[] = DataRelevanceOperations(collaterals, protocolAddresses,counter, keystore, fee, gas, freight);
        const opGroup = await TezosNodeWriter.prepareOperationGroup(server, keystore, counter, ops);
        // send operation
        const operationResult = await TezosNodeWriter.sendOperation(server, opGroup, signer);
        return TezosContractUtils.clearRPCOperationGroupHash(operationResult.operationGroupID);
    }

    /*
     * Description
     *
     * @param fTokens List of fToken contract addresses to use as collateral.
     */
    export interface EnterMarketsPair {
        fTokens: string[];
    }

    /*
     * Description
     *
     * @param
     */
    export function EnterMarketsPairMicheline(enterMarkets: EnterMarketsPair): string {
        return `[ ${enterMarkets.fTokens.map(market => `{ "bytes": "${TezosMessageUtils.writeAddress(market)}" }`).join(',')} ]`;
    }

    /*
     * @description
     *
     * @param
     */
    export function EnterMarketsOperation(enterMarkets: EnterMarketsPair, comptrollerAddress: string, counter: number, keystore: KeyStore, fee: number,  gas: number = 800_000, freight: number = 20_000): Transaction {
        const entrypoint = 'enterMarkets';
        const parameters = EnterMarketsPairMicheline(enterMarkets);
        return TezosNodeWriter.constructContractInvocationOperation(keystore.publicKeyHash, counter, comptrollerAddress, 0, fee, freight, gas, entrypoint, parameters, TezosTypes.TezosParameterFormat.Micheline);
    }

    /*
     * Description
     *
     * @param
     */
    export async function EnterMarkets(enterMarkets: EnterMarketsPair, comptrollerAddress: string, server: string, signer: Signer, keystore: KeyStore, fee: number,  gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'enterMarkets';
        const parameters = EnterMarketsPairMicheline(enterMarkets);
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, comptrollerAddress, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Micheline);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    /*
     * Description
     *
     * @param
     */
    export interface ExitMarketPair {
        address: string;
    }

    /*
     * Description
     *
     * @param
     */
    export function ExitMarketPairMicheline(exitMarket: ExitMarketPair): string {
        return `{ "bytes": "${TezosMessageUtils.writeAddress(exitMarket.address)}" }`;
    }

    /*
     * @description
     *
     * @param
     */
    export function ExitMarketOperation(exitMarket: ExitMarketPair, comptrollerAddress: string, counter: number, keystore: KeyStore, fee: number,  gas: number = 800_000, freight: number = 20_000): Transaction {
        const entrypoint = 'exitMarket';
        const parameters = ExitMarketPairMicheline(exitMarket);
        return TezosNodeWriter.constructContractInvocationOperation(keystore.publicKeyHash, counter, comptrollerAddress, 0, fee, freight, gas, entrypoint, parameters, TezosTypes.TezosParameterFormat.Micheline);
    }

    /*
     * Description
     *
     * @param
     */
    export async function ExitMarket(exitMarket: ExitMarketPair, comptrollerAddress: string, server: string, signer: Signer, keystore: KeyStore, fee: number,  gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'exitMarket';
        const parameters = ExitMarketPairMicheline(exitMarket);
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, comptrollerAddress, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Micheline);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }
}

