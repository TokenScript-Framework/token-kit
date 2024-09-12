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
