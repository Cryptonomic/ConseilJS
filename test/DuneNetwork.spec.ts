import { expect } from 'chai';
import { TezosMessageUtils } from '../src/chain/tezos/TezosMessageUtil';
import { TezosWalletUtil } from '../src/identity/tezos/TezosWalletUtil';
import { StoreType } from '../src/types/wallet/KeyStore';

import 'mocha';

const faucetAccount = {
    mnemonic: ['head', 'intact', 'umbrella', 'emerge', 'waste', 'tattoo', 'hard', 'beauty', 'broccoli', 'into', 'wide', 'another', 'shiver', 'vault', 'win'],
    activation_code: '6b9c6e0413876fb2cec98d4e710da7558d18cacc',
    amount: '17154238761',
    pkh: 'dn1KhewVzpKqp4PcEFS6pjEoHudtcTxJHvvG',
    password: 'r2T9tIB3os',
    email: 'alkwnnop.txsuvlrt@dune.example.org'
}

describe('Dune network tests', () => {
    it('test address decode', () => {
        let result = TezosMessageUtils.readAddressWithHint(Buffer.from('17153b23f331147b0b15c439d3a0ab2a2541e3f3', 'hex'), 'dn1');
        expect(result).to.equal('dn1JEycXwikBV3LSUE68G2rbXaeoWJtSbFev');

        result = TezosMessageUtils.readDuneAddress('000017153b23f331147b0b15c439d3a0ab2a2541e3f3');
        expect(result).to.equal('dn1JEycXwikBV3LSUE68G2rbXaeoWJtSbFev');

        result = TezosMessageUtils.readAddressWithHint(Buffer.from('e18e43dd1874b82afe1dc66a435f68365f687c81', 'hex'), 'dn2');
        expect(result).to.equal('dn2RNm56XujUuE9Pf89bLDPhPVxsVEdKkmzs');

        result = TezosMessageUtils.readAddressWithHint(Buffer.from('8556b119ac403d062bb51770286d1bdd5c8d7c0a', 'hex'), 'dn3');
        expect(result).to.equal('dn3UyyHUQj3NjMNaVJxduxhk6i9zsRqW8bvY');
    });

    it('test address encode', () => {
        let result = TezosMessageUtils.writeAddress('dn1NgbNYYkDxHfiZ3KZgmJjBgxGitoX1bZdo');
        expect(result).to.equal('000047cdfbaf158fea458f7981422c5703c1f2be7086');
    
        result = TezosMessageUtils.writeAddress('dn2N35cQ6FZghtRoMoE2THYm5jhCVvFTk9zN');
        expect(result).to.equal('0001bced0b6f7025013061298120c8e24277cfc7b370');
    
        result = TezosMessageUtils.writeAddress('dn3UKiJUWKRchjB1VFqUpxDgjpoiTi1qUX9a');
        expect(result).to.equal('00027e1a60d8105940bf24c2f39d97592f72bfbd84e7');
    });

    it('test key generation', async () => {
        let keyStore = await TezosWalletUtil.unlockFundraiserIdentity(faucetAccount.mnemonic.join(' '), faucetAccount.email, faucetAccount.password, faucetAccount.pkh);
        keyStore.storeType = StoreType.Fundraiser;

        expect(keyStore.publicKeyHash).to.equal('dn1KhewVzpKqp4PcEFS6pjEoHudtcTxJHvvG');
        expect(keyStore.publicKey).to.equal('edpkvXoqZpSyKTNFGoWQe4qm189Pynf1kyr2HrSrBM2j1zgJt8Ysiq');
        expect(keyStore.privateKey).to.equal('edskRunuFGePb6DXxMwroSDU7mvsMg6sqSSsSr2aRW8DBN7BxCUGsctR9kGPWfinP1ypycEyViyeLuGhT9VN9C2FiPPYCKDZX3');
    });
});