import 'mocha';
import {expect} from 'chai';

import {CryptoUtils} from "../src/utils/CryptoUtils";

describe('encryptMessage() and decryptMessage()', () => {
    it('should correctly encrypt and decrypt text', async () => {
        const salt = await CryptoUtils.generateSaltForPwHash();
        const message = "hello";
        const passphrase = "Spring12345!!!";
        const encrypted = await CryptoUtils.encryptMessage(message, passphrase, salt);
        const decrypted = await CryptoUtils.decryptMessage(encrypted, passphrase, salt);
        expect(decrypted).to.equal(message);
    });

    it('should be not encrypt if the password strength is less than 3', async () => {
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

describe('getPasswordStrength', () => {
    it('should not be less than 3', () => {
        const score = CryptoUtils.getPasswordStrength('Spring12345!');
        expect(score).to.greaterThan(2);
    });

    it('should be less than 3', () => {
        const score = CryptoUtils.getPasswordStrength('Spring');
        expect(score).to.lessThan(3);
    });
});
