export interface Activation {
    kind: string;
    pkh: string;
    secret: string;
}
export interface Ballot {
    source: string;
    period: number;
    proposal: string;
    vote: BallotVote;
}
export declare enum BallotVote {
    Yay = 0,
    Nay = 1,
    Pass = 2
}
export interface Transaction {
    kind: string;
    source: string;
    fee: string;
    counter: string;
    gas_limit: string;
    storage_limit: string;
    amount: string;
    destination: string;
    parameters?: string;
}
export interface Delegation {
    kind: string;
    source: string;
    fee: string;
    counter: string;
    gas_limit: string;
    storage_limit: string;
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
    manager_pubkey: string;
    balance: string;
    spendable?: boolean;
    delegatable?: boolean;
    delegate?: string;
    script?: object;
}
export interface ContractOrigination extends Origination {
    script: object;
}
export interface ContractInvocation extends Transaction {
    parameters: string;
}
export declare type Operation = Activation | Transaction | ContractInvocation | Delegation | Reveal | Origination | ContractOrigination;
export declare type StackableOperation = Transaction | ContractInvocation | Delegation | Origination | ContractOrigination;
