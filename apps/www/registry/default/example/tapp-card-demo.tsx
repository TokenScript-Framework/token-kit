import TappCard from "@/registry/default/ui/tapp-card";
import { ConnectButton, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";

export default function TappCardDemo() {
  const { address } = useAccount();
  return (
    <RainbowKitProvider>
      <div className="mb-4">
        <ConnectButton showBalance={false} />
      </div>
      {address && (
        <TappCard
          chainId={11155111}
          contract="0x3490FFc64A4E65aBb749317f7860E722Ba65a2b5"
          tokenId="473843023"
          cssClass="h-[800px] border"
        />
      )}
    </RainbowKitProvider>
  );
}
