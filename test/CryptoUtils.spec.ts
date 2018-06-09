import {expect} from 'chai';
import 'mocha';
import * as cryptoUtils from "../src/utils/CryptoUtils";

describe('base58CheckDecode() and base58CheckEncode()', () => {
    it('should correctly decode and encode a Tezos account ID', () => {
        const accountID = "tz1Z5pFi5Sy99Kcz36XA5WtKW7Z6NVG9LdA4";
        const decoded = cryptoUtils.base58CheckDecode(accountID, 'tz1');
        const encoded = cryptoUtils.base58CheckEncode(decoded, 'tz1');
        expect(encoded).to.equal(accountID);
    });
});

describe('unlockIdentityWithMnemonic()', () => {
    it('should produce the correct mnemonic-based key pair', () => {
        const result = cryptoUtils.getKeysFromMnemonicAndPassphrase(
            'clerk rhythm bonus fabric vital luggage team engine stairs palm degree gossip hour say tenant',
            'password'
        );
        expect(result.publicKeyHash).to.equal('tz1frMTRzFcEwTXC8WGZzkfZs1CfSL1F4Mnc');
    });
});

describe('encryptWithNonce() and decryptWithNonce()', () => {
    it('should correctly encrypt and decrypt text', () => {
        const salt = cryptoUtils.generateSalt();
        const message = "hello";
        const passphrase = "world";
        const encrypted = cryptoUtils.encryptWithNonce(message, passphrase, salt);
        const decrypted = cryptoUtils.decryptWithNonce(encrypted, passphrase, salt);
        expect(decrypted).to.equal(message);
    });
});