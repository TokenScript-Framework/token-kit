import { TokenCard } from "@/registry/default/ui/token-card";

export default function TokenCardDemo() {
  return (
    <TokenCard
      type="ERC1155"
      chainId={1}
      tokenId="1"
      contract="0x73da73ef3a6982109c4d5bdb0db9dd3e3783f313"
    />
  );
}
