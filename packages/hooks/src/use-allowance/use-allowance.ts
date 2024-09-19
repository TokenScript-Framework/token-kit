import { erc1155Abi } from "../libs/abi";
import { erc20Abi, erc721Abi } from "viem";
import { useReadContracts } from "wagmi";

export type UseAllowanceInput = {
  chainId: number;
  tokenType: "ERC20" | "ERC721" | "ERC1155";
  contract: `0x${string}`;
  owner: `0x${string}`;
  spender: `0x${string}`;
} & (
  | {
      tokenType: "ERC20";
      amount: string;
      spender: `0x${string}`;
      tokenId?: string;
    }
  | {
      tokenType: "ERC721" | "ERC1155";
      amount?: string;
      spender?: `0x${string}`;

      tokenId: string;
    }
);

export type UseAllowanceReturn = {
  status: "error" | "pending" | "success";
  isAllowed: boolean | undefined;
};

export function useAllowance({
  chainId,
  tokenType,
  contract,
  owner,
  spender,
  tokenId,
  amount,
}: UseAllowanceInput): UseAllowanceReturn {
  const { data, status } = useReadContracts({
    allowFailure: false,
    contracts:
      tokenType === "ERC20"
        ? [
            {
              chainId,
              address: contract,
              abi: erc20Abi,
              functionName: "allowance",
              args: [owner, spender],
            },
            {
              chainId,
              address: contract,
              abi: erc20Abi,
              functionName: "balanceOf",
              args: [owner],
            },
            {
              chainId,
              address: contract,
              abi: erc20Abi,
              functionName: "decimals",
            },
          ]
        : tokenType === "ERC721"
          ? [
              {
                chainId,
                address: contract,
                abi: erc721Abi,
                functionName: "ownerOf",
                args: [BigInt(tokenId!)],
              },
            ]
          : [
              {
                chainId,
                address: contract,
                abi: erc1155Abi,
                functionName: "balanceOf",
                args: [owner, BigInt(tokenId!)],
              },
            ],
  });

  if (status !== "success") {
    return { status, isAllowed: undefined };
  }

  let isAllowed: boolean;

  const result = data[0] as { result: unknown };
  if (tokenType === "ERC20") {
    const allowance = data[0] as bigint;
    const balance = data[1] as bigint;
    const actualDecimals = data[2] as number;
    const amountBigInt = BigInt(amount!) * BigInt(10 ** actualDecimals);
    isAllowed = balance >= amountBigInt && allowance >= amountBigInt;
  } else if (tokenType === "ERC721") {
    isAllowed = (data[0] as string).toLowerCase() === owner.toLowerCase();
  } else {
    isAllowed = BigInt(result.result as string) > BigInt(0);
  }

  return { status, isAllowed };
}
