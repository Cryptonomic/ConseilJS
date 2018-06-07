import {expect} from 'chai';
import 'mocha';
import {KeyStore} from "../src/types/KeyStore";
import {Wallet} from "../src/types/Wallet";
import * as fs from 'fs'
import * as tw from "../src/tezos/TezosWallet";

describe('createWallet()', () => {
    it('should create an empty wallet', async () => {
        fs.unlinkSync("//tmp//test.tezwallet");
        const result = await tw.createWallet("//tmp//test.tezwallet", "password");
        expect(result).to.deep.equal({identities: []});
    });
});

describe('saveWallet()', () => {
    it('should save an existing wallet', async () => {
        const keys: KeyStore = {
            publicKey: 'edpkv3azzeq9vL869TujYhdQY5FKiQH4CGwJEzqG7m6PoX7VEpdPc9',
            privateKey: 'edskS5owtVaAtWifnCNo8tUpAw2535AXEDY4RXBRV1NHbQ58RDdpaWz2KyrvFXE4SuCTbHU8exUecW33GRqkAfLeNLBS5sPyoi',
            publicKeyHash: 'tz1hcXqtiMYFhvuirD4guE7ts4yDuCAmtD95'
        };
        const wallet: Wallet = {identities: [keys]};
        const result = await tw.saveWallet("//tmp//test.tezwallet", wallet);
        expect(result).to.deep.equal({identities: [keys]});
    });
});

describe('loadWallet()', () => {
    it('should load a given wallet', async () => {
        const keys: KeyStore = {
            publicKey: 'edpkv3azzeq9vL869TujYhdQY5FKiQH4CGwJEzqG7m6PoX7VEpdPc9',
            privateKey: 'edskS5owtVaAtWifnCNo8tUpAw2535AXEDY4RXBRV1NHbQ58RDdpaWz2KyrvFXE4SuCTbHU8exUecW33GRqkAfLeNLBS5sPyoi',
            publicKeyHash: 'tz1hcXqtiMYFhvuirD4guE7ts4yDuCAmtD95'
        };
        const wallet: Wallet = {identities: [keys]};
        const result = await tw.loadWallet("//tmp//test.tezwallet", "password");
        expect(result).to.deep.equal(wallet);
    });
});

describe('unlockFundraiserIdentity()', () => {
    it('should produce the correct fundraiser key pair', () => {
        const result = tw.unlockFundraiserIdentity(
            'just manual depend knock secret kingdom cup ribbon age learn measure more merit bubble next',
            'imbfyoqx.sqxphenx@tw.example.org',
            'OEU8K0K1n5'
        );
        expect(result.publicKeyHash).to.equal('tz1hcXqtiMYFhvuirD4guE7ts4yDuCAmtD95');
    });
});

describe('generateMnemonic()', () => {
    it('should produce a fifteen work bip39 mnemonic', () => {
        const result = tw.generateMnemonic();
        console.log(result);
        expect(result.split(' ').length).to.equal(15);
    });
});

describe('unlockIdentityWithMnemonic()', () => {
    it('should produce the correct mnemonic-based key pair', () => {
        const result = tw.unlockIdentityWithMnemonic(
            'clerk rhythm bonus fabric vital luggage team engine stairs palm degree gossip hour say tenant',
            'password'
        );
        expect(result.publicKeyHash).to.equal('tz1frMTRzFcEwTXC8WGZzkfZs1CfSL1F4Mnc');
    });
});

