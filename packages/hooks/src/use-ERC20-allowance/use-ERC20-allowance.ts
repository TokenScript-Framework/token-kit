import { erc20Abi } from "viem";
import { useReadContracts } from "wagmi";

export type UseERC20AllowanceInput = {
  chainId: number;
  contract: `0x${string}`;
  owner: `0x${string}`;
  spender: `0x${string}`;
  amount: string;
};

export type UseERC20AllowanceReturn = {
  status: "error" | "pending" | "success";
  isAllowed: boolean | undefined;
};

export function useERC20Allowance({
  chainId,
  contract,
  owner,
  spender,
  amount,
}: UseERC20AllowanceInput): UseERC20AllowanceReturn {
  const { data, status } = useReadContracts({
    allowFailure: false,
    contracts: [
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
    ],
  });

  if (status !== "success") {
    return { status, isAllowed: undefined };
  }

  const allowance = data[0] as bigint;
  const balance = data[1] as bigint;
  const actualDecimals = data[2] as number;
  const amountBigInt = BigInt(amount!) * BigInt(10 ** actualDecimals);
  const isAllowed = balance >= amountBigInt && allowance >= amountBigInt;

  return { status, isAllowed };
}
