import { TokenThumbnail } from "@/registry/default/ui/token-thumbnail";

export default function TokenThumbnailDemo() {
  return (
    <TokenThumbnail
      token={{
        address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        name: "Tether USD",
        logoURI:
          "https://assets.coingecko.com/coins/images/325/standard/Tether.png?1696501661",
        verified: true,
      }}
    />
  );
}
