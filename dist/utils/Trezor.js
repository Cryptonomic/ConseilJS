"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf = __importStar(require("protobufjs"));
const usb = __importStar(require("usb"));
const trezToMsgid = {
    "tezosGetAddress": 150,
    "tezosGetPublicKey": 154,
    "tezosSignTx": 152,
    "acknowledge": 27,
    "acknowledgePassphrase": 42,
    "acknowledgePassphraseState": 78,
};
const msgidToPb = {
    2: "hw.trezor.messages.common.Success",
    3: "hw.trezor.messages.common.Failure",
    26: "hw.trezor.messages.common.ButtonRequest",
    27: "hw.trezor.messages.common.ButtonAck",
    41: "hw.trezor.messages.common.PassphraseRequest",
    42: "hw.trezor.messages.common.PassphraseAck",
    77: "hw.trezor.messages.common.PassphraseStateRequest",
    78: "hw.trezor.messages.common.PassphraseStateAck",
    150: "hw.trezor.messages.tezos.TezosGetAddress",
    151: "hw.trezor.messages.tezos.TezosAddress",
    152: "hw.trezor.messages.tezos.TezosSignTx",
    153: "hw.trezor.messages.tezos.TezosSignedTx",
    154: "hw.trezor.messages.tezos.TezosGetPublicKey",
    155: "hw.trezor.messages.tezos.TezosPublicKey",
};
var TezFns;
(function (TezFns) {
    let device, interf, inep, outep, pbroot, currentMessageData, currentMessageId, currentMessageLength, currentMessageHandler, currentMessageErrorHandler, isLoaded, pbError;
    function openDevice() {
        return new Promise((resolve, reject) => {
            device = usb.findByIds(4617, 21441);
            reject = (e) => { throw e; };
            if (!device)
                reject("No device found");
            device.open();
            // Find interface - we want to connect to the first one hopefully
            if (device.interfaces.length <= 0)
                reject("No interface found");
            interf = device.interface(device.interfaces[0].id);
            interf.claim();
            for (let i = 0; i < interf.endpoints.length; i++) {
                if (interf.endpoints[i].direction == 'in' && !inep)
                    inep = interf.endpoint(interf.endpoints[i].address);
                if (interf.endpoints[i].direction == 'out' && !outep)
                    outep = interf.endpoint(interf.endpoints[i].address);
                if (inep && outep)
                    break;
            }
            if (!inep || !outep)
                reject("Not enough endpoints found");
            // Set up polling
            inep.on("data", (d) => {
                if (d[0] != 63)
                    return;
                d = d.slice(1);
                if (d[0] == 35 && d[1] == 35) {
                    currentMessageId = buf2int(d.slice(2, 4));
                    currentMessageLength = buf2int(d.slice(4, 8));
                    d = d.slice(8);
                    currentMessageData = Buffer.alloc(0);
                }
                if (currentMessageId) {
                    currentMessageData = Buffer.concat([currentMessageData, d]);
                    if (currentMessageData.length >= currentMessageLength) {
                        if (currentMessageId == 26) {
                            trezorQuery("acknowledge", {}, true);
                            currentMessageData = false;
                            currentMessageId = false;
                            currentMessageLength = false;
                        }
                        else if (currentMessageId == 41) {
                            if (currentMessageData[1]) {
                                trezorQuery("acknowledgePassphrase", {}, true);
                            }
                            else {
                                // prompt({
                                // title: 'Enter Trezor Passphrase',
                                // height: 150,
                                // resizable : false,
                                // label: 'Passphrase',
                                // inputAttrs: {type: 'text', required: true},
                                // })
                                // .then((r) => {
                                // if(r === null) {
                                //     throw "No passphrase provided";
                                // } else {
                                //     trezorQuery("acknowledgePassphrase", {
                                //     passphrase : r
                                //     }, true);
                                // }
                                // }).catch(function(){
                                // throw "Error with passphrase";
                                // });
                            }
                            currentMessageData = false;
                            currentMessageId = false;
                            currentMessageLength = false;
                        }
                        else if (currentMessageId == 77) {
                            trezorQuery("acknowledgePassphraseState", {}, true);
                            currentMessageData = false;
                            currentMessageId = false;
                            currentMessageLength = false;
                        }
                        else {
                            currentMessageData = currentMessageData.slice(0, currentMessageLength);
                            if (currentMessageHandler) {
                                currentMessageHandler(decodeProtobugMessage(currentMessageId, currentMessageData));
                            }
                            currentMessageData = false;
                            currentMessageId = false;
                            currentMessageLength = false;
                            currentMessageHandler = false;
                            currentMessageErrorHandler = false;
                        }
                    }
                }
            });
            inep.on("error", (e) => {
                if (currentMessageErrorHandler)
                    currentMessageErrorHandler(e);
            });
            try {
                inep.startPoll();
            }
            catch (e) {
                console.log(e);
            }
            resolve();
        });
    }
    function closeDevice() {
        inep.stopPoll(() => {
            interf.release(true, () => {
                device.close();
                device = false;
                interf = false;
                inep = false;
                outep = false;
                currentMessageData = false;
                currentMessageId = false;
                currentMessageLength = false;
                currentMessageHandler = false;
                currentMessageErrorHandler = false;
            });
        });
    }
    function load() {
        return new Promise((resolve, reject) => {
            if (isLoaded) {
                if (pbError) {
                    reject(pbError);
                }
                else {
                    resolve();
                }
            }
            else {
                protobuf.load("src/utils/protob/trezor.tezos.proto", (err, root) => {
                    if (err) {
                        pbError = err;
                        isLoaded = true;
                        reject(err);
                    }
                    else {
                        pbroot = root;
                        isLoaded = true;
                        resolve();
                    }
                });
            }
        });
    }
    function convertPath(p) {
        const ps = p.split('/');
        let r = [];
        for (let i = 0; i < ps.length; i++) {
            r.push((ps[i].indexOf("'") >= 0 ? (parseInt(ps[i]) | 0x80000000) >>> 0 : parseInt(ps[i])));
        }
        return r;
    }
    function buildPackets(id, data) {
        data = encodeProtobugMessage(id, data || {});
        data = Array.prototype.slice.call(data, 0);
        let header = [35, 35];
        header = header.concat([id >> 8, id % 255]);
        header = header.concat(toBytesInt32(data.length));
        data = header.concat(data);
        let pak = [];
        let packets = [];
        for (let i = 0; i < Math.ceil((data.length) / 63); i++) {
            pak = data.slice(i * 63, (i * 63) + 63);
            pak = pad_array(pak, 63, 0);
            packets.push(pak);
        }
        return packets;
    }
    function pad_array(arr, len, fill) {
        return arr.concat(Array(len).fill(fill)).slice(0, len);
    }
    function encodeProtobugMessage(messageId, message) {
        const pbm = pbroot.lookupType(msgidToPb[messageId]);
        // var err = pbm.verify(message);
        // if (err)
        // throw Error(err);
        return pbm.encode(message).finish();
    }
    function decodeProtobugMessage(messageId, message) {
        const pbm = pbroot.lookupType(msgidToPb[messageId]);
        return pbm.toObject(pbm.decode(message));
    }
    function buf2int(b) {
        let count = 0;
        for (let i = 0; i < b.length; i++) {
            count = (count << 8) + b[i];
        }
        return count;
    }
    function toBytesInt32(num) {
        return [
            (num & 0xff000000) >> 24,
            (num & 0x00ff0000) >> 16,
            (num & 0x0000ff00) >> 8,
            (num & 0x000000ff)
        ];
    }
    function trezorQuery(id, data, nocb) {
        nocb = nocb || false;
        return new Promise((resolve, reject) => {
            if (!nocb) {
                currentMessageHandler = resolve;
                currentMessageErrorHandler = reject;
            }
            const packets = buildPackets(trezToMsgid[id], data || false);
            for (let i = 0; i < packets.length; i++) {
                outep.transfer([63].concat(packets[i]), (e) => { if (e)
                    console.log("err", e); });
            }
        });
    }
    function sign(path, branch, operation, revealOp) {
        return new Promise((resolve, reject) => {
            openDevice().then(() => {
                load().then(() => {
                    const tx = {
                        addressN: convertPath(path),
                        branch: branch
                    };
                    if (revealOp)
                        tx.reveal = revealOp;
                    const type = operation.type;
                    delete operation.type;
                    tx[type] = operation;
                    trezorQuery('tezosSignTx', tx).then((d) => {
                        closeDevice();
                        if (typeof d.message != 'undefined' && d.message == 'Cancelled')
                            reject('TREZOR_ERROR');
                        else
                            resolve(d);
                    }).catch(reject);
                }).catch(reject);
            }).catch(reject);
        });
    }
    TezFns.sign = sign;
    function getAddress(path, isShow = false) {
        return new Promise((resolve, reject) => {
            openDevice().then(() => {
                load().then(() => {
                    trezorQuery('tezosGetAddress', {
                        addressN: convertPath(path),
                        showDisplay: isShow,
                    }).then((d) => {
                        trezorQuery('tezosGetPublicKey', {
                            addressN: convertPath(path),
                            showDisplay: false,
                        }).then((d1) => {
                            closeDevice();
                            resolve({
                                address: d.address,
                                publicKey: d1.publicKey
                            });
                        }).catch(reject);
                    }).catch(reject);
                }).catch(reject);
            }).catch(reject);
        });
    }
    TezFns.getAddress = getAddress;
})(TezFns = exports.TezFns || (exports.TezFns = {}));
//# sourceMappingURL=Trezor.js.map