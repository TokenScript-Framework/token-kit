import { createPublicClient, http } from "viem";
import { ADDRESSTYPE, ContractMetadata, Token, TokenMetadata } from "./types";
import { baseSepolia, mainnet, sepolia } from "viem/chains";
import {
  tokenData,
  ERC20TokenData,
  ERC721TokenData,
  ERC1155TokenData,
} from "@token-kit/onchain";
import { NETWORK_INFO, ChainId } from "./constants";

export function getRPCURL(chainId: ChainId): string {
  return NETWORK_INFO[chainId].rpcUrl;
}

export function getChain(chainId: number) {
  switch (chainId) {
    case 11155111:
      return sepolia;
    case 84532:
      return baseSepolia;
    default:
      return mainnet;
  }
}
function normalizeTokenData(
    result: ERC20TokenData | ERC721TokenData | ERC1155TokenData,
    contract: ADDRESSTYPE,
    chain: string,
  ) {
    const {
      contractMetadata = { name: "", description: "", external_link: "", image: "" },
      symbol = "",
      name = "",
      tokenMetadata,
    } = result as any;
  
    return {
      name: contractMetadata.name || symbol,
      description: contractMetadata.description || name,
      aboutUrl: contractMetadata.external_link || 
        `${NETWORK_INFO[Number(chain) as ChainId].explorerUrl}address/${contract}`,
      tokenMetadata: tokenMetadata || {
        description: symbol || null,
        address: contract,
        name: name || null,
        attributes: [],
      },
    };
  }

export async function getMetadata(
  chain: string,
  contract: ADDRESSTYPE,
  tokenId?: string,
): Promise<Token> {
  const chainId = Number(chain);
  const client = createPublicClient({
    chain: getChain(chainId),
    transport: http(getRPCURL(chainId)),
  })as any;

  const result = await tokenData(
    client,
    contract,
    tokenId ? Number(tokenId) : undefined,
    {
      includeTokenMetadata: true,
      includeContractMetadata: true,
    },
  );

  const { name, description, aboutUrl, tokenMetadata } = normalizeTokenData(
    result,
    contract,
    chain,
  );

  return {
    chain,
    contract,
    tokenId,
    name,
    description,
    aboutUrl,
    actions: ["Action"],
    tokenMetadata: tokenMetadata as TokenMetadata,
  };
}
