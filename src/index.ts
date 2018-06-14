// export {
//     getBlockHead,
//     getBlock,
//     getBlocks,
//     getOperationGroup,
//     getOperationGroups,
//     getAccount,
//     getAccounts
// } from './tezos/TezosQuery';

export {
    signOperationGroup,
    computeOperationHash,
    handleKeyRevealForOperations,
    forgeOperations,
    applyOperation,
    injectOperation,
    sendOperation,
    sendTransactionOperation,
    sendDelegationOperation,
    sendOriginationOperation,
} from './tezos/TezosOperations'

export {
    saveWallet,
    loadWallet,
    createWallet,
    unlockFundraiserIdentity,
    generateMnemonic,
    unlockIdentityWithMnemonic,
} from './tezos/TezosWallet'
