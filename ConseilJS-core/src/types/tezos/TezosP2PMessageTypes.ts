/**
 * Type definitions for messages that can be forged with the RPC service
 */

export interface Activation {
    kind: string; // activate_account
    pkh: string;
    secret: string;
}

export interface Ballot {
    kind: string;
    source: string;
    period: number;
    proposal: string;
    vote: BallotVote;
}

export enum BallotVote {
    Yay = 0,
    Nay = 1,
    Pass = 2
}

export interface Transaction {
    kind: string,
    source: string,
    fee: string,
    counter: string,
    gas_limit: string,
    storage_limit: string,
    amount: string,
    destination: string,
    parameters?: ContractParameters | string;
}

export interface Delegation {
    kind: string,
    source: string,
    fee: string,
    counter: string,
    gas_limit: string,
    storage_limit: string,
    delegate?: string;
}

export interface Reveal {
    kind: string;
    source: string;
    fee: string;
    counter: string;
    gas_limit: string;
    storage_limit: string;
    public_key: string;
}

export interface Origination {
    kind: string;
    source: string;
    fee: string;
    counter: string;
    gas_limit: string;
    storage_limit: string;
    manager_pubkey?: string; // deprecated in P005
    balance: string;
    spendable?: boolean; // deprecated in P005
    delegatable?: boolean; // deprecated in P005
    delegate?: string;
    script?: any;
}

export interface ContractParameters {
    entrypoint: string;
    value: any;
}

export type Operation = Activation | Ballot | Transaction | Delegation | Reveal | Origination;

export type StackableOperation =  Transaction | Delegation | Origination;
