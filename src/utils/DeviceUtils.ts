export default class DeviceUtils {
    static ledgerUtils: any = null;
    static setLedgerUtils(ledger: any) {
        this.ledgerUtils = fetch;
    }

    static getLedgerUtils() {
        return this.ledgerUtils;
    }
}