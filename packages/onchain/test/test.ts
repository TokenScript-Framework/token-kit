import { tokenType } from "../src/token-type";
import test from "ava";
import { getRPCURL } from "./_utils";
import { createPublicClient, http, PublicClient } from "viem";

import { baseSepolia, mainnet, sepolia } from "viem/chains";

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
    result.subTypes,
    ["ERC5169", "IERC721Metadata"],
    "Should support these interfaces.",
  );
  t.truthy(result.scriptURI, "scriptURI should not be empty");
});

test("test unknown type on Sepolia", async (t) => {
  const client = createPublicClient({
    chain: sepolia,
    transport: http(getRPCURL(11155111)),
  });

  const result = await tokenType(
    "0xd52CE4582d4F1De01643C82A516C1192f3Bd9B25",
    client as PublicClient,
  );

  t.is(result.type, "Unknown Type", "Should return Unknown Type.");
  t.is(result.subTypes, undefined, "subTypes should be undefined for ERC20");
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

  t.is(result.type, "ERC1155", "Should return ERC1155.");
  t.is(result.subTypes, undefined, "subTypes should be undefined for ERC20");
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

  t.is(result.type, "ERC20", "Should return ERC20.");
  t.is(result.subTypes, undefined, "subTypes should be undefined for ERC20");
});

test("test ERC1155 on BaseSepolia", async (t) => {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(getRPCURL(84532)),
  });

  const result = await tokenType(
    "0xcaD7587a5072CB8dF1E20aeB9B7816e41A756c48",
    client as PublicClient,
  );

  t.is(result.type, "ERC1155", "Should return ERC1155.");
  t.deepEqual(
    result.subTypes,
    ["IERC1155Metadata_URI"],
    "Should support these interfaces.",
  );
  t.is(
    result.scriptURI,
    undefined,
    "scriptURI should be undefined for this token",
  );
});

test("test ERC721 on BaseSepolia", async (t) => {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(getRPCURL(84532)),
  });

  const result = await tokenType(
    "0xCd5eF176A4Af5CbEfC6F72F478726E882C49b1D7",
    client as PublicClient,
  );

  t.is(result.type, "ERC721", "Should return ERC721.");
  t.deepEqual(
    result.subTypes,
    ["IERC721Metadata", "IERC721Enumerable"],
    "Should support these interfaces.",
  );
  t.is(
    result.scriptURI,
    undefined,
    "scriptURI should be undefined for this token",
  );
});
