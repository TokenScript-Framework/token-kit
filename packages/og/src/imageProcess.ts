import sharp from "sharp";

export async function image2DataUri(imgBuffer: Buffer): Promise<string> {
  const sharpImg = sharp(imgBuffer);
  const mimeType = await sharpImg.metadata().then((data) => data.format);
  return `data:image/${mimeType};base64,${imgBuffer.toString("base64")}`;
}

export async function svg2WebpBuffer(svgBuffer: Buffer): Promise<Buffer> {
  const sharpImg = sharp(svgBuffer);
  return sharpImg
    .webp({
      quality: 80,
      lossless: false,
      nearLossless: true,
      smartSubsample: true,
      effort: 6,
    })
    .toBuffer();
}

export async function svg2TwitterWebpBuffer(
  svgBuffer: Buffer,
): Promise<Buffer> {
  const sharpImg = sharp(svgBuffer);
  const metadata = await sharpImg.metadata();
  const height = metadata.height!;
  return sharpImg
    .resize({
      width: Math.floor(height * 2),
      height: height,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({
      quality: 80,
      lossless: false,
      nearLossless: true,
      smartSubsample: true,
      effort: 6,
    })
    .toBuffer();
}

export async function svg2PngBuffer(svgBuffer: Buffer): Promise<Buffer> {
  const sharpImg = sharp(svgBuffer);
  return sharpImg
    .png({
      quality: 80,
      compressionLevel: 9,
      adaptiveFiltering: true,
      effort: 10,
      palette: true,
    })
    .toBuffer();
}
