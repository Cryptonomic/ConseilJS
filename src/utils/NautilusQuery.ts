import fetch from 'node-fetch';

export function runQuery(network: string, command: string, payload = {}): Promise<object> {
    const url = `http://nautilus.cryptonomic.tech:8732/tezos/${network}/${command}`;
    //const url = `http://localhost:8732/${command}`;
    const payloadStr = JSON.stringify(payload)
    console.log(`Querying Tezos node with URL ${url} and payload: ${payloadStr}`)
    return fetch(url, {
        method: 'post',
        body: payloadStr,
        headers: {
            'content-type': 'application/json'
        }
    })
        .then(response => {return response.json()})
        .then(json => {
            console.log(`Reponse from Tezos node: ${JSON.stringify(json)}`)
            return new Promise<Object>(resolve => resolve(json))
        })
}
