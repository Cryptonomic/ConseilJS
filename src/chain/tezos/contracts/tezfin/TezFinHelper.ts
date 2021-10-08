import { TezosNodeWriter } from '../../TezosNodeWriter';
import { TezosNodeReader } from '../../TezosNodeReader';
import * as TezosP2PMessageTypes from '../../../../types/tezos/TezosP2PMessageTypes';
import { Signer, KeyStore } from '../../../../types/ExternalInterfaces';
import { Tzip7ReferenceTokenHelper } from '../Tzip7ReferenceTokenHelper';
import { CToken as FToken } from './CToken';
import { Comptroller } from './Comptroller';
import { TezosContractUtils } from '../TezosContractUtils';
import {MultiAssetTokenHelper, UpdateOperator} from '../tzip12/MultiAssetTokenHelper';

export namespace TezFinHelper {
    /*
     * Addresses of the protocol contracts
     *
     * @param fTokens List of fToken contract addresses, e.g. fTokens["XTZ"] == cXTZ contract address.
     * @param underlying Map of underlying assets' metadata.
     * @param comptroller Comptroller contract address
     * @param interestRateModel InterestRateModel contract addresses
     * @param governance Governance contract address
    */
    export interface ProtocolAddresses {
        fTokens: { [underlying: string]: string};
        fTokensReverse: { [address: string]: FToken.AssetType};
        underlying: { [tokenName: string]: FToken.UnderlyingAsset };
        comptroller: string;
        interestRateModel: { [underlying: string]: string};
        governance: string;
        priceFeed: string;
    }

    // TODO: add mainnet addresses as a constant

    /*
     * Description
     *
     * @param
     */
    export interface MarketMetadata {
        asset: FToken.UnderlyingAsset;
        metadata: FToken.UnderlyingAssetMetadata;
        liquidity: number;
        supply: FToken.MarketStatus;
        borrow: FToken.MarketStatus;
        dailyInterestPaid: number;
        reserves: number;
        reserveFactor: number;
        collateralFactor: number;
        fTokensMinted: number;
        fTokenExchangeRate: number;
    }

    /*
     * Get a market's metadata
     *
     * @param address The fToken contract address to query
     */
    export async function getMarketInfo(asset: FToken.UnderlyingAsset): Promise<MarketMetadata> {
        // TODO: do this for each fToken
        return {} as MarketMetadata;
    }

    /*
     * @description
     *
     * @param
     */
    export async function accountAPY(account: string): Promise<number> {
        return 99;
    }

    /*
     * @description
     *
     * @param
     */
    export interface SupplyComposition {
        assets: { assetType: FToken.AssetType, usdValue: number }[];
        collateral: number;
        totalUsdValue: number;
    }

    /*
     * @description
     *
     * @param
     */
    export async function supplyComposition(account: string): Promise<SupplyComposition> {
        return {
            assets: [
                { assetType: FToken.AssetType.XTZ, usdValue: 10 },
                { assetType: FToken.AssetType.FA2, usdValue: 10 },
            ],
            collateral: 44,
            totalUsdValue: 100
        }
    }

    /*
     * @description
     *
     * @param
     */
    export interface BorrowComposition {
        assets: { assetType: FToken.AssetType, usdValue: number }[];
        borrowLimit: number;
        totalUsdValue: number;
    }

    /*
     * @description
     *
     * @param
     */
    export async function borrowComposition(account: string): Promise<BorrowComposition> {
        return {};
    }

    /*
     * @description
     *
     * @param
     */
    export interface tokenStatus {
        apy: number;
        tokenBalance: number;
        usdValue: number;
    }

    /*
     * @description
     *
     * @param
     */
    export async function getSupplyToken(asset: FToken.UnderlyingAsset, account: string): Promise<{tokenStatus, collateralize}> {
        return {} as {tokenStatus, collateralize};
    }

    /*
     * @description
     *
     * @param
     */
    export async function getBorrowToken(asset: FToken.UnderlyingAsset, account: string): Promise<tokenStatus> {
        return {} as tokenStatus;
    }

    // TODO: Price feed oracle
    export interface PriceFeed {
        address: string;
    }

    /*
     * Represents an address' LTV status across the platform, denominated in USD according to the price feed
     *
     * @param supplyBalance Total value supplied
     * @param supplyAPY Current supply APY across assets
     * @param collateralBalance Total value collateralized
     * @param borrowBalance Total value borrowed
     * @param borrowAPY Current borrow APY across assets
     * @param collateralFactor Max fraction of total value supplied available for use as collateral
     * @param LTV Loan-to-value ratio = borrowBalance / (supplyBalance * collateralFactor)
     */
    export interface LTVStatus {
        suppliedAssets: MarketMetadata[];
        supplyBalance: number;
        supplyAPY: number;
        collateralBalance: number;
        borrowBalance: number;
        borrowAPY: number;
        collateralFactor: number;
        LTV: number;
    }

    /*
     * Get an account's LTV across given markets
     *
     * @param markets Array of fTokens over which to calculate LTV
     * @param priceFeed Protocol's price feed oracle
     * @param address The address for which to calculate LTV
     */
    export function getLTVStatus(markets: MarketMetadata[], priceFeed: PriceFeed, address: string): LTVStatus {
        // TODO: for each market, call getAccountStatus() and sum over all markets using price feed
        return {} as LTVStatus;
    }

    /*
     * Return the required operations for adding permissions to the underlying asset contracts. Approves the amount in params for FA1.2 and adds keystore.publicKeyHash as operator for FA2.
     *
     * @param params The parameters for invoking the CToken entrypoint
     * @param cancelPermission True when removing permissions
     * @param counter Current accout counter
     * @param keystore
     * @param fee
     * @param gas
     * @param freight
     */
    export function permissionOperation(params: FToken.MintPair | FToken.RepayBorrowPair, cancelPermission: boolean, protocolAddresses: ProtocolAddresses, counter: number, keystore: KeyStore, fee: number, gas: number = 800_000, freight: number = 20_000): TezosP2PMessageTypes.Transaction | undefined {
        const underlying: FToken.UnderlyingAsset = protocolAddresses.underlying[params.underlying] == undefined
            ? { assetType: FToken.AssetType.XTZ }
            : protocolAddresses.underlying[params.underlying];
        switch (underlying.assetType) {
            case FToken.AssetType.FA12:
                // fa12 approval operation
                return cancelPermission ?
                    // fa12 approved balance is depleted, so no need to invoke again to cancel
                    undefined :
                    // fa12 approve balance
                    Tzip7ReferenceTokenHelper.ApproveBalanceOperation(params.amount, protocolAddresses.fTokens[params.underlying], counter, underlying.address!, keystore, fee, gas, freight);
            case FToken.AssetType.FA2:
                const updateOperator: UpdateOperator = {
                    owner: keystore.publicKeyHash,
                    operator: protocolAddresses.fTokens[params.underlying],
                    tokenid: underlying.tokenId!
                };
                return cancelPermission ?
                    // fa2 remove operator
                    MultiAssetTokenHelper.RemoveOperatorsOperation(underlying.address!, counter, keystore, fee, [updateOperator]) :
                    // fa2 add operator
                    MultiAssetTokenHelper.AddOperatorsOperation(underlying.address!, counter, keystore, fee, [updateOperator]);
            case FToken.AssetType.XTZ:
                return undefined;
        }
    }

    /*
     * Construct and invoke the operation group for minting fTokens.
     *
     * @param
     */
    export async function Mint(mint: FToken.MintPair, protocolAddresses: ProtocolAddresses, server: string, signer: Signer, keystore: KeyStore, fee: number, gas: number = 800_000, freight: number = 20_000): Promise<string> {
        // get account counter
        const counter = await TezosNodeReader.getCounterForAccount(server, keystore.publicKeyHash);
        let ops: TezosP2PMessageTypes.Transaction[] = [];
        // accrue interest operation
        ops = ops.concat(FToken.AccrueInterestOperations([mint.underlying], protocolAddresses, counter, keystore, fee, gas, freight));
        // get permissions from underlying asset
        let permissionOp = permissionOperation(mint, false, protocolAddresses, counter, keystore, fee);
        if (permissionOp != undefined)
            ops.push(permissionOp);
        // mint operation
        ops.push(FToken.MintOperation(mint, counter, protocolAddresses.fTokens[mint.underlying], keystore, fee, gas, freight));
        // remove permissions from underlying asset
        let removePermissionOp = permissionOperation(mint, true, protocolAddresses, counter, keystore, fee);
        if (removePermissionOp != undefined)
            ops.push(removePermissionOp);
        // prep operation
        const opGroup = await TezosNodeWriter.prepareOperationGroup(server, keystore, counter, ops);
        // send operation
        const operationResult = await TezosNodeWriter.sendOperation(server, opGroup, signer);
        return TezosContractUtils.clearRPCOperationGroupHash(operationResult.operationGroupID);
    }

    /*
     * Construct and invoke the operation group for redeeming fTokens for the underlying asset.
     *
     * @param
     */
    export async function Redeem(redeem: FToken.RedeemPair, comptroller: Comptroller.Storage, protocolAddresses: ProtocolAddresses, server: string, signer: Signer, keystore: KeyStore, fee: number, gas: number = 800_000, freight: number = 20_000): Promise<string> {
        // get account counter
        const counter = await TezosNodeReader.getCounterForAccount(server, keystore.publicKeyHash);
        let ops: TezosP2PMessageTypes.Transaction[] = [];
        let collaterals = await Comptroller.GetCollaterals(keystore.publicKeyHash, comptroller, protocolAddresses, server);
        // accrue interest operation
        if (!collaterals.includes(redeem.underlying)) // need to accrueInterest on the redeemed market as well)
            collaterals.push(redeem.underlying);
        ops = ops.concat(FToken.AccrueInterestOperations(collaterals, protocolAddresses, counter, keystore, fee, gas, freight));
        // comptroller data relevance
        ops = ops.concat(Comptroller.DataRelevanceOperations(collaterals, protocolAddresses, counter, keystore, fee));
        // redeem operation
        ops.push(FToken.RedeemOperation(redeem, counter, protocolAddresses.fTokens[redeem.underlying], keystore, fee, gas, freight));
        // prep operation
        const opGroup = await TezosNodeWriter.prepareOperationGroup(server, keystore, counter, ops);
        // send operation
        const operationResult = await TezosNodeWriter.sendOperation(server, opGroup, signer);
        return TezosContractUtils.clearRPCOperationGroupHash(operationResult.operationGroupID);
    }

    /*
     * Construct and invoke the operation group for borrowing underlying assets.
     *
     * @param
     */
    export async function Borrow(borrow: FToken.BorrowPair, comptroller: Comptroller.Storage, protocolAddresses: ProtocolAddresses, server: string, signer: Signer, keystore: KeyStore, fee: number, gas: number = 800_000, freight: number = 20_000): Promise<string> {
        // get account counter
        const counter = await TezosNodeReader.getCounterForAccount(server, keystore.publicKeyHash);
        let ops: TezosP2PMessageTypes.Transaction[] = [];
        let collaterals = await Comptroller.GetCollaterals(keystore.publicKeyHash, comptroller, protocolAddresses, server);
        // accrue interest operation
        if (!collaterals.includes(borrow.underlying)) // need to accrueInterest on the borrowed market as well
            collaterals.push(borrow.underlying);
        ops = ops.concat(FToken.AccrueInterestOperations(collaterals, protocolAddresses, counter, keystore, fee, gas, freight));
        // comptroller data relevance
        ops = ops.concat(Comptroller.DataRelevanceOperations(collaterals, protocolAddresses, counter, keystore, fee));
        // borrow operation
        ops.push(FToken.BorrowOperation(borrow, counter, protocolAddresses.fTokens[borrow.underlying], keystore, fee, gas, freight));
        // prep operation
        const opGroup = await TezosNodeWriter.prepareOperationGroup(server, keystore, counter, ops);
        // send operation
        const operationResult = await TezosNodeWriter.sendOperation(server, opGroup, signer);
        return TezosContractUtils.clearRPCOperationGroupHash(operationResult.operationGroupID);
    }

    /*
     * Construct and invoke the operation group for repaying borrowed fTokens.
     *
     * @param
     */
    export async function RepayBorrow(repayBorrow: FToken.RepayBorrowPair, protocolAddresses: ProtocolAddresses, server: string, signer: Signer, keystore: KeyStore, fee: number, gas: number = 800_000, freight: number = 20_000): Promise<string> {
        // get account counter
        const counter = await TezosNodeReader.getCounterForAccount(server, keystore.publicKeyHash);
        let ops: TezosP2PMessageTypes.Transaction[] = [];
        // accrue interest operation
        ops = ops.concat(FToken.AccrueInterestOperations([repayBorrow.underlying], protocolAddresses, counter, keystore, fee, gas, freight));
        // get permissions from underlying asset
        let permissionOp = permissionOperation(repayBorrow, false, protocolAddresses, counter, keystore, fee);
        if (permissionOp != undefined)
            ops.push(permissionOp);
        // repayBorrow operation
        ops.push(FToken.RepayBorrowOperation(repayBorrow, counter, protocolAddresses.fTokens[repayBorrow.underlying], keystore, fee, gas, freight));
        // remove permissions from underlying asset
        let removePermissionOp = permissionOperation(repayBorrow, true, protocolAddresses, counter, keystore, fee);
        if (removePermissionOp != undefined)
            ops.push(removePermissionOp);
        // prep operation
        const opGroup = await TezosNodeWriter.prepareOperationGroup(server, keystore, counter, ops);
        // send operation
        const operationResult = await TezosNodeWriter.sendOperation(server, opGroup, signer);
        return TezosContractUtils.clearRPCOperationGroupHash(operationResult.operationGroupID);
    }

    /*
     * @description
     *
     * @param
     */
    export async function EnterMarkets(enterMarkets: Comptroller.EnterMarketsPair, comptroller: Comptroller.Storage, protocolAddresses: ProtocolAddresses, server: string, signer: Signer, keystore: KeyStore, fee: number, gas: number = 800_000, freight: number = 20_000) {
        // get account counter
        const counter = await TezosNodeReader.getCounterForAccount(server, keystore.publicKeyHash);
        let ops: TezosP2PMessageTypes.Transaction[] = [];
        let collaterals = await Comptroller.GetCollaterals(keystore.publicKeyHash, comptroller, protocolAddresses, server);
        // accrue interest operation
        ops = ops.concat(FToken.AccrueInterestOperations(collaterals, protocolAddresses, counter, keystore, fee, gas, freight));
        // comptroller data relevance
        ops = ops.concat(Comptroller.DataRelevanceOperations(collaterals, protocolAddresses, counter, keystore, fee));
        // enterMarkets operation
        ops.push(Comptroller.EnterMarketsOperation(enterMarkets, protocolAddresses.comptroller, counter, keystore, fee, gas, freight));
        // prep operation
        const opGroup = await TezosNodeWriter.prepareOperationGroup(server, keystore, counter, ops);
        // send operation
        const operationResult = await TezosNodeWriter.sendOperation(server, opGroup, signer);
        return TezosContractUtils.clearRPCOperationGroupHash(operationResult.operationGroupID);
    }

    /*
     * @description
     *
     * @param
     */
    export async function ExitMarket(exitMarket: Comptroller.ExitMarketPair, comptroller: Comptroller.Storage, protocolAddresses: ProtocolAddresses, server: string, signer: Signer, keystore: KeyStore, fee: number, gas: number = 800_000, freight: number = 20_000) {
        // get account counter
        const counter = await TezosNodeReader.getCounterForAccount(server, keystore.publicKeyHash);
        let ops: TezosP2PMessageTypes.Transaction[] = [];
        let collaterals = await Comptroller.GetCollaterals(keystore.publicKeyHash, comptroller, protocolAddresses, server);
        // accrue interest operation
        ops = ops.concat(FToken.AccrueInterestOperations(collaterals, protocolAddresses, counter, keystore, fee, gas, freight));
        // comptroller data relevance
        ops = ops.concat(Comptroller.DataRelevanceOperations(collaterals, protocolAddresses, counter, keystore, fee));
        // enterMarkets operation
        ops.push(Comptroller.ExitMarketOperation(exitMarket, protocolAddresses.comptroller, counter, keystore, fee, gas, freight));
        // prep operation
        const opGroup = await TezosNodeWriter.prepareOperationGroup(server, keystore, counter, ops);
        // send operation
        const operationResult = await TezosNodeWriter.sendOperation(server, opGroup, signer);
        return TezosContractUtils.clearRPCOperationGroupHash(operationResult.operationGroupID);
    }
}

