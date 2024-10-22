import TappCard from "@/registry/default/ui/tapp-card";
import "@rainbow-me/rainbowkit/styles.css";

export default function TappCardDemo() {
  return (
    <TappCard
      chainId={11155111}
      contract="0x4e45cFDEc47924d28c41933C07f9915E86457375"
      tokenId="0"
      cssClass="h-[800px] border"
    />
  );
}
