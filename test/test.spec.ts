import {expect} from 'chai';
import 'mocha';
import getBalance from "../src/index";

describe('getBalance()', () => {
    it('should return hello world', () => {
        const result = getBalance('tz1iCuaTQnEu28cPBGikhgYrTGFieLfRaL3G');
        expect(result).to.equal('Hello World!');
    });
});
