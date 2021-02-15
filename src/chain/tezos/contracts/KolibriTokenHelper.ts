import { JSONPath } from 'jsonpath-plus';

import { KeyStore, Signer } from '../../../types/ExternalInterfaces';
import * as TezosTypes from '../../../types/tezos/TezosChainTypes';
import { TezosConstants } from '../../../types/tezos/TezosConstants';
import { TezosMessageUtils } from '../TezosMessageUtil';
import { TezosNodeReader } from '../TezosNodeReader';
import { TezosNodeWriter } from '../TezosNodeWriter';
import { TezosContractUtils } from './TezosContractUtils';

/**
 *
 */
export namespace KolibriTokenHelper {
    /**
     * Gets the contract code at the specified address at the head block and compares it to the known hash of the code. This function processes Micheline format contracts.
     * 
     * 
     * @param server Destination Tezos node.
     * @param address Contract address to query.
     */
    export async function verifyDestination(server: string, address: string): Promise<boolean> {
        return TezosContractUtils.verifyDestination(server, address, '0e3e137841a959521324b4ce20ca2df7');
    }

    /**
     * In contrast to verifyDestination, this function uses compares Michelson hashes.
     * 
     * @param script 
     */
    export function verifyScript(script: string): boolean {
        return TezosContractUtils.verifyScript(script, 'b77ada691b1d630622bea243696c84d7');
    }

    export async function getAccountBalance(server: string, mapid: number, account: string): Promise<number> {
        const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(account, 'address'), 'hex'));
        const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

        if (mapResult === undefined) { throw new Error(`Map ${mapid} does not contain a record for ${account}`); }

        const jsonresult = JSONPath({ path: '$.args[1].int', json: mapResult });
        return Number(jsonresult[0]);
    }

    export async function getAccountAllowance(server: string, mapid: number, account: string, source: string) {
        const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(source, 'address'), 'hex'));
        const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

        if (mapResult === undefined) { throw new Error(`Map ${mapid} does not contain a record for ${source}/${account}`); }

        let allowances = new Map<string, number>();
        JSONPath({ path: '$.args[1][*].args', json: mapResult }).forEach(v => allowances[v[0]['string']] = Number(v[1]['int']));

        return allowances[account];
    }

    export async function getSimpleStorage(server: string, address: string): Promise<{mapid: number, supply: number, administrator: string, paused: boolean}> {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);

        return {
            mapid: Number(JSONPath({ path: '$.args[0].args[0].args[1].int', json: storageResult })[0]),
            supply: Number(JSONPath({ path: '$.args[3].int', json: storageResult })[0]),
            administrator: JSONPath({ path: '$.args[0].args[0].args[0].string', json: storageResult })[0],
            paused: (JSONPath({ path: '$.args[1].args[1].prim', json: storageResult })[0]).toString().toLowerCase().startsWith('t')
        };
    }

    export async function getTokenSupply(server: string, address: string): Promise<number> {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);

        return Number(JSONPath({ path: '$.args[3].int', json: storageResult })[0]);
    }

    export async function getAdministrator(server: string, address: string): Promise<string> {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);

        return JSONPath({ path: '$.args[1].string', json: storageResult })[0];
    }

    export async function getPaused(server: string, address: string): Promise<boolean> {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);

        return (JSONPath({ path: '$.args[2].prim', json: storageResult })[0]).toString().toLowerCase().startsWith('t');
    }

    export async function transferBalance(server: string, signer: Signer, keystore: KeyStore, contract: string, fee: number, source: string, destination: string, amount: number, gas: number, freight: number) {
        const parameters = `(Left (Left (Left (Pair "${source}" (Pair "${destination}" ${amount})))))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, 0, fee, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson, TezosConstants.HeadBranchOffset, true);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function approveBalance(server: string, signer: Signer, keystore: KeyStore, contract: string, fee: number, destination: string, amount: number, gas: number, freight: number) {
        const parameters = `(Left (Left (Right (Pair "${destination}" ${amount}))))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, 0, fee, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson, TezosConstants.HeadBranchOffset, true);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function activateLedger(server: string, signer: Signer, keystore: KeyStore, contract: string, fee: number, gas: number, freight: number) {
        const parameters = '(Right (Left (Left False)))';

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, 0, fee, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson, TezosConstants.HeadBranchOffset, true);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function deactivateLedger(server: string, signer: Signer, keystore: KeyStore, contract: string, fee: number, gas: number, freight: number) {
        const parameters = '(Right (Left (Left True)))';

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, 0, fee, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson, TezosConstants.HeadBranchOffset, true);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function setAdministrator(server: string, signer: Signer, keystore: KeyStore, contract: string, address: string, fee: number, gas: number, freight: number) {
        const parameters = `(Right (Left (Right "${address}")))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, 0, fee, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson, TezosConstants.HeadBranchOffset, true);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function mint(server: string, signer: Signer, keystore: KeyStore, contract: string, fee: number, destination: string, amount: number, gas: number = 150_000, freight: number = 5_000) {
        const parameters = `(Right (Right (Right (Left (Pair "${destination}" ${amount})))))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, 0, fee, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson, TezosConstants.HeadBranchOffset, true);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function burn(server: string, signer: Signer, keystore: KeyStore, contract: string, fee: number, source: string, amount: number, gas: number, freight: number) {
        const parameters = `(Right (Right (Right (Right (Pair "${source}" ${amount})))))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, 0, fee, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson, TezosConstants.HeadBranchOffset, true);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }
}
