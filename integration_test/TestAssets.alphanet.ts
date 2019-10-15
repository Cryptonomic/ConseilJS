import { KeyStore, StoreType } from '../src/types/wallet/KeyStore';
import { ConseilServerInfo } from '../src/types/conseil/QueryTypes';

export const faucetAccount = { // get yours at http://faucet.tzalpha.net
    'mnemonic': [ ],
    'secret': 'b42d8338853febc7384c8b162d86fc1cf22a2575',
    'amount': '777735031',
    'pkh': 'tz1ZmJch5fHBfgXf2YmGhvFEArH6my4JQUZd',
    'password': 'Qng3Q7vXWo',
    'email': 'upgypoyo.fcezugvj@tezos.example.org'
};

export const keys: KeyStore = {
    publicKey: 'edpkvMmmaxdUNWmxvnRUqbBfcdLLmANe4TUWucrE2GN75E4wMXUgJa',
    privateKey: '',
    publicKeyHash: 'tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2',
    seed: '',
    storeType: StoreType.Mnemonic
};

export const tezosServer = '';

export const conseilServer: ConseilServerInfo = {
    url: '',
    apiKey: '', // get yours at https://nautilus-cloud.cryptonomic-infra.tech
    network: 'alphanet'
};

export const transferAddress = 'tz1VttGDs9M2kr3zMfLRHqACpAcNcKY2bYj5';

export const contractAddress = 'KT1XtauF2tnmAKBzbLA2gNoMji9zSzSyYq9w';
