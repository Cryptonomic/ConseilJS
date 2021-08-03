import {KeyStore, Signer} from '../../../../types/ExternalInterfaces';
import * as TezosTypes from '../../../../types/tezos/TezosChainTypes';
import {TezosNodeReader} from '../../TezosNodeReader';
import {TezosNodeWriter} from '../../TezosNodeWriter';
import {TezosContractUtils} from '../TezosContractUtils';
import { TezFinHelper } from './TezFinHelper';
import {Transaction} from '../../../../types/tezos/TezosP2PMessageTypes';

export namespace CToken {
    /*
     * Description
     *
     * @param
     */
    export interface MarketMetadata {
        name: string;
        tokenSymbol: string;
        address: string;
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
     * Mint entrypoint parameters
     *
     * @param amount The amount to cTokens to mint
     */
    export interface MintPair {
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
    export function RedeemOperation(mint: MintPair, counter: number, cTokenAddress: string, keyStore: KeyStore, fee: number,  gas: number = 800_000, freight: number = 20_000): Transaction {
        const entrypoint = 'mint';
        const parameters = MintPairMichelson(mint);
        return TezosNodeWriter.constructContractInvocationOperation(keyStore.publicKeyHash, counter, cTokenAddress, 0, fee, freight, gas, entrypoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
    }


    /*
     * Description
     *
     * @param
     */
    export interface BorrowPair {
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
    export function BorrowOperation(mint: MintPair, counter: number, cTokenAddress: string, keyStore: KeyStore, fee: number,  gas: number = 800_000, freight: number = 20_000): Transaction {
        const entrypoint = 'mint';
        const parameters = MintPairMichelson(mint);
        return TezosNodeWriter.constructContractInvocationOperation(keyStore.publicKeyHash, counter, cTokenAddress, 0, fee, freight, gas, entrypoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
    }

    /*
     * Description
     *
     * @param
     */
    export interface RepayBorrowPair {
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
    export function RepayBorrowOperation(mint: MintPair, counter: number, cTokenAddress: string, keyStore: KeyStore, fee: number,  gas: number = 800_000, freight: number = 20_000): Transaction {
        const entrypoint = 'mint';
        const parameters = MintPairMichelson(mint);
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
