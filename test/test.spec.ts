import {expect} from 'chai';
import 'mocha';
import signOperationGroup from "../src/tezos/TezosOperations";

"../src/index";

/*describe('getBalance()', () => {
    it('should return hello world', () => {
        const result = getBalance('tz1iCuaTQnEu28cPBGikhgYrTGFieLfRaL3G');
        //expect(result).to.equal('Hello World!');
    });
});*/

describe('signOperationGroup()', () => {
    it('should return a correct signature for a forged operation', () => {
        const result = signOperationGroup()
        expect(result).to.equal('edsigtu4NbVsyomvHbAtstQAMpXFSKkDxH1YoshhQQmJhVe2pyWRUYvQr7dDLetLvyL7Yi78Pe846mG6hBGLx2WJXkuqSCU6Ff2');
    });
});