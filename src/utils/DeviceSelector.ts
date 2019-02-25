/**
 * Ledger interface abstraction.
 * 
 * Rather than importing the ledger library directly the code that needs it will look it up here and
 * only execute if it is indeed available. This is done in an effort to provide the ability to package
 * different versions of ConseilJS, a light-weight one for web reporting tools like Arronax, a full
 * version for nodejs-based use, etc.
 */
export default class DeviceSelector {
    static ledgerUtils: any = null;
    static setLedgerUtils(ledger: any) {
        this.ledgerUtils = ledger;
    }

    static getLedgerUtils() {
        return this.ledgerUtils;
    }
}
