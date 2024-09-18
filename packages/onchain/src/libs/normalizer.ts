export function normalizeTokenId(tokenId: number | bigint) {
  if (!["bigint", "number"].includes(typeof tokenId))
    throw new Error("tokenId number is required for ERC721");
  return BigInt(tokenId);
}
