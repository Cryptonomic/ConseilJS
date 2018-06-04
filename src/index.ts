import {Wallet} from "./types/Wallet";
import {KeyPair} from "./types/KeyPair";
import {TezosAccount} from "./tezos/TezosTypes";
import {TezosTransaction} from "./types/TezosTransaction";
import * as CryptoUtils from "./utils/CryptoUtils"
import * as Conseil from "./utils/ConseilQuery"
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

    export function unlockFundraiserIdentity(mnemonic: string, email: string, password: string): KeyPair {
        const passphrase = email + password
        return CryptoUtils.getKeysFromMnemonicAndPassphrase(mnemonic, passphrase)
    }

    export function generateMnemonic(): string {
        return CryptoUtils.generateMnemonic()
    }

    export function unlockIdentityWithMnemonic(mnemonic: string, passphrase: string): KeyPair {
        return CryptoUtils.getKeysFromMnemonicAndPassphrase(mnemonic, passphrase)
    }

    export function getAccountsForIdentity(id: string, network: string): Promise<TezosAccount[]> {
        const filter: Conseil.ConseilFilter = {
            limit: 100,
            block_id: [],
            block_level: [],
            block_netid: [],
            block_protocol: [],
            operation_id: [],
            operation_source: [],
            account_id: [],
            account_manager: [id],
            account_delegate: []
        }
        return Conseil.getAccounts(network, filter)
    }

    export function getBalance(id: string, network: string): Promise<number> {
        return Conseil.getAccount(network, id)
            .then(account => {return account.balance})
    }

    export function getTransactionsForAddress(id: string, network: string): Promise<TezosTransaction[]> {
        return new Promise<TezosTransaction[]>((resolve, reject) => {
            resolve(
                [
                    {
                        id: 'oo3g2w3h9pK56GafXEHuu3FWZGKy6ctMjViw46aTT41qUK3FWEW',
                        sender: id,
                        recipient: id,
                        amount: 10
                    },
                    {
                        id: 'oo3g2w3h9pK56GafXEHuu3FWZGKy6ctMjViw46aTT41qUK3FWEW',
                        sender: id,
                        recipient: id,
                        amount: -20
                    }
                ]
            )
        })
    }

    export function sendTransaction(network: string, from: string, to: string, amount: number, fee: number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            resolve(
                'op4prKdhMfcGraxqe45KYEs8W3Yyf7BXiDxn5LNssRs54XLdmBo'
            )
        })
    }

    export function createAccount(network: string, from: string, to: string, amount: number, fee: number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            resolve(
                'op4prKdhMfcGraxqe45KYEs8W3Yyf7BXiDxn5LNssRs54XLdmBo'
            )
        })
    }

    export function delegateAccount(network: string, id: string, delegate: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            resolve(
                'op4prKdhMfcGraxqe45KYEs8W3Yyf7BXiDxn5LNssRs54XLdmBo'
            )
        })
    }
}