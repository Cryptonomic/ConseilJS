import { JSONPath } from 'jsonpath-plus';

import { KeyStore, Signer } from '../../../types/ExternalInterfaces';
import * as TezosTypes from '../../../types/tezos/TezosChainTypes';
import { TezosMessageUtils } from '../TezosMessageUtil';
import { TezosNodeReader } from '../TezosNodeReader';
import { TezosNodeWriter } from '../TezosNodeWriter';
import { TezosContractUtils } from './TezosContractUtils';
import { TezosParameterFormat } from '../../../types/tezos/TezosChainTypes'

/**
 * Interface for the Name Service contract developed by Cryptonomic, Inc.
 */
export namespace CryptonomicNameServiceHelper {
    /**
     * Gets the contract code at the specified address at the head block and compares it to the known hash of the code.
     * 
     * @param server Destination Tezos node.
     * @param address Contract address to query.
     */
    export async function verifyDestination(server: string, address: string): Promise<boolean> {
        return TezosContractUtils.verifyDestination(server, address, 'c020219e31ee3b462ed93c33124f117f');
    }

    export async function commitName(server: string, signer: Signer, keystore: KeyStore, contract: string, name: string, nonce: number, operationFee: number, freight?: number, gas?: number) {
        const commitRecord = `(Pair "${name}" (Pair ${nonce} 0x${TezosMessageUtils.writeAddress(keystore.publicKeyHash)}))`;
        const packedCommit = TezosMessageUtils.writePackedData(commitRecord, 'record', TezosParameterFormat.Michelson);
        const hashedCommit = TezosMessageUtils.simpleHash(Buffer.from(packedCommit, 'hex'), 32);
        const parameters = `0x${hashedCommit.toString('hex')}`;

        if (!freight || !gas) {
            const cost = await TezosNodeWriter.testContractInvocationOperation(server, 'main', keystore, contract, 0, operationFee, 6000, 500_000, 'commit', parameters, TezosTypes.TezosParameterFormat.Michelson);
            if (!freight){ freight = Number(cost['storageCost']) || 0; }
            if (!gas) { gas = Number(cost['gas']) + 300; }
        }

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, 0, operationFee, 6000, 300_000, 'commit', parameters, TezosTypes.TezosParameterFormat.Michelson);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    /**
     * Creates a name registry record.
     * 
     * @param server 
     * @param signer
     * @param keystore 
     * @param contract Contract address to call..
     * @param name Name to register.
     * @param {number} nonce 
     * @param registrationPeriod Duration to register the name for.
     * @param registrationFee Registration fee to pay.
     * @param operationFee Operation fee.
     * @param freight Storage limit, will be estimated if not given.
     * @param gas Gas limit, will be estimated if not given.
     */
    export async function registerName(server: string, signer: Signer, keystore: KeyStore, contract: string, name: string, nonce: number, registrationPeriod: number, registrationFee: number, operationFee: number, freight?: number, gas?: number) {
        const parameters = `(Pair ${registrationPeriod} (Pair "${name}" ${nonce}))`;

        if (!freight || !gas) {
            const cost = await TezosNodeWriter.testContractInvocationOperation(server, 'main', keystore, contract, registrationFee, operationFee, 6000, 500_000, 'registerName', parameters, TezosTypes.TezosParameterFormat.Michelson);
            if (!freight){ freight = Number(cost['storageCost']) || 0; }
            if (!gas) { gas = Number(cost['gas']) + 300; }
        }

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, registrationFee, operationFee, 6000, 300_000, 'registerName', parameters, TezosTypes.TezosParameterFormat.Michelson);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    /*
    updateOwnerInit(commitment: bytes, name: string)
    (Right (Right (Left (Right (Pair $PARAM $PARAM)))))
    
    updateOwnerComplete(name: string, nonce: int)
    (Right (Right (Left (Left (Pair $PARAM $PARAM)))))

    config(interval: int, maxCommitTime: int, maxDuration: int, minCommitTime: int, price: mutez)
    (Left (Left (Right (Left (Pair (Pair $PARAM $PARAM) (Pair $PARAM (Pair $PARAM $PARAM)))))))

    setDelegate(option (key_hash)?)
    (Right (Left (Right (Left ($PARAM)))))
    
    withdrawFunds(address)
    (Right (Right (Right (Right $PARAM))))
    */

    export async function updateRegistrationPeriod(server: string, signer: Signer, keystore: KeyStore, contract: string, name: string, newRegistrationPeriod: number, registrationFee: number, operationFee: number, freight?: number, gas?: number) {
        const parameters = `(Pair "${name}" ${newRegistrationPeriod})`;

        if (!freight || !gas) {
            const cost = await TezosNodeWriter.testContractInvocationOperation(server, 'main', keystore, contract, registrationFee, operationFee, 1000, 100000, 'updateRegistrationPeriod', parameters, TezosTypes.TezosParameterFormat.Michelson);
            if (!freight) { freight = Number(cost['storageCost']) || 0; }
            if (!gas) { gas = Number(cost['gas']) + 300; }
        }

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, registrationFee, operationFee, freight, gas, 'updateRegistrationPeriod', parameters, TezosTypes.TezosParameterFormat.Michelson);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function setPrimaryName(server: string, signer: Signer, keystore: KeyStore, contract: string, name: string, fee: number, freight?: number, gas?: number) {
        const parameters = `"${name}"`;

        if (!freight || !gas) {
            const cost = await TezosNodeWriter.testContractInvocationOperation(server, 'main', keystore, contract, 0, fee, 1000, 100000, 'setPrimaryName', parameters, TezosTypes.TezosParameterFormat.Michelson);
            if (!freight) { freight = Number(cost['storageCost']) || 0; }
            if (!gas) { gas = Number(cost['gas']) + 300; }
        }

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, 0, fee, freight, gas, 'deleteName', parameters, TezosTypes.TezosParameterFormat.Michelson);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function deleteName(server: string, signer: Signer, keystore: KeyStore, contract: string, name: string, fee: number, freight?: number, gas?: number) {
        const parameters = `"${name}"`;

        if (!freight || !gas) {
            const cost = await TezosNodeWriter.testContractInvocationOperation(server, 'main', keystore, contract, 0, fee, 1000, 100000, 'deleteName', parameters, TezosTypes.TezosParameterFormat.Michelson);
            if (!freight) { freight = Number(cost['storageCost']) || 0; }
            if (!gas) { gas = Number(cost['gas']) + 300; }
        }

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, 0, fee, freight, gas, 'deleteName', parameters, TezosTypes.TezosParameterFormat.Michelson);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function getNameForAddress(server: string, mapid: number, address: string) {
        const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(address, 'address'), 'hex'));
        const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

        return JSONPath({ path: '$.string', json: mapResult })[0];
    }

    /**
     * Queries the name registry big_map, 'nameMap' as returned by getSimpleStorage, for a specific name.
     *
     * @param server Destination Tezos node.
     * @param mapid Map index to query
     * @param name Name to look up.
     */
    export async function getNameInfo(server: string, mapid: number, name: string): Promise<NameServiceRecord>{
        const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(name, 'string'), 'hex'));
        const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

        return {
            name: JSONPath({ path: '$.args[0].args[1].string', json: mapResult })[0],
            modified: Boolean(JSONPath({ path: '$.args[0].args[0].prim', json: mapResult })[0]),
            owner: JSONPath({ path: '$.args[1].args[0].string', json: mapResult })[0],
            registeredAt: new Date(JSONPath({ path: '$.args[1].args[1].args[0].string', json: mapResult })[0]),
            registrationPeriod: JSONPath({ path: '$.args[1].args[1].args[1].int', json: mapResult })[0]
        };
    }

    /**
     * Returns basic contract configuration.
     * 
     * @param server Destination Tezos node.
     * @param contract Contract to query.
     * @returns A JSON object in the following format: { nameMap, addressMap, manager, interval, maxDuration, intervalFee }. `nameMap` is the name dictionary, `addressMap` is the reverse lookup map, `manager` is the registry administrator, `interval` is the registration period increment, `maxDuration` longest interval for which a name may be registered, `intervalFee` cost per interval.
     */
    export async function getSimpleStorage(server: string, contract: string): Promise<NameServiceStorage> {
        const storageResult = await TezosNodeReader.getContractStorage(server, contract);

        return {
            addressMap: Number(JSONPath({ path: '$.args[0].args[0].args[0].int', json: storageResult })[0]),
            commitmentMap: Number(JSONPath({ path: '$.args[0].args[0].args[1].int', json: storageResult })[0]),
            manager: JSONPath({ path: '$.args[0].args[1].args[0].string', json: storageResult })[0],
            interval: Number(JSONPath({ path: '$.args[0].args[1].args[1].int', json: storageResult })[0]),
            maxCommitTime: Number(JSONPath({ path: '$.args[1].args[0].args[0].int', json: storageResult })[0]),
            maxDuration: Number(JSONPath({ path: '$.args[1].args[0].args[1].int', json: storageResult })[0]),
            minCommitTime: Number(JSONPath({ path: '$.args[1].args[1].args[0].int', json: storageResult })[0]),
            nameMap: Number(JSONPath({ path: '$.args[1].args[1].args[1].args[0].int', json: storageResult })[0]),
            intervalFee: Number(JSONPath({ path: '$.args[1].args[1].args[1].args[1].int', json: storageResult })[0])
        };
    }
}

export interface NameServiceStorage {
    addressMap: number;
    commitmentMap: number;
    manager: string;
    interval: number;
    maxCommitTime: number;
    maxDuration: number;
    minCommitTime: number;
    nameMap: number;
    intervalFee: number;
}

export interface NameServiceRecord {
    name: string;
    modified: boolean;
    owner: string;
    registeredAt: Date;
    registrationPeriod: number;
}
