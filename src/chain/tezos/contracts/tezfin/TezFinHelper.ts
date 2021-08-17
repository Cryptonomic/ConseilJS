import { TezosNodeWriter } from '../../TezosNodeWriter';
import { TezosNodeReader } from '../../TezosNodeReader';
import * as TezosP2PMessageTypes from '../../../../types/tezos/TezosP2PMessageTypes';
import { Signer, KeyStore } from '../../../../types/ExternalInterfaces';
import { Tzip7ReferenceTokenHelper } from '../Tzip7ReferenceTokenHelper';
import { CToken } from './CToken';
import { Comptroller } from './Comptroller';
import { TezosContractUtils } from '../TezosContractUtils';
import {MultiAssetTokenHelper, UpdateOperator} from '../tzip12/MultiAssetTokenHelper';

export namespace TezFinHelper {
    /*
     * Addresses of the protocol contracts
     *
     * @param cTokens List of cToken contract addresses, e.g. cTokens["XTZ"] == cXTZ contract address.
     * @param underlying Map of underlying assets' metadata.
     * @param comptroller Comptroller contract address
     * @param interestRateModel InterestRateModel contract addresses
     * @param governance Governance contract address
    */
    export interface ProtocolAddresses {
        cTokens: { [underlying: string]: string};
        underlying: { [tokenName: string]: CToken.UnderlyingAsset };
        comptroller: string;
        interestRateModel: { [underlying: string]: string};
        governance: string;
        priceFeed: string;
    }

    // TODO: add mainnet addresses
    export const protocolAddresses: ProtocolAddresses = {
        cTokens: {},
        underlying: {},
        comptroller: '',
        interestRateModel: {},
        governance: '',
        priceFeed: ''
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
     * @param markets Array of cTokens over which to calculate LTV
     * @param priceFeed Protocol's price feed oracle
     * @param address The address for which to calculate LTV
     */
    export function getLTVStatus(markets: CToken.MarketInfo[], priceFeed: PriceFeed, address: string): LTVStatus {
        // TODO: for each market, call getAccountStatus() and sum over all markets using price feed
        return {} as LTVStatus;
    }

    // TODO: fucntions to get market infos

    // TODO: user flow functions
    // mint:
    //  CToken.accrueInterest
    //  CFA12.approve
    //  CToken.mint
    //  CFA12.unapprove
    // redeem: doTransferOut
    //  CToken.accrueInterest
    //  Comptroller.updateAssetPrice
    //  Comptroller.updateAccountLiquidity
    //  CToken.redeem
    // redeemUnderlying:
    //  same as redeem, but amount is specified in underlying rather than cTokens
    // borrow: doTransferOut
    //  CToken.accrueInterest
    //  Comptroller.updateAssetPrice
    //  Comptroller.updateAccountLiquidity
    //  CToken.borrow
    // repayBorrow: doTransferIn
    //  CToken.accrueInterest
    //  CFA12.approve
    //  CToken.repayBorrow
    //  CFA12.unapprove
    // repayBorrowBehalf:
    //  same as repayBorrow
    // transfer:
    //  Comptroller.updateAssetPrice
    //  Comptroller.updateAccountLiquidity
    //  CToken.transfer

    /*
     * Return which token standard the underlying of mint is implemented on.
     *
     * @param mint MintParams object
     */
    export function TokenStandard(underlying: string): string {
        // TODO: change token names to tokens supported at launch. underlying will be compared to 'usdtz' || 'ethtz' for example.
        if (underlying == 'fa12') {
            return 'fa12';
        } else if (underlying == 'fa2') {
            return 'fa2';
        } else
            return 'xtz';
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
    function permissionOperation(params: CToken.MintPair | CToken.RepayBorrowPair, cancelPermission: boolean, protocolAddresses: ProtocolAddresses, counter: number, keystore: KeyStore, fee: number, gas: number = 800_000, freight: number = 20_000): TezosP2PMessageTypes.Transaction | undefined {
        const underlying: CToken.UnderlyingAsset = protocolAddresses.underlying[params.underlying];
        switch (underlying.assetType) {
            case CToken.AssetType.FA12:
                // fa12 approval operation
                return Tzip7ReferenceTokenHelper.ApproveBalanceOperation(params.amount, protocolAddresses.cTokens[params.underlying], counter, underlying.address!, keystore, fee, gas, freight);
            case CToken.AssetType.FA2:
                const updateOperator: UpdateOperator = { 
                    owner: keystore.publicKeyHash,
                    operator: protocolAddresses.cTokens[params.underlying],
                    tokenid: underlying.tokenId!
                };
                return cancelPermission ?
                    // fa2 remove operator
                    MultiAssetTokenHelper.removeOperatorsOperation(underlying.address!, counter, keystore, fee, [updateOperator]) :
                    // fa2 add operator
                    MultiAssetTokenHelper.addOperatorsOperation(underlying.address!, counter, keystore, fee, [updateOperator]);
            case CToken.AssetType.XTZ:
                return undefined;
        }
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
    function comptrollerRelevanceOperations(params: CToken.RedeemPair | CToken.BorrowPair, protocolAddresses: ProtocolAddresses, counter: number, keystore: KeyStore, fee: number, gas: number = 800_000, freight: number = 20_000): TezosP2PMessageTypes.Transaction[] {
        // updateAssetPrice
        const updateAssetPrice: Comptroller.UpdateAssetPricePair = { address: protocolAddresses.cTokens[params.underlying] };
        const updateAssetPriceOp = Comptroller.UpdateAssetPriceOperation(updateAssetPrice, counter, protocolAddresses.comptroller, keystore, fee,  gas, freight);
        // updateAccountLiquidity
        const updateAccountLiquidity: Comptroller.UpdateAccountLiquidityPair = { address: keystore.publicKeyHash };
        const updateAccountLiquidityOp = Comptroller.UpdateAccountLiquidityOperation(updateAccountLiquidity, counter, protocolAddresses.comptroller, keystore, fee,  gas, freight);
        return [ updateAssetPriceOp, updateAccountLiquidityOp ];
    }

    /*
     * Construct and invoke the operation group for minting cTokens.
     *
     * @param
     */
    export async function Mint(mint: CToken.MintPair, protocolAddresses: ProtocolAddresses, server: string, signer: Signer, keystore: KeyStore, fee: number, gas: number = 800_000, freight: number = 20_000): Promise<string> {
        // get account counter
        const counter = await TezosNodeReader.getCounterForAccount(server, keystore.publicKeyHash);
        let ops: TezosP2PMessageTypes.Transaction[] = [];
        // accrue interest operation
        ops.push(CToken.AccrueInterestOperation(counter, protocolAddresses.cTokens[mint.underlying], keystore, fee, gas, freight));
        // get permissions from underlying asset
        let permissionOp = permissionOperation(mint, false, protocolAddresses, counter, keystore, fee);
        if (permissionOp != undefined)
            ops.push(permissionOp);
        // mint operation
        ops.push(CToken.MintOperation(mint, counter, protocolAddresses.cTokens[mint.underlying], keystore, fee, gas, freight));
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
     * Construct and invoke the operation group for redeeming cTokens for the underlying asset.
     *
     * @param
     */
    export async function Redeem(redeem: CToken.RedeemPair, protocolAddresses: ProtocolAddresses, server: string, signer: Signer, keystore: KeyStore, fee: number, gas: number = 800_000, freight: number = 20_000): Promise<string> {
        // get account counter
        const counter = await TezosNodeReader.getCounterForAccount(server, keystore.publicKeyHash);
        let ops: TezosP2PMessageTypes.Transaction[] = [];
        // accrue interest operation
        ops.push(CToken.AccrueInterestOperation(counter, protocolAddresses.cTokens[redeem.underlying], keystore, fee, gas, freight));
        // comptroller data relevance
        ops.concat(comptrollerRelevanceOperations(redeem, protocolAddresses, counter, keystore, fee));
        // redeem operation
        ops.push(CToken.RedeemOperation(redeem, counter, protocolAddresses.cTokens[redeem.underlying], keystore, fee, gas, freight));
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
    export async function Borrow(borrow: CToken.BorrowPair, protocolAddresses: ProtocolAddresses, server: string, signer: Signer, keystore: KeyStore, fee: number, gas: number = 800_000, freight: number = 20_000): Promise<string> {
        // get account counter
        const counter = await TezosNodeReader.getCounterForAccount(server, keystore.publicKeyHash);
        let ops: TezosP2PMessageTypes.Transaction[] = [];
        // accrue interest operation
        // ops.push(CToken.AccrueInterestOperation(counter, protocolAddresses.cTokens[borrow.underlying], keystore, fee, gas, freight));
        // comptroller data relevance
        ops = ops.concat(comptrollerRelevanceOperations(borrow, protocolAddresses, counter, keystore, fee));
        // borrow operation
        ops.push(CToken.BorrowOperation(borrow, counter, protocolAddresses.cTokens[borrow.underlying], keystore, fee, gas, freight));
        // prep operation
        const opGroup = await TezosNodeWriter.prepareOperationGroup(server, keystore, counter, ops);
        // send operation
        const operationResult = await TezosNodeWriter.sendOperation(server, opGroup, signer);
        return TezosContractUtils.clearRPCOperationGroupHash(operationResult.operationGroupID);
    }

    /*
     * Construct and invoke the operation group for repaying borrowed cTokens.
     *
     * @param
     */
    export async function RepayBorrow(repayBorrow: CToken.RepayBorrowPair, protocolAddresses: ProtocolAddresses, server: string, signer: Signer, keystore: KeyStore, fee: number, gas: number = 800_000, freight: number = 20_000): Promise<string> {
        // get account counter
        const counter = await TezosNodeReader.getCounterForAccount(server, keystore.publicKeyHash);
        let ops: TezosP2PMessageTypes.Transaction[] = [];
        // accrue interest operation
        ops.push(CToken.AccrueInterestOperation(counter, protocolAddresses.cTokens[repayBorrow.underlying], keystore, fee, gas, freight));
        // get permissions from underlying asset
        let permissionOp = permissionOperation(repayBorrow, false, protocolAddresses, counter, keystore, fee);
        if (permissionOp != undefined)
            ops.push(permissionOp);
        // mint operation
        ops.push(CToken.RepayBorrowOperation(repayBorrow, counter, protocolAddresses.cTokens[repayBorrow.underlying], keystore, fee, gas, freight));
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
}

