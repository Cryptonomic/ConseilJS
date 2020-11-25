import { JSONPath } from 'jsonpath-plus';
import base58Check from "bs58check";
import * as blakejs from 'blakejs';

import { KeyStore, Signer } from '../../../types/ExternalInterfaces';
import * as TezosTypes from '../../../types/tezos/TezosChainTypes';
import { TezosMessageUtils } from '../TezosMessageUtil';
import { TezosNodeReader } from '../TezosNodeReader';
import { TezosNodeWriter } from '../TezosNodeWriter';
import { TezosContractUtils } from './TezosContractUtils';
import { TezosParameterFormat } from '../../../types/tezos/TezosChainTypes';

/** The expected checksum for the Wrapped Tezos contracts. */
const CONTRACT_CHECKSUMS = {
    token: 'd48b45bd77d2300026fe617c5ba7670e',
    oven: '5e3c30607da21a0fc30f7be61afb15c7',
    core: '7b9b5b7e7f0283ff6388eb783e23c452'
}

/** The expected checksum for the Wrapped Tezos scripts. */
const SCRIPT_CHECKSUMS = {
    // TODO(keefertaylor): Compute this checksum correctly.
    token: '',
    // TODO(keefertaylor): Compute this checksum correctly.
    oven: '',
    // TODO(keefertaylor): Compute this checksum correctly.
    core: ''
}

/**
 * Property bag containing the results of opening an oven.
 */
export type OpenOvenResult = {
    // The operation hash of the request to open an oven.
    operationHash: string

    // The address of the new oven contract.
    ovenAddress: string
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
     * @param ovenContractAddress The address of an oven contract.
     * @param coreContractAddress The address of the core contract.
     * @returns A boolean indicating if the code was the expected sum.
     */
    export async function verifyDestination(
        nodeUrl: string,
        tokenContractAddress: string,
        ovenContractAddress: string,
        coreContractAddress: string
    ): Promise<boolean> {
        const tokenMatched = TezosContractUtils.verifyDestination(nodeUrl, tokenContractAddress, CONTRACT_CHECKSUMS.token)
        const ovenMatched = TezosContractUtils.verifyDestination(nodeUrl, ovenContractAddress, CONTRACT_CHECKSUMS.oven)
        const coreMatched = TezosContractUtils.verifyDestination(nodeUrl, coreContractAddress, CONTRACT_CHECKSUMS.core)

        return tokenMatched && ovenMatched && coreMatched
    }

    /**
     * Verifies that Michelson script for Wrapped Tezos contracts matches the expected code.
     * 
     * Note: This function processes scrips in Michelson format.
     * 
     * @param tokenScript The script of the token contract.
     * @param ovenScript The script of an oven contract.
     * @param coreScript The script of the core contract.
     * @returns A boolean indicating if the code was the expected sum.
     */

    export function verifyScript(tokenScript: string, ovenScript, string, coreScript: string): boolean {
        const tokenMatched = TezosContractUtils.verifyScript(tokenScript, SCRIPT_CHECKSUMS.token)
        const ovenMatched = TezosContractUtils.verifyScript(ovenScript, SCRIPT_CHECKSUMS.oven)
        const coreMatched = TezosContractUtils.verifyScript(coreScript, SCRIPT_CHECKSUMS.core)

        return tokenMatched && ovenMatched && coreMatched
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

    /**
     * Deposit XTZ into an oven to mint WXTZ.
     * 
     * WXTZ will be minted for the owner of the oven, *not* the source address. This allows bakers
     * to payout delegated ovens.
     *
     * @param nodeUrl The URL of the Tezos node which serves data.
     * @param signer A Signer for the sourceAddress.
     * @param keystore A Keystore for the sourceAddress.
     * @param ovenAddress The address of the oven contract. 
     * @param fee The fee to use.
     * @param amountMutez The amount of XTZ to deposit, specified in mutez.
     * @param gasLimit The gas limit to use.
     * @param storageLimit The storage limit to use. 
     * @returns A string representing the transaction hash.
     */
    export async function depositToOven(
        nodeUrl: string,
        signer: Signer,
        keystore: KeyStore,
        ovenAddress: string,
        fee: number,
        amountMutez: number,
        gasLimit: number,
        storageLimit: number
    ): Promise<string> {
        const parameters = 'Unit'

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(
            nodeUrl,
            signer,
            keystore,
            ovenAddress,
            amountMutez,
            fee,
            storageLimit,
            gasLimit,
            '',
            parameters,
            TezosTypes.TezosParameterFormat.Michelson
        )

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    /**
     * Withdraw XTZ from an oven by repaying WXTZ.
     * 
     * This operation will fail if:
     * - The sending account is not the oven owner.
     * - The sending account does not possess the equivalent amount of WXTZ to the withdrawal amount
     * - The oven has less XTZ in it than is requested to be withdrawn.
     *
     * @param nodeUrl The URL of the Tezos node which serves data.
     * @param signer A Signer for the sourceAddress.
     * @param keystore A Keystore for the sourceAddress.
     * @param ovenAddress The address of the oven contract. 
     * @param fee The fee to use.
     * @param amountMutez The amount of XTZ to withdraw, specified in mutez.
     * @param gasLimit The gas limit to use.
     * @param storageLimit The storage limit to use. 
     * @returns A string representing the transaction hash.
     */
    export async function withdrawFromOven(
        nodeUrl: string,
        signer: Signer,
        keystore: KeyStore,
        ovenAddress: string,
        fee: number,
        amountMutez: number,
        gasLimit: number,
        storageLimit: number
    ): Promise<string> {
        const parameters = `${amountMutez}`

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(
            nodeUrl,
            signer,
            keystore,
            ovenAddress,
            0,
            fee,
            storageLimit,
            gasLimit,
            'withdraw',
            parameters,
            TezosTypes.TezosParameterFormat.Michelson
        )

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function openOven(
        nodeUrl: string,
        signer: Signer,
        keystore: KeyStore,
        fee: number,
        coreAddress: string,
        gasLimit: number,
        storageLimit: number
    ): Promise<OpenOvenResult> {
        const entryPoint = 'runEntrypointLambda'
        const lambdaName = 'createOven'
        const bytes = TezosMessageUtils.writePackedData(`Pair None "${keystore.publicKeyHash}"`, 'pair (option key_hash) address', TezosParameterFormat.Michelson)
        const parameters = `Pair "${lambdaName}" 0x${bytes}`

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(
            nodeUrl,
            signer,
            keystore,
            coreAddress,
            0,
            fee,
            storageLimit,
            gasLimit,
            entryPoint,
            parameters,
            TezosTypes.TezosParameterFormat.Michelson
        )

        const operationHash = TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
        const ovenAddress = calculateContractAddress(operationHash, 0)
        return {
            operationHash,
            ovenAddress
        }
    }

    /**
     * Calculate the address of a contract that was originated.
     * 
     * TODO(anonymoussprocket): This funcition is probably useful elsewhere in ConseilJS. Consider refactoring.
     *
     * @param operationHash The operation group hash.
     * @param index The index of the origination operation in the operation group.
     */
    function calculateContractAddress(operationHash: string, index: number): string {
        // Decode and slice two byte prefix off operation hash.
        const decoded: Uint8Array = base58Check.decode(operationHash).slice(2)

        // Merge the decoded buffer with the operation prefix.
        let decodedAndOperationPrefix: Array<number> = []
        for (let i = 0; i < decoded.length; i++) {
            decodedAndOperationPrefix.push(decoded[i])
        }
        decodedAndOperationPrefix = decodedAndOperationPrefix.concat([
            (index & 0xff000000) >> 24,
            (index & 0x00ff0000) >> 16,
            (index & 0x0000ff00) >> 8,
            index & 0x000000ff,
        ])

        // Hash and encode.
        const hash = blakejs.blake2b(new Uint8Array(decodedAndOperationPrefix), null, 20)
        const smartContractAddressPrefix = new Uint8Array([2, 90, 121]) // KT1
        const prefixedBytes = mergeBytes(smartContractAddressPrefix, hash)
        return base58Check.encode(prefixedBytes)
    }

    function mergeBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
        const merged = new Uint8Array(a.length + b.length)
        merged.set(a)
        merged.set(b, a.length)

        return merged
    }
}
