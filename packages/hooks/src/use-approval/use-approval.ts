import { erc721Abi } from "viem";
import { useReadContracts } from "wagmi";
import { ERC1155_ABI } from "@token-kit/onchain";

export type UseApprovalInput = {
  chainId: number;
  contract: `0x${string}`;
  owner: `0x${string}`;
  operator: `0x${string}`;
  tokenId?: string;
  tokenType: "ERC721" | "ERC1155";
};

export type UseApprovalReturn =
  | {
      status: "error" | "loading";
      data?: undefined;
    }
  | {
      status: "success";
      data: { isApproved: boolean };
    };

export function useApproval({
  chainId,
  contract,
  tokenId,
  owner,
  operator,
  tokenType,
}: UseApprovalInput): UseApprovalReturn {
  const isERC721 = tokenType === "ERC721";
  const hasTokenId = tokenId !== undefined;


  const { data: results, isLoading } = useReadContracts({
    allowFailure: false,
    contracts:
      isERC721 && hasTokenId
        ? [
            {
              chainId,
              address: contract,
              abi: erc721Abi,
              functionName: "getApproved",
              args: [BigInt(tokenId)],
            },
            {
              chainId,
              address: contract,
              abi: isERC721 ? erc721Abi : ERC1155_ABI,
              functionName: "isApprovedForAll",
              args: [owner, operator],
            },
          ]
        : [
            {
              chainId,
              address: contract,
              abi: isERC721 ? erc721Abi : ERC1155_ABI,
              functionName: "isApprovedForAll",
              args: [owner, operator],
            },
          ],
  });

  if (isLoading || !results || results.some((result) => !result)) {
    return { status: "loading" };
  }
  const isApproved = (
    tokenType === "ERC721" && tokenId
      ? results[0] === operator || results[1]
      : results[0]
  ) as boolean;

  return {
    status: "success",
    data: { isApproved },
  };
}
