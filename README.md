<p align="middle">
    <img src="https://www.rifos.org/assets/img/logo.svg" alt="logo" height="100" >
</p>
<h3 align="middle"><code>rns-auction-manager</code></h3>
<p align="middle">
    <b>(deprecated)</b> RNS manager for auction registrations.
</p>

## Run locally

1. Install dependencies:

    ```bash
    yarn install
    ```

2. Set configuration:

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

3. Start development:

    ```
    yarn start
    ```

Now browse to http://localhost:3000.

> The default port specified in ``config.json`` is 3000.
