import { expect, use} from "chai";
import chaiAsPromised from 'chai-as-promised';
import 'mocha';
import * as fs from 'fs';

import {KeyStore, StoreType} from "../../../src/types/wallet/KeyStore";
import {Wallet} from "../../../src/types/wallet/Wallet";
import {TezosFileWallet} from "../../../src";
import {TezosWalletUtil} from "../../../src/identity/tezos/TezosWalletUtil";

use(chaiAsPromised);

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
    it('should produce the correct fundraiser key pair', async () => {
        const result = await TezosWalletUtil.unlockFundraiserIdentity(
            "woman chaos mammal brain huge race weasel vintage doll pulse spot mansion lawsuit fat target",
            "psgtnfuc.vjppumbu@tezos.example.org",
            "A0mEUNNzP7",
            "tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2");
        expect(result["publicKey"]).to.equal("edpkvMmmaxdUNWmxvnRUqbBfcdLLmANe4TUWucrE2GN75E4wMXUgJa");
        expect(result["privateKey"]).to.equal("edskRpjW6egVEyFwQAttuHy8S5WLYqkpichsW2MzDpAQHWvunrr4ZVWRRQ6dx5y4G9S2s8Y4MDevmpavPVVYDN6egrbypcbWAc");
        expect(result["publicKeyHash"]).to.equal("tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2");
    });

    it('should fail mnemonic/passphrase validation', async () => {
        await expect(TezosWalletUtil.unlockFundraiserIdentity(
            'vendor excite awake enroll essay gather mention knife inmate insect agent become alpha desert menu',
            'byixpeyi.dofdqvwn@tezos.example.org',
            'SU0j4HSgbd',
            'tz2aj32NRPg49jtvSDhkpruQAFevjaewaLew'
        )).be.rejectedWith('The given mnemonic and passphrase do not correspond to the applied public key hash');
    });
});

describe('generateMnemonic()', () => {
    it('should produce a 24-word bip39 mnemonic', () => {
        const result = TezosWalletUtil.generateMnemonic();
        expect(result.split(' ').length).to.equal(24);
    });
});

describe('unlockIdentityWithMnemonic()', () => {
    it('should produce the correct mnemonic-based key pair', async () => {
        const result = await TezosWalletUtil.unlockIdentityWithMnemonic(
            'clerk rhythm bonus fabric vital luggage team engine stairs palm degree gossip hour say tenant',
            'password'
        );
        expect(result.publicKeyHash).to.equal('tz1frMTRzFcEwTXC8WGZzkfZs1CfSL1F4Mnc');
    });
});

describe('signText() + checkSignature()', () => {
    it('should produce the correct mnemonic-based key pair', async () => {
        const keyStore = await TezosWalletUtil.restoreIdentityWithSecretKey('edskRiuSUDavec7ZVH4gkbukcZC1AfRaUNPnfhcsJy5p84TUsG2SVAzzWsrZ2LJZgH7ZUa6u5GH1b6k42FsJYYWdr9MkFb5rEY');
        expect(keyStore.publicKey).to.equal('edpkvNjPhSt3W1kGXPNkP58H2CVP1YXJWw25qcMV8AMyTLz3Kib2Q7');

        const shortText = 'Tacos Nachos Burritos Guacamole';
        let signature = await TezosWalletUtil.signText(keyStore, shortText);
        expect(signature).to.equal('edsigtwmbUdjDFar2P1rhzpSd3FYhsNCrRPK8R6rXgPQ9FhttsjSifdiqs1mdQwM8QFGqEBBQ7GoX2FCGKSmFjCxRPCn8YupfEZ');

        let result = await TezosWalletUtil.checkSignature(signature, shortText, keyStore.publicKey);
        expect(result).to.be.true;

        const longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vulputate sem augue, non sodales tellus viverra ac. Fusce metus nulla, tristique ut mollis nec, semper sit amet tortor. Integer molestie interdum elementum. Sed at lacus cursus, convallis ante at, accumsan ex. In suscipit lacinia libero eget aliquet. Ut vitae elit sed dui ultricies semper semper at nunc. Quisque varius laoreet enim, ut consectetur metus malesuada eget. Cras at risus ac dolor hendrerit hendrerit. Integer finibus, felis eu malesuada tincidunt, mi orci sollicitudin odio, sit amet gravida nisi orci non tortor.';
        signature = await TezosWalletUtil.signText(keyStore, longText);
        expect(signature).to.equal('edsigtcmGhHEu4bteLYp4zwb419AawYJECTGUY9aV7kMwGNAsLSbFrL5mQchDbFQs5aWHQf4gAkVfVwhNgqWamE1DRsHhtXXCBW');

        result = await TezosWalletUtil.checkSignature(signature, longText, keyStore.publicKey);
        expect(result).to.be.true;
    });
});

describe('restoreIdentityWithSecretKey()', () => {
    it('should produce an expected pkh from secret key', async () => {
        const result = await TezosWalletUtil.restoreIdentityWithSecretKey('edskS5owtVaAtWifnCNo8tUpAw2535AXEDY4RXBRV1NHbQ58RDdpaWz2KyrvFXE4SuCTbHU8exUecW33GRqkAfLeNLBS5sPyoi');

        expect(result.publicKey).to.equal('edpkv3azzeq9vL869TujYhdQY5FKiQH4CGwJEzqG7m6PoX7VEpdPc9');
        expect(result.publicKeyHash).to.equal('tz1hcXqtiMYFhvuirD4guE7ts4yDuCAmtD95');
    });
});

describe('getKeysFromMnemonicAndPassphrase()', () => {
    it('should produce the correct mnemonic-based key pair', async () => {
        let result = await TezosWalletUtil.getKeysFromMnemonicAndPassphrase('clerk rhythm bonus fabric vital luggage team engine stairs palm degree gossip hour say tenant', 'password', StoreType.Mnemonic);
        expect(result.publicKeyHash).to.equal('tz1frMTRzFcEwTXC8WGZzkfZs1CfSL1F4Mnc');

        result = await TezosWalletUtil.getKeysFromMnemonicAndPassphrase('clerk rhythm bonus fabric vital luggage team engine stairs palm degree gossip hour say tenant', 'password', StoreType.Mnemonic, 'tz1frMTRzFcEwTXC8WGZzkfZs1CfSL1F4Mnc');
        expect(result.publicKeyHash).to.equal('tz1frMTRzFcEwTXC8WGZzkfZs1CfSL1F4Mnc');
    });

    it('should be 15 words', async () => {
        await expect(TezosWalletUtil.getKeysFromMnemonicAndPassphrase('clerk rhythm', 'password', StoreType.Mnemonic)).be.rejectedWith("Invalid mnemonic length.");
    });

    it('should detect invalid mnemonics', async () => {
        await expect(TezosWalletUtil.getKeysFromMnemonicAndPassphrase(
            'clerk rhythm bonus fabric vital luggage team engine stairs palm degree gossip hour say c0ff33',
            'password',
            StoreType.Mnemonic
        )).be.rejectedWith("The given mnemonic could not be validated.");
    });
});

describe('Error paths', () => {
    it('test error conditions', async () => {
        await expect(TezosFileWallet.loadWallet("//###//missing.tezwallet", "passwordwithentropy")).to.be.rejected;

        const keys: KeyStore = {
            publicKey: 'edpkv3azzeq9vL869TujYhdQY5FKiQH4CGwJEzqG7m6PoX7VEpdPc9',
            privateKey: 'edskS5owtVaAtWifnCNo8tUpAw2535AXEDY4RXBRV1NHbQ58RDdpaWz2KyrvFXE4SuCTbHU8exUecW33GRqkAfLeNLBS5sPyoi',
            publicKeyHash: 'tz1hcXqtiMYFhvuirD4guE7ts4yDuCAmtD95',
            seed: '',
            storeType: StoreType.Mnemonic
        };
        const wallet: Wallet = {identities: [keys]};
        await expect(TezosFileWallet.saveWallet("//###//test.tezwallet", wallet, "passwordwithentropy")).to.be.rejected;
    });
});
