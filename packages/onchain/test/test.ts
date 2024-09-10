import { tokenType } from "../src/token-type";
import test from "ava";
import { getRPCURL } from "./_utils";
import { createPublicClient, http, PublicClient } from "viem";

import { mainnet, sepolia } from "viem/chains";

test("test ERC721 on Sepolia", async (t) => {
  const client = createPublicClient({
    chain: sepolia,
    transport: http(getRPCURL(11155111)),
  });

  const result = await tokenType(
    "0x3490ffc64a4e65abb749317f7860e722ba65a2b5",
    client as PublicClient,
  );

  t.is(result.type, "ERC721", "Should return ERC721.");
  t.deepEqual(
    result.supportedInterfaces,
    ["IERC721Metadata"],
    "Should support these interfaces.",
  );
});

test("test ERC1155 on Mainnet", async (t) => {
  const client = createPublicClient({
    chain: mainnet,
    transport: http(getRPCURL(1)),
  });

  const result = await tokenType(
    "0x73da73ef3a6982109c4d5bdb0db9dd3e3783f313",
    client as PublicClient,
  );

  t.is(result.type, "Unknow Type", "Should return Unknow Type.");
});

test("test ERC20 on Mainnet", async (t) => {
  const client = createPublicClient({
    chain: mainnet,
    transport: http(getRPCURL(1)),
  });

  const result = await tokenType(
    "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    client as PublicClient,
  );

  t.is(result.type, "Unknow Type", "Should return Unknow Type.");
});
