import * as blakejs from 'blakejs';
import { JSONPath } from 'jsonpath-plus';

import { TezosMessageUtils } from '../TezosMessageUtil';
import { TezosNodeReader } from '../TezosNodeReader';

/**
 * Awaiting contracts at https://gitlab.com/camlcase-dev/dexter
 */
export namespace DexterTokenHelper {
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

        if (k !== '1234') { throw new Error(`Contract at ${address} does not match the expected code hash`); }

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
        console.log('-----')
        console.log(storageResult);
        console.log('-----')

        return {
            mapid: Number(JSONPath({ path: '$.args[0].int', json: storageResult })[0]),
            totalSupply: Number(JSONPath({ path: '$.args[1].int', json: storageResult })[0])
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

        return {
            allowances: JSONPath({ path: '$.args[0]', json: mapResult })[0],
            balance: Number(JSONPath({ path: '$.args[1].int', json: mapResult })[0])
        };
    }

    /**
     * 
     * @param server Destination Tezos node.
     * @param manager Token manager address
     * @param supply Initial token supply
     */
    export async function deployContract(server: string, manager: string, supply: number) {

    }
}
