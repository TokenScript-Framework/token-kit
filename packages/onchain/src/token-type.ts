import {
  INTERFACEIDS,
  SUB_TYPES,
  SUBTYPE_INTERFACEIDS,
  TOKEN_TYPE,
  TOKEN_TYPES,
} from "./constant";
import { ERC165_ABI, ERC20_ABI } from "./abi";
import { parseAbi, PublicClient, zeroAddress } from "viem";

export async function tokenType(address: string, client: PublicClient) {
  try {
    const tokenType = await detectTokenType(address, client);

    const subType = await detectSubTokenType(tokenType, address, client);

    return {
      ...tokenType,
      ...(subType.length > 0 ? { subType } : {}),
    };
  } catch {
    return { type: "Unknow Type" };
  }
}

async function detectTokenType(
  address: string,
  client: PublicClient,
): Promise<{ type: string }> {
  const checks = [
    isERC20(address, client),
    isERC165(address, INTERFACEIDS["ERC721"], client),
    isERC165(address, INTERFACEIDS["ERC1155"], client),
  ];

  const results = await Promise.all(checks);
  const detectedIndex = results.findIndex((result) => result === true);

  if (detectedIndex !== -1) {
    return { type: TOKEN_TYPES[detectedIndex] };
  }

  return { type: "Unknown Type" };
}

async function detectSubTokenType(
  tokenType: TOKEN_TYPE,
  address: string,
  client: PublicClient,
): Promise<string[]> {
  if (!SUB_TYPES[tokenType.type] || SUB_TYPES[tokenType.type].length === 0) {
    return [];
  }
  const interfaceIds = {};
  const subTypes = await Promise.all(
    SUB_TYPES[tokenType.type].map(async (subType) => {
      if (subType === "ERC5169") {
        const result = await isERC5169(address, client);
        return result ? "ERC5169" : "";
      } else {
        interfaceIds[`${subType}`] =
          SUBTYPE_INTERFACEIDS[tokenType.type][`${subType}`];
        return null;
      }
    }),
  );

  const supportInterfaces = await checkInterfaces(
    address,
    interfaceIds,
    client,
  );

  return [...removeNull(subTypes), ...supportInterfaces];
}

async function checkInterfaces(address, interfaceIds, client) {
  const contract = {
    address: address as `0x${string}`,
    abi: parseAbi(ERC165_ABI),
  };
  const list = await Promise.all(
    Object.entries(interfaceIds).map(async ([key, value]) => {
      try {
        const isSupported = await client.readContract({
          ...contract,
          functionName: "supportsInterface",
          args: [value],
        });
        return isSupported ? key : null;
      } catch {
        return null;
      }
    }),
  );

  return removeNull(list);
}

async function isERC5169(address: string, client: PublicClient) {
  const contract = {
    address: address as `0x${string}`,
    abi: parseAbi(ERC165_ABI),
  };
  try {
    await client.readContract({
      ...contract,
      functionName: "scriptURI",
    });
    return true;
  } catch {
    return false;
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

async function isERC165(
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

function removeNull(list: string[]) {
  return list.flatMap((f) => (f ? [f] : []));
}
