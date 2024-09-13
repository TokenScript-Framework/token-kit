# @token-kit/og

Generate open graph image for tokens. This package can be used in hono or nextjs app.

Forked from [hono-og](https://github.com/wevm/hono-og).

## Installation

```sh
npm i @token-kit/og
```

## Usage

```ts
import axios from "axios";
import { ethers } from "ethers";
import { Hono } from "hono";

import { ImageResponse } from "@token-kit/og";

const app = new Hono();

const chainId = 185;
const contract = "0x80A6da00140C4798bAba3b3f362839b6f87b6fc6";
const tokenId = 1;
const provider = new ethers.JsonRpcProvider(
  "https://global.rpc.mintchain.io",
  chainId,
  { staticNetwork: true },
);
const imageUrl =
  "https://resources.smartlayer.network/smart-token-store/images/mint/suitup/smart-cat/assets/ed48be3a1c4bbfbee857304337947ad5.png";
const imgBuffer: Buffer = await axios
  .get(imageUrl, {
    responseType: "arraybuffer",
  })
  .then((response) => response.data);

app.get("/", () => {
  return new ImageResponse({
    provider: provider,
    chainId,
    contract,
    imgBuffer,
    context: { tokenId: tokenId.toString() },
  });
});
```
