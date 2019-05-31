/**
 *
 */
export default class LoggerSelector {
    static log: any = null;

    static setLogger(log: any) {
        this.log = log;
    }

    static getLogger() {
        return this.log;
    }

    static setLevel(level: string) {
        this.log.setLevel(level, false);
    }
}
