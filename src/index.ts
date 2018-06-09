import * as tezosQuery from './tezos/TezosQuery';
import * as tezosOperations from './tezos/TezosOperations'
import * as tezosWallet from './tezos/TezosWallet'

module.exports = Object.assign(
    {},
    tezosQuery,
    tezosOperations,
    tezosWallet,
);

