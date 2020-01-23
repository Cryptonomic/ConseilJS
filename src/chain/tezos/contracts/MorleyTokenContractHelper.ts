import * as blakejs from 'blakejs';
import { JSONPath } from 'jsonpath';

import { TezosMessageUtils } from '../TezosMessageUtil';
import { TezosNodeReader } from '../TezosNodeReader';
import { TezosNodeWriter } from '../TezosNodeWriter';
import { KeyStore } from '../../../types/wallet/KeyStore';
import * as TezosTypes from '../../../types/tezos/TezosChainTypes';

/**
 * Interface for the FA1.2 contract implementation from the Morley Project outlined here: https://gitlab.com/tzip/tzip/blob/master/proposals/tzip-7/ManagedLedger.md
 * 
 * Compatible with the contract as of January 22, 2020 from https://gitlab.com/tzip/tzip/raw/master/proposals/tzip-7/ManagedLedger.tz
 * 
 * This wrapper does not include support for the following contract functions: getAllowance, getBalance, getTotalSupply, getAdministrator. This information is retrieved by querying the big_map structure on chain directly.
 */
export namespace MorleyTokenContractHelper {
    /**
     * Gets the contract code at the specified address at the head block and compares it to the known hash of the code.
     * 
     * @param server Destination Tezos node.
     * @param address Contract address to query.
     */
    export async function verifyDestination(server: string, address: string): Promise<boolean> {
        const contract = await TezosNodeReader.getAccountForBlock(server, 'head', address);

        if (!!!contract.script) { throw new Error(`No code found at ${address}`); }

        const k = Buffer.from(blakejs.blake2s(contract['script'].toString(), null, 16)).toString('hex');

        if (k !== 'c020219e31ee3b462ed93c33124f117f') { throw new Error(`Contract at ${address} does not match the expected code hash`); }

        return true;
    }

    // TODO: deploy function

    export async function getAccountBalance(server: string, mapid: number, account: string): Promise<number> {
        const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(account, 'address'), 'hex'));
        const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

        if (mapResult === undefined) { throw new Error(`Map ${mapid} does not contain a record for ${account}`); }
    
        const jsonpath = new JSONPath();
        return Number(jsonpath.query(mapResult, '$.args[0].int')[0]);
    }

    export async function getAccountAllowance(server: string, mapid: number, account: string, source: string) {
        const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(source, 'address'), 'hex'));
        const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

        if (mapResult === undefined) { throw new Error(`Map ${mapid} does not contain a record for ${source}/${account}`); }

        const jsonpath = new JSONPath();
        let allowances = new Map<string, number>();
        (jsonpath.query(mapResult, '$.args[1][*].args')).forEach(v => allowances[v[0]['string']] = Number(v[1]['int']));

        return allowances[account];
    }

    export async function getTokenSupply(server: string, address: string): Promise<number> {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);
        const jsonpath = new JSONPath();

        return Number(jsonpath.query(storageResult, '$.args[1].args[1].args[1].int')[0]);
    }

    // TODO: getManager

    export async function transferBalance(server: string, keystore: KeyStore, contract: string, fee: number, source: string, destination: string, amount: number) {
        const freight = 2000;
        const gas = 200000;
        const parameters = `(Left (Left (Left (Pair "${source}" (Pair "${destination}" ${amount})))))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, '', freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function approveBalance(server: string, keystore: KeyStore, contract: string, fee: number, destination: string, amount: number) {
        const freight = 2000;
        const gas = 200000;
        const parameters = `(Left (Left (Right (Pair "${destination}" ${amount}))))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, '', freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function activateLedger(server: string, keystore: KeyStore, contract: string, fee: number) {
        const freight = 2000;
        const gas = 200000;
        const parameters = '(Right (Left (Left False)))';

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, '', freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function deactivateLedger(server: string, keystore: KeyStore, contract: string, fee: number) {
        const freight = 2000;
        const gas = 200000;
        const parameters = '(Right (Left (Left True)))';

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, '', freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function setAdministrator(server: string, keystore: KeyStore, contract: string, fee: number, address: string) {
        const freight = 2000;
        const gas = 200000;
        const parameters = `(Right (Left (Right "admin")))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, '', freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function mint(server: string, keystore: KeyStore, contract: string, fee: number, destination: string, amount: number) {
        const freight = 2000;
        const gas = 200000;
        const parameters = `(Right (Right (Right (Left (Pair "${destination}" ${amount})))))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, '', freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function burn(server: string, keystore: KeyStore, contract: string, fee: number, source: string, amount: number) {
        const freight = 2000;
        const gas = 200000;
        const parameters = `(Right (Right (Right (Right (Pair "${source}" ${amount})))))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, '', freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    function clearRPCOperationGroupHash(hash: string) {
        return hash.replace(/\"/g, '').replace(/\n/, '');
    }
}
