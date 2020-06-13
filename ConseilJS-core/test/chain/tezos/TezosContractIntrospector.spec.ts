import { expect } from 'chai';

import { TezosContractIntrospector } from '../../../src/chain/tezos/TezosContractIntrospector';
import { Parameter, EntryPoint } from '../../../src/types/tezos/ContractIntrospectionTypes';


describe("Generate EntryPoints From Params", () => {
    it('multi-sig', async () => { // https://github.com/murbard/smart-contracts/blob/master/multisig/michelson/multisig.tz as of 2019/dec/30
        const entryPoints = await TezosContractIntrospector.generateEntryPointsFromParams(`parameter
            (pair
              (pair :payload
                (nat %counter) # counter, used to prevent replay attacks
                (or :action    # payload to sign, represents the requested action
                  (pair :transfer    # transfer tokens
                    (mutez %amount) # amount to transfer
                    (contract %dest unit)) # destination to transfer to
                  (or
                    (option %delegate key_hash) # change the delegate to this address
                    (pair %change_keys          # change the keys controlling the multisig
                      (nat %threshold)         # new threshold
                      (list %keys key)))))     # new list of keys
            (list %sigs (option signature)));    # signatures`);

        entryPoints.forEach(e => {
            console.log(formatEntryPoint(e));
            //console.log(`invocation pattern: ${e.generateInvocationString()}`);
            console.log(`invocation pattern: ${e.generateSampleInvocation()}`);
        });

        expect(entryPoints.length).to.be.greaterThan(0);
    });

    /*it('generic multi-sig', async () => { // https://github.com/murbard/smart-contracts/blob/master/multisig/michelson/generic.tz as of 2019/dec/30
        const entryPoints = await TezosContractIntrospector.generateEntryPointsFromParams(`parameter
        (or
          (unit %default)
          (pair %main
            (pair :payload
              (nat %counter) # counter, used to prevent replay attacks
              (or :action    # payload to sign, represents the requested action
                  (lambda %operation unit (list operation))
                  (pair %change_keys          # change the keys controlling the multisig
                    (nat %threshold)         # new threshold
                    (list %keys key))))     # new list of keys
            (list %sigs (option signature))));    # signatures`);

        entryPoints.forEach(e => {
            console.log(`\n${e.name + '(' + e.parameters.map(p => p.type + ' ' + p.name).join(', ') + ')'}`)
            //console.log(`invocation pattern: ${e.generateInvocationString()}`);
            console.log(`invocation pattern: ${e.generateSampleInvocation()}`);
        });

        expect(entryPoints.length).to.be.greaterThan(0);
    });*/
});

function formatEntryPoint(e: EntryPoint) {
    let s = '';
    s += !!e.name ? e.name : '';
    s += '(';
    s += e.parameters.map(p => p.type + (!!p.name ? ` ${p.name}`: '')).join(', ');
    s += ')';
    return s;
}
