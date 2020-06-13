import { expect } from 'chai';

import * as bip39 from 'bip39';
import { TezosMessageUtils } from 'conseiljs';

import { CryptoUtils } from '../src/utils/CryptoUtils';
import { KeyStoreUtils } from '../src/KeyStoreUtils';
import { SoftSigner } from '../src/SoftSigner';

describe('encryptMessage() and decryptMessage()', () => {
    it('should correctly encrypt and decrypt text', async () => {
        const salt = await CryptoUtils.generateSaltForPwHash();
        const message = 'Tacos Nachos Burritos Guacamole';
        const passphrase = '$T3Z0s!';
        const encrypted = await CryptoUtils.encryptMessage(Buffer.from(message, 'utf8'), passphrase, salt);
        const decrypted = await CryptoUtils.decryptMessage(encrypted, passphrase, salt);
        expect(decrypted.toString('utf8')).to.equal(message);
    });

    it('fail encryption operation due to password strength', async () => {
        const salt = await CryptoUtils.generateSaltForPwHash();
        const message = Buffer.from('hello', 'utf8');
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
        const privateKey = TezosMessageUtils.writeKeyWithHint('edskRqLyhpmvk7PGg6zvbEV3n325UsLF2qKuNrDHit4zbJtqEpBE925Jdx13d7ax1uiewmg4FR2TVisnuDL6epbips9NMLtsMc', 'edsk');
        const keys = await CryptoUtils.recoverPublicKey(privateKey);
        const publicKeyHash = TezosMessageUtils.computeKeyHash(keys.publicKey, 'tz1');

        expect(publicKeyHash).to.equal('tz1io3eJUT6C3heVaewJiDio18QzkNNHaE2v');
    });

    it('sign a message with secret key, verify signature with public key', async () => {
        const privateKey = TezosMessageUtils.writeKeyWithHint('edskRqLyhpmvk7PGg6zvbEV3n325UsLF2qKuNrDHit4zbJtqEpBE925Jdx13d7ax1uiewmg4FR2TVisnuDL6epbips9NMLtsMc', 'edsk');
        const keys = await CryptoUtils.recoverPublicKey(privateKey);
        const publicKey = keys.publicKey;

        const message = Buffer.from('Tacos Nachos Burritos Guacamole', 'utf8');
        const messageSig = await CryptoUtils.signDetached(message, privateKey);
        const check = await CryptoUtils.checkSignature(messageSig, message, publicKey);

        expect(check).to.be.true;
    });

    it('sign a message with secret key, verify signature with public key (Tezos encoding)', async () => {
        const keyStore = await KeyStoreUtils.restoreIdentityFromSecretKey('edskRqLyhpmvk7PGg6zvbEV3n325UsLF2qKuNrDHit4zbJtqEpBE925Jdx13d7ax1uiewmg4FR2TVisnuDL6epbips9NMLtsMc');
        const signer = new SoftSigner(TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'));
        const privateKey = TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk');
        const publicKey = TezosMessageUtils.writeKeyWithHint(keyStore.publicKey, 'edpk');

        const message = Buffer.from('Tacos Nachos Burritos Guacamole', 'utf8');
        const messageSig = await CryptoUtils.signDetached(message, privateKey);
        const check = await CryptoUtils.checkSignature(messageSig, message, publicKey);

        expect(check).to.be.true;
    });
});
