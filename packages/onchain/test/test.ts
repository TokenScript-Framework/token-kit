import { isERC5169, isValidateToken } from "../src/token-type";
import test from "ava";
import { getProvider } from "./_utils";
const provider = getProvider(11155111);

test("test ERC721", async (t) => {
  t.true(
    await isValidateToken(
      "ERC721",
      "0x3490ffc64a4e65abb749317f7860e722ba65a2b5",
      provider
    ),
    "Should return true for a valid token"
  );

  t.false(
    await isValidateToken(
      "ERC721",
      "0xcaD7587a5072CB8dF1E20aeB9B7816e41A756c48",
      provider
    ),
    "Should return false for an invalid token"
  );
});

test("test ERC1155", async (t) => {
  t.false(
    await isValidateToken(
      "ERC1155",
      "0x3490ffc64a4e65abb749317f7860e722ba65a2b5",
      provider
    ),
    "Should return true for a invalid token"
  );
});

test("test ERC5169", async (t) => {
  t.true(
    await isERC5169("0x3490ffc64a4e65abb749317f7860e722ba65a2b5", provider),
    "Should return true for a valid token"
  );

  t.false(
    await isERC5169("0xcaD7587a5072CB8dF1E20aeB9B7816e41A756c48", provider),
    "Should return false for an invalid token"
  );
});
