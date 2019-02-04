// BLa9pmsQ5Hf6E9MSqVTHp65wNchXe8WjsGgjKeutAwmeQrd9YsT   --- manager not revealed
// BLNB68pLiAgXiJHXNUK7CDKRnCx1TqzaNGsRXsASg38wNueb8bx   --- manager reveal
export const blockHead = {
  "protocol": "PsddFKi32cMJ2qPjf43Qv5GDWLDPZb3T3bF6fLKiF5HtvHNU7aP",
  "chain_id": "NetXgtSLGNJvNye",
  "hash": "BLNB68pLiAgXiJHXNUK7CDKRnCx1TqzaNGsRXsASg38wNueb8bx",
  "metadata": {
    "level": 141196,
    "proto": 10,
    "predecessor": 'predecessor',
    "timestamp": "timestamp",
    "validation_pass": 10,
    "operations_hash": '',
    "fitness": [],
    "context": '',
    "priority": 10,
    "proof_of_work_nonce": '',
    "signature": 'sigQLLnSecsUoj3aw58wpvGDcsea2edoFVBnaetYGM3oeAMwLpPZCmfjduLmWUVkn9frPvEBtoAHDX6e7sSLsN7csVFpzfwT',
  }
};

export const signedOpGroup = {
  "bytes": Buffer.from([113,60,176,104,254,58,192,120,53,23,39,235,92,52,39,158,34,183,91,12,244,220,10,141,61,89,158,39,3,29,177,54,4,12,185,249,218,8,86,7,192,92,172,28,164,198,42,63,60,251,129,70,170,155,127,99,30,82,248,119,161,211,99,71,68,4,218,129,48,176,185,64,238,136,222,54,227,73,222,46,126,236,32,75,243,178,77,64,188,75,120,44,222,54,147,4,186,148,128,137,25,108,43,176,0,96,63,171,12,23,53,13,25,221,111,207,182,167,33,14,45,122,76,110,243,187,99,30,199,36,246,189,169,23,54,236,11])
  ,
  "signature": "edsigtqiKkZEAA8rrioRkAHW3atqD5dMJ6986hL5KpVHiJcMkWKYrGVy65Bwmhc5zkvagL3jhEZEvVwBYfwPW56SAKyGbXK1S61"
};

export const forgedOpGroupList = [
  '713cb068fe3ac078351727eb5c34279e22b75b0cf4dc0a8d3d599e27031db136040cb9f9da085607c05cac1ca4c62a3f3cfb8146aa9b7f631e52f877a1d363474404da8130b0b940ee',
  'df23ec85f33ef87ce40a9fab2fd7e3f01a3390f55c5613264a4d405c7119745b0700000cb9f9da085607c05cac1ca4c62a3f3cfb8146aa940a828701904e00003f5ab48bd0c9f071a582a1c4bb1fd8f2e6c45fb15d59b225a86b62c02fb17af9',
  'cbaf78a1e934a6554cec455e08d02f8b8879686ad032222d0d8cbd3923a12cfc0800000cb9f9da085607c05cac1ca4c62a3f3cfb8146aaa08d06838701bc50ac0280ade2040000da127edc28ee7880d01cdf5871efdc03c35ab7ff00',
  'c7171defe56ade93839b482e2bb8c6f481af111a4f2eba870799cd4884a64bcc0900000cb9f9da085607c05cac1ca4c62a3f3cfb8146aaa08d06848701b04f9502000cb9f9da085607c05cac1ca4c62a3f3cfb8146aa80ade204ffffff00c4e2fbc790485d1cde3e21da2a879f29293048b200',
  'd98a373b9bc861331d61d5553c44c38dbd021a1c412c8da4d2d713eb8172605c0701f524e07bfd155ac2ec783a1329b4f9352b44a04c000001904e00003f5ab48bd0c9f071a582a1c4bb1fd8f2e6c45fb15d59b225a86b62c02fb17af90a01f524e07bfd155ac2ec783a1329b4f9352b44a04c00e0a71202904e00ff02dbc751212b8750586a65d528256916795112edc9'
];

export const appliedOpList = [
  [
    {
      "contents": [
        {
          "kind": "activate_account",
          "pkh": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
          "secret": "9b7f631e52f877a1d363474404da8130b0b940ee",
          "metadata": {
            "balance_updates": [
              {
                "kind": "contract",
                "contract": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
                "change": "13212502893"
              }
            ]
          }
        }
      ],
      "signature": "edsigtqiKkZEAA8rrioRkAHW3atqD5dMJ6986hL5KpVHiJcMkWKYrGVy65Bwmhc5zkvagL3jhEZEvVwBYfwPW56SAKyGbXK1S61"
    }
  ],
  [
    {
      "contents": [
        {
          "kind": "reveal",
          "source": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
          "fee": "1300",
          "counter": "17282",
          "gas_limit": "10000",
          "storage_limit": "0",
          "public_key": "edpku88EkY42ZKGTkiWTLkz8Th977n82AJWaZrmyBcrQ1dzo26aWKp",
          "metadata": {
            "balance_updates": [
              {
                "kind": "contract",
                "contract": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
                "change": "-1300"
              },
              {
                "kind": "freezer",
                "category": "fees",
                "delegate": "tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU",
                "level": 69,
                "change": "1300"
              }
            ],
            "operation_result": {
              "status": "applied",
              "consumed_gas": "10000"
            }
          }
        }
      ],
      "signature": "edsigtgTWxkW6PGFMKduFBg2vpDUHAdecGe8f8hdvaiBH4Pd9pQaQyCMxqMqqEWfmWQvHQJMR3eG7iigmMuq9tFBJk3XVAGWmDX"
    }
  ],
  [
    {
      "contents": [
        {
          "kind": "transaction",
          "source": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
          "fee": "100000",
          "counter": "17283",
          "gas_limit": "10300",
          "storage_limit": "300",
          "amount": "10000000",
          "destination": "tz1fX6A2miVXjNyReg2dpt2TsXLkZ4w7zRGa",
          "metadata": {
            "balance_updates": [
              {
                "kind": "contract",
                "contract": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
                "change": "-100000"
              },
              {
                "kind": "freezer",
                "category": "fees",
                "delegate": "tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU",
                "level": 69,
                "change": "100000"
              }
            ],
            "operation_result": {
              "status": "applied",
              "balance_updates": [
                {
                  "kind": "contract",
                  "contract": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
                  "change": "-10000000"
                },
                {
                  "kind": "contract",
                  "contract": "tz1fX6A2miVXjNyReg2dpt2TsXLkZ4w7zRGa",
                  "change": "10000000"
                },
                {
                  "kind": "contract",
                  "contract": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
                  "change": "-257000"
                }
              ],
              "consumed_gas": "10100",
              "allocated_destination_contract": true
            }
          }
        }
      ],
      "signature": "edsigtpwyMthE8urabFwngqkwEfWKR1338DEgfckXTgZ9R4usgRy9s2Eau3dmtEedcTC6HLNSTp5PdWHBHKuh3VMRfXQTeMqKzR"
    }
  ],
  [
    {
      "contents": [
        {
          "kind": "origination",
          "source": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
          "fee": "100000",
          "counter": "17284",
          "gas_limit": "10160",
          "storage_limit": "277",
          "managerPubkey": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
          "balance": "10000000",
          "delegate": "tz1db53osfzRqqgQeLtBt4kcFcQoXJwPJJ5G",
          "metadata": {
            "balance_updates": [
              {
                "kind": "contract",
                "contract": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
                "change": "-100000"
              },
              {
                "kind": "freezer",
                "category": "fees",
                "delegate": "tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU",
                "level": 69,
                "change": "100000"
              }
            ],
            "operation_result": {
              "status": "applied",
              "balance_updates": [
                {
                  "kind": "contract",
                  "contract": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
                  "change": "-257000"
                },
                {
                  "kind": "contract",
                  "contract": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
                  "change": "-10000000"
                },
                {
                  "kind": "contract",
                  "contract": "KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM",
                  "change": "10000000"
                }
              ],
              "originated_contracts": [
                "KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM"
              ],
              "consumed_gas": "10000"
            }
          }
        }
      ],
      "signature": "edsigtvkJX3RDTk6sYysLyPkhVFsA5HgnuTTZRcsPsC461YctQrmpgjD8aGK4xDMat7zfirD9UHHqfp5G2rSxEXLjY1iav9F1XM"
    }
  ],
  [
    {
      "contents": [
        {
          "kind": "reveal",
          "source": "KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM",
          "fee": "0",
          "counter": "1",
          "gas_limit": "10000",
          "storage_limit": "0",
          "public_key": "edpku88EkY42ZKGTkiWTLkz8Th977n82AJWaZrmyBcrQ1dzo26aWKp",
          "metadata": {
            "balance_updates": [],
            "operation_result": {
              "status": "applied",
              "consumed_gas": "10000"
            }
          }
        },
        {
          "kind": "delegation",
          "source": "KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM",
          "fee": "300000",
          "counter": "2",
          "gas_limit": "10000",
          "storage_limit": "0",
          "delegate": "tz3gN8NTLNLJg5KRsUU47NHNVHbdhcFXjjaB",
          "metadata": {
            "balance_updates": [
              {
                "kind": "contract",
                "contract": "KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM",
                "change": "-300000"
              },
              {
                "kind": "freezer",
                "category": "fees",
                "delegate": "tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU",
                "level": 69,
                "change": "300000"
              }
            ],
            "operation_result": {
              "status": "applied",
              "consumed_gas": "10000"
            }
          }
        }
      ],
      "signature": "edsigthZJLo3MDt12sEdsFNyydRyjWjY5Qpxgwdj7aZUZewZe7xHYBXkMxftpN8CdY986fSe2eUUcbEyA3JiWpTKfMhjUPNVy1L"
    }
  ]
];

export const injectOpList = [
  'opBpn8Uzt1c67jw7a3H5nDkpryDkVF1W9SmiWBHtnnofg8TL7LA',
  'opLpvbPti1mGUxtYeTNxrwDDxj6y5gWzX6M1WC2N2nsVyoQx2Q6',
  'oorzMv8McWTRvZ8PVWDvdAGeP7m1rs7cVVC69g7t2UyCUM4y4Pb',
  'ooZxQcA43uh8bFbY5PJfrTadTZ38RZ6PP3iDc2jF6aJFQSLXhvF',
  'oooidxFJKy4iEtmCtZtYg2DibL7A5eapjYTtZ4Pf9D7THSyA5C1'
];
export const accountMockList = [
  {
    manager: 'tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP',
    balance: 13191787593,
    spendable: true,
    delegate: { setable: false },
    counter: '17259'
  },
  {
    manager: 'tz1fX6A2miVXjNyReg2dpt2TsXLkZ4w7zRGa',
    balance: 0,
    spendable: true,
    delegate: { setable: false },
    counter: '17259'
  },
  { 
    manager: 'tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP',
    balance: 9700000,
    spendable: true,
    delegate: { setable: false },
    counter: '2' 
  }
];

export const managerKeyMockList = [
  {
    "manager":  "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
    "key":  "edpku88EkY42ZKGTkiWTLkz8Th977n82AJWaZrmyBcrQ1dzo26aWKp"
  },
  {
    "manager":  "tz1fX6A2miVXjNyReg2dpt2TsXLkZ4w7zRGa"
  }
];

export const walletInfoLists = [
  {
    "seed": 'crucial can galaxy shield runway chunk sorry bronze icon fold convince inner inherit nest leader',
    "secret": "9b7f631e52f877a1d363474404da8130b0b940ee",
    "amount": "13212502893",
    "pkh": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
    "password": "dB1pS2w8Cm",
    "email": "yojmzsbv.cfgoawgf@tezos.example.org"
  },
  {
    "seed": 'rude expect abstract return garbage pepper situate salad analyst arm garbage canyon maze debris transfer',
    "secret": "a664b80cb07999c349cde169cdc69e2c6b56901b",
    "amount": "2099397010",
    "pkh": "tz1fX6A2miVXjNyReg2dpt2TsXLkZ4w7zRGa",
    "password": "5TsURhzMH3",
    "email": "zvhmwpxp.oyknmtkh@tezos.example.org"
  }
];


