# geocodeur

## Prerequisites

- Node.js 18 LTS and above

## Copy and edit env file

```bash
cp .env.sample .env
```

| Environment variable name | Description |
| --- | --- |
| `PORT` | Port node will use to start the server |
| `ADDRESS_ADDOK_SERVER_URL`* | An Addok server URL for address index |

***Required**

## Install dependencies and start node server

```bash
yarn && yarn start
```

*TODO city parameter, reverse, autocomplete, POI*
