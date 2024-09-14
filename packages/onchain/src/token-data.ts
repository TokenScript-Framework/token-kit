import {
  ContractFunctionParameters,
  erc20Abi,
  erc721Abi,
  MulticallParameters,
  PublicClient,
} from "viem";
import {
  ERC1155TokenData,
  ERC20TokenData,
  ERC721TokenData,
  TokenDataOptions,
  TokenTypes,
} from "./constant";
import { ERC1155_ABI, OPENSEA_CONTRACT_URI_ABI } from "./libs/abi";
import { rewriteUrlIfIFPSUrl } from "./libs/url-rewrite";
import { tokenType } from "./token-type";
import { normalizeTokenId } from "./libs/normalizer";
import { initFetchHandler } from "./libs/fetch-handler";

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
  initFetchHandler(opts);
  const type = await tokenType(address, client);

  switch (type.type) {
    case TokenTypes.ERC20:
      return {
        type,
        ...(await fetchERC20TokenData(client, address)),
      };
    case TokenTypes.ERC721: {
      const result = {
        type,
        ...(await fetchERC721TokenData(
          client,
          address,
          normalizeTokenId(tokenId),
        )),
      } as ERC721TokenData;
      await enrichMetadata(client, address, result, opts, result.tokenURI);

      return result;
    }
    case TokenTypes.ERC1155: {
      const result = {
        type,
        ...(await fetchERC1155TokenData(
          client,
          address,
          normalizeTokenId(tokenId),
        )),
      } as ERC1155TokenData;
      await enrichMetadata(client, address, result, opts, result.uri);

      return result;
    }
    default:
      throw new Error("Unsupported token type");
  }
}

async function enrichMetadata(
  client: PublicClient,
  address: `0x${string}`,
  result: ERC721TokenData | ERC1155TokenData,
  opts: TokenDataOptions,
  tokenURI: string,
) {
  if (opts.includeTokenMetadata) {
    result.tokenMetadata = await opts.fetchHandler(tokenURI);
  }

  if (opts.includeContractMetadata) {
    const contractURI = await fetchOpenseaContractURI(client, address);
    if (contractURI) {
      result.contractMetadata = await opts.fetchHandler(contractURI);
    }
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

  const contractParams = [
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
  const results = await Promise.all(contractParams.map(client.readContract));

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

  const contractParams = [
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
  const results = await Promise.all(contractParams.map(client.readContract));

  return {
    owner: results[0] as `0x${string}`,
    tokenURI: results[1],
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

  const contractParams = [
    {
      ...contractBase,
      functionName: "uri" as const,
      args: [tokenId],
    },
  ] as const;

  // PublicClient.multicall has type inference issue, need to revisit later
  const results = await Promise.all(contractParams.map(client.readContract));

  return {
    uri: results[0],
  };
}

async function fetchOpenseaContractURI(
  client: PublicClient,
  address: `0x${string}`,
) {
  try {
    return (await client.readContract({
      address,
      abi: OPENSEA_CONTRACT_URI_ABI,
      functionName: "contractURI",
    })) as string;
  } catch {
    return null;
  }
}
