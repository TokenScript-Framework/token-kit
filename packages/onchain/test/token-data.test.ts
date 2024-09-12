import test from "ava";
import { getRPCURL } from "./_utils";
import { createPublicClient, http, PublicClient } from "viem";

import { mainnet } from "viem/chains";
import { tokenData } from "../src/token-data";
import { ERC20TokenData } from "../src/constant";

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
