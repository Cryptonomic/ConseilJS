import bigInt from 'big-integer';
import { JSONPath } from 'jsonpath-plus';

import { KeyStore, Signer } from '../../../types/ExternalInterfaces';
import * as TezosTypes from '../../../types/tezos/TezosChainTypes';
import { TezosNodeReader } from '../TezosNodeReader';
import { TezosNodeWriter } from '../TezosNodeWriter';
import { TezosContractUtils } from './TezosContractUtils';
import { TezosMessageUtils } from '../TezosMessageUtil';

interface DexterPoolSimpleStorage {
    balanceMap: number;
    administrator: string;
    token: string;
    tokenBalance: number;
    xtzBalance: number;
    selfIsUpdatingTokenPool: boolean;
    freeze_baker: boolean;
    lqt_total: number;
}

/**
 * mainnet KT1DrJV8vhkdLEj76h1H9Q4irZDqAkMPo1Qf tzbtc
 * mainner KT1Puc9St8wdNoGtLiD2WXaHbWU7styaxYhD usdtz
 * 
 * https://gitlab.com/camlcase-dev/dexter-integration
 */
export namespace DexterPoolHelper {
    const DexterPoolLiquidityOperationGasLimit = 500_000;
    const DexterPoolLiquidityOperationStorageLimit = 5_000;
    const DexterPoolExchangeOperationGasLimit = 500_000;
    const DexterPoolExchangeOperationStorageLimit = 5_000;
    const ExchangeMultiplier = 997;

    /**
     * Gets the contract code at the specified address at the head block and compares it to the known hash of the code. This function processes Micheline format contracts.
     * 
     * @param server Destination Tezos node.
     * @param address Contract address to query.
     */
    export async function verifyDestination(server: string, address: string): Promise<boolean> {
        return TezosContractUtils.verifyDestination(server, address, 'a72954311c48dcc28279590d82870611');
    }

    /**
     * In contrast to verifyDestination, this function uses compares Michelson hashes.
     * 
     * @param script 
     */
    export function verifyScript(script: string): boolean {
        return TezosContractUtils.verifyScript(script, 'yyy');
    }

    export async function getSimpleStorage(server: string, address: string): Promise<DexterPoolSimpleStorage> {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);

        return {
            balanceMap: Number(JSONPath({ path: '$.args[0].int', json: storageResult })[0]),
            administrator: JSONPath({ path: '$.args[1].args[1].args[0].args[0].string', json: storageResult })[0],
            token: JSONPath({ path: '$.args[1].args[1].args[0].args[1].string', json: storageResult })[0],
            tokenBalance: Number(JSONPath({ path: '$.args[1].args[1].args[1].args[1].int', json: storageResult })[0]),
            xtzBalance: Number(JSONPath({ path: '$.args[1].args[1].args[1].args[0].int', json: storageResult })[0]),
            selfIsUpdatingTokenPool: (JSONPath({ path: '$.args[1].args[0].args[0].prim', json: storageResult })[0]).toString().toLowerCase().startsWith('t'),
            freeze_baker: (JSONPath({ path: '$.args[1].args[0].args[1].args[0].prim', json: storageResult })[0]).toString().toLowerCase().startsWith('t'),
            lqt_total: Number(JSONPath({ path: '$.args[1].args[0].args[1].args[1].int', json: storageResult })[0])
        };
    }

    export async function getAccountBalance(server: string, mapid: number, account: string): Promise<number> {
        try {
            const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(account, 'address'), 'hex'));
            const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

            if (mapResult === undefined) { throw new Error(`Map ${mapid} does not contain a record for ${account}`); }

            const jsonresult = JSONPath({ path: '$.args[0].int', json: mapResult });
            return Number(jsonresult[0]);
        } catch {
            return 0;
        }
    }

    export async function getAccountAllowance(server: string, mapid: number, account: string, spender: string) {
        const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(account, 'address'), 'hex'));
        const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

        if (mapResult === undefined) { throw new Error(`Map ${mapid} does not contain a record for ${account}/${spender}`); }

        let allowances = new Map<string, number>();
        JSONPath({ path: '$.args[1][*].args', json: mapResult }).forEach(v => allowances[v[0]['string']] = Number(v[1]['int']));

        return allowances[spender] || 0;
    }

    export async function addLiquidity(server: string, signer: Signer, keyStore: KeyStore, contract: string, fee: number, xtzAmount: number, liquidityAmount: number, tokenAmount: number, expiration: Date): Promise<string> {
        //(pair (address :owner) (nat :minLqtMinted)) (pair (nat :maxTokensDeposited) (timestamp :deadline)))
        const parameters = `(Pair (Pair "${keyStore.publicKeyHash}" ${liquidityAmount}) (Pair ${tokenAmount} "${expiration.toISOString()}"))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keyStore, contract, xtzAmount, fee, DexterPoolLiquidityOperationStorageLimit, DexterPoolLiquidityOperationGasLimit, 'addLiquidity', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function removeLiquidity(server: string, signer: Signer, keyStore: KeyStore, contract: string, fee: number, balance: number, xtzBalance: number, tokenBalance: number, expiration: Date): Promise<string> {
        //(pair (address :owner) (pair (address :to) (nat :lqtBurned))) (pair (mutez :minXtzWithdrawn) (pair (nat :minTokensWithdrawn) (timestamp :deadline)))
        const parameters = `(Pair (Pair "${keyStore.publicKeyHash}" (Pair "${keyStore.publicKeyHash}" ${balance})) (Pair ${xtzBalance} (Pair ${tokenBalance} "${expiration.toISOString()}")))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keyStore, contract, 0, fee, DexterPoolLiquidityOperationStorageLimit, DexterPoolLiquidityOperationGasLimit, 'removeLiquidity', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function xtzToToken(server: string, signer: Signer, keyStore: KeyStore, contract: string, fee: number, xtzAmount: number, tokenAmount: number, expiration: Date): Promise<string> {
        //(pair %xtzToToken (address :to) (pair (nat :minTokensBought) (timestamp :deadline)))
        const parameters = `(Pair "${keyStore.publicKeyHash}" (Pair ${tokenAmount} "${expiration.toISOString()}"))`;
        
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keyStore, contract, xtzAmount, fee, DexterPoolExchangeOperationStorageLimit, DexterPoolExchangeOperationGasLimit, 'xtzToToken', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function tokenToXtz(server: string, signer: Signer, keyStore: KeyStore, contract: string, fee: number, xtzAmount: number, tokenAmount: number, expiration: Date): Promise<string> {
        //(pair %tokenToXtz (pair (address :owner) (address :to)) (pair (nat :tokensSold) (pair (mutez :minXtzBought) (timestamp :deadline))))
        const parameters = `(Pair (Pair "${keyStore.publicKeyHash}" "${keyStore.publicKeyHash}") (Pair ${tokenAmount} (Pair ${xtzAmount} "${expiration.toISOString()}")))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keyStore, contract, 0, fee, DexterPoolExchangeOperationStorageLimit, DexterPoolExchangeOperationGasLimit, 'tokenToXtz', parameters, TezosTypes.TezosParameterFormat.Michelson);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function tokenToToken(server: string, signer: Signer, keyStore: KeyStore, contract: string, fee: number, otherPoolContract: string, sellAmount: number, buyAmount: number, expiration: Date): Promise<string> {
        //(pair %tokenToToken (pair (address :outputDexterContract) (pair (nat :minTokensBought) (address :owner))) (pair (address :to) (pair (nat :tokensSold) (timestamp :deadline))))
        const parameters = `(Pair (Pair "${otherPoolContract}" (Pair ${buyAmount} "${keyStore.publicKeyHash}")) (Pair "${keyStore.publicKeyHash}" (Pair ${sellAmount} "${expiration.toISOString()}")))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keyStore, contract, 0, fee, DexterPoolExchangeOperationStorageLimit, 1_000_000, 'tokenToToken', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function approve(server: string, signer: Signer, keyStore: KeyStore, contract: string, fee: number, spender: string, newAllowance: number, currentAllowance: number): Promise<string> {
        //(pair %approve (address :spender) (pair (nat :allowance) (nat :currentAllowance)))
        const parameters = `(Pair "${spender}" (Pair ${newAllowance} ${currentAllowance}))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keyStore, contract, 0, fee, DexterPoolExchangeOperationStorageLimit, DexterPoolExchangeOperationGasLimit, 'approve', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    /**
     * Show pending applied operations against this contract in the mempool
     */
    export async function previewTransactions() {
        //
    }

    /**
     * 
     * @param xtzDeposit XTZ amount of the proposed transaction
     * @param tokenBalance Pool token balance
     * @param xtzBalance Pool XTZ balance
     * @returns Token amount required for the matching XTZ balance
     */
    export function calcTokenLiquidityRequirement(xtzDeposit: number, tokenBalance: number, xtzBalance: number): number {
        return bigInt(xtzDeposit).multiply(bigInt(tokenBalance)).divide(bigInt(xtzBalance)).toJSNumber();
    }

    /**
     * Returns the token exchange rate for a given XTZ amount.
     * 
     * @param xtzDeposit 
     * @param tokenBalance 
     * @param xtzBalance 
     */
    export function getTokenExchangeRate(xtzAmount: number, tokenBalance: number, xtzBalance: number) {
        const n = bigInt(xtzAmount).multiply(bigInt(tokenBalance)).multiply(bigInt(ExchangeMultiplier));
        const d = bigInt(xtzBalance).multiply(bigInt(1000)).add(bigInt(xtzAmount).multiply(bigInt(ExchangeMultiplier)))

        return n.divide(d).divide(bigInt(xtzAmount)).toJSNumber();
    }

    /**
     * Returns the XTZ exchange rate for a given token amount
     * 
     * @param tokenAmount 
     * @param tokenBalance 
     * @param xtzBalance 
     */
    export function getXTZExchangeRate(tokenAmount: number, tokenBalance: number, xtzBalance: number) {
        const n = bigInt(tokenAmount).multiply(bigInt(xtzBalance)).multiply(bigInt(ExchangeMultiplier));
        const d = bigInt(tokenBalance).multiply(bigInt(1000)).add(bigInt(tokenAmount).multiply(bigInt(ExchangeMultiplier)))

        return n.divide(d).divide(bigInt(tokenAmount)).toJSNumber();
    }

    //const lqtMinted = bigInt(xtzDeposit).multiply(bigInt(poolStorage.lqt_total)).divide(bigInt(poolStorage.xtzBalance)).toJSNumber();

    /**
     * Estimates the cost of buying 1% share of the pool in terms of XTZ
     */
    export function estimateShareCost(xtzBalance: number, tokenBalance: number): { xtzCost: number, tokenCost: number } {
        const xtzShare = bigInt(xtzBalance).divide(bigInt(100)).toJSNumber();
        const tokenShare = calcTokenLiquidityRequirement(xtzShare, tokenBalance, xtzBalance);

        return { xtzCost: xtzShare, tokenCost: tokenShare };
    }
}
