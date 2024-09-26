import { svg2WebpBuffer, TsRender } from "@token-kit/og";
import { parse } from "querystring";
import "source-map-support/register";
import { CloudFrontEvent, CloudFrontResponse } from "./types";

export const handler = async (event: CloudFrontEvent) => {
  // issue: https://github.com/lovell/sharp/issues/1851
  process.env.VIPS_DISC_THRESHOLD = "1g";
  const request = event.Records[0].cf.request;
  const requestUri = request.uri;
  const queryString = request.querystring;

  // we only handle GET request to /
  if (
    requestUri === "/" &&
    request.method === "GET" &&
    queryString.includes("chainId") &&
    queryString.includes("contract") &&
    // This is only fix typescript error
    "origin" in request
  ) {
    try {
      const parsedQueryString = parseQueryString(queryString);
      const chainId = parsedQueryString.chainId;
      const contract = parsedQueryString.contract;
      const tokenId = parsedQueryString.tokenId;
      const scriptId = parsedQueryString.scriptId;
      if (!(chainId && contract)) {
        return request;
      }
      const render = await TsRender.from({
        chainId: chainId,
        contract: contract,
        tokenId: tokenId,
        scriptId: scriptId,
      });
      const svg = await render.toSvg();
      const webp = await svg2WebpBuffer(Buffer.from(svg));
      return responseToClient(webp, "image/webp");
    } catch (err: unknown) {
      console.trace(err);
      return request;
    }
  }

  return request;
};

function responseToClient(
  body: string | Buffer,
  mime = "text/html",
): CloudFrontResponse["response"] {
  return {
    status: "200",
    statusDescription: "OK",
    headers: {
      "cache-control": [{ key: "Cache-Control", value: "max-age=86400" }],
      "content-type": [{ key: "Content-Type", value: mime }],
    },
    bodyEncoding: typeof body === "string" ? "text" : "base64",
    body: typeof body === "string" ? body : body.toString("base64"),
  };
}

function parseQueryString(queryString: string): {
  chainId?: string;
  contract?: string;
  tokenId?: string;
  scriptId?: string;
} {
  const parsedQueryString = parse(queryString);
  const parsedChain = parsedQueryString.chain as string | string[];
  const parsedContract = parsedQueryString.contract as string | string[];
  const parsedTokenId = parsedQueryString.tokenId as string | string[];
  const parsedScriptId = parsedQueryString.scriptId as string | string[];
  let chainId;
  if (parsedChain) {
    chainId = typeof parsedChain === "string" ? parsedChain : parsedChain[0];
  }
  let contract;
  if (parsedContract) {
    contract =
      typeof parsedContract === "string" ? parsedContract : parsedContract[0];
  }
  let tokenId;
  if (parsedTokenId) {
    tokenId =
      typeof parsedTokenId === "string" ? parsedTokenId : parsedTokenId[0];
  }
  let scriptId;
  if (parsedScriptId) {
    scriptId =
      typeof parsedScriptId === "string" ? parsedScriptId : parsedScriptId[0];
    scriptId = scriptId.split("_")[1];
  }
  return { chainId, contract, tokenId, scriptId };
}
