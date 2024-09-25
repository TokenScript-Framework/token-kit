import { erc721Abi } from "viem";
import { useReadContract } from "wagmi";

export type UseOwnerInput = {
  chainId: number;
  contract: `0x${string}`;
  tokenId: string;
};

export type UseOwnerReturn =
  | {
      status: "error" | "loading";
      data?: undefined;
    }
  | {
      status: "success";
      data: `0x${string}`;
    };

export function useOwner({
  chainId,
  contract,
  tokenId,
}: UseOwnerInput): UseOwnerReturn {
  const result = useReadContract({
    chainId,
    address: contract,
    abi: erc721Abi,
    functionName: "ownerOf",
    args: [BigInt(tokenId)],
  });

  if (!result || result.status === "pending" || result.status === "error") {
    return { status: result?.status === "pending" ? "loading" : "error" };
  }

  return result;
}
