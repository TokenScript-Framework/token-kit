import { tokenType } from "../src/token-type";
import test from "ava";
import { getProvider } from "./_utils";

test("test ERC721 on Sepolia", async (t) => {
  const provider = getProvider(11155111);
  const result = await tokenType(
    "0x3490ffc64a4e65abb749317f7860e722ba65a2b5",
    provider,
  );
  t.is(result.type, "ERC721", "Should return ERC721.");
  t.deepEqual(
    result.supportedInterfaces,
    ["IERC721", "IERC721Metadata"],
    "Should support these interfaces.",
  );
});

test("test ERC1155 on Mainnet", async (t) => {
  const provider = getProvider(1);
  const result = await tokenType(
    "0x73da73ef3a6982109c4d5bdb0db9dd3e3783f313",
    provider,
  );
  t.is(result.type, "ERC1155", "Should return ERC1155.");
  t.deepEqual(
    result.supportedInterfaces,
    ["IERC1155"],
    "Should support these interfaces.",
  );
});

test("test ERC20 on Mainnet", async (t) => {
  const provider = getProvider(1);
  const result = await tokenType(
    "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    provider,
  );
  t.is(result.type, "ERC20", "Should return ERC20.");
});
