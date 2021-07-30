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
     * Description
     *
     * @param
     */
    export function AccrueInterestOperation(counter: number, address: string, keyStore: KeyStore, fee: number,  gas: number = 800_000, freight: number = 20_000): Transaction {
        const entrypoint = 'accrueInterest';
        const parameters = 'Unit'
        return TezosNodeWriter.constructContractInvocationOperation(keyStore.publicKeyHash, counter, address, 0, fee, freight, gas, entrypoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
    }

    /*
     * Description
     *
     * @param
     */
    export interface MintPair {

    }

    /*
     * Description
     *
     * @param
     */
    export function MintPairMichelson(mint: MintPair): string {
        // cxtz mint: (Left (Right (Right (Left (Right 777)))))
        // cfa1.2 mint: (Right (Left (Pair "tz1WxrQuZ4CK1MBUa2GqUWK1yJ4J6EtG1Gwi" 100)))
        // cfa2 mint: (Left (Right (Right (Left (Right (Left 100))))))
        return "";
    }

    /*
     * Description
     *
     * @param
     */
    export async function Mint(server: string, address: string, signer: Signer, keystore: KeyStore, mint: MintPair, fee: number,  gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'mint';
        const parameters = MintPairMichelson(mint);
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
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
    function RedeemPairMichelson(redeem: RedeemPair): string {
        return "";
    }

    /*
     * Description
     *
     * @param
     */
    export async function Redeem(server: string, address: string, signer: Signer, keystore: KeyStore, redeem: RedeemPair, fee: number,  gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'redeem';
        const parameters = RedeemPairMichelson(redeem);
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
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
    export function BorrowPairMichelson(borrow: BorrowPair): string {
        return "";

    }

    /*
     * Description
     *
     * @param
     */
    export async function Borrow(server: string, address: string, signer: Signer, keystore: KeyStore, borrow: BorrowPair, fee: number,  gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'borrow';
        const parameters = BorrowPairMichelson(borrow);
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
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
    export function RepayBorrowPairMichelson(repayBorrow: RepayBorrowPair): string {
        return "";
    }

    /*
     * Description
     *
     * @param
     */
    export async function RepayBorrow(server: string, address: string, signer: Signer, keystore: KeyStore, repayBorrow: RepayBorrowPair, fee: number,  gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'repayBorrow';
        const parameters = RepayBorrowPairMichelson(repayBorrow);
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
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
