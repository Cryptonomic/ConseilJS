import {KeyStore, Signer} from '../../../../types/ExternalInterfaces';
import {TezosNodeWriter} from '../../TezosNodeWriter';
import {TezosParameterFormat} from '../../../../types/tezos/TezosChainTypes';

// deploy parameters
export interface DeployPair {
    admin: string;
}
// mint
export interface MintPair {
    address: string;
    amount: number;
    sym: string;
    token_id: number;
}
// burn
export interface BurnPair {
    address: string;
    amount: number;
    sym: string;
    token_id: number;
}
// contract interface
interface FA2Contract {
    address: string;
    ledgerMapID: number;
}
export namespace FA2Helper {


    // need to add interface and micheline func for DeployPair
    export async function Deploy(signer: Signer, keystore: KeyStore, config): Promise<string> {
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

    export async function Mint(signer: Signer, keystore: KeyStore, mints: MintPair[], config): Promise<string> {
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

    export async function Burn(signer: Signer, keystore: KeyStore, burns: BurnPair[], config): Promise<string> {
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


    function DeployPairMicheline(): string {
        return ``;
    }


    export function MintPairMicheline(mint: MintPair): string {
        return `{
            "prim": "Pair",
            "args": [
                { "prim": "Pair", "args": [ { "string": "${mint.address}" }, { "int": "${mint.amount}" } ] },
                { "prim": "Pair", "args": [ { "string": "${mint.sym}" }, { "int": "${mint.token_id}" } ] }
            ]
        }`;
    }


    export function BurnPairMicheline(burn: BurnPair): string {
        return `{
            "prim": "Pair",
            "args": [ { "string": "${burn.address}" },
                { "prim": "Pair", "args": [ { "int": "${burn.amount}" }, { "int": "${burn.token_id}" } ] }
            ]
        }`;
    }
}

function clearRPCOperationGroupHash(hash: string): string {
    return hash.replace(/\"/g, '').replace(/\n/, '');
}

