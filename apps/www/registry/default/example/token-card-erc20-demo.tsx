import { TokenCard } from "@/registry/default/ui/token-card";

export default function TokenCardDemo() {
  return (
    <TokenCard
      type="ERC20"
      chainId={1}
      contract="0xdac17f958d2ee523a2206206994597c13d831ec7"
      wallet="0x04B07Ab1970898FF7e4e6a487530515129deF530"
    />
  );
}
