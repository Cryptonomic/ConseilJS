import {KeyPair} from "./KeyPair";

export interface Wallet {
    identities: KeyPair[],
    password: String
}