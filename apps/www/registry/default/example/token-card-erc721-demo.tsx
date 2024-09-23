import { TokenCard } from "@/registry/default/ui/token-card";

export default function TokenCardDemo() {
  return (
    <TokenCard
      type="ERC721"
      chainId={137}
      tokenId="1649017156"
      contract="0xD5cA946AC1c1F24Eb26dae9e1A53ba6a02bd97Fe"
    />
  );
}
