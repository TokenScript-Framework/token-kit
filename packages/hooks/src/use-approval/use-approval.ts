import { erc1155Abi } from "../libs/abi";
import { Abi, erc721Abi } from "viem";
import { useReadContracts } from "wagmi";

export type UseApprovalInput = {
  chainId: number;
  contract: `0x${string}`;
  owner: `0x${string}`;
  operator: `0x${string}`;
} & (
  | {
      tokenType: "ERC721";
      tokenId: string;
    }
  | {
      tokenType: "ERC1155";
      tokenId?: string;
    }
);

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

  const contracts =
    tokenType === "ERC721"
      ? [
          {
            ...baseContract,
            abi: erc721Abi,
            functionName: "getApproved",
            args: [tokenId],
          },
          {
            ...baseContract,
            abi: erc721Abi,
            functionName: "isApprovedForAll",
            args: [owner, operator],
          },
        ]
      : [
          {
            ...baseContract,
            abi: erc1155Abi,
            functionName: "isApprovedForAll",
            args: [owner, operator],
          },
        ];

  const { data: results, isLoading } = useReadContracts({
    contracts: contracts as readonly {
      abi: Abi;
      address: `0x${string}`;
      functionName: string;
      chainId: number;
      args: readonly unknown[];
    }[],
  });

  if (isLoading || !results || results.some((result) => !result)) {
    return { status: "loading" };
  }
  const isApproved = (
    tokenType === "ERC721" && tokenId
      ? results[0].result === operator || Boolean(results[1].result)
      : Boolean(results[0].result)
  ) as boolean;

  return {
    status: "success",
    data: { isApproved },
  };
}
