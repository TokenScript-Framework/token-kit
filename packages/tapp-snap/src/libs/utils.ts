import { assert, Json, ManageStateOperation } from "@metamask/snaps-sdk";
import { bytesToBase64 } from "@metamask/utils";
import { ADDRESSTYPE, Token, TokenListState } from "./types";

export const VIEWER_ROOT = "https://viewer.tokenscript.org";

export async function getSVG(url: string) {
  const imagePromise = getImageComponent(url, { width: 400 });

  const [image] = await Promise.all([imagePromise]);

  return { svg: image };
}

export async function updateTokenList(
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
  await updateState({ [owner]: tokenList });
}

export async function updateState(content: Record<string, Json>) {
  const state = await getState();
  await snap.request({
    method: "snap_manageState",
    params: {
      operation: ManageStateOperation.UpdateState,
      newState: { ...state, ...content },
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

export async function getSnapStateSize() {
  const state = await snap.request({
    method: "snap_manageState",
    params: { operation: ManageStateOperation.GetState },
  });

  const stateString = JSON.stringify(state);
  const sizeInBytes = new TextEncoder().encode(stateString).length;
  const sizeInKB = sizeInBytes / 1024;

  return {
    sizeInBytes,
    sizeInKB: sizeInKB.toFixed(2),
    percentageUsed: ((sizeInBytes / (10 * 1024 * 1024)) * 100).toFixed(2),
  };
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
      blob.type === "image/jpeg" || blob.type === "image/png",
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

export function addressPipe(address: string, start: number = 38) {
  return `${address.slice(0, 6)}...${address.slice(start)}`;
}
