import { MyNfts } from "@/registry/default/ui/my-nfts";
import { createPublicClient, http, PublicClient } from "viem";
import { baseSepolia } from "viem/chains";

const client = createPublicClient({
  chain: baseSepolia,
  transport: http("https://sepolia.base.org"),
});

export default function TokenThumbnailDemo() {
  return (
    <div className="w-full">
      <MyNfts
        client={client as PublicClient}
        address="0x250eb01a55d7E462ad478465581344521B01CD6b"
        tokenId={0n}
        chainId={baseSepolia.id}
      />
    </div>
  );
}
