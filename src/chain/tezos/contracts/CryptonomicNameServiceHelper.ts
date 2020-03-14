import * as blakejs from 'blakejs';
import { JSONPath } from 'jsonpath-plus';

import { TezosMessageUtils } from '../TezosMessageUtil';
import { TezosNodeReader } from '../TezosNodeReader';
import { TezosNodeWriter } from '../TezosNodeWriter';
import { KeyStore } from '../../../types/wallet/KeyStore';
import * as TezosTypes from '../../../types/tezos/TezosChainTypes';

/**
 * 
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

    export async function registerName(server: string, keystore: KeyStore, contract: string, name: string, resolver: string, registrationPeriod: number, fee: number, freight?: number, gas?: number) {
        //const parameters = `(Pair ${registrationPeriod} (Pair "${name}" "${resolver}"))`;
        //(pair %registerName (int %duration) (pair (string %name) (address %resolver))))
        //(Left (Right (Pair $PARAM (Pair $PARAM $PARAM))))
        const parameters = `(Left (Right (Pair ${registrationPeriod} (Pair "${name}" "${resolver}"))))`;

        if (!freight || !gas) {
            const cost = await TezosNodeWriter.testContractInvocationOperation(server, 'main', keystore, contract, 0, fee, 6000, 500_000, '', parameters, TezosTypes.TezosParameterFormat.Michelson);
            if (!freight){ freight = Number(cost['storageCost']) || 0; }
            if (!gas) { gas = Number(cost['gas']) + 300; }
        }

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, keystore.derivationPath, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);
        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function transferNameOwnership(server: string, keystore: KeyStore, contract: string, name: string, newNameOwner: string, fee: number, freight?: number, gas?: number, derivationPath: string = '') {
        const parameters = `(Pair "${name}" "${newNameOwner}")`;
        //(pair %transferNameOwnership (string %name) (address %newNameOwner))
        //(Right (Left (Pair $PARAM $PARAM)))

        if (!freight || !gas) {
            const cost = await TezosNodeWriter.testContractInvocationOperation(server, 'main', keystore, contract, 0, fee, 1000, 100000, 'transferNameOwnership', parameters, TezosTypes.TezosParameterFormat.Michelson);
            if (!freight) { freight = Number(cost['storageCost']) || 0; }
            if (!gas) { gas = Number(cost['gas']) + 300; }
        }

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, derivationPath, freight, gas, 'transferNameOwnership', parameters, TezosTypes.TezosParameterFormat.Michelson);
        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function updateResolver(server: string, keystore: KeyStore, contract: string, name: string, resolver: string, fee: number, freight?: number, gas?: number) {
        const parameters = `(Pair "${name}" "${resolver}")`;
        //(pair %updateResolver (string %name) (address %resolver))
        //(Right (Right (Right (Pair $PARAM $PARAM))))

        if (!freight || !gas) {
            const cost = await TezosNodeWriter.testContractInvocationOperation(server, 'main', keystore, contract, 0, fee, 1000, 100000, 'updateResolver', parameters, TezosTypes.TezosParameterFormat.Michelson);
            if (!freight) { freight = Number(cost['storageCost']) || 0; }
            if (!gas) { gas = Number(cost['gas']) + 300; }
        }

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, keystore.derivationPath, freight, gas, 'updateResolver', parameters, TezosTypes.TezosParameterFormat.Michelson);
        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    /**
     * Calls the updateRegistrationPeriod entrypoint on the contract.
     * 
     * @param server Destination Tezos node.
     * @param keystore KeyStore object to sign the transaction with.
     * @param name Name to register in the contract.
     * @param resolver Resolver to register with name.
     * @param registrationPeriod Length of time to register name for.
     * @param fee Transaction fee.
     * @param freight Storage fee limit, if not provided calculate storage limit.
     * @param gas Gas fee, if not provided calculate gas limit.
     */
    export async function updateRegistrationPeriod(server: string, keystore: KeyStore, contract: string, name: string, newRegistrationPeriod: number, fee: number, freight?: number, gas?: number) {
        const parameters = `(Pair "${name}" ${newRegistrationPeriod})`;
        //(pair %updateRegistrationPeriod (int %duration) (string %name))
        //(Right (Right (Left (Pair $PARAM $PARAM))))

        if (!freight || !gas) {
            const cost = await TezosNodeWriter.testContractInvocationOperation(server, 'main', keystore, contract, 0, fee, 1000, 100000, 'updateRegistrationPeriod', parameters, TezosTypes.TezosParameterFormat.Michelson);
            if (!freight) { freight = Number(cost['storageCost']) || 0; }
            if (!gas) { gas = Number(cost['gas']) + 300; }
        }

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, keystore.derivationPath, freight, gas, 'updateRegistrationPeriod', parameters, TezosTypes.TezosParameterFormat.Michelson);
        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function deleteName(server: string, keystore: KeyStore, contract: string, name: string, fee: number, freight?: number, gas?: number) {
        const parameters = `"${name}"`;
        //(string %deleteName)
        //(Left (Left $PARAM))

        if (!freight || !gas) {
            const cost = await TezosNodeWriter.testContractInvocationOperation(server, 'main', keystore, contract, 0, fee, 1000, 100000, 'deleteName', parameters, TezosTypes.TezosParameterFormat.Michelson);
            if (!freight) { freight = Number(cost['storageCost']) || 0; }
            if (!gas) { gas = Number(cost['gas']) + 300; }
        }

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, keystore.derivationPath, freight, gas, 'deleteName', parameters, TezosTypes.TezosParameterFormat.Michelson);
        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function getNameFromAddress(server: string, address: string) {
        
    }

    export async function getNameInfo(server: string, mapid: number, name: string) {
        const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(name, 'string'), 'hex'));
        const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

        return {
            name, // name
            owner: JSONPath({ path: '$.args[0].args[0].args[0].args[1].string', json: mapResult })[0], // owner
            resolver: JSONPath({ path: '$.args[1].string', json: mapResult })[0], // resolver
            registeredAt: new Date(JSONPath({ path: '$.args[0].args[0].args[1].string', json: mapResult })[0]), // registeredAt
            registrationPeriod: JSONPath({ path: '$.args[0].args[1].int', json: mapResult })[0], // registrationPeriod
            modified: Boolean(JSONPath({ path: '$.args[0].args[0].args[0].args[0].args[0].prim', json: mapResult })[0]) // modified
        };
    }

    function clearRPCOperationGroupHash(hash: string) {
        return hash.replace(/\"/g, '').replace(/\n/, '');
    }
}
