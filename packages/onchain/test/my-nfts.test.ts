import test from "ava";
import { getRPCURL } from "./_utils";
import { createPublicClient, http, PublicClient } from "viem";

import { baseSepolia, polygon } from "viem/chains";
import { MyNfts } from "../src/constant";
import { myNfts } from "../src/my-nfts";

/*
 * test ERC721 enumberable token with metadata
 * https://sepolia.basescan.org/address/0x250eb01a55d7E462ad478465581344521B01CD6b
 * 0xae749AE248d9c7014b6a2E951542cdAa619e14C1 owns 3 tokens of 0, 1, 2
 */
test("should get all user tokens for an erc721 enumerable token", async (t) => {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(getRPCURL(84532)),
  });

  const results = (await myNfts(
    client as PublicClient,
    "0x250eb01a55d7E462ad478465581344521B01CD6b",
    0n,
  )) as MyNfts;

  t.like(results, {
    owner: "0xae749AE248d9c7014b6a2E951542cdAa619e14C1",
    tokens: [
      {
        tokenId: 0n,
        tokenURI: "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/0",
      },
      {
        tokenId: 1n,
        tokenURI: "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/0",
      },
      {
        tokenId: 2n,
        tokenURI: "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/0",
      },
    ],
  });
});

test("should get all user tokens with metadata", async (t) => {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(getRPCURL(84532)),
  });

  const results = (await myNfts(
    client as PublicClient,
    "0x250eb01a55d7E462ad478465581344521B01CD6b",
    0n,
    { includeTokenMetadata: true },
  )) as MyNfts;

  t.truthy(results.tokens[0].tokenMetadata);
  t.truthy(results.tokens[1].tokenMetadata);
  t.truthy(results.tokens[2].tokenMetadata);
});

test("should throw error if token is not enumberable erc721", async (t) => {
  const client = createPublicClient({
    chain: polygon,
    transport: http(getRPCURL(137)),
  });

  const error = await t.throwsAsync(
    async () =>
      await myNfts(
        client as PublicClient,
        "0xD5cA946AC1c1F24Eb26dae9e1A53ba6a02bd97Fe", // Smart Cat
        1997912245n,
      ),
  );

  t.is(error.message, "Only support Enumberable ERC721 token");
});
