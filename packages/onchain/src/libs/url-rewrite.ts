import { DEFAULT_IPFS_GATEWAY_DOMAIN } from "../constant";

export function rewriteUrlIfIFPSUrl(url: string, customGateway?: string) {
  const gateway = `${customGateway || DEFAULT_IPFS_GATEWAY_DOMAIN}/ipfs`;

  if (!url) {
    return "";
  } else if (url.toLowerCase().startsWith("https://ipfs.io/ipfs")) {
    return url.replace("https://ipfs.io/ipfs", gateway);
  } else if (url.toLowerCase().startsWith("ipfs://ipfs")) {
    return url.replace("ipfs://ipfs", gateway);
  } else if (url.toLowerCase().startsWith("ipfs://")) {
    return url.replace("ipfs://", `${gateway}/`);
  }

  return url;
}
