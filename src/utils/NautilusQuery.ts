import fetch from 'node-fetch';

export function runQuery(network: string, command: string, payload = {}): Promise<object> {
    const https = require("https");
    const agent = new https.Agent({
        rejectUnauthorized: false
    })
    let url = `https://nautilus.cryptonomic.tech:1337/tezos/${network}/${command}`;
    return fetch(url, {
        method: 'post',
        body: payload,
        agent: agent
    })
        .then(response => {return response.json()});
}
