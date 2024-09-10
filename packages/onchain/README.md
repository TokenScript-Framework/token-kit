# Token Type

This module provides a `tokenType` function to detect the type of a given token contract address on the Ethereum blockchain.

## Usage

```typescript
import { tokenType } from "@token-kit/onchain";

const provider = YOUR_PROVIDER;

const result = await tokenType("TOKEN_ADDRESS", provider);
```

## Return Value

The `tokenType` function returns an object with the following structure:

```typescript
{
   type: string;
   supportedInterfaces?: string[];
}
```

## Supported Token Types

- ERC20
- ERC721
- ERC1155
- ERC5169
- Unknown Type: If the contract doesn't match any of the above standards

## Error Handling

If an error occurs during the detection process, the function will return `{ type: "Unknown Type" }`.

## Dependencies

This module requires `ethers` library to interact with the Ethereum blockchain.
