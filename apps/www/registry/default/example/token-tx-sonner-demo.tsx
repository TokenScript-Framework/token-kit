import {
  showTxSonner,
  ToastProvider,
} from "@/registry/default/ui/token-tx-sonner";
import { Button } from "@/components/ui/button";

export default function TokenTxSonnerDemo() {
  const simulateTx = (txHash:string, txUrl?:string, duration?:number) => {
    showTxSonner(
      txHash,
      txUrl,
      duration
    )
  };

  return (
    <div>
      <ToastProvider />
      <Button onClick={() => simulateTx("0x4ee12786284e8a4a0d2f6e3235db37a96b47d473d67526135895ee80cfb349cb", "https://etherscan.io/tx/", 5000)}>Click me</Button>
    </div>
  );
}
