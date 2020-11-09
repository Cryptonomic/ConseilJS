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
 * Contract wrapper for http://dexter.exchange/ pool contracts, intended for use on mainnet with KT1Puc9St8wdNoGtLiD2WXaHbWU7styaxYhD (usdtz) and KT1DrJV8vhkdLEj76h1H9Q4irZDqAkMPo1Qf (tzbtc).
 *
 * Tested on carthagenet with KT1RtNatBzmk2AvJKm9Mx6b55GcQejJneK7t.
 * 
 * Based on integration documentation provided at https://gitlab.com/camlcase-dev/dexter-integration.
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

    /**
     * Queries the tezos node directly for basic contract storage.
     * 
     * @param server Destination Tezos node.
     * @param address Contract address to query.
     * @returns 
     * - balanceMap: bigmap index of the liquidity balance map
     * - administrator: Contract administrator
     * - token: Token address this pool services
     * - tokenBalance: Total token balance held in the pool
     * - xtzBalance: Total XTZ balance held in the pool
     * - selfIsUpdatingTokenPool
     * - freeze_baker
     * - lqt_total Liquidity token balance
     */
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

    /**
     * Queries the Tezos node for the liquidity balance of the requested account.
     * 
     * @param server Destination Tezos node.
     * @param mapid bigmap id of the pool to query.
     * @param account Account to query.
     */
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

    /**
     * Queries the Tezos node for the liquidity balance approval for a given spender on the requested account.
     * 
     * @param server Destination Tezos node. 
     * @param mapid bigmap id of the pool to query.
     * @param account Account to query.
     * @param spender Spender to get balance for.
     */
    export async function getAccountAllowance(server: string, mapid: number, account: string, spender: string) {
        const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(account, 'address'), 'hex'));
        const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

        if (mapResult === undefined) { throw new Error(`Map ${mapid} does not contain a record for ${account}/${spender}`); }

        let allowances = new Map<string, number>();
        JSONPath({ path: '$.args[1][*].args', json: mapResult }).forEach(v => allowances[v[0]['string']] = Number(v[1]['int']));

        return allowances[spender] || 0;
    }

    /**
     * Adds liquidity to the pool using the `addLiquidity` entry point of the contract pool. Deposits both XTZ and a matching token balance.
     * 
     * @param server Destination Tezos node. 
     * @param signer 
     * @param keyStore 
     * @param contract 
     * @param fee 
     * @param liquidityAmount Expected liquidity amount
     * @param xtzAmount 
     * @param tokenAmount 
     * @param expiration Request expiration date.
     */
    export async function addLiquidity(server: string, signer: Signer, keyStore: KeyStore, contract: string, fee: number, liquidityAmount: number, xtzAmount: number, tokenAmount: number, expiration: Date): Promise<string> {
        //(pair (address :owner) (nat :minLqtMinted)) (pair (nat :maxTokensDeposited) (timestamp :deadline)))
        const parameters = `(Pair (Pair "${keyStore.publicKeyHash}" ${liquidityAmount}) (Pair ${tokenAmount} "${expiration.toISOString()}"))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keyStore, contract, xtzAmount, fee, DexterPoolLiquidityOperationStorageLimit, DexterPoolLiquidityOperationGasLimit, 'addLiquidity', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    /**
     * Removes liquidity from the pool using the `removeLiquidity` entry point.
     * 
     * @param server Destination Tezos node. 
     * @param signer 
     * @param keyStore 
     * @param contract 
     * @param fee 
     * @param balance Liquidity amount to withdraw.
     * @param xtzBalance Expected XTZ balance
     * @param tokenBalance Expected token balance
     * @param expiration Request expiration date.
     */
    export async function removeLiquidity(server: string, signer: Signer, keyStore: KeyStore, contract: string, fee: number, balance: number, xtzBalance: number, tokenBalance: number, expiration: Date): Promise<string> {
        //(pair (address :owner) (pair (address :to) (nat :lqtBurned))) (pair (mutez :minXtzWithdrawn) (pair (nat :minTokensWithdrawn) (timestamp :deadline)))
        const parameters = `(Pair (Pair "${keyStore.publicKeyHash}" (Pair "${keyStore.publicKeyHash}" ${balance})) (Pair ${xtzBalance} (Pair ${tokenBalance} "${expiration.toISOString()}")))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keyStore, contract, 0, fee, DexterPoolLiquidityOperationStorageLimit, DexterPoolLiquidityOperationGasLimit, 'removeLiquidity', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    /**
     * 
     * Convert an XTZz balance into an token balance.
     * @param server 
     * @param signer 
     * @param keyStore 
     * @param contract 
     * @param fee 
     * @param xtzAmount 
     * @param tokenAmount 
     * @param expiration Request expiration date.
     */
    export async function xtzToToken(server: string, signer: Signer, keyStore: KeyStore, contract: string, fee: number, xtzAmount: number, tokenAmount: number, expiration: Date): Promise<string> {
        //(pair %xtzToToken (address :to) (pair (nat :minTokensBought) (timestamp :deadline)))
        const parameters = `(Pair "${keyStore.publicKeyHash}" (Pair ${tokenAmount} "${expiration.toISOString()}"))`;
        
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keyStore, contract, xtzAmount, fee, DexterPoolExchangeOperationStorageLimit, DexterPoolExchangeOperationGasLimit, 'xtzToToken', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    /**
     * Convert a token balance into an XTZ balance.
     * 
     * @param server Destination Tezos node. 
     * @param signer 
     * @param keyStore 
     * @param contract 
     * @param fee 
     * @param xtzAmount 
     * @param tokenAmount 
     * @param expiration Request expiration date.
     */
    export async function tokenToXtz(server: string, signer: Signer, keyStore: KeyStore, contract: string, fee: number, xtzAmount: number, tokenAmount: number, expiration: Date): Promise<string> {
        //(pair %tokenToXtz (pair (address :owner) (address :to)) (pair (nat :tokensSold) (pair (mutez :minXtzBought) (timestamp :deadline))))
        const parameters = `(Pair (Pair "${keyStore.publicKeyHash}" "${keyStore.publicKeyHash}") (Pair ${tokenAmount} (Pair ${xtzAmount} "${expiration.toISOString()}")))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keyStore, contract, 0, fee, DexterPoolExchangeOperationStorageLimit, DexterPoolExchangeOperationGasLimit, 'tokenToXtz', parameters, TezosTypes.TezosParameterFormat.Michelson);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    /**
     * Untested function that should allow exchange of a token for a different token instead of xtz.
     * 
     * @param server Destination Tezos node. 
     * @param signer 
     * @param keyStore 
     * @param contract 
     * @param fee 
     * @param otherPoolContract 
     * @param sellAmount 
     * @param buyAmount 
     * @param expiration Request expiration date. 
     */
    export async function tokenToToken(server: string, signer: Signer, keyStore: KeyStore, contract: string, fee: number, otherPoolContract: string, sellAmount: number, buyAmount: number, expiration: Date): Promise<string> {
        //(pair %tokenToToken (pair (address :outputDexterContract) (pair (nat :minTokensBought) (address :owner))) (pair (address :to) (pair (nat :tokensSold) (timestamp :deadline))))
        const parameters = `(Pair (Pair "${otherPoolContract}" (Pair ${buyAmount} "${keyStore.publicKeyHash}")) (Pair "${keyStore.publicKeyHash}" (Pair ${sellAmount} "${expiration.toISOString()}")))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keyStore, contract, 0, fee, DexterPoolExchangeOperationStorageLimit, 1_000_000, 'tokenToToken', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    /**
     * Approves a spender for a share of the liquidity balance on the given account.
     * 
     * @param server Destination Tezos node. 
     * @param signer 
     * @param keyStore 
     * @param contract 
     * @param fee 
     * @param spender 
     * @param newAllowance 
     * @param currentAllowance 
     */
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
        // TODO
    }

    /**
     * Calculate the token requirement for the proposed XTZ deposit.
     * 
     * @param xtzDeposit XTZ amount of the proposed transaction
     * @param tokenBalance Pool token balance
     * @param xtzBalance Pool XTZ balance
     * @return {number} Matching token balance for the proposed deposit
     */
    export function calcTokenLiquidityRequirement(xtzDeposit: number, tokenBalance: number, xtzBalance: number): number {
        return bigInt(xtzDeposit).multiply(bigInt(tokenBalance)).divide(bigInt(xtzBalance)).toJSNumber();
    }

    /**
     * XTZ/Token exchange rate for a given XTZ trade.
     * 
     * @param xtzAmount Proposed XTZ deposit
     * @param tokenBalance Current token balance in the pool
     * @param xtzBalance Current XTZ balance in the pool
     */
    export function getTokenExchangeRate(xtzAmount: number, tokenBalance: number, xtzBalance: number, xtzDecimals: number = 6) {
        const n = bigInt(xtzAmount).multiply(bigInt(tokenBalance)).multiply(bigInt(ExchangeMultiplier));
        const d = bigInt(xtzBalance).multiply(bigInt(1000)).add(bigInt(xtzAmount).multiply(bigInt(ExchangeMultiplier)));

        const tokenAmount = n.divide(d);
        const dm = tokenAmount.divmod(bigInt(xtzAmount));
        const f = dm.remainder.multiply(bigInt(10 ** xtzDecimals)).divide(bigInt(xtzAmount));

        return { tokenAmount: tokenAmount.toJSNumber(), rate: parseFloat(`${dm.quotient.toJSNumber()}.${f.toJSNumber()}`) };
    }

    /**
     * Token/XTZ exchange rate for a given token trade.
     * 
     * @param tokenAmount Proposed token deposit
     * @param tokenBalance Current token balance in the pool
     * @param xtzBalance Current XTZ balance in the pool
     */
    export function getXTZExchangeRate(tokenAmount: number, tokenBalance: number, xtzBalance: number, tokenDecimals: number = 6) {
        const n = bigInt(tokenAmount).multiply(bigInt(xtzBalance)).multiply(bigInt(ExchangeMultiplier));
        const d = bigInt(tokenBalance).multiply(bigInt(1000)).add(bigInt(tokenAmount).multiply(bigInt(ExchangeMultiplier)))

        const xtzAmount = n.divide(d);
        const dm = xtzAmount.divmod(bigInt(tokenAmount));
        const f = dm.remainder.multiply(bigInt(10 ** tokenDecimals)).divide(bigInt(tokenAmount));

        return { xtzAmount: xtzAmount.toJSNumber(), rate: parseFloat(`${dm.quotient.toJSNumber()}.${f.toJSNumber()}`) };
    }

    /**
     * Returns the amount of liquidity tokens a particular XTZ deposit would receive.
     * @param xtzDeposit 
     * @param liquidityBalance 
     * @param xtzBalance 
     */
    export function estimateLiquidityAmount(xtzDeposit: number, liquidityBalance: number, xtzBalance: number) {
        return bigInt(xtzDeposit).multiply(bigInt(liquidityBalance)).divide(bigInt(xtzBalance)).toJSNumber();
    }

    /**
     * Estimates the cost of buying 1% share of the pool in terms of XTZ
     */
    export function estimateShareCost(xtzBalance: number, tokenBalance: number, liquidityBalance: number): { xtzCost: number, tokenCost: number } {
        const xtzShare = bigInt(xtzBalance).divide(bigInt(99)).toJSNumber();
        const tokenShare = calcTokenLiquidityRequirement(xtzShare, tokenBalance, xtzBalance);

        // TODO: use estimateLiquidityAmount

        return { xtzCost: xtzShare, tokenCost: tokenShare };
    }
}
