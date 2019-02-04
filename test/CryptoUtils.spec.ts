import {expect} from 'chai';
import 'mocha';
import * as cryptoUtils from "../src/utils/CryptoUtils";
import {KeyStore, StoreType} from "../src/types/wallet/KeyStore";

describe('base58CheckDecode() and base58CheckEncode()', () => {
    it('should correctly decode and encode a Tezos account ID', () => {
        const accountID = "tz1Z5pFi5Sy99Kcz36XA5WtKW7Z6NVG9LdA4";
        const decoded = cryptoUtils.base58CheckDecode(accountID, 'tz1');
        const encoded = cryptoUtils.base58CheckEncode(decoded, 'tz1');
        expect(encoded).to.equal(accountID);
    });
});

describe('encryptMessage() and decryptMessage()', () => {
    it('should correctly encrypt and decrypt text', () => {
        const salt = cryptoUtils.generateSaltForPwHash();
        const message = "hello";
        const passphrase = "Spring12345!!!";
        const encrypted = cryptoUtils.encryptMessage(message, passphrase, salt);
        const decrypted = cryptoUtils.decryptMessage(encrypted, passphrase, salt);
        expect(decrypted).to.equal(message);
    });
    it('should be not encrypt if the password strength is less than 3', () => {
        const salt = cryptoUtils.generateSaltForPwHash();
        const message = "hello";
        const passphrase = "password";
        try {
            const encrypted = cryptoUtils.encryptMessage(message, passphrase, salt);
            cryptoUtils.decryptMessage(encrypted, passphrase, salt);
        } catch (err) {
            expect(err.message).to.equal('The password strength should not be less than 3.');
        }
    });
});

describe('getPasswordStrength', () => {
    it('should not be less than 3', () => {
        const score = cryptoUtils.getPasswordStrength('Spring12345!');
        expect(score).to.greaterThan(2);
    });
    it('should be less than 3', () => {
        const score = cryptoUtils.getPasswordStrength('Spring');
        expect(score).to.lessThan(3);
    });
});