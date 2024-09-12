import { erc20Abi, erc721Abi, PublicClient } from "viem";
import {
  ERC1155TokenData,
  ERC20TokenData,
  ERC721TokenData,
  TokenDataOptions,
  TokenTypes,
} from "./constant";
import { tokenType } from "./token-type";
import { ERC1155_ABI } from "./abi";

const defaultOptions: TokenDataOptions = {
  includeTokenMetadata: false,
  includeContractMetadata: false,
};

export async function tokenData(
  client: PublicClient,
  address: `0x${string}`,
  tokenId?: number | bigint,
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
    case TokenTypes.ERC721: {
      const onChainData = await fetchERC721TokenData(
        client,
        address,
        normalizeTokenId(tokenId),
      );
      return {
        type,
        ...onChainData,
      };
    }
    case TokenTypes.ERC1155: {
      const onChainData = await fetchERC1155TokenData(
        client,
        address,
        normalizeTokenId(tokenId),
      );
      return {
        type,
        ...onChainData,
      };
    }
    default:
      throw new Error("Unsupported token type");
  }
}

function normalizeTokenId(tokenId: number | bigint) {
  if (!["bigint", "number"].includes(typeof tokenId))
    throw new Error("tokenId number is required for ERC721");
  return BigInt(tokenId);
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

  // PublicClient.multicall has type inference issue, need to revisit later
  const results = await Promise.all(contracts.map(client.readContract));

  return {
    name: results[0] as string,
    symbol: results[1] as string,
    decimals: Number(results[2]),
    totalSupply: Number(results[3]),
  };
}

async function fetchERC721TokenData(
  client: PublicClient,
  address: `0x${string}`,
  tokenId: bigint,
) {
  const contractBase = {
    address,
    abi: erc721Abi,
  } as const;

  const contracts = [
    {
      ...contractBase,
      functionName: "ownerOf" as const,
      args: [tokenId],
    },
    {
      ...contractBase,
      functionName: "tokenURI" as const,
      args: [tokenId],
    },
  ] as const;

  // PublicClient.multicall has type inference issue, need to revisit later
  const results = await Promise.all(contracts.map(client.readContract));

  return {
    owner: results[0] as `0x${string}`,
    tokenURI: results[1] as string,
  };
}

async function fetchERC1155TokenData(
  client: PublicClient,
  address: `0x${string}`,
  tokenId: bigint,
) {
  const contractBase = {
    address,
    abi: ERC1155_ABI,
  } as const;

  const contracts = [
    {
      ...contractBase,
      functionName: "uri" as const,
      args: [tokenId],
    },
  ] as const;

  // PublicClient.multicall has type inference issue, need to revisit later
  const results = await Promise.all(contracts.map(client.readContract));

  return {
    uri: results[0] as `0x${string}`,
  };
}
