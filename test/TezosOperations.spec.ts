import "mocha";
import { expect } from "chai";

import { TezosOperations } from "../src";
import { TezosWallet } from "../src";
import { KeyStore } from "../src/types/KeyStore";

describe('Off-line TezosOperations methods tests', () => {
    it('Correctly sign and hash an operation group', async () => {
        const keys = <KeyStore> TezosWallet.unlockFundraiserIdentity(
            "woman chaos mammal brain huge race weasel vintage doll pulse spot mansion lawsuit fat target",
            "psgtnfuc.vjppumbu@tezos.example.org",
            "A0mEUNNzP7",
            "tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2");

        const signedResult = await TezosOperations.signOperationGroup(
            "8f90f8f1f79bd69ae7d261252c51a1f5e8910f4fa2712a026f2acadb960416d900020000f10a450269188ebd9d29c6402d186bc381770fae000000000000c3500000001900000026010000000005f5e1000000bad6e61eb7b96f08783a476508e3d83b2bb15e19ff00000002030bb8010000000000000000",
            keys,
            "undefined"
        );
        expect(signedResult.signature).to.equal('edsigtta7Fc4M27GwBxKYCBPvNaSEJzengzn51FzqJpUuuUJoJJGthPEe7dLSn4xc37oyrvToG35dnRMSLmcYicGVhBqC727Tgu');

        const hashedResult = TezosOperations.computeOperationHash(signedResult);
        expect(hashedResult).to.equal('op22K8nJ9uCkWqvCSnRofpe6WrnVyRkNKNAFJEA3T879PKd6Sdo')
    });
});