# @token-kit/hooks

## useAllowance

A custom React hook that detect the wallet address has allowance to operate the token, it suports ERC20, ERC721, ERC1155.

### Usage

```tsx
function TokenAllowance() {
  const { status as ERC20Status, data as ERC20Data } = useAllowance({
    chainId: 1,
    contract: "0xdac17f958d2ee523a2206206994597c13d831ec7", // ERC20 contract address
    tokenType: "ERC20",
    owner: "0x1234567890123456789012345678901234567890",
    spender: "0x9876543210987654321098765432109876543210",
    amount: "2",
  });

  const { status as ERC721Status, data as ERC721Data } = useAllowance({
    chainId: 1,
    contract: "0xdac17f958d2ee523a2206206994597c13d831ec7", // ERC721 contract address
    tokenType: "ERC721",
    owner: "0x1234567890123456789012345678901234567890",
    tokenId: "1",
  });

  const { status as ERC1155Status, data as ERC1155Data } = useAllowance({
    chainId: 1,
    contract: "0xdac17f958d2ee523a2206206994597c13d831ec7", // ERC1155 contract address
    tokenType: "ERC20",
    owner: "0x1234567890123456789012345678901234567890",
    tokenId: "2",
  });


  return (
    <div>
      <p>isAllowed: {data.isAllowed}</p>
    </div>
  );
}
```

#### Input

The `useAllowance` hook accepts an object with the following properties:

| Property   | Type          | Description                                        |
| ---------- | ------------- | -------------------------------------------------- |
| chainId    | number        | The ID of the blockchain network                   |
| contract   | `0x${string}` | The ERC20 token contract address                   |
| tokenType  | string        | The token type, it supports ERC20, ERC721, ERC1155 |
| owner      | `0x${string}` | The owner address of the token                     |
| spender    | `0x${string}` | The spender address to check the allowance for     |
| tokenId    | string        | The token Id, userd for ERC721 or ERC1155          |
| amount     | string        | The amount, used for ERC20                         |

#### Return Value

The hook returns an object with the following structure:

```typescript
| {
    status: 'error' | 'pending'
    data?: undefined
  }
| {
    status: 'success'
    data: {
      isAllowed: string
    }
  }
```

## useApproval

A custom React hook that detect whether the operator is approved to opertrate for the token.

### Usage

```tsx
function TokenApproval() {
  const { status, data } = useApproval({
    chainId: 1,
    contract: "0xdac17f958d2ee523a2206206994597c13d831ec7", // Contract address
    owner: "0x04B07Ab1970898FF7e4e6a487530515129deF530", // Owner address
    operator: "0x04B07Ab1970898FF7e4e6a487530515129deF530", // Operator address
    tokenType: "ERC1155",  // Token type, it can be ERC721 or ERC1155, if the type is ERC721, you should also add tokenId into params
  });

  if (status === "pending") return <div>Loading...</div>;
  if (status === "error") return <div>Error fetching balance</div>;

  return (
    <div>
      <p>isApproved: {data.isApproved}</p>
    </div>
  );
}
```

#### Input

The `useApproval` hook accepts an object with the following properties:

| Property   | Type          | Description                                 |
| ---------- | ------------- | ------------------------------------------- |
| chainId    | number        | The ID of the blockchain network            |
| contract   | `0x${string}` | The token contract address            |
| owner      | `0x${string}` | The token owner address   |
| operator   | `0x${string}` | The operator address to check the approval for |
| tokenId    | string        | The token Id |
| tokenType  | string        | The token type, it supports ERC721, ERC1155 |

#### Return Value

The hook returns an object with the following structure:

```typescript
| {
    status: 'error' | 'pending'
    data?: undefined
  }
| {
    status: 'success'
    data: {
      isApproved: boolean
    }
  }
```

## useERC20Balance

A custom React hook that fetches the balance of an ERC20 token for a given wallet address, together with the token's name, symbol, and decimals.

### Usage

```tsx
function TokenBalance() {
  const { status, data } = useERC20Balance({
    chainId: 1,
    contract: "0xdac17f958d2ee523a2206206994597c13d831ec7", // ERC20 contract address
    wallet: "0x04B07Ab1970898FF7e4e6a487530515129deF530", // Wallet address
  });

  if (status === "pending") return <div>Loading...</div>;
  if (status === "error") return <div>Error fetching balance</div>;

  return (
    <div>
      <p>Token Name: {data.name}</p>
      <p>Symbol: {data.symbol}</p>
      <p>
        Balance: {data.formatted} {data.symbol}
      </p>
    </div>
  );
}
```

#### Input

The `useERC20Balance` hook accepts an object with the following properties:

| Property | Type          | Description                                 |
| -------- | ------------- | ------------------------------------------- |
| chainId  | number        | The ID of the blockchain network            |
| contract | `0x${string}` | The ERC20 token contract address            |
| wallet   | `0x${string}` | The wallet address to check the balance for |

#### Return Value

The hook returns an object with the following structure:

```typescript
| {
    status: 'error' | 'pending'
    data?: undefined
  }
| {
    status: 'success'
    data: {
      formatted: string
      name: string
      symbol: string
      decimals: number
      balance: bigint
    }
  }
```

## useOwner

A custom React hook that fetches the owner of a token.

### Usage

```tsx
function TokenOwner() {
  const { status, data } = useOwner({
    chainId: 1,
    contract: "0xdac17f958d2ee523a2206206994597c13d831ec7", // Contract address
    tokenId: "1", // Token Id
  });

  if (status === "pending") return <div>Loading...</div>;
  if (status === "error") return <div>Error fetching balance</div>;

  return (
    <div>
      <p>Token Owner: {data.owner}</p>
    </div>
  );
}
```

#### Input

The `useOwner` hook accepts an object with the following properties:

| Property | Type          | Description                                 |
| -------- | ------------- | ------------------------------------------- |
| chainId  | number        | The ID of the blockchain network            |
| contract | `0x${string}` | The token contract address                  |
| tokenId  | string        | The token Id to check the owner for         |

#### Return Value

The hook returns an object with the following structure:

```typescript
| {
    status: 'error' | 'pending'
    data?: undefined
  }
| {
    status: 'success'
    data: {
      owner: string
    }
  }
```
