export interface TezosAccount {
    accountId: string,
    blockId: string,
    manager: string,
    spendable: boolean,
    delegateSetable: boolean,
    delegateValue: string,
    counter: number,
    script: string,
    balance: number
}