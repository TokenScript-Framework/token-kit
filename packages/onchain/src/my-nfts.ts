import {
  erc721Abi,
  PublicClient,
  ReadContractParameters,
  ReadContractReturnType,
} from "viem";
import {
  MyNfts,
  MyNftsOptions,
  MyNftToken,
  MyNftTokenWithoutMetadata,
  TokenTypes,
} from "./constant";
import { ERC721Enumerable_ABI } from "./libs/abi";
import { batchExecutor } from "./libs/batch-executor";
import { initFetchHandler } from "./libs/fetch-handler";
import { normalizeTokenId } from "./libs/normalizer";
import { tokenType } from "./token-type";

const defaultOptions: MyNftsOptions = {
  includeTokenMetadata: false,
};

export async function myNfts(
  v:
    | {
        client: PublicClient;
        address: `0x${string}`;
        tokenId: number | bigint;
        options?: MyNftsOptions;
      }
    | {
        client: PublicClient;
        address: `0x${string}`;
        userWallet: `0x${string}`;
        options?: MyNftsOptions;
      },
): Promise<MyNfts> {
  const { client, address, options } = v;
  const opts = { ...defaultOptions, ...options };

  const { type, subTypes } = await tokenType(address, client);
  if (type !== TokenTypes.ERC721 || !subTypes.includes("IERC721Enumerable"))
    throw new Error("Only support Enumberable ERC721 token");

  let owner: `0x${string}`;
  if ("userWallet" in v && v.userWallet) {
    owner = v.userWallet;
  } else if ("tokenId" in v) {
    const id = normalizeTokenId(v.tokenId);
    owner = await getOwner(client, address, id);
  }

  const tokenIds = await fetchTokenIds(client, address, owner);
  let tokens = await fetchTokenURIs(client, address, tokenIds);

  if (opts.includeTokenMetadata) {
    tokens = await fetchTokenMetadatas(tokens, opts);
  }

  return {
    owner,
    tokens,
  };
}

async function getOwner(
  client: PublicClient,
  address: `0x${string}`,
  tokenId: bigint,
) {
  return await client.readContract({
    address,
    abi: erc721Abi,
    functionName: "ownerOf" as const,
    args: [tokenId],
  });
}

async function fetchTokenIds(
  client: PublicClient,
  address: `0x${string}`,
  owner: `0x${string}`,
) {
  const balance = await client.readContract({
    address,
    abi: erc721Abi,
    functionName: "balanceOf" as const,
    args: [owner],
  });

  const enumerableContractBase = {
    address,
    abi: ERC721Enumerable_ABI,
  } as const;

  const contractParams = Array.from({ length: Number(balance) }).map(
    (_, i) => ({
      ...enumerableContractBase,
      functionName: "tokenOfOwnerByIndex" as const,
      args: [owner, i],
    }),
  ) as ReadContractParameters[];

  return (await batchExecutor<ReadContractParameters, ReadContractReturnType>(
    contractParams,
    client.readContract,
  )) as bigint[];
}

async function fetchTokenURIs(
  client: PublicClient,
  address: `0x${string}`,
  tokenIds: bigint[],
) {
  const contractBase = {
    address,
    abi: erc721Abi,
  } as const;

  const contractParams = tokenIds.map((tokenId) => ({
    ...contractBase,
    functionName: "tokenURI" as const,
    args: [tokenId],
  })) as ReadContractParameters[];

  return await batchExecutor<ReadContractParameters, MyNftTokenWithoutMetadata>(
    contractParams,
    async (contract) => {
      const tokenURI = (await client.readContract(contract)) as string;
      return { tokenId: contract.args[0] as bigint, tokenURI };
    },
  );
}

async function fetchTokenMetadatas(
  tokens: MyNftTokenWithoutMetadata[],
  opts: MyNftsOptions,
) {
  initFetchHandler(opts);

  return await batchExecutor<MyNftTokenWithoutMetadata, MyNftToken>(
    tokens,
    async (token) => {
      const tokenMetadata = await opts.fetchHandler(token.tokenURI);
      return { ...token, tokenMetadata };
    },
  );
}
