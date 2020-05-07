/**
 *
 */
export default class LoggerSelector {
    static log: any = {};

    static setLogger(log: any) {
        Object.assign(this.log, log);
    }
}
