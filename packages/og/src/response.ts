import { svg2PngBuffer, svg2WebpBuffer } from "./imageProcess";
import TsRender, { MetadataOptions } from "./render";

export type ImageResponseOptions = {
  headers?: Record<string, string>;
  format?: "png" | "webp" | "svg";
  debug?: boolean;
  status?: number;
  statusText?: string;
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
        const converter = await TsRender.from(params);
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
