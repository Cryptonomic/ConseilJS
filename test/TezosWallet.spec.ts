import {expect} from 'chai';
import 'mocha';
import {KeyStore} from "../src/types/KeyStore";
import {Wallet} from "../src/types/Wallet";
import * as fs from 'fs'
import { TezosWallet } from "../src/tezos/TezosWallet";

describe('createWallet()', () => {
    it('should create an empty wallet', async () => {
        fs.unlinkSync("//tmp//test.tezwallet");
        const result = await TezosWallet.createWallet("//tmp//test.tezwallet", "password");
        expect(result).to.deep.equal({identities: []});
    });

    it('should be validated', async () => {
        return TezosWallet.createWallet("//tmp//test.tezwallet", "test")
        .catch((result) => {
            expect(result.error).to.equal("The password wasn't validated.");
        });
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
        const result = await TezosWallet.saveWallet("//tmp//test.tezwallet", wallet, "password");
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
        const result = await TezosWallet.loadWallet("//tmp//test.tezwallet", "password");
        expect(result).to.deep.equal(wallet);
    });
});

describe('unlockFundraiserIdentity()', () => {
    it('should produce the correct fundraiser key pair', () => {
        const result: any = TezosWallet.unlockFundraiserIdentity(
            'vendor excite awake enroll essay gather mention knife inmate insect agent become alpha desert menu',
            'byixpeyi.dofdqvwn@tezos.example.org',
            'SU0j4HSgbd'
        );
        expect(result.publicKeyHash).to.equal('tz1aj32NRPg49jtvSDhkpruQAFevjaewaLew');
    });
});

describe('generateMnemonic()', () => {
    it('should produce a fifteen work bip39 mnemonic', () => {
        const result = TezosWallet.generateMnemonic();
        console.log(result);
        expect(result.split(' ').length).to.equal(15);
    });
});

describe('unlockIdentityWithMnemonic()', () => {
    it('should produce the correct mnemonic-based key pair', () => {
        const result: any = TezosWallet.unlockIdentityWithMnemonic(
            'clerk rhythm bonus fabric vital luggage team engine stairs palm degree gossip hour say tenant',
            'password'
        );
        expect(result.publicKeyHash).to.equal('tz1frMTRzFcEwTXC8WGZzkfZs1CfSL1F4Mnc');
    });
});

