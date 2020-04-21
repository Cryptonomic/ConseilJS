import * as blakejs from 'blakejs';
import { JSONPath } from 'jsonpath-plus';

import { TezosLanguageUtil } from '../TezosLanguageUtil';
import { TezosMessageUtils } from '../TezosMessageUtil';
import { TezosNodeReader } from '../TezosNodeReader';
import { TezosNodeWriter } from '../TezosNodeWriter';
import { KeyStore } from '../../../types/wallet/KeyStore';
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
     * 
     * 
     * @param server 
     * @param mapid 
     * @param account 
     */
    export async function getAccountBalance(server: string, mapid: number, account: string): Promise<number> {
        return 0;
    }

    /**
     * 
     * 
     * @param server 
     * @param mapid 
     * @param account 
     */
    export async function getOperatorList(server: string, mapid: number): Promise<string[]> {
        return ['']
    }

    /**
     * 
     * 
     * @param server 
     * @param mapid 
     */
    export async function getTokenMetadata(server: string, mapid: number): Promise<any> {
        return {}
    }

    export async function getSimpleStorage(server: string, address: string): Promise<{mapid: number}> {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);

        return {
            mapid: Number(JSONPath({ path: '$.args[0].int', json: storageResult })[0])
        };
    }

    export async function transferBalance(server: string, keystore: KeyStore, contract: string, fee: number, source: string, destination: string, amount: number, gas: number = 250_000, freight: number = 1_000) {
        //const parameters = `(Right (Right (Right (Right (Left (Right (Right (Left (Pair "${source}" (Pair "${destination}" ${amount}))))))))))`;
        const parameters = `(Pair "${source}" (Pair "${destination}" ${amount}))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, '', freight, gas, 'transfer', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function approveBalance(server: string, keystore: KeyStore, contract: string, fee: number, destination: string, amount: number, gas: number = 220_000, freight: number = 1_000) {
        const parameters = `(Right (Right (Right (Right (Left (Right (Right (Right (Pair "${destination}" ${amount})))))))))`;
        //approve
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, '', freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function mintBalance(server: string, keystore: KeyStore, contract: string, fee: number, destination: string, amount: number, gas: number = 220_000, freight: number = 1_000) {
        const parameters = `(Right (Right (Right (Right (Right (Left (Left (Left (Pair "${destination}" ${amount})))))))))`;
        //mint
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, '', freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function addOperator(server: string, keystore: KeyStore, contract: string, fee: number, operator: string, gas: number = 220_000, freight: number = 1_000) {
        const parameters = `(Right (Right (Right (Right (Right (Left (Right (Left "${operator}" ))))))))`;
        //addOperator
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, '', freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    function clearRPCOperationGroupHash(hash: string) {
        return hash.replace(/\"/g, '').replace(/\n/, '');
    }
}
