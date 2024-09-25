import { erc721Abi } from "viem";
import { useReadContracts } from "wagmi";

export type UseERC721AllowanceInput = {
  chainId: number;
  contract: `0x${string}`;
  owner: `0x${string}`;
  tokenId: string;
};

export type UseERC721AllowanceReturn = {
  status: "error" | "pending" | "success";
  isAllowed: boolean | undefined;
};

export function useERC721Allowance({
  chainId,
  contract,
  owner,
  tokenId,
}: UseERC721AllowanceInput): UseERC721AllowanceReturn {
  const { data, status } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        chainId,
        address: contract,
        abi: erc721Abi,
        functionName: "ownerOf",
        args: [BigInt(tokenId!)],
      },
    ],
  });

  if (status !== "success") {
    return { status, isAllowed: undefined };
  }

  const isAllowed = (data[0] as string).toLowerCase() === owner.toLowerCase();

  return { status, isAllowed };
}
