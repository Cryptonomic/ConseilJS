import {KeyStore, Signer} from '../../../../types/ExternalInterfaces';
import * as TezosTypes from '../../../../types/tezos/TezosChainTypes';
import {TezosNodeReader} from '../../TezosNodeReader';
import {TezosNodeWriter} from '../../TezosNodeWriter';
import {TezosContractUtils} from '../TezosContractUtils';
import { TezFinHelper } from './TezFinHelper';
import {Transaction} from '../../../../types/tezos/TezosP2PMessageTypes';
import {JSONPath} from 'jsonpath-plus';

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
     * Represents metadata about a cToken contract.
     *
     * @param name Name of the underlying asset, e.g. Tezos.
     * @param tokenSymbol Symbol of the underlying asset, e.g. XTZ.
     * @param administrator Address of the cToken contract administrator, e.g. the governance contract.
     * @param price Price according to the protocol's price oracle.
     */
    export interface UnderlyingAssetMetadata {
        name: string;
        tokenSymbol: string;
        administrator: string;
        price: number;
    }

    /*
     * Represents the status of one side of a cToken's market (either supply or borrow)
     *
     * @param numParticipants The number of unique addresses in the market
     * @param amount The total number of tokens in the market (either supplied or borrowed)
     * @param rate Current interest rate
     */
    export interface MarketStatus {
        numParticipants: number;
        amount: number;
        rate: number;
    }

    /*
     * @description
     *
     * @param
     */
    export interface Storage {
        accrualBlockNumber: number;
        accrualIntPeriodRelevance: number;
        administrator: string;
        balancesMapId: number;
        borrowIndex: number;
        borrowRateMaxMantissa: number;
        borrowRatePerBlock: number;
        comptroller: string;
        expScale: number;
        halfExpScale: number;
        initialExchangeRateMantissa: number;
        interestRateModel: string;
        isAccrualInterestValid: boolean;
        pendingAdministrator: string | undefined;
        reserveFactorMantissa: number;
        reserveFactorMaxMantissa: number;
        supplyRatePerBlock: number;
        totalBorrows: number;
        totalReserves: number;
        totalSupply: number;

    }

    /*
     * @description
     *
     * @param
     * @param
     */
    export async function getStorage(server: string, cTokenAddress: string): Promise<Storage> {
        const storageResult = await TezosNodeReader.getContractStorage(server, cTokenAddress);
        return {
            accrualBlockNumber: JSONPath({path: '$.args[0].args[0].args[0].args[0].args[0].int', json: storageResult })[0],
            accrualIntPeriodRelevance: JSONPath({path: '$.args[0].args[0].args[0].args[0].args[1].int', json: storageResult })[0],
            administrator: JSONPath({path: '$.args[0].args[0].args[0].args[2].string', json: storageResult })[0],
            balancesMapId: JSONPath({path: '$.args[0].args[0].args[0].args[3].int', json: storageResult })[0],
            borrowIndex: JSONPath({path: '$.args[0].args[0].args[1].args[0].int', json: storageResult })[0],
            borrowRateMaxMantissa: JSONPath({path: '$.args[0].args[0].args[1].args[1].int', json: storageResult })[0],
            borrowRatePerBlock: JSONPath({path: '$.args[0].args[0].args[2].int', json: storageResult })[0],
            comptroller: JSONPath({path: '$.args[0].args[0].args[3].string', json: storageResult })[0],
            expScale: JSONPath({path: '$.args[0].args[0].args[4].int', json: storageResult })[0],
            halfExpScale: JSONPath({path: '$.args[0].args[1].args[0].args[0].int', json: storageResult })[0],
            initialExchangeRateMantissa: JSONPath({path: '$.args[0].args[1].args[0].args[1].int', json: storageResult })[0],
            interestRateModel: JSONPath({path: '$.args[0].args[1].args[1].string', json: storageResult })[0],
            isAccrualInterestValid: JSONPath({path: '$.args[0].args[1].args[2].prim', json: storageResult })[0], // fix to boolean
            pendingAdministrator: JSONPath({path: '$.args[0].args[1].args[3].prim', json: storageResult })[0], // fix optional
            reserveFactorMantissa: JSONPath({path: '$.args[0].args[2].args[0].int', json: storageResult })[0],
            reserveFactorMaxMantissa: JSONPath({path: '$.args[0].args[2].args[1].int', json: storageResult })[0],
            supplyRatePerBlock: JSONPath({path: '$.args[0].args[2].args[2].int', json: storageResult })[0],
            totalBorrows: JSONPath({path: '$.args[0].args[3].int', json: storageResult })[0],
            totalReserves: JSONPath({path: '$.args[0].args[4].int', json: storageResult })[0],
            totalSupply: JSONPath({path: '$.args[0].args[5].int', json: storageResult })[0]
        };
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
        underlying: AssetType;
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
        const xtzAmount = mint.underlying == AssetType.XTZ ? mint.amount : 0;
        return TezosNodeWriter.constructContractInvocationOperation(keyStore.publicKeyHash, counter, cTokenAddress, xtzAmount, fee, freight, gas, entrypoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
    }

    /*
     * Redeem entrypoint parameters
     *
     * @param amount The amount of cTokens to redeem
     */
    export interface RedeemPair {
        underlying: AssetType;
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
        underlying: AssetType;
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
        underlying: AssetType;
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
        const xtzAmount = repayBorrow.underlying == AssetType.XTZ ? repayBorrow.amount : 0;
        return TezosNodeWriter.constructContractInvocationOperation(keyStore.publicKeyHash, counter, cTokenAddress, xtzAmount, fee, freight, gas, entrypoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
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
