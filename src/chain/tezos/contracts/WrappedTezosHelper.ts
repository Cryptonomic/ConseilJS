import { JSONPath } from 'jsonpath-plus';

import { KeyStore, Signer } from '../../../types/ExternalInterfaces';
import * as TezosTypes from '../../../types/tezos/TezosChainTypes';
import { TezosMessageUtils } from '../TezosMessageUtil';
import { TezosNodeReader } from '../TezosNodeReader';
import { TezosNodeWriter } from '../TezosNodeWriter';
import { TezosContractUtils } from './TezosContractUtils';

/** The expected checksum for the Wrapped Tezos contracts. */
const CONTRACT_CHECKSUMS = {
    token: 'd48b45bd77d2300026fe617c5ba7670e'

    // TODO(keefertaylor): Implement additional checksums for core and oven contracts here.
}

/** The expected checksum for the Wrapped Tezos scripts. */
const SCRIPT_CHECKSUMS = {
    // TODO(keefertaylor): Compute this checksum correctly.
    token: '0e3e137841a959521324b4ce20ca2df7'

    // TODO(keefertaylor): Implement additional checksums for core and oven contracts here.
}

/**
 * Interface for the Wrapped XTZ Token and Oven implementation.
 * 
 * @see {@link https://forum.tezosagora.org/t/wrapped-tezos/2195|wXTZ on Tezos Agora}
 * 
 * The token represented by these contracts trades with symbol 'WXTZ' and is specified with 10^-6 precision. Put
 * simply, 1 XTZ = 1 WXTZ, and 0.000_001 XTZ = 1 Mutez = 0.000_001 WXTZ.
 * 
 * Canonical Data:
 * - Delphinet:
 *  - Token Contract: KT1JYf7xjCJAqFDfNpuump9woSMaapy1WcMY 
 *  - Token Balances Map ID: 14566
 *  - TODO(keefertaylor): Add core / oven contracts here.
 * TODO(keefertaylor): Add additional data for mainnet here.
 *
 * @author Keefer Taylor, Staker Services Ltd <keefer@stakerdao.com>
 */
export namespace WrappedTezosHelper {
    /**
     * Verifies that contract code for Wrapped Tezos matches the expected code.
     * 
     * Note: This function processes contracts in the Micheline format.
     * 
     * @param nodeUrl The URL of the Tezos node which serves data.
     * @param tokenContractAddress The address of the token contract.
     * @returns A boolean indicating if the code was the expected sum.
     */
    export async function verifyDestination(nodeUrl: string, tokenContractAddress: string): Promise<boolean> {
        // TODO(keefertaylor): Verify checksums for core and oven contracts here.
        return TezosContractUtils.verifyDestination(nodeUrl, tokenContractAddress, CONTRACT_CHECKSUMS.token);
    }

    /**
     * Verifies that Michelson script for Wrapped Tezos contracts matches the expected code.
     * 
     * Note: This function processes scrips in Michelson format.
     * 
     * @param tokenScript The address of the token contract.
     * @returns A boolean indicating if the code was the expected sum.
     */

    export function verifyScript(tokenScript: string): boolean {
        // TODO(keefertaylor): Verify checksums for core and oven scrips here.
        return TezosContractUtils.verifyScript(tokenScript, SCRIPT_CHECKSUMS.token);
    }

    /**
     * Get the balance of WXTZ tokens for an address.
     * 
     * @param nodeUrl The URL of the Tezos node which serves data.
     * @param mapId The ID of the BigMap which contains balances.
     * @param address The address to fetch the token balance for.
     */
    export async function getAccountBalance(server: string, mapid: number, address: string): Promise<number> {
        const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(address, 'address'), 'hex'));
        const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

        if (mapResult === undefined) { throw new Error(`Map ${mapid} does not contain a record for ${address}`); }

        const numberString = JSONPath({ path: '$.int', json: mapResult });
        return Number(numberString);
    }

    /**
     * Transfer some WXTZ between addresses.
     * 
     * @param nodeUrl The URL of the Tezos node which serves data.
     * @param signer A Signer for the sourceAddress.
     * @param keystore A Keystore for the sourceAddress.
     * @param tokenContractAddress The address of the token contract. 
     * @param fee The fee to use.
     * @param sourceAddress The address which will send tokens.
     * @param destinationAddress The address which will receive tokens.
     * @param amount The amount of tokens to send.
     * @param gasLimit The gas limit to use.
     * @param storageLimit The storage limit to use. 
     * @returns A string representing the transaction hash.
     */
    export async function transferBalance(
        nodeUrl: string,
        signer: Signer,
        keystore: KeyStore,
        tokenContractAddress: string,
        fee: number,
        sourceAddress: string,
        destinationAddress: string,
        amount: number,
        gasLimit: number,
        storageLimit: number
    ): Promise<string> {
        const parameters = `Pair "${sourceAddress}" (Pair "${destinationAddress}" ${amount})`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(
            nodeUrl,
            signer,
            keystore,
            tokenContractAddress,
            0,
            fee,
            storageLimit,
            gasLimit,
            'transfer',
            parameters,
            TezosTypes.TezosParameterFormat.Michelson
        );

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }
}
