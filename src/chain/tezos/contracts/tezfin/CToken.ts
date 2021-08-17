import {KeyStore, Signer} from '../../../../types/ExternalInterfaces';
import * as TezosTypes from '../../../../types/tezos/TezosChainTypes';
import {TezosNodeReader} from '../../TezosNodeReader';
import {TezosNodeWriter} from '../../TezosNodeWriter';
import {TezosContractUtils} from '../TezosContractUtils';
import { TezFinHelper } from './TezFinHelper';
import {Transaction} from '../../../../types/tezos/TezosP2PMessageTypes';

export namespace CToken {
    export enum AssetType {
        XTZ = "XTZ",
        FA12 = "FA12",
        FA2 = "FA2"
    }

    /*
     * Represents an underlying asset.
     *
     * @param address Contract address. Null for XTZ.
     * @param tokenId FA2 token id. Null for XTZ, FA12.
     */
    export interface UnderlyingAsset {
        assetType: AssetType;
        address?: string;
        tokenId?: number;
    }

    /*
     * Description
     *
     * @param
     */
    export interface MarketMetadata {
        name: string;
        tokenSymbol: string;
        administrator: string;
        price: number;
    }

    /*
     * Description
     *
     * @param
     */
    export interface MarketStatus {
        numParticipants: number;
        amount: number;
        apy: number;
    }

    /*
     * Description
     *
     * @param
     */
    export interface MarketInfo {
        asset: UnderlyingAsset;
        metadata: MarketMetadata;
        liquidity: number;
        supply: MarketStatus;
        borrow: MarketStatus;
        dailyInterestPaid: number;
        reserves: number;
        reserveFactor: number;
        collateralFactor: number;
        cTokensMinted: number;
        cTokenExchangeRate: number;
    }

    /*
     * Get a market's metadata
     *
     * @param address The cToken contract address to query
     */
    export async function getMarketInfo(address: string): Promise<MarketInfo> {
        return {} as MarketInfo;
    }

    /*
     * Return the operation for invoking the accrueInterest entrypoint of the given cToken address
     *
     * @param counter Current account counter
     * @param cTokenAddress The relevant CToken contract address
     * @param keyStore
     * @param fee
     * @param gas
     * @param freight
     */
    export function AccrueInterestOperation(counter: number, cTokenAddress: string, keyStore: KeyStore, fee: number,  gas: number = 800_000, freight: number = 20_000): Transaction {
        const entrypoint = 'accrueInterest';
        const parameters = 'Unit'
        return TezosNodeWriter.constructContractInvocationOperation(keyStore.publicKeyHash, counter, cTokenAddress, 0, fee, freight, gas, entrypoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
    }

    /*
     * Invoke only the accrueInterest entrypoint.
     *
     * @param
     */
    export async function AccrueInterest(server: string, address: string, signer: Signer, keystore: KeyStore, fee: number, gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'accrueInterest';
        const parameters = 'Unit';

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }


    /*
     * Mint entrypoint parameters
     *
     * @param amount The amount to cTokens to mint
     */
    export interface MintPair {
        underlying: string;
        amount: number;
    }

    /*
     * Convert MintPair to Michelson string
     *
     * @param
     */
    export function MintPairMichelson(mint: MintPair): string {
        return `${mint.amount}`;
    }

    /*
     * Returns the operation for invoking the mint entrypoint of the given cToken address
     *
     * @param mint Invocation parameters
     * @param counter Current account coutner
     * @param cTokenAddress The relevant CToken contract address
     * @param keyStore
     * @param fee
     * @param gas
     * @param freight
     */
    export function MintOperation(mint: MintPair, counter: number, cTokenAddress: string, keyStore: KeyStore, fee: number,  gas: number = 800_000, freight: number = 20_000): Transaction {
        const entrypoint = 'mint';
        const parameters = MintPairMichelson(mint);
        return TezosNodeWriter.constructContractInvocationOperation(keyStore.publicKeyHash, counter, cTokenAddress, 0, fee, freight, gas, entrypoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
    }

    /*
     * Redeem entrypoint parameters
     *
     * @param amount The amount of cTokens to redeem
     */
    export interface RedeemPair {
        underlying: string;
        amount: number;
    }

    /*
     * Description
     *
     * @param
     */
    function RedeemPairMichelson(redeem: RedeemPair): string {
        return `${redeem.amount}`;
    }

    /*
     * Description
     *
     * @param
     */
    export function RedeemOperation(redeem: RedeemPair, counter: number, cTokenAddress: string, keyStore: KeyStore, fee: number,  gas: number = 800_000, freight: number = 20_000): Transaction {
        const entrypoint = 'redeem';
        const parameters = RedeemPairMichelson(redeem);
        return TezosNodeWriter.constructContractInvocationOperation(keyStore.publicKeyHash, counter, cTokenAddress, 0, fee, freight, gas, entrypoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
    }


    /*
     * Description
     *
     * @param
     */
    export interface BorrowPair {
        underlying: string;
        amount: number;
    }

    /*
     * Description
     *
     * @param
     */
    export function BorrowPairMichelson(borrow: BorrowPair): string {
        return `${borrow.amount}`;

    }

    /*
     * Description
     *
     * @param
     */
    export function BorrowOperation(borrow: BorrowPair, counter: number, cTokenAddress: string, keyStore: KeyStore, fee: number,  gas: number = 800_000, freight: number = 20_000): Transaction {
        const entrypoint = 'borrow';
        const parameters = BorrowPairMichelson(borrow);
        return TezosNodeWriter.constructContractInvocationOperation(keyStore.publicKeyHash, counter, cTokenAddress, 0, fee, freight, gas, entrypoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
    }

    /*
     * Description
     *
     * @param
     */
    export interface RepayBorrowPair {
        underlying: string;
        amount: number;
    }

    /*
     * Description
     *
     * @param
     */
    export function RepayBorrowPairMichelson(repayBorrow: RepayBorrowPair): string {
        return `${repayBorrow.amount}`;
    }

    /*
     * Description
     *
     * @param
     */
    export function RepayBorrowOperation(repayBorrow: RepayBorrowPair, counter: number, cTokenAddress: string, keyStore: KeyStore, fee: number,  gas: number = 800_000, freight: number = 20_000): Transaction {
        const entrypoint = 'repayBorrow';
        const parameters = RepayBorrowPairMichelson(repayBorrow);
        return TezosNodeWriter.constructContractInvocationOperation(keyStore.publicKeyHash, counter, cTokenAddress, 0, fee, freight, gas, entrypoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
    }

    /*
     * Represents an account's cToken state
     *
     * @param balance
     * @param accountBorrows
     * @param approvals
     */
    export interface AccountStatus {
        balance: number;
        accountBorrows: { principal: number; interestIndex: number; }[];
        approvals: { [ address: string]: number };
    }

    /*
     * Get an account's current position in a market
     *
     * @param
     */
    export async function getAccountStatus(cTokenAddress: string, accountAddress: string): Promise<AccountStatus> {
        return {} as AccountStatus;
    }
}
