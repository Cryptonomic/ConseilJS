import { KeyStore, StoreType } from '../src/types/wallet/KeyStore';
import { ConseilServerInfo } from '../src/types/conseil/QueryTypes';

export const faucetAccount = { // get yours at http://faucet.tzalpha.net
    'mnemonic': [ 'circle', 'train', 'snow', 'mandate', 'resist', 'hand', 'fiction', 'bean', 'harbor', 'helmet', 'cattle', 'pass', 'convince', 'sunny', 'tool' ],
    'secret': 'b42d8338853febc7384c8b162d86fc1cf22a2575',
    'amount': '777735031',
    'pkh': 'tz1ZmJch5fHBfgXf2YmGhvFEArH6my4JQUZd',
    'password': 'Qng3Q7vXWo',
    'email': 'upgypoyo.fcezugvj@tezos.example.org'
};

export const keys: KeyStore = {
    publicKey: 'edpkushaNmbgnuKEkkjCPC7MgmVq5rC5KDBhUKrnahZLBs1FKXR3NV',
    privateKey: 'edskRdaHf1fyn9bUy6iC8WwBvwGDynxuAKSA1MmA5qawQacNJuxN74n36A9t2CSfn6ni1Z2EyZVG4xr7cViodhTASp8uM82BrS',
    publicKeyHash: 'tz1ZmJch5fHBfgXf2YmGhvFEArH6my4JQUZd',
    seed: '',
    storeType: StoreType.Fundraiser
};

export const transferAddress = 'tz1T72nyqnJWwxad6RQnh7imKQz7mzToamWd';

export const contractAddress = 'KT1HwpTJB74MwKLC413PZKpV69KtXw2idWen';

export const bakerAddress = 'tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9';

// get yours at https://nautilus-cloud.cryptonomic-infra.tech
export const tezosServer = '';

export const conseilServer: ConseilServerInfo = { 
    url: '',
    apiKey: '',
    network: 'babylonnet'
};
