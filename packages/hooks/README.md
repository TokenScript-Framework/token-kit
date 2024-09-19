# hooks

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
