import test from "ava";
import { getRPCURL } from "./_utils";
import { createPublicClient, http, PublicClient } from "viem";

import { mainnet } from "viem/chains";
import { tokenData } from "../src/token-data";
import {
  ERC1155TokenData,
  ERC20TokenData,
  ERC721TokenData,
} from "../src/constant";

test("ERC20 - should return token data with type", async (t) => {
  const client = createPublicClient({
    chain: mainnet,
    transport: http(getRPCURL(1)),
  });

  const result = (await tokenData(
    client as PublicClient,
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
  )) as ERC20TokenData;

  t.like(result, {
    type: {
      type: "ERC20",
    },
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
  });
  t.truthy(result.totalSupply, "totalSupply should not be empty");
});

test("ERC721 - should return token data with type", async (t) => {
  const client = createPublicClient({
    chain: mainnet,
    transport: http(getRPCURL(1)),
  });

  const result = (await tokenData(
    client as PublicClient,
    "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d", // BAYC
    1,
  )) as ERC721TokenData;

  t.truthy(result.owner);
  t.truthy(result.tokenURI);
  t.deepEqual(result.type, {
    type: "ERC721",
    subTypes: ["IERC721Metadata", "IERC721Enumerable"],
  });
});

test("ERC1155 - should return token data with type", async (t) => {
  const client = createPublicClient({
    chain: mainnet,
    transport: http(getRPCURL(1)),
  });

  const result = (await tokenData(
    client as PublicClient,
    "0x3e34ff1790bf0a13efd7d77e75870cb525687338",
    1,
  )) as ERC1155TokenData;

  t.truthy(result.uri);
  t.deepEqual(result.type, {
    type: "ERC1155",
    subTypes: ["IERC1155Metadata_URI"],
  });
});
