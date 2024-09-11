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
- Unknown Type: If the contract doesn't match any of the above standards

For `scriptURI`, it supports the following types:

- ERC5169
- IERC721TokenReceiver
- IERC721Metadata
- IERC721Enumerable
- IERC1155TokenReceiver
- IERC1155Metadata_URI

For ERC5169 tokens, the function will return the `scriptURI` if available.

### Error Handling

If an error occurs during the detection process, the function will return `{ type: "Unknown Type" }`.

### Dependencies

This module requires `viem` library to interact with the Ethereum blockchain.
