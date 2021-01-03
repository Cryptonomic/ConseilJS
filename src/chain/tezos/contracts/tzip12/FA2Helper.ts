import {KeyStore, Signer, TezosNodeWriter, TezosParameterFormat} from 'conseiljs';
import {MintPair, MintPairMicheline, BurnPair, BurnPairMicheline, StoragePair, DeployPair} from './FA2Types';
import {config} from './config';

export namespace FA2Helper {

    export interface FA2Contract {
        address: string;
        ledgerMapID: number;
        storage: StoragePair;
    }

    // need to add interface and micheline func for DeployPair
    export async function Deploy(signer: Signer, keystore: KeyStore): Promise<string> {
        // let paramaters: string = DeployPairMicheline(DeployPair);
        const nodeResult = await TezosNodeWriter.sendContractOriginationOperation(
            config.tezosNode,
            signer,
            keystore,
            config.testTx.amount,
            undefined,
            config.testTx.fee,
            config.testTx.storageLimit,
            config.testTx.gasLimit,
            config.contractCode,
            config.contractInitialStorage,
            TezosParameterFormat.Michelson);
        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function Mint(signer: Signer, keystore: KeyStore, mints: MintPair[]): Promise<string> {
        const entrypoint = `mint`;
        let parameters: string = `[ ${mints.map(m => MintPairMicheline(m)).join(',')} ]`;
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(
            config.tezosNode,
            signer,
            keystore,
            config.contractAddress,
            config.testTx.amount,
            config.testTx.fee,
            config.testTx.storageLimit,
            config.testTx.gasLimit,
            entrypoint,
            parameters,
            TezosParameterFormat.Micheline);
        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function Burn(signer: Signer, keystore: KeyStore, burns: BurnPair[]): Promise<string> {
        const entrypoint = `burn`;
        let parameters: string = `[ ${burns.map(b => BurnPairMicheline(b)).join(',')} ]`;
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(
            config.tezosNode,
            signer,
            keystore,
            config.contractAddress,
            config.testTx.amount,
            config.testTx.fee,
            config.testTx.storageLimit,
            config.testTx.gasLimit,
            entrypoint,
            parameters,
            TezosParameterFormat.Micheline);
        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }
}

function clearRPCOperationGroupHash(hash: string) {
    return hash.replace(/\"/g, '').replace(/\n/, '');
}
