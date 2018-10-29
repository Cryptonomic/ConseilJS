export interface Operation {
    kind: string,
    source: string,
    fee: string,
    counter: string,
    storage_limit: string,
    gas_limit: string,
    delegate?: String,
    public_key?: string,
    manager_pubkey?: string,
    balance?: string,
    spendable?: boolean,
    delegatable?: boolean,
    destination?: String,
    amount?: string
}