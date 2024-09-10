import {
  earlyReturnTypes,
  IERC1155InterfaceId,
  IERC721InterfaceId,
  interfaceIdMap,
  tokenTypes,
} from "./constant";
import { ERC165_ABI, ERC20_ABI } from "./abi";
import { parseAbi, PublicClient, zeroAddress } from "viem";

export async function tokenType(address: string, client: PublicClient) {
  try {
    let result = await detectTokenType(address, client);
    if (earlyReturnTypes.includes(result.type)) {
      return result;
    }

    if (result.type in interfaceIdMap) {
      const supportedInterfaces = await checkInterfaces(
        address,
        interfaceIdMap[result.type as keyof typeof interfaceIdMap],
        client,
      );
      result = { ...result, supportedInterfaces };
    }

    return result;
  } catch (err) {
    console.error(err);
    return { type: "Unknow Type" };
  }
}

async function detectTokenType(
  address: string,
  client: PublicClient,
): Promise<{ type: string; supportedInterfaces?: string[] }> {
  if (await isERC5169(address, client)) {
    const checks = [
      isERC20(address, client),
      isERC165(address, IERC721InterfaceId, client),
      isERC165(address, IERC1155InterfaceId, client),
    ];

    const results = await Promise.all(checks);
    const detectedIndex = results.findIndex(Boolean);

    if (detectedIndex !== -1) {
      return { type: tokenTypes[detectedIndex] };
    }

    return { type: "ERC5169" };
  }

  return { type: "Unknow Type" };
}

async function checkInterfaces(address, interfaceIds, client) {
  const contract = {
    address: address as `0x${string}`,
    abi: parseAbi(ERC165_ABI),
  };
  const entries = Object.entries(interfaceIds);
  const supportedInterfaces = await Promise.all(
    entries.map(async ([key, value]) => {
      const isSupported = await client.readContract({
        ...contract,
        functionName: "supportsInterface",
        args: [value],
      });
      return isSupported ? key : null;
    }),
  );
  return supportedInterfaces.filter(Boolean);
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
  } catch (err) {
    console.error(err);
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
  } catch (err) {
    console.error(err);
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
  } catch (err) {
    console.error(err);
    return false;
  }
}
