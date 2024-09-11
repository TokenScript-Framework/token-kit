import { Eip1193Provider, JsonRpcApiProvider } from "ethers";
import { getTokenscriptMetadata } from "token-kit";
import { svg2PngBuffer, svg2WebpBuffer } from "./imageProcess";
import TsRender from "./render";

export type ImageResponseOptions = {
  headers?: Record<string, string>;
  format?: "png" | "webp" | "svg";
  debug?: boolean;
  status?: number;
  statusText?: string;
};

export type MetadataOptions = {
  provider: Eip1193Provider | JsonRpcApiProvider;
  chainId: number;
  contract: `0x${string}`;
  imgBuffer: Buffer;
  context?: {
    tokenId: string;
    originIndex?: number;
  };
  index?: number;
};

export class ImageResponseBase extends Response {
  constructor(params: MetadataOptions, options: ImageResponseOptions = {}) {
    const { headers = {}, status = 200, statusText, format = "webp" } = options;
    let contentType: string;
    switch (format) {
      case "png":
        contentType = "image/png";
        break;
      case "webp":
        contentType = "image/webp";
        break;
      case "svg":
        contentType = "image/svg+xml";
        break;
    }

    const body = new ReadableStream({
      async start(controller) {
        const metadata = await getTokenscriptMetadata(
          params.provider,
          params.chainId,
          params.contract,
          params.context,
          { css: true, cards: true },
          params.index,
        );
        const converter = new TsRender({
          metadata,
          image: params.imgBuffer,
          name: metadata.name,
          description: metadata.name,
        });
        const svg = await converter.toSvg();
        let data: string | Buffer;
        switch (format) {
          case "png":
            data = await svg2PngBuffer(Buffer.from(svg));
            break;
          case "webp":
            data = await svg2WebpBuffer(Buffer.from(svg));
            break;
          case "svg":
            data = svg;
            break;
        }

        controller.enqueue(data);
        controller.close();
      },
    });

    super(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": options.debug
          ? "no-cache, no-store"
          : "public, immutable, no-transform, max-age=31536000",
        ...headers,
      },
      status,
      statusText,
    });
  }
}

export const ImageResponse = ImageResponseBase;
