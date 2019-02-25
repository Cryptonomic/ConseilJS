import {expect} from 'chai';
import 'mocha';
import * as fs from 'fs'

import {KeyStore, StoreType} from "../src/types/wallet/KeyStore";
import {Wallet} from "../src/types/wallet/Wallet";
import {TezosFileWallet} from "../src";
import {TezosWalletUtil} from "../src/identity/tezos/TezosWalletUtil";
import {Error} from "../src/types/wallet/Error";

describe('createWallet()', () => {
    it('should create an empty wallet', async () => {
        try { fs.unlinkSync("//tmp//test.tezwallet"); } catch { /* eh */ }
        const result = await TezosFileWallet.createWallet("//tmp//test.tezwallet", "passwordwithentropy");
        expect(result).to.deep.equal({identities: []});
    });
});

describe('saveWallet()', () => {
    it('should save an existing wallet', async () => {
        const keys: KeyStore = {
            publicKey: 'edpkv3azzeq9vL869TujYhdQY5FKiQH4CGwJEzqG7m6PoX7VEpdPc9',
            privateKey: 'edskS5owtVaAtWifnCNo8tUpAw2535AXEDY4RXBRV1NHbQ58RDdpaWz2KyrvFXE4SuCTbHU8exUecW33GRqkAfLeNLBS5sPyoi',
            publicKeyHash: 'tz1hcXqtiMYFhvuirD4guE7ts4yDuCAmtD95',
            seed: '',
            storeType: StoreType.Mnemonic
        };
        const wallet: Wallet = {identities: [keys]};
        const result = await TezosFileWallet.saveWallet("//tmp//test.tezwallet", wallet, "passwordwithentropy");
        expect(result).to.deep.equal({identities: [keys]});
    });
});

describe('loadWallet()', () => {
    it('should load a given wallet', async () => {
        const keys: KeyStore = {
            publicKey: 'edpkv3azzeq9vL869TujYhdQY5FKiQH4CGwJEzqG7m6PoX7VEpdPc9',
            privateKey: 'edskS5owtVaAtWifnCNo8tUpAw2535AXEDY4RXBRV1NHbQ58RDdpaWz2KyrvFXE4SuCTbHU8exUecW33GRqkAfLeNLBS5sPyoi',
            publicKeyHash: 'tz1hcXqtiMYFhvuirD4guE7ts4yDuCAmtD95',
            seed: '',
            storeType: StoreType.Mnemonic
        };
        const wallet: Wallet = {identities: [keys]};
        const result = await TezosFileWallet.loadWallet("//tmp//test.tezwallet", "passwordwithentropy");
        expect(result).to.deep.equal(wallet);
    });
});

describe('unlockFundraiserIdentity()', () => {
    it('should produce the correct fundraiser key pair', () => {
        const result = TezosWalletUtil.unlockFundraiserIdentity(
            "woman chaos mammal brain huge race weasel vintage doll pulse spot mansion lawsuit fat target",
            "psgtnfuc.vjppumbu@tezos.example.org",
            "A0mEUNNzP7",
            "tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2");
        expect(result["publicKey"]).to.equal("edpkvMmmaxdUNWmxvnRUqbBfcdLLmANe4TUWucrE2GN75E4wMXUgJa");
        expect(result["privateKey"]).to.equal("edskRpjW6egVEyFwQAttuHy8S5WLYqkpichsW2MzDpAQHWvunrr4ZVWRRQ6dx5y4G9S2s8Y4MDevmpavPVVYDN6egrbypcbWAc");
        expect(result["publicKeyHash"]).to.equal("tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2");

        const result2 = <Error> TezosWalletUtil.unlockFundraiserIdentity(
            'vendor excite awake enroll essay gather mention knife inmate insect agent become alpha desert menu',
            'byixpeyi.dofdqvwn@tezos.example.org',
            'SU0j4HSgbd',
            'tz2aj32NRPg49jtvSDhkpruQAFevjaewaLew'
        );
        expect(result2.error).to.equal('The given mnemonic and passphrase do not correspond to the applied public key hash');
    });
});

describe('generateMnemonic()', () => {
    it('should produce a fifteen work bip39 mnemonic', () => {
        const result = TezosWalletUtil.generateMnemonic();
        expect(result.split(' ').length).to.equal(15);
    });
});

describe('unlockIdentityWithMnemonic()', () => {
    it('should produce the correct mnemonic-based key pair', () => {
        const result: any = TezosWalletUtil.unlockIdentityWithMnemonic(
            'clerk rhythm bonus fabric vital luggage team engine stairs palm degree gossip hour say tenant',
            'password'
        );
        expect(result.publicKeyHash).to.equal('tz1frMTRzFcEwTXC8WGZzkfZs1CfSL1F4Mnc');
    });
});

describe('getKeysFromMnemonicAndPassphrase()', () => {
    it('should produce the correct mnemonic-based key pair', () => {
        const result = <KeyStore> TezosWalletUtil.getKeysFromMnemonicAndPassphrase('clerk rhythm bonus fabric vital luggage team engine stairs palm degree gossip hour say tenant', 'password', '', false, StoreType.Mnemonic);

        expect(result.publicKeyHash).to.equal('tz1frMTRzFcEwTXC8WGZzkfZs1CfSL1F4Mnc');
    });

    it('should be 15 words', () => {
        const result: any = TezosWalletUtil.getKeysFromMnemonicAndPassphrase(
            'clerk rhythm bonus fabric vital luggage team engine stairs palm degree gossip hour say',
            'password',
            'tz1frMTRzFcEwTXC8WGZzkfZs1CfSL1F4Mnc',
            true,
            StoreType.Mnemonic
        );

        expect(result.error).to.equal("The mnemonic should be 15 words.");
    });

    it('should detect invalid mnemonics', () => {
        const result: any = TezosWalletUtil.getKeysFromMnemonicAndPassphrase(
            'clerk rhythm bonus fabric vital luggage team engine stairs palm degree gossip hour say tenants',
            'password',
            'tz1frMTRzFcEwTXC8WGZzkfZs1CfSL1F4Mnc',
            true,
            StoreType.Mnemonic
        );

        expect(result.error).to.equal("The given mnemonic could not be validated.");
    });
});
