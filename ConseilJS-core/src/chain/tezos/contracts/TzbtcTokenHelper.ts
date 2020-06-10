import * as blakejs from 'blakejs';
import { JSONPath } from 'jsonpath-plus';

import { TezosLanguageUtil } from '../TezosLanguageUtil';
import { TezosMessageUtils } from '../TezosMessageUtil';
import { TezosNodeReader } from '../TezosNodeReader';
import { TezosNodeWriter } from '../TezosNodeWriter';
import { KeyStore, Signer } from '../../../types/ExternalInterfaces';
import * as TezosTypes from '../../../types/tezos/TezosChainTypes';

/**
 *
 */
export namespace TzbtcTokenHelper {
    /**
     * Gets the contract code at the specified address at the head block and compares it to the known hash of the code. This function processes Micheline format contracts.
     * 
     * @param server Destination Tezos node.
     * @param address Contract address to query.
     */
    export async function verifyDestination(server: string, address: string): Promise<boolean> {
        const contract = await TezosNodeReader.getAccountForBlock(server, 'head', address);

        if (!!!contract.script) { throw new Error(`No code found at ${address}`); }

        const k = Buffer.from(blakejs.blake2s(JSON.stringify(contract.script.code), null, 16)).toString('hex');

        if (k !== '187c967006ca95a648c770fdd76947ef') { throw new Error(`Contract does not match the expected code hash: ${k}, '187c967006ca95a648c770fdd76947ef'`); }

        return true;
    }

    /**
     * In contrast to verifyDestination, this function uses compares Michelson hashes.
     * 
     * @param script 
     */
    export function verifyScript(script: string): boolean {
        const k = Buffer.from(blakejs.blake2s(TezosLanguageUtil.preProcessMichelsonScript(script).join('\n'), null, 16)).toString('hex');

        if (k !== 'ffcad1e376a6c8915780fe6676aceec6') { throw new Error(`Contract does not match the expected code hash: ${k}, 'ffcad1e376a6c8915780fe6676aceec6'`); }

        return true;
    }

    /**
     * https://github.com/tz-wrapped/tezos-btc/blob/master/src/Lorentz/Contracts/TZBTC/V1.hs#L110
     * 
     * @param server 
     * @param mapid 
     * @param account 
     */
    export async function getAccountBalance(server: string, mapid: number, account: string): Promise<number> {
        const value = await queryMap(server, mapid, `(Pair "ledger" 0x${TezosMessageUtils.writeAddress(account)})`);

        return Number(JSONPath({ path: '$.args[0].int', json: value })[0]);
    }

    /**
     * https://github.com/tz-wrapped/tezos-btc/blob/master/src/Lorentz/Contracts/TZBTC/V1.hs#L105
     * 
     * @param server 
     * @param mapid 
     */
    export async function getOperatorList(server: string, mapid: number): Promise<string[]> {
        const value = await queryMap(server, mapid, '"operators"');

        let addresses: string[] = [];
        for (const a of value) {
            addresses.push(TezosMessageUtils.readAddress(a.bytes));
        }

        return addresses;
    }

    /**
     * https://github.com/tz-wrapped/tezos-btc/blob/master/src/Lorentz/Contracts/TZBTC/V1.hs#L107
     * 
     * @param server 
     * @param mapid 
     */
    export async function getTokenMetadata(server: string, mapid: number): Promise<any> {
        return await queryMap(server, mapid, '"tokenMetadata"');
    }

    /**
     * Returns the mapid of the associated contract and scale at which token values should be interpreted. With tzBTC, 1 means 0.00000001, that is 1 / 100000000 or 10 ^ 8.
     */
    export async function getSimpleStorage(server: string, address: string): Promise<{ mapid: number, scale: number }> {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);

        return {
            mapid: Number(JSONPath({ path: '$.args[0].int', json: storageResult })[0]),
            scale: 8
        };
    }

    export async function transferBalance(server: string, signer: Signer, keystore: KeyStore, contract: string, fee: number, source: string, destination: string, amount: number, gas: number = 250_000, freight: number = 1_000) {
        //const parameters = `(Right (Right (Right (Right (Left (Right (Right (Left (Pair "${source}" (Pair "${destination}" ${amount}))))))))))`;
        const parameters = `(Pair "${source}" (Pair "${destination}" ${amount}))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, 0, fee, freight, gas, 'transfer', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function approveBalance(server: string, signer: Signer, keystore: KeyStore, contract: string, fee: number, destination: string, amount: number, gas: number = 250_000, freight: number = 1_000) {
        const parameters = `(Right (Right (Right (Right (Left (Right (Right (Right (Pair "${destination}" ${amount})))))))))`;
        //approve
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, 0, fee, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function mintBalance(server: string, signer: Signer, keystore: KeyStore, contract: string, fee: number, destination: string, amount: number, gas: number = 250_000, freight: number = 1_000) {
        const parameters = `(Right (Right (Right (Right (Right (Left (Left (Left (Pair "${destination}" ${amount})))))))))`;
        //mint
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, 0, fee, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function addOperator(server: string, signer: Signer, keystore: KeyStore, contract: string, fee: number, operator: string, gas: number = 250_000, freight: number = 1_000) {
        const parameters = `(Right (Right (Right (Right (Right (Left (Right (Left "${operator}" ))))))))`;
        //addOperator
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, 0, fee, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    async function queryMap(server: string, mapid: number, query: string): Promise<any> {
        const key = Buffer.from(TezosMessageUtils.writePackedData(query, '', TezosTypes.TezosParameterFormat.Michelson), 'hex');
        const packedKey = TezosMessageUtils.writePackedData(key, 'bytes');
        const encodedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(packedKey, 'hex'));
        const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, encodedKey);

        if (mapResult === undefined) { throw new Error(`Could not get data from map ${mapid} for '${query}'`); }
        const bytes = JSONPath({ path: '$.bytes', json: mapResult })[0];
        return JSON.parse(TezosLanguageUtil.hexToMicheline(bytes.slice(2)).code);
    }

    function clearRPCOperationGroupHash(hash: string) {
        return hash.replace(/\"/g, '').replace(/\n/, '');
    }
}
