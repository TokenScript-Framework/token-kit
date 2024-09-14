import { erc20Abi, PublicClient, zeroAddress } from "viem";
import {
  InterfaceIds,
  SUB_TYPES,
  SUBTYPE_INTERFACEIDS,
  TokenType,
  TokenTypes,
  UNKNOWN,
} from "./constant";
import { ERC165_ABI, ERC5169_ABI } from "./libs/abi";

export async function tokenType(
  address: string,
  client: PublicClient,
): Promise<TokenType> {
  try {
    const mainType = await detectTokenType(address, client);
    if (mainType.type === UNKNOWN) {
      return mainType;
    }
    const subTypes = await detectSubTokenType(mainType, address, client);

    return {
      ...mainType,
      ...subTypes,
    };
  } catch {
    return { type: UNKNOWN };
  }
}

async function detectTokenType(
  address: string,
  client: PublicClient,
): Promise<{ type: string }> {
  const tokenTypeChecks = [
    { check: isERC20(address, client), type: TokenTypes.ERC20 },
    {
      check: isSupported(address, InterfaceIds["ERC721"], client),
      type: TokenTypes.ERC721,
    },
    {
      check: isSupported(address, InterfaceIds["ERC1155"], client),
      type: TokenTypes.ERC1155,
    },
  ];

  const results = await Promise.all(tokenTypeChecks.map(({ check }) => check));
  const type =
    tokenTypeChecks.find((_, index) => results[index])?.type || UNKNOWN;

  return { type };
}

async function detectSubTokenType(
  tokenType: TokenType,
  address: string,
  client: PublicClient,
): Promise<{ subTypes?: string[]; scriptURI?: string[] }> {
  if (!SUB_TYPES[tokenType.type] || SUB_TYPES[tokenType.type].length === 0) {
    return { subTypes: [] };
  }

  let scriptURI;
  const checkSubTypes = await Promise.all(
    SUB_TYPES[tokenType.type].map(async (subType) => {
      if (subType === "ERC5169") {
        const result = await isERC5169(address, client);
        scriptURI = result.isERC5169 ? result.scriptURI : [];
        return result.isERC5169 ? "ERC5169" : null;
      } else {
        const result = await isSupported(
          address,
          SUBTYPE_INTERFACEIDS[tokenType.type][`${subType}`],
          client,
        );

        return result ? subType : null;
      }
    }),
  );
  const subTypes = checkSubTypes.flatMap((f) => (f ? [f] : []));

  return {
    ...(subTypes.length > 0 ? { subTypes } : {}),
    ...(scriptURI.length > 0 ? { scriptURI } : {}),
  };
}

async function isSupported(
  address: string,
  interfaceId: string,
  client: PublicClient,
) {
  const contract = {
    address: address as `0x${string}`,
    abi: ERC165_ABI,
  };
  try {
    return await client.readContract({
      ...contract,
      functionName: "supportsInterface",
      args: [interfaceId],
    });
  } catch {
    return false;
  }
}

async function isERC5169(address: string, client: PublicClient) {
  const contract = {
    address: address as `0x${string}`,
    abi: ERC5169_ABI,
  };
  try {
    const scriptURI = await client.readContract({
      ...contract,
      functionName: "scriptURI",
    });
    return { isERC5169: true, scriptURI };
  } catch {
    return { isERC5169: false };
  }
}

async function isERC20(address: string, client: PublicClient) {
  const contract = {
    address: address as `0x${string}`,
    abi: erc20Abi,
  };
  try {
    await Promise.all([
      client.readContract({
        ...contract,
        functionName: "totalSupply",
      }),
      client.readContract({
        ...contract,
        functionName: "balanceOf",
        args: [zeroAddress],
      }),
    ]);
    return true;
  } catch {
    return false;
  }
}
