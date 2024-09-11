# @token-kit/onchain

This module provides some onchain tools.

## tokenType

This function is to detect the type of a given token contract address on the Ethereum blockchain.

### Usage

```typescript
import { tokenType } from "@token-kit/onchain";

const client = YOUR_VIEM_CLIENT;

const result = await tokenType("TOKEN_ADDRESS", client);
```

### Return Value

The `tokenType` function returns an object with the following structure:

```typescript
{
   type: string;
   subType?: string[];
}
```

### Supported Token Types

- ERC20
- ERC721
- ERC1155
- ERC5169
- Unknown Type: If the contract doesn't match any of the above standards

### Error Handling

If an error occurs during the detection process, the function will return `{ type: "Unknown Type" }`.

### Dependencies

This module requires `viem` library to interact with the Ethereum blockchain.
