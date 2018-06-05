import sodium = require('libsodium-wrappers');
import * as CryptoUtils from '../utils/CryptoUtils';
import {KeyStore} from "../types/KeyStore";
import * as TezosNode from "./TezosNodeQuery"
import * as TezosTypes from "./TezosTypes"

export interface SignedOperationGroup {
    bytes: Buffer,
    signature: string
}

export function signOperationGroup(forgedOperation: string, keyStore: KeyStore): SignedOperationGroup {
    const watermark = '03'
    const watermarkedForgedOperationBytes: Buffer = sodium.from_hex(watermark + forgedOperation)
    const privateKeyBytes: Buffer = CryptoUtils.base58CheckDecode(keyStore.privateKey, "edsk")
    const hashedWatermarkedOpBytes: Buffer = sodium.crypto_generichash(32, watermarkedForgedOperationBytes)
    const opSignature: Buffer = sodium.crypto_sign_detached(hashedWatermarkedOpBytes, privateKeyBytes)
    const hexSignature: string = CryptoUtils.base58CheckEncode(opSignature, "edsig").toString()
    const signedOpBytes: Buffer = Buffer.concat([sodium.from_hex(forgedOperation), opSignature])
    return {
        bytes: signedOpBytes,
        signature: hexSignature.toString()
    }
}

export function computeOperationHash(signedOpGroup: SignedOperationGroup): string {
    const hash: Buffer = sodium.crypto_generichash(32, signedOpGroup.bytes)
    return CryptoUtils.base58CheckEncode(hash, "op").toString()
}

export function handleKeyRevealForOperations(
    operations: object[],
    managerKey: TezosTypes.ManagerKey,
    keyStore: KeyStore): object[] {
    if(managerKey.key === null) {
        const revealOp: object = {
            kind: "reveal",
            public_key: keyStore.publicKey
        }
        return [revealOp].concat(operations)
    }
    else {
        return operations
    }
}

export function forgeOperations(
    network: string,
    blockHead: TezosTypes.BlockMetadata,
    account: TezosTypes.Account,
    operations: object[],
    keyStore: KeyStore,
    fee: number): Promise<string> {
    //For now we only support operations with fees.
    const payload = {
        branch: blockHead.hash,
        source: keyStore.publicKeyHash,
        operations: operations,
        counter: account.counter + 1,
        fee: fee,
        kind: 'manager',
        gas_limit: '120',
        storage_limit: 0
    }
    return TezosNode.forgeOperation(network, payload)
        .then(forgedOperation => {return forgedOperation.operation})
}

export function sendOperation(
    network: string,
    operations: object[],
    keyStore: KeyStore,
    fee: number
)   {
    TezosNode.getBlockHead(network)
        .then(blockHead =>
        {
            TezosNode.getAccountForBlock(network, blockHead.hash, keyStore.publicKeyHash)
                .then(account =>
                {
                    TezosNode.getAccountManagerForBlock(network, blockHead.hash, keyStore.publicKeyHash)
                        .then(accountManager => {
                            const operationsWithKeyReveal = handleKeyRevealForOperations(operations, accountManager, keyStore)
                            return forgeOperations(network, blockHead, account, operationsWithKeyReveal, keyStore, fee)
                        })
                })
        })

}

export function sendTransactionOperation(
    network: string,
    keyStore: KeyStore,
    to: String,
    amount: number,
    fee: number
) {
    const transaction = {
        kind:   "transaction",
        amount: amount,
        destination: to,
        parameters: {prim: "Unit", args: []}
    }
    const operations = [transaction]
    return sendOperation(network, operations, keyStore, fee)
}

export function sendDelegationOperation(
    network: string,
    keyStore: KeyStore,
    delegate: String,
    fee: number
) {
    const delegation = {
        kind:   "delegation",
        delegate: delegate
    }
    const operations = [delegation]
    return sendOperation(network, operations, keyStore, fee)
}

export function sendOriginationOperation(
    network: string,
    keyStore: KeyStore,
    amount: number,
    delegate: string,
    spendable: boolean,
    delegatable: boolean,
    fee: number
) {
    const origination = {
        kind:   "origination",
        balance: "amount",
        managerPubkey: keyStore.publicKeyHash,
        spendable: spendable,
        delegatable: delegatable,
        delegate: delegate
    }
    const operations = [origination]
    return sendOperation(network, operations, keyStore, fee)
}



