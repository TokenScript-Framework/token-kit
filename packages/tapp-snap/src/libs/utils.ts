import { assert, Json, ManageStateOperation } from "@metamask/snaps-sdk";
import { bytesToBase64 } from "@metamask/utils";
import { ADDRESSTYPE, Token, TokenListState } from "./types";
import { BrowserProvider, ethers } from "ethers";
import { ABI, API_KEY, COMMON_API_ROOT } from "./constants";

export async function getTokenMetdata(
  chain: string,
  contract: ADDRESSTYPE,
  tokenId: string,
) {
  const response = await fetch(
    `${COMMON_API_ROOT}/token-view/${chain}/${contract}/${tokenId}`,
    {
      headers: {
        "x-stl-key": API_KEY,
      },
    },
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch token metadata: ${response.status} ${response.statusText}`,
    );
  }
  const { tokenMetadata, tsMetadata } = await response.json();
  return {
    actions: tsMetadata.actions,
    name: tsMetadata.name,
    description: tsMetadata.meta.description,
    aboutUrl: tsMetadata.meta.aboutUrl,
    tokenMetadata: tokenMetadata,
    signed: tsMetadata.signed,
  };
}

export async function getSVG(url: string) {
  if (!url) {
    return { svg: "" };
  }
  const imagePromise = getImageComponent(rewriteUrlIfIFPSUrl(url), {
    width: 400,
  });
  const [image] = await Promise.all([imagePromise]);
  return { svg: image };
}

export async function importTokenToState(
  newToken: Token,
  key: string,
  owner: ADDRESSTYPE,
) {
  const state = await getState();

  let tokenList: TokenListState = (state?.[owner] as TokenListState) ?? {};
  if (!tokenList[key]) {
    tokenList = { ...tokenList, [key]: newToken };
  } else {
    tokenList[key] = { ...tokenList[key], ...newToken };
  }

  await updateState({ ...state, ...{ [owner]: tokenList } });
}

export async function updateState(newState: Record<string, Json>) {
  await snap.request({
    method: "snap_manageState",
    params: {
      operation: ManageStateOperation.UpdateState,
      newState: newState,
    },
  });
}

export async function getState() {
  return await snap.request({
    method: "snap_manageState",
    params: {
      operation: ManageStateOperation.GetState,
    },
  });
}

export async function clearState() {
  return await snap.request({
    method: "snap_manageState",
    params: {
      operation: ManageStateOperation.ClearState,
    },
  });
}

async function getImageComponent(
  url: string,
  { width, height = width }: { width: number; height?: number },
) {
  assert(
    typeof width === "number" && width > 0,
    "Expected width to be a number greater than 0.",
  );

  assert(
    typeof height === "number" && height > 0,
    "Expected height to be a number greater than 0.",
  );

  const imageData = await getImageData(url);
  const size = `width="${width}" height="${height}"`;

  return `<svg ${size.trim()} xmlns="http://www.w3.org/2000/svg"><image ${size.trim()} href="${imageData}" /></svg>`;
}

async function getImageData(url: string) {
  const blob = await getRawImageData(url);
  const bytes = new Uint8Array(await blob.arrayBuffer());

  return `data:${blob.type};base64,${bytesToBase64(bytes)}`;
}

async function getRawImageData(url: string) {
  if (typeof fetch !== "function") {
    throw new Error(
      `Failed to fetch image data from "${url}": Using this function requires the "endowment:network-access" permission.`,
    );
  }

  return fetch(url).then(async (response) => {
    if (!response.ok) {
      throw new Error(
        `Failed to fetch image data from "${url}": ${response.status} ${response.statusText}`,
      );
    }

    const blob = await response.blob();
    assert(
      blob.type === "image/jpeg" ||
        blob.type === "image/png" ||
        blob.type === "image/svg+xml",
      "Expected image data to be a JPEG or PNG image.",
    );

    return blob;
  });
}

export function chainPipe(chain: number) {
  switch (chain) {
    case 1:
      return "Ethereum";
    case 137:
      return "Polygon";
    case 10:
      return "OP Mainnet";
    case 8453:
      return "Base";
    case 11155111:
      return "Sepolia";
    case 84532:
      return "Base Sepolia";
    default:
      return `Chain ${chain}`;
  }
}

export function truncateAddress(address: string, start: number = 38) {
  return `${address.slice(0, 6)}...${address.slice(start)}`;
}

export async function detectChain(expectedChainId: string): Promise<boolean> {
  const chainId = await ethereum.request<string>({
    method: "eth_chainId",
  });

  if (typeof chainId !== "string") {
    throw new Error("Invalid chainId response");
  }

  return BigInt(chainId).toString(10) === expectedChainId.toString();
}

export async function detectOwner(contract: ADDRESSTYPE, tokenId: string) {
  const accounts = await ethereum.request<string[]>({
    method: "eth_requestAccounts",
  });

  if (!tokenId) {
    return { isOwner: true, owner: accounts?.[0] as ADDRESSTYPE };
  }

  const owner = await getOwnerOf(contract, tokenId);
  const isOwner =
    accounts?.length && owner && accounts.includes(owner.toLowerCase());
  return { isOwner, ...(isOwner ? { owner: owner as ADDRESSTYPE } : {}) };
}

async function getOwnerOf(contract: string, tokenId: string): Promise<string> {
  try {
    const provider = new BrowserProvider(ethereum);
    const ethersContract = new ethers.Contract(contract, ABI, provider);
    if (!ethersContract || typeof ethersContract.ownerOf !== "function") {
      return "0x";
    }
    return await ethersContract.ownerOf(tokenId);
  } catch (error) {
    console.error("Error getting owner:", error);
    throw error;
  }
}

export function rewriteUrlIfIFPSUrl(url: string) {
  if (!url) {
    return "";
  } else if (url.toLowerCase().startsWith("https://ipfs.io/ipfs")) {
    return url.replace(
      "https://ipfs.io/ipfs",
      "https://gateway.pinata.cloud/ipfs",
    );
  } else if (url.toLowerCase().startsWith("ipfs://ipfs")) {
    return url.replace("ipfs://ipfs", "https://gateway.pinata.cloud/ipfs");
  } else if (url.toLowerCase().startsWith("ipfs://")) {
    return url.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
  }
  return url;
}
