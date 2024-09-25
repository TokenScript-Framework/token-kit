import { Abi, erc721Abi } from "viem";
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
  const baseContract = {
    chainId,
    address: contract,
  };

  const isERC721 = tokenType === "ERC721";
  const hasTokenId = tokenId !== undefined;

  const isApprovedForAllContract = {
    ...baseContract,
    abi: isERC721 ? erc721Abi : ERC1155_ABI,
    functionName: "isApprovedForAll",
    args: [owner, operator],
  };

  const getApprovedContract = (
    chainId: number,
    contract: `0x${string}`,
    tokenId: string,
    abi: Abi,
  ) => {
    return {
      chainId,
      address: contract,
      abi: abi,
      functionName: "getApproved",
      args: [BigInt(tokenId)],
    };
  };

  const { data: results, isLoading } = useReadContracts({
    allowFailure: false,
    contracts:
      isERC721 && hasTokenId
        ? [
            getApprovedContract(chainId, contract, tokenId, erc721Abi),
            isApprovedForAllContract,
          ]
        : [isApprovedForAllContract],
  });

  if (isLoading || !results || results.some((result) => !result)) {
    return { status: "loading" };
  }
  const isApproved = (
    tokenType === "ERC721" && tokenId
      ? (results[0] as { result: `0x${string}` }).result === operator ||
        Boolean((results[1] as { result: boolean }).result)
      : Boolean((results[0] as { result: boolean }).result)
  ) as boolean;

  return {
    status: "success",
    data: { isApproved },
  };
}
