
# RNS Manager

The RNS Manager is hosted on [manager.rns.rsk.co](https://manager.rns.rsk.co)

## Configure
To run locally, open a **terminal** and run

```bash
cp sample-config.json config.json
```

Set values in `config.json` file.

```json
{
    "node": "https://public-node.rsk.co",
    "port": 3000,
    "tld": "rsk",
    "chainId": 30,
    "explorer": {
        "url": "http://explorer.rsk.co/",
        "tx": "tx/",
        "address": "address/"
    },
    "googleAnalytics": "",
    "contracts": {
        "rif": "0x2acc95758f8b5f583470ba265eb685a8f45fc9d5",
        "registrar": "0x5269f5bc51cdd8aa62755c97229b7eeddd8e69a6",
        "rns": "0xcb868aeabd31e2b66f74e9a55cf064abb31a4ad5"
    },
    "periods": {
        "auction": 432000,
        "reveal": 172800
    }
}
```

- `node`: RSK Node
- `port`: TCP port to use for manager
- `tld`: Top Level Domain
- `chainId`: RSKIP-60 Checksum Address Encoding Chain ID
- `explorer`
    - `url`: explorer redirect url
    - `tx`: explorer tx path
    - `address`: explorer address path
- `googleAnalytics`: Google Analytics app ID
- `contracts`
    - `rif`: RIF Contract address
    - `registrar`: Registrar address
    - `RNS`: RNS Registry address
- `periods`
    - `auction`: auction time in seconds
    - `reveal`: reveal time in seconds

## Run locally

```bash
npm install
npm start
```

Now browse to http://localhost:3000.

> The default port specified in ``config.json`` is 3000.

# Documentation

For more details see the [documentation](https://docs.rns.rsk.co)

# Contributors

- [@m-picco](https://github.com/m-picco)
- [@ajlopez](https://github.com/ajlopez)
- [@julianlen](https://github.com/julianlen)
- [@ilanolkies](https://github.com/ilanolkies)
- [@alebanzas](https://github.com/alebanzas)
