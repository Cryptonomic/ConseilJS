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
export namespace StakerDAOTokenHelper {
    /**
     * Gets the contract code at the specified address at the head block and compares it to the known hash of the code. This function processes Micheline format contracts.
     * 
     * 
     * @param server Destination Tezos node.
     * @param address Contract address to query.
     */
    export async function verifyDestination(server: string, address: string): Promise<boolean> {
        const contract = await TezosNodeReader.getAccountForBlock(server, 'head', address);

        if (!!!contract.script) { throw new Error(`No code found at ${address}`); }

        const k = Buffer.from(blakejs.blake2s(JSON.stringify(contract.script.code), null, 16)).toString('hex');

        if (k !== '0e3e137841a959521324b4ce20ca2df7') { throw new Error(`Contract does not match the expected code hash: ${k}, '0e3e137841a959521324b4ce20ca2df7'`); }

        return true;
    }

    /**
     * In contrast to verifyDestination, this function uses compares Michelson hashes.
     * 
     * @param script 
     */
    export function verifyScript(script: string): boolean {
        const k = Buffer.from(blakejs.blake2s(TezosLanguageUtil.preProcessMichelsonScript(script).join('\n'), null, 16)).toString('hex');

        if (k !== 'b77ada691b1d630622bea243696c84d7') { throw new Error(`Contract does not match the expected code hash: ${k}, 'b77ada691b1d630622bea243696c84d7'`); }

        return true;
    }

    export async function getAccountBalance(server: string, mapid: number, account: string): Promise<number> {
        const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(account, 'address'), 'hex'));
        const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

        if (mapResult === undefined) { throw new Error(`Map ${mapid} does not contain a record for ${account}`); }

        return Number(JSONPath({ path: '$.int', json: mapResult })[0]);
    }

    /**
     * Storage definition taken from https://github.com/StakerDAO/staker-dao/blob/master/stkr-token/src/Lorentz/Contracts/STKR/Storage.hs#L20
     * 
     * @param server 
     * @param address 
     */
    export async function getSimpleStorage(server: string, address: string): Promise<{ mapid: number, council: string[], stage: number,  phase: number, supply: number, paused: boolean }> {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);

        return {
            mapid: Number(JSONPath({ path: '$.args[1].args[1].args[0].int', json: storageResult })[0]),
            council: JSONPath({ path: '$.args[0].args[0].args[1]..string', json: storageResult }),
            stage: Number(JSONPath({ path: '$.args[1].args[0].args[0].int', json: storageResult })[0]),
            phase: Number(JSONPath({ path: '$.args[1].args[0].args[0].int', json: storageResult })[0]) % 4,
            supply: Number(JSONPath({ path: '$.args[1].args[0].args[1].int', json: storageResult })[0]),
            paused: (JSONPath({ path: '$.args[1].args[1].args[1].args[0].prim', json: storageResult })[0]).toString().toLowerCase().startsWith('t')
            //policy
            //proposals
            //votes
        };
    }

    export async function transferBalance(server: string, keystore: KeyStore, contract: string, fee: number, source: string, destination: string, amount: number, gas: number, freight: number) {
        const parameters = `(Right (Left (Left (Right (Pair "${source}" (Pair "${destination}" ${amount}))))))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, '', freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    function clearRPCOperationGroupHash(hash: string) {
        return hash.replace(/\"/g, '').replace(/\n/, '');
    }
}
