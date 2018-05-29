import * as Conseil from './conseil_bridge';

export function getBalance(id: string) {
    return Conseil.getAccount('zeronet', id);
};

export default getBalance;