import {Wallet} from "./types/Wallet";
import {KeyStore} from "./types/KeyPair";
import {TezosAccount, TezosOperationGroup} from "./tezos/TezosTypes";
import * as CryptoUtils from "./utils/CryptoUtils"
import * as TezosQuery from "./tezos/TezosQuery"
import * as fs from 'fs';

export namespace tezos
{
    export function createWallet(filename: string, password: string): Promise<Wallet> {
        return new Promise<Wallet>((resolve, reject) => {
            if (fs.existsSync(filename)) reject("A wallet already exists at this path!")
            const wallet: Wallet = {
                identities: []
            }
            fs.writeFile(filename, JSON.stringify(wallet), (err) => {
                if (err) reject(err);
                resolve(wallet)
            });
        })
    }

    export function saveWallet(filename: string, wallet: Wallet): Promise<Wallet> {
        return new Promise<Wallet>((resolve, reject) => {
            fs.writeFile(filename, JSON.stringify(wallet), (err) => {
                if (err) reject(err);
                resolve(wallet)
            });
        })
    }

    export function loadWallet(filename: string, password: string): Promise<Wallet> {
        return new Promise<Wallet>((resolve, reject) => {
            fs.readFile(filename, (err, data) => {
                if (err) reject(err);
                const wallet = <Wallet> JSON.parse(data.toString())
                resolve(wallet)
            });
        })
    }

    export function unlockFundraiserIdentity(mnemonic: string, email: string, password: string): KeyStore {
        const passphrase = email + password
        return CryptoUtils.getKeysFromMnemonicAndPassphrase(mnemonic, passphrase)
    }

    export function generateMnemonic(): string {
        return CryptoUtils.generateMnemonic()
    }

    export function unlockIdentityWithMnemonic(mnemonic: string, passphrase: string): KeyStore {
        return CryptoUtils.getKeysFromMnemonicAndPassphrase(mnemonic, passphrase)
    }

    export function getAccountsForIdentity(id: string, network: string): Promise<TezosAccount[]> {
        const filter: TezosQuery.TezosFilter = {
            limit: 100,
            block_id: [],
            block_level: [],
            block_netid: [],
            block_protocol: [],
            operation_id: [],
            operation_source: [],
            operation_group_kind: [],
            operation_kind: [],
            account_id: [],
            account_manager: [id],
            account_delegate: []
        }
        return TezosQuery.getAccounts(network, filter)
    }

    export function getBalance(id: string, network: string): Promise<number> {
        return TezosQuery.getAccount(network, id)
            .then(result => {return result.account.balance})
    }

    export function getTransactionsForAddress(id: string, network: string): Promise<TezosOperationGroup[]> {
        const filter: TezosQuery.TezosFilter = {
            limit: 100,
            block_id: [],
            block_level: [],
            block_netid: [],
            block_protocol: [],
            operation_id: [],
            operation_source: [id],
            operation_group_kind: [],
            operation_kind: ['transaction'],
            account_id: [],
            account_manager: [],
            account_delegate: []
        }
        return TezosQuery.getOperationGroups(network, filter)
    }

    export function sendTransaction(network: string, keyPair: KeyStore, from: string, to: string, amount: number, fee: number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            resolve(
                'op4prKdhMfcGraxqe45KYEs8W3Yyf7BXiDxn5LNssRs54XLdmBo'
            )
        })
    }

    export function createAccount(network: string, keyPair: KeyStore): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            resolve(
                'op4prKdhMfcGraxqe45KYEs8W3Yyf7BXiDxn5LNssRs54XLdmBo'
            )
        })
    }

    export function delegateAccount(network: string, keyPair: KeyStore, id: string, delegate: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            resolve(
                'op4prKdhMfcGraxqe45KYEs8W3Yyf7BXiDxn5LNssRs54XLdmBo'
            )
        })
    }
}