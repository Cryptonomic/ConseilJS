import * as blakejs from 'blakejs';
import { JSONPath } from 'jsonpath';

import { TezosMessageUtils } from '../TezosMessageUtil';
import { TezosNodeReader } from '../TezosNodeReader';

/**
 * Interface for the Tezos Token contract proposal TZIP-0007: https://gitlab.com/tzip/tzip/tree/master/Proposals/TZIP-0007
 * 
 * Compatible with the contract as of December 22, 2019.
 */
export namespace TZIPSevenTokenHelper {
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

    /**
     * Retrieves high level storage, including map id and token supply cap.
     * 
     * @param server Destination Tezos node.
     * @param address Contract address to query.
     */
    export async function getBasicStorage(server: string, address: string) {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);
        const jsonpath = new JSONPath();

        return {
            mapid: Number(jsonpath.query(storageResult, '$.args[0].int')[0]),
            totalSupply: Number(jsonpath.query(storageResult, '$.args[1].int')[0])
        };
    }

    /**
     * 
     * 
     * @param server Destination Tezos node.
     * @param mapid bigmap reference to query.
     * @param account Account address to query.
     */
    export async function getAddressRecord(server: string, mapid: number, account: string) {
        const key = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(account, 'address'), 'hex'));
        const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, key);

        if (!!!mapResult) { return undefined; }

        const jsonpath = new JSONPath();

        return {
            allowances: jsonpath.query(mapResult, '$.args[0]')[0],
            balance: Number(jsonpath.query(mapResult, '$.args[1].int')[0])
        };
    }
}
