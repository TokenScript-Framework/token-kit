import { useReadContracts } from "wagmi";
import { ERC1155_ABI } from "@token-kit/onchain";

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
  const { data, status } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        chainId,
        address: contract,
        abi: ERC1155_ABI,
        functionName: "balanceOf",
        args: [owner, BigInt(tokenId!)],
      },
    ],
  });

  if (status !== "success") {
    return { status, isAllowed: undefined };
  }

  const result = data[0] as { result: string };
  const amountBigInt = BigInt(amount!) * BigInt(10 ** 18);
  const isAllowed = BigInt(result.result) > BigInt(amountBigInt);

  return { status, isAllowed };
}
