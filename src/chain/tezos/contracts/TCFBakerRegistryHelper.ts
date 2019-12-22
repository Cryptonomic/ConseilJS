import * as blakejs from 'blakejs';
import { JSONPath } from 'jsonpath';

import { TezosMessageUtils } from '../TezosMessageUtil';
import { TezosNodeReader } from '../TezosNodeReader';

/**
 * Interface for the Tezos Commons Baker Registry contract outlined here: https://forum.tezosagora.org/t/bakers-registry-discussion/1238/55
 * 
 * Compatible with the contract as of December 22, 2019.
 */
export namespace TCFBakerRegistryHelper {
    /**
     * Gets the contract code at the specified address at the head block and compares it to the known hash of the code.
     * 
     * @param server Destination Tezos node.
     * @param address Contract address to query.
     */
    export async function verifyDestination(server: string, address: string): Promise<boolean> {
        const contract = await TezosNodeReader.getAccountForBlock(server, 'head', address);

        if (!!!contract.script) { throw new Error(`No code found at ${address}`); }

        const k = Buffer.from(blakejs.blake2s(contract['script'].toString(), null, 16)).toString('hex');

        if (k !== '1527ddf08bdf582dce0b28c051044897') { throw new Error(`Contract at ${address} does not match the expected code hash`); }

        return true;
    }

    /**
     * Retrieves high level storage, including map id and fees for invocation.
     * 
     * @param server Destination Tezos node.
     * @param address Contract address to query.
     */
    export async function getFees(server: string, address: string) {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);
        const jsonpath = new JSONPath();

        return {
            mapid: parseInt(jsonpath.query(storageResult, '$.args[0].int')[0]),
            owner: jsonpath.query(storageResult, '$.args[1].args[0].string')[0],
            signupFee: parseInt(jsonpath.query(storageResult, '$.args[1].args[1].args[0].int')[0]),
            updateFee: parseInt(jsonpath.query(storageResult, '$.args[1].args[1].args[1].int')[0])
        };
    }

    /**
     * Calls the set_data entry point to update registration for a baker.
     * 
     * @param server Destination Tezos node.
     * @param address Contract address to query.
     * @param baker Baker address to register.
     * @param name Baker name, can be empty string.
     * @param isAcceptingDelegation 
     * @param detailsURL 
     * @param payoutShare 
     */
    export async function updateRegistration(server: string, address: string, baker: string, name: string, isAcceptingDelegation: boolean, detailsURL: string, payoutShare: number) {
        
    }

    /**
     * Query the baker registry contract at the specified address for a given baker address.
     * 
     * @param server Destination Tezos node.
     * @param mapid bigmap reference to query.
     * @param baker Baker address to query.
     */
    export async function queryRegistration(server: string, mapid: number, baker: string) {
        const key = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(baker, 'key_hash'), 'hex'));
        const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, key);

        if (!!!mapResult) { return undefined; }

        const jsonpath = new JSONPath();
        const textDecoder = new TextDecoder();

        const paymentConfigMask = Number(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[1].args[1].args[1].args[0].args[1].int')[0]); // paymentConfigMask

        return {
            name: textDecoder.decode(Buffer.from(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[0].args[0].args[0].bytes')[0], 'hex')), // bakerName
            isAcceptingDelegation: Boolean(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[0].args[0].args[1].prim')[0]), // openForDelegation
            externalDataURL: textDecoder.decode(Buffer.from(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[0].args[1].bytes')[0], 'hex')), // bakerOffchainRegistryUrl
            split: Number(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[1].args[0].args[0].int')[0]) / 10000, // split
            paymentAccounts: jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[1].args[0].args[1]..string'), // bakerPaysFromAccounts
            minimumDelegation: Number(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[1].args[1].args[0].args[0].args[0].int')[0]), // minDelegation
            isGreedy: Boolean(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[1].args[1].args[0].args[0].args[1].prim')[0]), // subtractPayoutsLessThanMin
            payoutDelay: Number(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[1].args[1].args[0].args[1].args[0].int')[0]), // payoutDelay
            payoutFrequency: Number(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[1].args[1].args[0].args[1].args[1].args[0].int')[0]), // payoutFrequency
            minimumPayout: Number(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[1].args[1].args[0].args[1].args[1].args[1].int')[0]), // minPayout
            isCheap: Boolean(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[1].args[1].args[1].args[0].args[0].prim')[0]), // bakerChargesTransactionFee
            paymentConfig: {
                payForOwnBlocks: Boolean(paymentConfigMask & 1),
                payForEndorsements: Boolean(paymentConfigMask & 2),
                payGainedFees: Boolean(paymentConfigMask & 4),
                payForAccusationGains: Boolean(paymentConfigMask & 8),
                subtractLostDepositsWhenAccused: Boolean(paymentConfigMask & 16),
                subtractLostRewardsWhenAccused: Boolean(paymentConfigMask & 32),
                subtractLostFeesWhenAccused: Boolean(paymentConfigMask & 64),
                payForRevelation: Boolean(paymentConfigMask & 128),
                subtractLostRewardsWhenMissRevelation: Boolean(paymentConfigMask & 256),
                subtractLostFeesWhenMissRevelation: Boolean(paymentConfigMask & 512),
                compensateMissedBlocks: !Boolean(paymentConfigMask & 1024),
                payForStolenBlocks: Boolean(paymentConfigMask & 2048),
                compensateMissedEndorsements: !Boolean(paymentConfigMask & 4096),
                compensateLowPriorityEndorsementLoss: !Boolean(paymentConfigMask & 8192)
            },
            overdelegationThreshold: Number(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[1].args[1].args[1].args[1].args[0].int')[0]), // overDelegationThreshold
            subtractRewardsFromUninvitedDelegation: Boolean(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[1].args[1].args[1].args[1].args[1].prim')[0]), // subtractRewardsFromUninvitedDelegation
            recordManager: jsonpath.query(mapResult, '$.args[0].args[1].args[0].string')[0], // reporterAccount
            timestamp: new Date(jsonpath.query(mapResult, '$.args[1].string')[0]) // last_update
        };
    }
}
