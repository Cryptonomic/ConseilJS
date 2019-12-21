import * as blakejs from 'blakejs';

import { KeyStore } from '../../../types/wallet/KeyStore';
import * as TezosTypes from '../../../types/tezos/TezosChainTypes';
import { TezosConstants } from '../../../types/tezos/TezosConstants';
import { TezosNodeWriter } from '../TezosNodeWriter';
import { TezosNodeReader } from '../TezosNodeReader';

export namespace TCFBakerRegistryHelper { // TODO: rename /chain/tezos/contracts/BabylonDelegationHelper.ts
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

        if (k !== '1527ddf08bdf582dce0b28c051044897') { throw new Error(`Contract at ${address} does not match the expected code hash`); }

        return true;
    }

    export async function getFees() {
        //
    }

    export async function updateRegistration() {
        //
    }

    export async function queryRegistration() {
        //
    }
}