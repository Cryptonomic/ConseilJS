import * as blakejs from 'blakejs';
import { JSONPath } from 'jsonpath-plus';

import { TezosMessageUtils } from '../TezosMessageUtil';
import { TezosNodeReader } from '../TezosNodeReader';
import { TezosNodeWriter } from '../TezosNodeWriter';
import { KeyStore, Signer } from '../../../types/ExternalInterfaces';
import * as TezosTypes from '../../../types/tezos/TezosChainTypes';

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
        const contract = await TezosNodeReader.getAccountForBlock(server, 'head', address);

        if (!!!contract.script) { throw new Error(`No code found at ${address}`); }

        const k = Buffer.from(blakejs.blake2s(contract['script'].toString(), null, 16)).toString('hex');

        if (k !== 'c020219e31ee3b462ed93c33124f117f') { throw new Error(`Contract at ${address} does not match the expected code hash: ${k}, 'c020219e31ee3b462ed93c33124f117f'`); }

        return true;
    }

    /**
     * Creates a name registry record.
     * 
     * @param server 
     * @param keystore 
     * @param contract Contract address to call..
     * @param name Name to register.
     * @param resolver Address to associate with the given name.
     * @param registrationPeriod Duration to register the name for.
     * @param registrationFee Registration fee to pay.
     * @param operationFee Operation fee.
     * @param freight Storage limit, will be estimated if not given.
     * @param gas Gas limit, will be estimated if not given.
     */
    export async function registerName(server: string, signer: Signer, keystore: KeyStore, contract: string, name: string, resolver: string, registrationPeriod: number, registrationFee: number, operationFee: number, freight?: number, gas?: number) {
        const parameters = `(Pair ${registrationPeriod} (Pair "${name}" "${resolver}"))`;

        if (!freight || !gas) {
            const cost = await TezosNodeWriter.testContractInvocationOperation(server, 'main', keystore, contract, registrationFee, operationFee, 6000, 500_000, 'registerName', parameters, TezosTypes.TezosParameterFormat.Michelson);
            if (!freight){ freight = Number(cost['storageCost']) || 0; }
            if (!gas) { gas = Number(cost['gas']) + 300; }
        }

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, registrationFee, operationFee, 6000, 300_000, 'registerName', parameters, TezosTypes.TezosParameterFormat.Michelson);
        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function transferNameOwnership(server: string, signer: Signer, keystore: KeyStore, contract: string, name: string, newNameOwner: string, fee: number, freight?: number, gas?: number) {
        const parameters = `(Pair "${name}" "${newNameOwner}")`;
        //(pair %transferNameOwnership (string %name) (address %newNameOwner))
        //(Right (Left (Pair $PARAM $PARAM)))

        if (!freight || !gas) {
            const cost = await TezosNodeWriter.testContractInvocationOperation(server, 'main', keystore, contract, 0, fee, 1000, 100000, 'transferNameOwnership', parameters, TezosTypes.TezosParameterFormat.Michelson);
            if (!freight) { freight = Number(cost['storageCost']) || 0; }
            if (!gas) { gas = Number(cost['gas']) + 300; }
        }

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, 0, fee, freight, gas, 'transferNameOwnership', parameters, TezosTypes.TezosParameterFormat.Michelson);
        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function updateResolver(server: string, signer: Signer, keystore: KeyStore, contract: string, name: string, resolver: string, fee: number, freight?: number, gas?: number) {
        const parameters = `(Pair "${name}" "${resolver}")`;
        //(pair %updateResolver (string %name) (address %resolver))
        //(Right (Right (Right (Pair $PARAM $PARAM))))

        if (!freight || !gas) {
            const cost = await TezosNodeWriter.testContractInvocationOperation(server, 'main', keystore, contract, 0, fee, 1000, 100000, 'updateResolver', parameters, TezosTypes.TezosParameterFormat.Michelson);
            if (!freight) { freight = Number(cost['storageCost']) || 0; }
            if (!gas) { gas = Number(cost['gas']) + 300; }
        }

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, 0, fee, freight, gas, 'updateResolver', parameters, TezosTypes.TezosParameterFormat.Michelson);
        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function updateRegistrationPeriod(server: string, signer: Signer, keystore: KeyStore, contract: string, name: string, newRegistrationPeriod: number, registrationFee: number, operationFee: number, freight?: number, gas?: number) {
        const parameters = `(Pair "${name}" ${newRegistrationPeriod})`;
        //(pair %updateRegistrationPeriod (int %duration) (string %name))
        //(Right (Right (Left (Pair $PARAM $PARAM))))

        if (!freight || !gas) {
            const cost = await TezosNodeWriter.testContractInvocationOperation(server, 'main', keystore, contract, registrationFee, operationFee, 1000, 100000, 'updateRegistrationPeriod', parameters, TezosTypes.TezosParameterFormat.Michelson);
            if (!freight) { freight = Number(cost['storageCost']) || 0; }
            if (!gas) { gas = Number(cost['gas']) + 300; }
        }

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, registrationFee, operationFee, freight, gas, 'updateRegistrationPeriod', parameters, TezosTypes.TezosParameterFormat.Michelson);
        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function deleteName(server: string, signer: Signer, keystore: KeyStore, contract: string, name: string, fee: number, freight?: number, gas?: number) {
        const parameters = `"${name}"`;
        //(string %deleteName)
        //(Left (Left $PARAM))

        if (!freight || !gas) {
            const cost = await TezosNodeWriter.testContractInvocationOperation(server, 'main', keystore, contract, 0, fee, 1000, 100000, 'deleteName', parameters, TezosTypes.TezosParameterFormat.Michelson);
            if (!freight) { freight = Number(cost['storageCost']) || 0; }
            if (!gas) { gas = Number(cost['gas']) + 300; }
        }

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, 0, fee, freight, gas, 'deleteName', parameters, TezosTypes.TezosParameterFormat.Michelson);
        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
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
    export async function getNameInfo(server: string, mapid: number, name: string): Promise<any>{
        const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(name, 'string'), 'hex'));
        const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

        return {
            name, // name
            owner: JSONPath({ path: '$.args[0].args[1].args[1].string', json: mapResult })[0], // owner
            resolver: JSONPath({ path: '$.args[1].args[1].args[1].string', json: mapResult })[0], // resolver
            registeredAt: new Date(JSONPath({ path: '$.args[1].args[0].string', json: mapResult })[0]), // registeredAt
            registrationPeriod: JSONPath({ path: '$.args[1].args[1].args[0].int', json: mapResult })[0], // registrationPeriod
            modified: Boolean(JSONPath({ path: '$.args[0].args[0].prim', json: mapResult })[0]) // modified
        };
    }

    /**
     * Returns basic contract configuration.
     * 
     * @param server Destination Tezos node.
     * @param contract Contract to query.
     * @returns A JSON object in the following format: { nameMap, addressMap, manager, interval, maxDuration, intervalFee }. `nameMap` is the name dictionary, `addressMap` is the reverse lookup map, `manager` is the registry administrator, `interval` is the registration period increment, `maxDuration` longest interval for which a name may be registered, `intervalFee` cost per interval.
     */
    export async function getSimpleStorage(server: string, contract: string): Promise<{ nameMap: number, addressMap: number, manager: string, interval: number, maxDuration: number, intervalFee: number }> {
        const storageResult = await TezosNodeReader.getContractStorage(server, contract);

        return {
            addressMap: Number(JSONPath({ path: '$.args[0].args[0].int', json: storageResult })[0]),
            nameMap: Number(JSONPath({ path: '$.args[1].args[1].args[0].int', json: storageResult })[0]),
            manager: JSONPath({ path: '$.args[0].args[1].args[0].string', json: storageResult })[0],
            interval: Number(JSONPath({ path: '$.args[0].args[1].args[1].int', json: storageResult })[0]), 
            maxDuration: Number(JSONPath({ path: '$.args[1].args[0].int', json: storageResult })[0]), 
            intervalFee: Number(JSONPath({ path: '$.args[1].args[1].args[1].int', json: storageResult })[0])
        };
    }

    function clearRPCOperationGroupHash(hash: string) {
        return hash.replace(/\"/g, '').replace(/\n/, '');
    }
}
