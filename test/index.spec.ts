import {expect} from 'chai';
import 'mocha';
import {
    createWallet,
    generateMnemonic,
    loadWallet,
    saveWallet,
    unlockFundraiserIdentity,
    unlockIdentityWithMnemonic
} from "../src";
import {KeyPair} from "../src/types/KeyPair";
import {Wallet} from "../src/types/Wallet";

describe('createWallet()', () => {
    it('should create an empty wallet', async () => {
        const result = await createWallet("//tmp//test.tezwallet", "password");
        expect(result).to.deep.equal({identities: []});
    });
})

describe('saveWallet()', () => {
    it('should save an existing wallet', async () => {
        const keys: KeyPair = {
            publicKey: 'edpkv3azzeq9vL869TujYhdQY5FKiQH4CGwJEzqG7m6PoX7VEpdPc9',
            privateKey: 'edskS5owtVaAtWifnCNo8tUpAw2535AXEDY4RXBRV1NHbQ58RDdpaWz2KyrvFXE4SuCTbHU8exUecW33GRqkAfLeNLBS5sPyoi',
            publicKeyHash: 'tz1hcXqtiMYFhvuirD4guE7ts4yDuCAmtD95'
        }
        const wallet: Wallet = {identities: [keys]}
        const result = await saveWallet("//tmp//test.tezwallet", wallet);
        expect(result).to.deep.equal({identities: [keys]});
    });
})

describe('loadWallet()', () => {
    it('should load a given wallet', async () => {
        const keys: KeyPair = {
            publicKey: 'edpkv3azzeq9vL869TujYhdQY5FKiQH4CGwJEzqG7m6PoX7VEpdPc9',
            privateKey: 'edskS5owtVaAtWifnCNo8tUpAw2535AXEDY4RXBRV1NHbQ58RDdpaWz2KyrvFXE4SuCTbHU8exUecW33GRqkAfLeNLBS5sPyoi',
            publicKeyHash: 'tz1hcXqtiMYFhvuirD4guE7ts4yDuCAmtD95'
        }
        const wallet: Wallet = {identities: [keys]}
        const result = await loadWallet("//tmp//test.tezwallet", "password");
        expect(result).to.deep.equal(wallet);
    });
})

describe('unlockFundraiserIdentity()', () => {
    it('should produce the correct fundraiser key pair', () => {
        const result = unlockFundraiserIdentity(
            'just manual depend knock secret kingdom cup ribbon age learn measure more merit bubble next',
            'imbfyoqx.sqxphenx@tezos.example.org',
            'OEU8K0K1n5'
        );
        expect(result.publicKeyHash).to.equal('tz1hcXqtiMYFhvuirD4guE7ts4yDuCAmtD95');
    });
});

describe('generateMnemonic()', () => {
    it('should produce a fifteen work bip39 mnemonic', () => {
        const result = generateMnemonic()
        console.log(result)
        expect(result.split(' ').length).to.equal(15);
    });
});

describe('unlockIdentityWithMnemonic()', () => {
    it('should produce the correct mnemonic-based key pair', () => {
        const result = unlockIdentityWithMnemonic(
            'clerk rhythm bonus fabric vital luggage team engine stairs palm degree gossip hour say tenant',
            'password'
        );
        expect(result.publicKeyHash).to.equal('tz1frMTRzFcEwTXC8WGZzkfZs1CfSL1F4Mnc');
    });
});

/*describe('getBalance()', () => {
    it('should return hello world', () => {
        const result = getBalance('tz1iCuaTQnEu28cPBGikhgYrTGFieLfRaL3G');
        //expect(result).to.equal('Hello World!');
    });
});*/
