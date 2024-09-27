import { useReadContract } from "wagmi";
import { ERC1155_ABI } from "@token-kit/onchain";
import { formatEther } from "viem";

export type UseERC1155AllowanceInput = {
  chainId: number;
  contract: `0x${string}`;
  owner: `0x${string}`;
  amount: string;
  tokenId: string;
};

export type UseERC1155AllowanceReturn = {
  status: "error" | "pending" | "success";
  isAllowed: boolean | undefined;
};

export function useERC1155Allowance({
  chainId,
  contract,
  owner,
  tokenId,
  amount,
}: UseERC1155AllowanceInput): UseERC1155AllowanceReturn {
  const { data, status } = useReadContract({
    chainId,
    address: contract,
    abi: ERC1155_ABI,
    functionName: "balanceOf",
    args: [owner, BigInt(tokenId!)],
  });

  if (status !== "success") {
    return { status, isAllowed: undefined };
  }
  const balance = formatEther(data);
  const isAllowed = Number(balance) > Number(amount);

  return { status, isAllowed };
}
