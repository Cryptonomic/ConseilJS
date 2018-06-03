import {expect} from 'chai';
import 'mocha';
import signOperationGroup from "../src/tezos/TezosOperations";
import {createWallet, loadWallet, saveWallet} from "../src";
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

/*describe('getBalance()', () => {
    it('should return hello world', () => {
        const result = getBalance('tz1iCuaTQnEu28cPBGikhgYrTGFieLfRaL3G');
        //expect(result).to.equal('Hello World!');
    });
});*/

/*describe('signOperationGroup()', () => {
    it('should return a correct signature for a forged operation', () => {
        const result = signOperationGroup()
        expect(result).to.equal('edsigtu4NbVsyomvHbAtstQAMpXFSKkDxH1YoshhQQmJhVe2pyWRUYvQr7dDLetLvyL7Yi78Pe846mG6hBGLx2WJXkuqSCU6Ff2');
    });
});*/