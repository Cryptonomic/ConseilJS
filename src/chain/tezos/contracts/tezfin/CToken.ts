import {KeyStore, Signer} from '../../../../types/ExternalInterfaces';
import * as TezosTypes from '../../../../types/tezos/TezosChainTypes';
import {TezosNodeReader} from '../../TezosNodeReader';
import {TezosNodeWriter} from '../../TezosNodeWriter';
import {TezosContractUtils} from '../TezosContractUtils';
import { TezFinHelper } from './TezFinHelper';

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
     * Description
     *
     * @param
     */
    export interface ApprovePair {

    }

    /*
     * Description
     *
     * @param
     */
    export function ApprovePairToMichelson(approve: ApprovePair): string {
        return "";
    }

    /*
     * Description
     *
     * @param
     */
    export async function Approve(server: string, address: string, signer: Signer, keystore: KeyStore, approve: ApprovePair, fee: number,  gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'approve';
        const parameters = ApprovePairToMichelson(approve);
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    /*
     * Description
     *
     * @param
     */
    export interface SupplyPair {

    }

    /*
     * Description
     *
     * @param
     */
    export function SupplyPairToMichelson(supply: SupplyPair): string {
        return "";
    }

    /*
     * Description
     *
     * @param
     */
    export async function Supply(server: string, address: string, signer: Signer, keystore: KeyStore, supply: SupplyPair, fee: number,  gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'supply';
        const parameters = SupplyPairToMichelson(supply);
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, supply.amount, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    /*
     * Description
     *
     * @param
     */
    export interface RedeemPair {

    }

    /*
     * Description
     *
     * @param
     */
    function RedeemPairToMichelson(redeem: RedeemPair): string {
        return "";
    }

    /*
     * Description
     *
     * @param
     */
    export async function Redeem(server: string, address: string, signer: Signer, keystore: KeyStore, redeem: RedeemPair, fee: number,  gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'redeem';
        const parameters = RedeemPairToMichelson(redeem);
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, redeem.amount, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    /*
     * Description
     *
     * @param
     */
    export interface BorrowPair {

    }

    /*
     * Description
     *
     * @param
     */
    export function BorrowPairToMichelson(borrow: BorrowPair): string {
        return "";

    }

    /*
     * Description
     *
     * @param
     */
    export async function Borrow(server: string, address: string, signer: Signer, keystore: KeyStore, borrow: BorrowPair, fee: number,  gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'borrow';
        const parameters = BorrowPairToMichelson(borrow);
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, borrow.amount, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    /*
     * Description
     *
     * @param
     */
    export interface RepayBorrowPair {

    }

    /*
     * Description
     *
     * @param
     */
    export function RepayBorrowPairToMichelson(repayBorrow: RepayBorrowPair): string {
        return "";
    }

    /*
     * Description
     *
     * @param
     */
    export async function RepayBorrow(server: string, address: string, signer: Signer, keystore: KeyStore, repayBorrow: RepayBorrowPair, fee: number,  gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'repayBorrow';
        const parameters = RepayBorrowPairToMichelson(repayBorrow);
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, repayBorrow.amount, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
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
