import * as Nautilus from '../utils/NautilusQuery'
import * as TezosTypes from './TezosTypes'

export function getBlock(network: string, hash:String): Promise<TezosTypes.BlockMetadata> {
    return Nautilus.runQuery(network, `blocks/${hash}`)
        .then(json => {return <TezosTypes.BlockMetadata> json})
}

export function getBlockHead(network: string): Promise<TezosTypes.BlockMetadata> {
    return getBlock(network, "head")
}

export function getAccountForBlock(network: string, blockHash: string, accountID: string): Promise<TezosTypes.Account> {
    return Nautilus.runQuery(network, `blocks/${blockHash}/proto/context/contracts/${accountID}`)
        .then(json => {return <TezosTypes.Account> json})
}

export function getAccountManagerForBlock(network: string, blockHash: string, accountID: string): Promise<TezosTypes.ManagerKey> {
    return Nautilus.runQuery(network, `blocks/${blockHash}/proto/context/contracts/${accountID}/manager_key`)
        .then(json => {return <TezosTypes.ManagerKey> json})
}

export function forgeOperation(network: string, opGroup: object): Promise<TezosTypes.ForgedOperation> {
    return Nautilus.runQuery(
        network,
        `/blocks/head/proto/helpers/forge/operations`,
        JSON.stringify(opGroup)
    )
        .then(json => {return <TezosTypes.ForgedOperation> json})
}

export function applyOperation(network: string, payload: object): Promise<TezosTypes.AppliedOperation> {
    return Nautilus.runQuery(
        network,
        `/blocks/head/proto/helpers/apply_operation`,
        JSON.stringify(payload)
    )
        .then(json => {return <TezosTypes.AppliedOperation> json})
}

export function injectOperation(network: string, payload: object): Promise<TezosTypes.InjectedOperation> {
    return Nautilus.runQuery(
        network,
        `/inject_operation`,
        JSON.stringify(payload)
    )
        .then(json => {return <TezosTypes.InjectedOperation> json})
}