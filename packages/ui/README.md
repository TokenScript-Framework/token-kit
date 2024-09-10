# Token kit

## build

```sh
npm run rollup
```

## Components

### Token Card

```jsx
import { TokenCard } from "token-kit";

// ERC 20
<TokenCard
  type="ERC20"
  chainId={1}
  contract="0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
  wallet="0x0000000000000000000000000000000000000000"
  onClick={() => void}
/>;

// ERC 721/1155
<TokenCard
  type="ERC721"
  chainId={137}
  contract="0xd5ca946ac1c1f24eb26dae9e1a53ba6a02bd97fe"
  tokenId="1202370524"
  onClick={() => void}
/>;
```

## React Hooks

### useTsMetadata

get tokenscript file metadata

```ts
import { useTsMetadata } from "token-kit";

const { tsMetadata, isChecking } = useTsMetadata({
  chainId,
  contract,
  options,
});
```

## Libraries

### Ethereum

#### Get Tokenscript File Metadata

```ts
import { getTokenscriptMetadata, TsMetadata } from "token-kit";

const tsMetadata: TsMetadata = await getTokenscriptMetadata(
  137,
  "0xd5ca946ac1c1f24eb26dae9e1a53ba6a02bd97fe",
  options,
);
```

the function will always return name and meta info of the tokenscript file, and by default it will return all the supported query options. However, you can also fine-grained control the queried data by passing the `options` argument.

| options                  | tsMetadata            |
| ------------------------ | --------------------- |
| `{checkSignature: true}` | `{signed: boolean}`   |
| `{actions: true}`        | `{actions: string[]}` |
