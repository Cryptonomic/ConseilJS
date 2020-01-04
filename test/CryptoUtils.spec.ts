import 'mocha';
import {expect} from 'chai';

import * as bip39 from 'bip39';

import {CryptoUtils} from "../src/utils/CryptoUtils";
import {TezosMessageUtils} from '../src/chain/tezos/TezosMessageUtil';

describe('encryptMessage() and decryptMessage()', () => {
    it('should correctly encrypt and decrypt text', async () => {
        const salt = await CryptoUtils.generateSaltForPwHash();
        const message = "hello";
        const passphrase = "Spring12345!!!";
        const encrypted = await CryptoUtils.encryptMessage(message, passphrase, salt);
        const decrypted = await CryptoUtils.decryptMessage(encrypted, passphrase, salt);
        expect(decrypted).to.equal(message);
    });

    it('fail encryption operation due to password strength', async () => {
        const salt = await CryptoUtils.generateSaltForPwHash();
        const message = "hello";
        const passphrase = "password";
        try {
            const encrypted = await CryptoUtils.encryptMessage(message, passphrase, salt);
            await CryptoUtils.decryptMessage(encrypted, passphrase, salt);
        } catch (err) {
            expect(err.message).to.equal('The password strength should not be less than 3.');
        }
    });
});

describe('generateKeys() and recoverPublicKey()', () => {
    it('generate keys from 24-word mnemonic', async () => {
        const mnemonic = 'valve maple arrow chef leave ten camera parrot puzzle nut early meadow spy jeans poem disease corn stone either main empty blush permit pigeon';
        const seed = (await bip39.mnemonicToSeed(mnemonic, '')).slice(0, 32);
        const keys = await CryptoUtils.generateKeys(seed);
        const publicKeyHash = TezosMessageUtils.computeKeyHash(keys.publicKey, 'tz1');

        expect(publicKeyHash).to.equal('tz1io3eJUT6C3heVaewJiDio18QzkNNHaE2v');
    });

    it('generate keys from 15-word fundraiser mnemonic', async () => {
        const mnemonic = 'flag obtain wrap joy obvious usual label capital month refuse misery crystal time security sun';
        const passphrase = 'yfzaknjf.mtmttysx@tezos.example.org' + 'KxdPIyrnCo';
        const seed = (await bip39.mnemonicToSeed(mnemonic, passphrase)).slice(0, 32);
        const keys = await CryptoUtils.generateKeys(seed);
        const publicKeyHash = TezosMessageUtils.computeKeyHash(keys.publicKey, 'tz1');
        
        expect(publicKeyHash).to.equal('tz1QjhkVsnJtij4f353WEmSNvs3tByQhq3ea');
    });

    it('recover public key from secret key', async () => {
        const sk = 'edskRqLyhpmvk7PGg6zvbEV3n325UsLF2qKuNrDHit4zbJtqEpBE925Jdx13d7ax1uiewmg4FR2TVisnuDL6epbips9NMLtsMc'
        const privateKey = TezosMessageUtils.writeKeyWithHint(sk, 'edsk');
        const keys = await CryptoUtils.recoverPublicKey(privateKey);
        const publicKeyHash = TezosMessageUtils.computeKeyHash(keys.publicKey, 'tz1');

        expect(publicKeyHash).to.equal('tz1io3eJUT6C3heVaewJiDio18QzkNNHaE2v');
    });
});
