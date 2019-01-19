"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Type of key store, i.e. whether it was generated from a fundraiser PDF or from a new mnemonic
 */
var StoreType;
(function (StoreType) {
    StoreType[StoreType["Mnemonic"] = 0] = "Mnemonic";
    StoreType[StoreType["Fundraiser"] = 1] = "Fundraiser";
    StoreType[StoreType["Hardware"] = 2] = "Hardware";
})(StoreType = exports.StoreType || (exports.StoreType = {}));
//# sourceMappingURL=KeyStore.js.map