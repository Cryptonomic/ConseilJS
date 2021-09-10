import { JSONPath } from 'jsonpath-plus';
import * as TezosP2PMessageTypes from '../../../../types/tezos/TezosP2PMessageTypes';
import {KeyStore, Signer} from '../../../../types/ExternalInterfaces';
import * as TezosTypes from '../../../../types/tezos/TezosChainTypes';
import {TezosNodeReader} from '../../TezosNodeReader';
import {TezosNodeWriter} from '../../TezosNodeWriter';
import {TezosContractUtils} from '../TezosContractUtils';
import {Transaction} from '../../../../types/tezos/TezosP2PMessageTypes';
import {TezosMessageUtils} from '../../TezosMessageUtil';
import {CToken} from './CToken';
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
    }

    /*
     * @description Get an instance of a Objkts contract's storage by querying a given address
     *
     * @param server The Tezos node to communicate with
     * @param address Contract address, i.e. HicNFTHelper.objktsAddress or HicNFTHelper.hDaoAddress
     */
    export async function GetStorage(address: string, server: string): Promise<Storage> {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);
        return {
            accountAssetsMapId: 46048
        };
    }

    /**
     * @description Return the list of collateralized markets for address
     *
     * @param server
     * @param mapId
     * @param address
     */
    export async function GetCollaterals(address: string, comptroller: Storage, protocolAddresses: TezFinHelper.ProtocolAddresses, server: string): Promise<CToken.AssetType[]> {
        const packedAccountKey = TezosMessageUtils.encodeBigMapKey(
            Buffer.from(TezosMessageUtils.writePackedData(`0x${TezosMessageUtils.writeAddress(address)}`, '', TezosTypes.TezosParameterFormat.Michelson), 'hex')
        );

        try {
            const assetsResult = await TezosNodeReader.getValueForBigMapKey(server, comptroller.accountAssetsMapId, packedAccountKey);
            const cTokenAddresses: CToken.AssetType[] = assetsResult.map((json) => json['string']);
            return cTokenAddresses.map((cTokenAddress) => protocolAddresses.cTokensReverse[cTokenAddress]);
        } catch (err) {
            log.error(`${address} has no collateralized assets`);
            return [];
        }
    }


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
     * @param params The parameters for invoking the CToken entrypoint
     * @param counter Current account counter
     * @param keystore
     * @param fee
     * @param gas
     * @param freight
     */
    export function DataRelevanceOperations(collaterals: CToken.AssetType[], protocolAddresses: TezFinHelper.ProtocolAddresses, counter: number, keystore: KeyStore, fee: number,  gas: number = 800_000, freight: number = 20_000): Transaction[] {
        let ops: TezosP2PMessageTypes.Transaction[] = [];
        // updateAssetPrice for every collateralized market
        for (const collateral of collaterals) {
            const updateAssetPrice: Comptroller.UpdateAssetPricePair = { address: protocolAddresses.cTokens[collateral] };
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
     * @param params The parameters for invoking the CToken entrypoint
     * @param counter Current account counter
     * @param keystore
     * @param fee
     * @param gas
     * @param freight
     */
    export async function DataRelevance(collaterals: CToken.AssetType[], protocolAddresses: TezFinHelper.ProtocolAddresses, server: string, signer: Signer, keystore: KeyStore, fee: number,  gas: number = 800_000, freight: number = 20_000): Promise<string> {
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
    export function EnterMarketsPairMicheline(enterMarkets: EnterMarketsPair): string {
        return `[ ${enterMarkets.cTokens.map(market => `{ "bytes": "${TezosMessageUtils.writeAddress(market)}" }`).join(',')} ]`;
    }

    /*
     * Description
     *
     * @param
     */
    export async function EnterMarkets(enterMarkets: EnterMarketsPair, server: string, comptrollerAddress: string, signer: Signer, keystore: KeyStore, fee: number,  gas: number = 800_000, freight: number = 20_000): Promise<string> {
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
     * Description
     *
     * @param
     */
    export async function ExitMarket(exitMarket: ExitMarketPair, server: string, comptrollerAddress: string, signer: Signer, keystore: KeyStore, fee: number,  gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'exitMarket';
        const parameters = ExitMarketPairMicheline(exitMarket);
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, comptrollerAddress, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Micheline);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }
}

