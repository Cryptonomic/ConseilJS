let Transport = require("@ledgerhq/hw-transport-node-hid").default;
let App = require("@ledgerhq/hw-app-xtz").default;

function formFullDerivationPath(derivationPath: string, index: number) {
    return `${derivationPath}/${index.toString()}'`;
}

export async function getPublicKey(derivationPath: string, index: number) {
    const transport = await Transport.create();
    const xtz = new App(transport);
    const result = await xtz.getAddress(formFullDerivationPath(derivationPath, index), true);
    return result.publicKey;
}

export async function signOperation(derivationPath: string, index: number, opBytesInHex: string) {
    const transport = await Transport.create();
    const xtz = new App(transport);
    const result = await xtz.signOperation(formFullDerivationPath(derivationPath, index), opBytesInHex);
}