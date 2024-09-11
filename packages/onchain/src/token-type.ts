import {
  INTERFACE_IDS,
  SUB_TYPES,
  SUBTYPE_INTERFACEIDS,
  TOKEN_TYPES,
  TokenType,
  UNKNOWN_TYPE,
} from "./constant";
import { ERC165_ABI, ERC20_ABI, ERC5169_ABI } from "./abi";
import { parseAbi, PublicClient, zeroAddress } from "viem";

export async function tokenType(
  address: string,
  client: PublicClient,
): Promise<TokenType> {
  try {
    const mainType = await detectTokenType(address, client);
    if (mainType.type === UNKNOWN_TYPE) {
      return mainType;
    }
    const subTypes = await detectSubTokenType(mainType, address, client);

    return {
      ...mainType,
      ...subTypes,
    };
  } catch {
    return { type: UNKNOWN_TYPE };
  }
}

async function detectTokenType(
  address: string,
  client: PublicClient,
): Promise<{ type: string }> {
  const tokenTypeChecks = [
    { check: isERC20(address, client), type: TOKEN_TYPES.ERC20 },
    {
      check: isSupportedToken(address, INTERFACE_IDS["ERC721"], client),
      type: TOKEN_TYPES.ERC721,
    },
    {
      check: isSupportedToken(address, INTERFACE_IDS["ERC1155"], client),
      type: TOKEN_TYPES.ERC1155,
    },
  ];

  const results = await Promise.all(tokenTypeChecks.map(({ check }) => check));
  const type =
    tokenTypeChecks.find((_, index) => results[index])?.type || UNKNOWN_TYPE;

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
        const result = await isSupportedInterface(
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

async function isSupportedToken(
  address: string,
  interfaceId: string,
  client: PublicClient,
) {
  const contract = {
    address: address as `0x${string}`,
    abi: parseAbi(ERC165_ABI),
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

async function isSupportedInterface(address, interfaceId, client) {
  const contract = {
    address: address as `0x${string}`,
    abi: parseAbi(ERC165_ABI),
  };
  try {
    const result = await client.readContract({
      ...contract,
      functionName: "supportsInterface",
      args: [interfaceId],
    });
    return result;
  } catch {
    return false;
  }
}

async function isERC5169(address: string, client: PublicClient) {
  const contract = {
    address: address as `0x${string}`,
    abi: parseAbi(ERC5169_ABI),
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
    abi: parseAbi(ERC20_ABI),
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
