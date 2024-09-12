import { erc20Abi, PublicClient } from "viem";
import {
  ERC1155TokenData,
  ERC20TokenData,
  ERC721TokenData,
  TokenDataOptions,
  TokenTypes,
} from "./constant";
import { tokenType } from "./token-type";

const defaultOptions: TokenDataOptions = {
  includeTokenMetadata: false,
  includeContractMetadata: false,
};

export async function tokenData(
  client: PublicClient,
  address: `0x${string}`,
  tokenId?: string,
  options?: TokenDataOptions,
): Promise<ERC20TokenData | ERC721TokenData | ERC1155TokenData> {
  const opts = { ...defaultOptions, ...options };
  const type = await tokenType(address, client);

  switch (type.type) {
    case TokenTypes.ERC20: {
      const onChainData = await fetchERC20TokenData(client, address);
      return {
        type,
        ...onChainData,
      };
    }
    case TokenTypes.ERC721:
      return {} as ERC721TokenData;
    case TokenTypes.ERC1155:
      return {} as ERC1155TokenData;
  }
}

async function fetchERC20TokenData(
  client: PublicClient,
  address: `0x${string}`,
) {
  const contractBase = {
    address,
    abi: erc20Abi,
  } as const;

  const contracts = [
    {
      ...contractBase,
      functionName: "name" as const,
    },
    {
      ...contractBase,
      functionName: "symbol" as const,
    },
    {
      ...contractBase,
      functionName: "decimals" as const,
    },
    {
      ...contractBase,
      functionName: "totalSupply" as const,
    },
  ] as const;

  const results = await Promise.all(contracts.map(client.readContract));

  return {
    name: results[0] as string,
    symbol: results[1] as string,
    decimals: Number(results[2]),
    totalSupply: Number(results[3]),
  };
}
