# @token-kit/ui

## build

```sh
npm run build
```

## Components

### Token Card

```jsx
// ERC 20
<TokenCard
  type="ERC20"
  chainId={1}
  contract="0xdac17f958d2ee523a2206206994597c13d831ec7"
  wallet="0x04B07Ab1970898FF7e4e6a487530515129deF530"
/>;

// ERC721
<TokenCard
  type="ERC721"
  chainId={137}
  tokenId="1649017156"
  contract="0xD5cA946AC1c1F24Eb26dae9e1A53ba6a02bd97Fe"
/>;

// ERC1155
<TokenCard
  type="ERC1155"
  chainId={1}
  tokenId="1"
  contract="0x73da73ef3a6982109c4d5bdb0db9dd3e3783f313"
/>;
```

### Token Thumbnail

```jsx
<TokenThumbnail
  token={{
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    name: "Tether USD",
    chainId: 1,
    logoURI:
      "https://assets.coingecko.com/coins/images/325/standard/Tether.png?1696501661",
    verified: true,
  }}
/>
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
