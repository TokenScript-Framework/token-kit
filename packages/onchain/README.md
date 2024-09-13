# @token-kit/onchain

This module provides some onchain tools.

## tokenType

This function is to detect the type and subTypes of a given token contract address on the Ethereum blockchain.

### Usage

```typescript
import { tokenType } from "@token-kit/onchain";

const client = YOUR_VIEM_CLIENT;

const result = await tokenType("TOKEN_ADDRESS", client);
```

The `tokenType` function returns an object with the following structure:

```typescript
{
   type: string;
   subTypes?: string[];
   scriptURI?: string[];
}
```

For `type`, this function supports the following types:

- ERC20
- ERC721
- ERC1155
- Unknown: If the contract doesn't match any of the above standards

For `subTypes`, it supports the following types:

- ERC5169
- IERC721TokenReceiver
- IERC721Metadata
- IERC721Enumerable
- IERC1155TokenReceiver
- IERC1155Metadata_URI

For ERC5169 tokens, the function will return the `scriptURI` if available.

### Error Handling

If an error occurs during the detection process, the function will return `{ type: "Unknown" }`.

### Dependencies

This module requires `viem` library to interact with the Ethereum blockchain.

## tokenData

This function is to get on-chain data for a given token (ERC20/ERC721/ERC1155), it will optionally fetch token metadata or Opensea contract metadata if exists.

### Usage

```typescript
import { tokenData } from "@token-kit/onchain";

const client = YOUR_VIEM_CLIENT;
const options: TokenDataOptions = {
   ...
}

const result = await tokenData(
  client,
  "TOKEN_ADDRESS",
  "TOKEN_ID", // only required for ERC721 and ERC1155 token
  options, // optional
);
```

The `tokenData` function returns an object depends on the token type:

```typescript
ERC20TokenData {
  type: TokenType;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
}

ERC721TokenData {
  type: TokenType;
  owner: `0x${string}`;
  tokenURI: string;
  tokenMetadata?: unknown; // parsed json result
  contractMetadata?: unknown; // parsed json result
}

ERC1155TokenData {
  type: TokenType;
  uri: string;
  tokenMetadata?: unknown; // parsed json result
  contractMetadata?: unknown; // parsed json result
}
```

For `options`

| option                                            | description                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `includeTokenMetadata: boolean`                   | optional, control whether token metadata will be fetched, metadata source is decided by token type, it will use `tokenURI` value for ERC721, and `uri` value for ERC1155                                                                                                                                                                                                                                                       |
| `includeContractMetadata: boolean`                | optional, control whether try to load Opensea contract-level metadata. Note. this is not part of the token metadata, if the provided token contract doesn't implement the function, it will be null                                                                                                                                                                                                                            |
| `fetchHandler: (uri: string) => Promise<unknown>` | optional, if you need to load metadata with custom network protocol, or process the raw metadata, this option will allow you to override the default fetch handler, provided function needs to take the metadata uri (for both token or contract-level), and return the result as a JSON object. Note: default metadata fetch handler will handle https / ipfs (using `gateway.pinata.cloud` ifps gateway) based metadata uri. |

### Error Handling

If the token type of the provided address cannot be identified, it throws return error

### Dependencies

This module requires `viem` library to interact with the Ethereum blockchain.
