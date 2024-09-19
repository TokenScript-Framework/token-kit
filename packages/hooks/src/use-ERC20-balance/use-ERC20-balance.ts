import { erc20Abi, formatUnits } from "viem";
import { useReadContracts } from "wagmi";

export type UseERC20BalanceInput = {
  chainId: number;
  contract: `0x${string}`;
  wallet: `0x${string}`;
};

export type UseERC20BalanceReturn =
  | {
      status: "error" | "pending";
      data?: undefined;
    }
  | {
      status: "success";
      data: {
        formatted: string;
        name: string;
        symbol: string;
        decimals: number;
        balance: bigint;
      };
    };

/**
 * Custom hook that fetches the balance of an ERC20 token.
 * @param {UseERC20BalanceInput} input - The input object containing the chainId, contract address, and wallet address.
 * @returns {UseERC20BalanceReturn} The return object containing the status and data of the ERC20 balance.
 * @public
 * @example
 * ```tsx
 * const { value, setTrue, setFalse, toggle } = useERC20Balance({
 *   chainId: 1,
 *   contract: "0xdac17f958d2ee523a2206206994597c13d831ec7",
 *   wallet: "0x04B07Ab1970898FF7e4e6a487530515129deF530",
 * });
 * ```
 */
export function useERC20Balance({
  chainId,
  contract,
  wallet,
}: UseERC20BalanceInput): UseERC20BalanceReturn {
  const { data, status } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        chainId: chainId,
        address: contract,
        abi: erc20Abi,
        functionName: "name",
      },
      {
        chainId: chainId,
        address: contract,
        abi: erc20Abi,
        functionName: "symbol",
      },
      {
        chainId: chainId,
        address: contract,
        abi: erc20Abi,
        functionName: "decimals",
      },
      {
        chainId: chainId,
        address: contract,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [wallet],
      },
    ],
  });

  if (status === "pending" || status === "error") {
    return { status };
  }

  const [name, symbol, decimals, balance] = data;

  return {
    status,
    data: {
      formatted: formatUnits(balance, decimals),
      name,
      symbol,
      decimals,
      balance,
    },
  };
}
