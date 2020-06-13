import { expect, use } from "chai";
import chaiAsPromised from 'chai-as-promised';

import { KeyStoreUtils } from '../src/KeyStoreUtils';

use(chaiAsPromised);

describe('KeyStoreUtils tests', () => {
    it('generateMnemonic 24-words', async () => {
        expect(KeyStoreUtils.generateMnemonic().split(' ').length).to.equal(24);
    });

    it('generateMnemonic 15-words', async () => {
        expect(KeyStoreUtils.generateMnemonic(160).split(' ').length).to.equal(15);
    });

    it('generateIdentity', async () => {
        const result = await KeyStoreUtils.generateIdentity(0, '', 'resist winner shift attract issue penalty feed disease guess ridge grace warfare brave cause jar track exhibit movie seminar light broken light few tomato');

        expect(result.publicKeyHash).to.equal('tz1WRm1WMpioh4Gm1eopgvudaEoY6wX7cTTg');
    });

    it('generateIdentity with password', async () => {
        const result = await KeyStoreUtils.generateIdentity(0, 'Nachos Tacos', 'resist winner shift attract issue penalty feed disease guess ridge grace warfare brave cause jar track exhibit movie seminar light broken light few tomato');

        expect(result.publicKeyHash).to.equal('tz1d6c6SVPfyoEodJqXNLPtknqoJMSRVYn8n');
    });

    it('restoreIdentityFromSecretKey', async () => {
        const result = await KeyStoreUtils.restoreIdentityFromSecretKey('edskRhLgG6p1qyj2Y1oitK1wspsHTQsHf7y8UKMxFDM53SDxRxWeSioqvUWQ8wPyTux4TTvg3nJT9WbXzBrcSCc3YVgsX3VwBy');

        expect(result.publicKeyHash).to.equal('tz1WRm1WMpioh4Gm1eopgvudaEoY6wX7cTTg');
    });

    it('restoreIdentityFromMnemonic', async () => {
        const result = await KeyStoreUtils.restoreIdentityFromMnemonic('resist winner shift attract issue penalty feed disease guess ridge grace warfare brave cause jar track exhibit movie seminar light broken light few tomato', 'Nachos Tacos', 'tz1d6c6SVPfyoEodJqXNLPtknqoJMSRVYn8n');

        expect(result.publicKeyHash).to.equal('tz1d6c6SVPfyoEodJqXNLPtknqoJMSRVYn8n');
    });

    it('restoreIdentityFromMnemonic fail verification', async () => {
        await expect(KeyStoreUtils.restoreIdentityFromMnemonic('resist winner shift attract issue penalty feed disease guess ridge grace warfare brave cause jar track exhibit movie seminar light broken light few tomato', 'Nachos Tacos', 'tz1WRm1WMpioh4Gm1eopgvudaEoY6wX7cTTg'))
            .to.be.rejectedWith('The given mnemonic and passphrase do not correspond to the supplied public key hash');
    });

    it('restoreIdentityFromMnemonic fail mnemonic length', async () => {
        await expect(KeyStoreUtils.restoreIdentityFromMnemonic('resist winner shift'))
            .to.be.rejectedWith('Invalid mnemonic length.');
    });

    it('restoreIdentityFromMnemonic fail mnemonic length', async () => {
        await expect(KeyStoreUtils.restoreIdentityFromMnemonic('coffee c0ffee c0ff33 coffee c0ffee c0ff33 coffee c0ffee c0ff33 coffee c0ffee c0ff33 coffee c0ffee c0ff33'))
            .to.be.rejectedWith('The given mnemonic could not be validated.');
    });

    it('restoreIdentityFromFundraiser', async () => {
        const faucetAccount = {
            mnemonic: [ "solve", "situate", "timber", "panther", "guide", "media", "dad", "style", "govern", "bracket", "hurry", "okay", "slide", "ripple", "rug" ],
            secret: "03e04299bb331d9855e1e0c86d684dceeff4f60e",
            amount: "32492613852",
            pkh: "tz1MRXFvJdkZdsr4CpGNB9dwA37LvMoNf7pM",
            password: "8PXlLLjH6e",
            email: "tsmnpgbq.ltvhiwzm@tezos.example.org"
        };

        const result = await KeyStoreUtils.restoreIdentityFromFundraiser(faucetAccount.mnemonic.join(' '), faucetAccount.email, faucetAccount.password, faucetAccount.pkh);
        expect(result.publicKeyHash).to.equal(faucetAccount.pkh);
    });

    it('generateKeys', async () => { });

    it('recoverKeys', async () => { });

    it('decryptMessage', async () => { });

    it('encryptMessage', async () => { });

    it('checkTextSignature', async () => { });
});
