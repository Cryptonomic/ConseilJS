import {expect} from 'chai';
import 'mocha';
import {base58CheckDecode, base58CheckEncode} from "../src/utils/CryptoUtils";

describe('base58CheckDecode() and base58CheckEncode()', () => {
    it('should correctly decode and encode a Tezos account ID', () => {
        const accountID = "tz1Z5pFi5Sy99Kcz36XA5WtKW7Z6NVG9LdA4";
        const decoded = base58CheckDecode(accountID, 'tz1');
        const encoded = base58CheckEncode(decoded, 'tz1');
        expect(encoded).to.equal(accountID);
    });
});