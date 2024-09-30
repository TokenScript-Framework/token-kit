import axios from "axios";
import jsdom from "jsdom";
import { parse } from "querystring";
import "source-map-support/register";
import S3 from "./s3";
import { CloudFrontEvent, CloudFrontResponse } from "./types";

export const handler = async (event: CloudFrontEvent) => {
  const request = event.Records[0].cf.request;
  const requestUri = request.uri;
  const queryString = request.querystring;

  // we only handle GET request to /
  if (
    requestUri === "/" &&
    request.method === "GET" &&
    queryString.includes("chain") &&
    queryString.includes("contract") &&
    // This is only fix typescript error
    "origin" in request
  ) {
    try {
      const parsedQueryString = parseQueryString(queryString);
      const chain = parsedQueryString.chain;
      const contract = parsedQueryString.contract;
      const tokenId = parsedQueryString.tokenId;
      if (!(chain && contract)) {
        return request;
      }
      const origin = request.origin;
      const domainName = origin.custom.domainName;
      const bucket = domainName.replace(
        /\.s3(-website-)?.*?\.amazonaws\.com$/,
        "",
      );
      const regionMatch = /\.s3(-website-|.)?(.+)?\.amazonaws\.com$/.exec(
        domainName,
      );
      const region = regionMatch ? regionMatch[2] : null;
      const [indexHtml, frameHtml] = await Promise.all([
        getHtmlBody(region!, bucket),
        getFrameHtml(chain, contract, tokenId),
      ]);
      const mergedHtml = mergeHtml(indexHtml!, frameHtml);
      return responseToClient(mergedHtml);
    } catch (err: unknown) {
      console.trace(err);
      return request;
    }
  }

  return request;
};

function responseToClient(
  body: string,
  mime = "text/html",
): CloudFrontResponse["response"] {
  return {
    status: "200",
    statusDescription: "OK",
    headers: {
      "cache-control": [{ key: "Cache-Control", value: "max-age=86400" }],
      "content-type": [{ key: "Content-Type", value: mime }],
    },
    body: body,
  };
}

async function getHtmlBody(region: string, bucket: string) {
  const s3 = new S3({ region });
  const indexHtml = await s3.get(bucket, "index.html");
  return indexHtml;
}

async function getFrameHtml(
  chain: string,
  contract: string,
  tokenId?: string,
  scriptId?: string,
) {
  const frameUrl = `https://token-kit-farcaster-token-frame.vercel.app/${chain}/${contract}`;
  const frameHtml = await axios
    .get(frameUrl, { params: { tokenId, scriptId } })
    .then((res) => res.data);
  return frameHtml;
}

function parseQueryString(queryString: string): {
  chain?: string;
  contract?: string;
  tokenId?: string;
  scriptId?: string;
} {
  const parsedQueryString = parse(queryString);
  const parsedChain = parsedQueryString.chain as string | string[];
  const parsedContract = parsedQueryString.contract as string | string[];
  const parsedTokenId = parsedQueryString.tokenId as string | string[];
  const parsedScriptId = parsedQueryString.scriptId as string | string[];
  let chain;
  if (parsedChain) {
    chain = typeof parsedChain === "string" ? parsedChain : parsedChain[0];
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
  return { chain, contract, tokenId, scriptId };
}

function mergeHtml(indexHtml: string, frameHtml: string) {
  const indexDoc = new jsdom.JSDOM(indexHtml).window.document;
  const frameDoc = new jsdom.JSDOM(frameHtml).window.document;

  const indexHead = indexDoc.head;
  const frameHead = frameDoc.head;
  const frameChildren = Array.from(frameHead.children);

  for (const child of frameChildren) {
    indexHead.appendChild(child);
  }

  const updatedHtml = indexDoc.documentElement.outerHTML;
  return updatedHtml;
}
