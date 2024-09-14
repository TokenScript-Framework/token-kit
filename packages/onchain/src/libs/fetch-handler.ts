import { MyNftsOptions, TokenDataOptions } from "../constant";
import { rewriteUrlIfIFPSUrl } from "./url-rewrite";

export function initFetchHandler(opts: TokenDataOptions | MyNftsOptions) {
  if (!opts.fetchHandler) {
    opts.fetchHandler = async (uri: string) =>
      await (
        await fetch(rewriteUrlIfIFPSUrl(uri, opts.ipfsGatewayDomain))
      ).json();
  }
}
