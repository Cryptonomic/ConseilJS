
import { KeyStore, Signer } from '../../../types/ExternalInterfaces';
import * as TezosTypes from '../../../types/tezos/TezosChainTypes';
import { TezosMessageUtils } from '../TezosMessageUtil';
import { TezosNodeWriter } from '../TezosNodeWriter';
import { TezosContractUtils } from './TezosContractUtils';
import { TezosConseilClient } from '../../../reporting/tezos/TezosConseilClient'
import { ConseilServerInfo } from '../../../types/conseil/QueryTypes';
import { ContractMapDetailsItem } from '../../../types/conseil/ConseilTezosTypes';
import { TezosParameterFormat } from '../../../types/tezos/TezosChainTypes';
import { StakerDaoTzip7 } from './StakerDaoTzip7';
import { StakerDAOTokenHelper } from './StakerDAOTokenHelper';

/** The expected checksum for the Wrapped Tezos contracts. */
const CONTRACT_CHECKSUMS = {
    oven: '5e3c30607da21a0fc30f7be61afb15c7',
    core: '7b9b5b7e7f0283ff6388eb783e23c452'
}

/** The expected checksum for the Wrapped Tezos scripts. */
const SCRIPT_CHECKSUMS = {
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
 * Types for the Oven Map .
 * 
 * Key: The oven's address.
 * Value: The oven owner's address.
 */
export type OvenMapSchema = { key: string, value: string }

/**
 * Wrapped Tezos specific functions. 
 * 
 * @see {WrappedTezosHelper}
 */
const WrappedTezosHelperInternal = {
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
    verifyDestination: async function (
        nodeUrl: string,
        ovenContractAddress: string,
        coreContractAddress: string
    ): Promise<boolean> {
        const ovenMatched = await TezosContractUtils.verifyDestination(nodeUrl, ovenContractAddress, CONTRACT_CHECKSUMS.oven)
        const coreMatched = await TezosContractUtils.verifyDestination(nodeUrl, coreContractAddress, CONTRACT_CHECKSUMS.core)

        return ovenMatched && coreMatched
    },

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
    verifyScript: function (
        ovenScript: string,
        coreScript: string
    ): boolean {
        const ovenMatched = TezosContractUtils.verifyScript(ovenScript, SCRIPT_CHECKSUMS.oven)
        const coreMatched = TezosContractUtils.verifyScript(coreScript, SCRIPT_CHECKSUMS.core)

        return ovenMatched && coreMatched
    },

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
     * @returns A string representing the operation hash.
     */
    depositToOven: async function depositToOven(
        nodeUrl: string,
        signer: Signer,
        keystore: KeyStore,
        ovenAddress: string,
        fee: number,
        amountMutez: number,
        gasLimit: number = 126_500,
        storageLimit: number = 10
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
    },

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
     * @returns A string representing the operation hash.
     */
    withdrawFromOven: async function (
        nodeUrl: string,
        signer: Signer,
        keystore: KeyStore,
        ovenAddress: string,
        fee: number,
        amountMutez: number,
        gasLimit: number = 121_000,
        storageLimit: number = 0
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
    },

    /**
     * Retrieve a list of all oven addresses a user owns.
     * 
     * @param serverInfo Connection info for Conseil.
     * @param coreContractAddress The core contract address
     * @param ovenOwner The oven owner to search for
     * @param ovenListBigMapId The BigMap ID of the oven list.
     */
    listOven: async function (
        serverInfo: ConseilServerInfo,
        coreContractAddress: string,
        ovenOwner: string,
        ovenListBigMapId: number
    ): Promise<Array<string>> {
        // Fetch map data.
        const mapData = await TezosConseilClient.getBigMapData(serverInfo, coreContractAddress)
        if (mapData === undefined) {
            throw new Error("Could not fetch map data!")
        }

        // Find the Map that contains the oven list.
        const { maps } = mapData
        let ovenListMap: ContractMapDetailsItem | undefined = undefined
        for (let i = 0; i < maps.length; i++) {
            if (maps[i].definition.index === ovenListBigMapId) {
                ovenListMap = maps[i]
                break
            }
        }
        if (ovenListMap === undefined) {
            throw new Error("Could not find specified map ID!")
        }

        // Conseil reports addresses as quoted michelson encoded hex prefixed 
        // with '0x'. Normalize these to base58check encoded addresses.
        const { content } = ovenListMap
        const normalizedOvenList: Array<OvenMapSchema> = content.map((oven: OvenMapSchema) => {
            return {
                key: TezosMessageUtils.readAddress(oven.key.replace(/\"/g, '').replace(/\n/, '').replace("0x", "")),
                value: TezosMessageUtils.readAddress(oven.value.replace(/\"/g, '').replace(/\n/, '').replace("0x", ""))
            }
        })

        // Filter oven list for ovens belonging to the owner.
        const ownedOvens = normalizedOvenList.filter((oven: OvenMapSchema): boolean => {
            return ovenOwner === oven.value
        })

        // Map filtered array to only contain oven addresses.
        return ownedOvens.map((oven: OvenMapSchema) => {
            return oven.key
        })
    },

    /**
     * Deploy a new oven contract.
     *
     * The oven's owner is assigned to the sender's address.
     *
     * @param nodeUrl The URL of the Tezos node which serves data.
     * @param signer A Signer for the sourceAddress.
     * @param keystore A Keystore for the sourceAddress.
     * @param fee The fee to use.
     * @param coreAddress The address of the core contract.
     * @param baker The inital baker for the Oven. If `undefined` the oven will not have an initial baker. Defaults to `undefined`.
     * @param gasLimit The gas limit to use.
     * @param storageLimit The storage limit to use.
     * @returns A property bag of data about the operation.
     */
    export async function deployOven(
        nodeUrl: string,
        signer: Signer,
        keystore: KeyStore,
        fee: number,
        coreAddress: string,
        baker: string | undefined = undefined,
        gasLimit: number = 115_000,
        storageLimit: number = 1100
    ): Promise<OpenOvenResult> {
        const entryPoint = 'runEntrypointLambda'
        const lambdaName = 'createOven'
        const bakerParam = baker !== undefined ? `Some "${baker}"` : 'None'
        const bytes = TezosMessageUtils.writePackedData(`Pair ${bakerParam} "${keystore.publicKeyHash}"`, 'pair (option key_hash) address', TezosParameterFormat.Michelson)
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
        const ovenAddress = TezosMessageUtils.calculateContractAddress(operationHash, 0)
        return {
            operationHash,
            ovenAddress
        }
    },

    /**
     * Set the baker for an oven.
     * 
     * This operation will fail if the sender is not the oven owner.
     * 
     * @param nodeUrl The URL of the Tezos node which serves data.
     * @param signer A Signer for the sourceAddress.
     * @param keystore A Keystore for the sourceAddress.
     * @param fee The fee to use.
     * @param ovenAddress The address of the oven contract. 
     * @param bakerAddress The address of the baker for the oven.
     * @param gasLimit The gas limit to use.
     * @param storageLimit The storage limit to use. 
     * @returns A string representing the operation hash.
     */
    setOvenBaker: async function (
        nodeUrl: string,
        signer: Signer,
        keystore: KeyStore,
        fee: number,
        ovenAddress: string,
        bakerAddress: string,
        gasLimit: number = 19_500,
        storageLimit: number = 0,
    ): Promise<string> {
        const parameters = `Some "${bakerAddress}"`

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(
            nodeUrl,
            signer,
            keystore,
            ovenAddress,
            0,
            fee,
            storageLimit,
            gasLimit,
            'setDelegate',
            parameters,
            TezosTypes.TezosParameterFormat.Michelson
        )

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    },

    /**
     * Clear the baker for an oven.
     * 
     * This operation will fail if the sender is not the oven owner.
     * 
     * @param nodeUrl The URL of the Tezos node which serves data.
     * @param signer A Signer for the sourceAddress.
     * @param keystore A Keystore for the sourceAddress.
     * @param fee The fee to use.
     * @param ovenAddress The address of the oven contract. 
     * @param gasLimit The gas limit to use.
     * @param storageLimit The storage limit to use. 
     * @returns A string representing the operation hash.
     */
    clearOvenBaker: async function (
        nodeUrl: string,
        signer: Signer,
        keystore: KeyStore,
        fee: number,
        ovenAddress: string,
        gasLimit: number = 19_500,
        storageLimit: number = 0,
    ): Promise<string> {
        const parameters = `None`

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(
            nodeUrl,
            signer,
            keystore,
            ovenAddress,
            0,
            fee,
            storageLimit,
            gasLimit,
            'setDelegate',
            parameters,
            TezosTypes.TezosParameterFormat.Michelson
        )

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }
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
 *  - Core Contract: KT1S98ELFTo6mdMBqhAVbGgKAVgLbdPP3AX8
 *  - Token Balances Map ID: 14566
 *  - Oven List Map ID: 14569
 * TODO(keefertaylor): Add additional data for mainnet here.
 *
 * @author Keefer Taylor, Staker Services Ltd <keefer@stakerdao.com>
 */
export const WrappedTezosHelper = StakerDaoTzip7 && WrappedTezosHelperInternal && {
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
    verifyDestination: async function verifyDestination(
        nodeUrl: string,
        tokenContractAddress: string,
        ovenContractAddress: string,
        coreContractAddress: string
    ): Promise<boolean> {
        const tokenMatched = await StakerDaoTzip7.verifyDestination(nodeUrl, tokenContractAddress)
        const wrappedTezosInternalMatched = await WrappedTezosHelperInternal.verifyDestination(nodeUrl, ovenContractAddress, coreContractAddress)

        return tokenMatched && wrappedTezosInternalMatched
    },

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
    verifyScript: function (
        tokenScript: string,
        ovenScript: string,
        coreScript: string
    ): boolean {
        // Confirm that both interfaces report contracts correctly. 
        const tokenMatched = StakerDaoTzip7.verifyScript(tokenScript)
        const wrappedTezosInternalMatched = WrappedTezosHelperInternal.verifyScript(ovenScript, coreScript)

        return tokenMatched && wrappedTezosInternalMatched
    }
}