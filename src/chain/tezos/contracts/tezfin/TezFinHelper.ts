import {TezosNodeWriter} from '../../TezosNodeWriter';
import {TezosNodeReader} from '../../TezosNodeReader';
import * as TezosP2PMessageTypes from '../../../../types/tezos/TezosP2PMessageTypes';
import {Signer, KeyStore} from '../../../../types/ExternalInterfaces';
import { Tzip7ReferenceTokenHelper } from '../Tzip7ReferenceTokenHelper';
import { CToken } from './CToken';
import { Comptroller } from './Comptroller';
import {TezosContractUtils} from '../TezosContractUtils';


export namespace TezFinHelper {
    /*
     * Addresses of the protocol contracts
     *
     * @param cTokens List of cToken contract addresses, e.g. cTokens["XTZ"] == cXTZ contract address.
     * @param comptroller Comptroller contract address
     * @param interestRateModel InterestRateModel contract addresses
     * @param governance Governance contract address
    */
    export interface ProtocolAddresses {
        cTokens: { [underlying: string]: string};
        underlying: { [tokenName: string]: string};
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
     * Description
     *
     * @param
     */
    export interface MintParams {
        underlying: string;
        pair: CToken.MintPair;
    }

    /*
     * Description
     *
     * @param
     */
    export interface RepayBorrowParams {
        underlying: string;
        pair: CToken.RepayBorrowPair;
    }

    /*
     * Add the required operations for entrypoints that invoke transferIn. This requires permissions from the underlying asset's contract, depending on the standard. For cXTZ, 
     *
     * @param params The parameters for invoking the CToken entrypoint
     * @param cancelPermission True when removing permissions
     * @param counter Current accout counter
     * @param keystore
     * @param fee
     * @param gas
     * @param freight
     */
    function permissionOperation(params: MintParams | RepayBorrowParams, cancelPermission: boolean, counter: number, keystore: KeyStore, fee: number, gas: number = 800_000, freight: number = 20_000): TezosP2PMessageTypes.Transaction | undefined {
        const tokenStd: string = TokenStandard(params.underlying);
        if (tokenStd == 'fa12') { // fa12 approval operation
            return Tzip7ReferenceTokenHelper.ApproveBalanceOperation(cancelPermission ? 0 : params.pair.amount, protocolAddresses.cTokens[params.underlying], counter, protocolAddresses.underlying[params.underlying], keystore, fee, gas, freight);
        } else if (tokenStd == 'fa2') { // fa2 add operator
            return {} as TezosP2PMessageTypes.Transaction;
        }
    }

    /*
     * Description
     *
     * @param
     */
    export async function Mint(protocolAddresses: ProtocolAddresses, mint: MintParams, server: string, signer: Signer, keystore: KeyStore, fee: number, gas: number = 800_000, freight: number = 20_000): Promise<string> {
        // get account counter
        const counter = await TezosNodeReader.getCounterForAccount(server, keystore.publicKeyHash);
        let ops: TezosP2PMessageTypes.Transaction[] = [];
        // accrue interest operation
        ops.push(CToken.AccrueInterestOperation(counter, protocolAddresses.cTokens[mint.underlying], keystore, fee, gas, freight));
        // get permissions from underlying asset
        let permissionOp = permissionOperation(mint, false, counter, keystore, fee);
        if (permissionOp != undefined)
            ops.push(permissionOp);
        // mint operation
        ops.push(CToken.MintOperation(mint.pair, counter, protocolAddresses.cTokens[mint.underlying], keystore, fee, gas, freight));
        // remove permissions from underlying asset
        let removePermissionOp = permissionOperation(mint, true, counter, keystore, fee);
        if (removePermissionOp != undefined)
            ops.push(removePermissionOp);
        // prep operation
        const opGroup = await TezosNodeWriter.prepareOperationGroup(server, keystore, counter, ops);
        // send operation
        const operationResult = await TezosNodeWriter.sendOperation(server, opGroup, signer);
        return TezosContractUtils.clearRPCOperationGroupHash(operationResult.operationGroupID);
    }

    /*
     * Description
     *
     * @param
     */
    export interface RedeemParams {
        underlying: string;
        pair: CToken.RedeemPair;
    }

    /*
     * Description
     *
     * @param
     */
    export interface BorrowParams {
        underlying: string;
        pair: CToken.BorrowPair;
    }

    // TODO: rename this to UpdateComptrollerOperations or something like that
    /*
     * Add the required operations for entrypoints that invoke transferOut. This requires updating values in the comptroller by invoking updateAssetPrice and updateAccountLiquidity.
     *
     * @param ops List of the rest of the operations in the group
     * @param params The parameters for invoking the CToken entrypoint
     * @param counter Current accout counter
     * @param keystore
     * @param fee
     * @param gas
     * @param freight
     */
    function updateComptrollerOperations(ops: TezosP2PMessageTypes.Transaction[], params: RedeemParams | BorrowParams, counter: number, keystore: KeyStore, fee: number, gas: number = 800_000, freight: number = 20_000): TezosP2PMessageTypes.Transaction[] {
        return ops;
    }
}

