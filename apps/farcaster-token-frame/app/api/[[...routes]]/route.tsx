/** @jsxImportSource frog/jsx */
import { getTokenViewData } from "@/app/service/externalApi";
import { Button, Frog } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";

const app = new Frog({
  title: "Farcaster token frame",
  basePath: "/api", //root uri
});

app.frame("/view/:chain/:contract", async (c) => {
  const { chain, contract } = c.req.param();
  const { tokenId, scriptId, imagePath, imagePostfix } = c.req.query();
  if (chain === ":chain" || contract === ":contract") {
    return c.res({
      image: (
        <div style={{ color: "black", display: "flex", fontSize: 60 }}>
          Error
        </div>
      ),
    });
  }

  const {
    tokenMetadata,
    tsMetadata: { actions, meta, label },
  } = await getTokenViewData(
    chain,
    contract as `0x${string}`,
    tokenId,
    scriptId,
  );

  const intents =
    (actions || [])
      .slice(0, 3)
      .map(({ label, name }: { label: string; name: string }) => (
        <Button.Link
          href={`${process.env.VIEWER_ROOT}/?chain=${chain}&contract=${contract}#card=${name}`}
        >
          {label}
        </Button.Link>
      )) || [];

  // Warpcast don't like the "." in the querystring, so we have to do the string concat to workaround it
  const customImage = imagePath
    ? imagePostfix
      ? `${imagePath}.${imagePostfix}`
      : imagePath
    : undefined;
  const imageUrl =
    tokenMetadata?.image || meta.imageUrl || meta.iconUrl || customImage;

  return c.res({
    image: (
      <div style={{ color: "black", display: "flex", fontSize: 60 }}>
        {imageUrl ? (
          <img src={imageUrl} style={{ height: "100%" }} tw={`mx-auto`} />
        ) : (
          <div
            style={{
              margin: "0 auto",
              height: "532px",
              color: "white",
              "font-size": "120px",
              display: "flex",
              "align-items": "center",
            }}
          >
            {label}
          </div>
        )}
      </div>
    ),
    intents: [
      ...intents,
      <Button.Link
        href={`${process.env.VIEWER_ROOT}/?chain=${chain}&contract=${contract}`}
      >
        More
      </Button.Link>,
    ],
    title: tokenMetadata?.name || label || undefined,
    ogImage: imageUrl,
    unstable_metaTags: [
      {
        property: "og:descrition",
        content: tokenMetadata?.description || label || undefined,
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "twitter:card",
        content: "summary_large_image",
      },
      {
        property: "twitter:title",
        content: tokenMetadata?.name || label || undefined,
      },
      {
        property: "twitter:description",
        content: tokenMetadata?.description || label || undefined,
      },
      {
        property: "twitter:image",
        content: imageUrl,
      },
    ],
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
