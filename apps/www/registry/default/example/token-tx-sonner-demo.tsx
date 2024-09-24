import {
  showTxSonner,
  ToastProvider,
} from "@/registry/default/ui/token-tx-sonner";
import { useEffect } from "react";

export default function TokenTxSonnerDemo() {
  useEffect(() => {
    setTimeout(() => {
      showTxSonner(
        "0x6ab620baa39d4bf784a229c1aa4df0b25267863a4e623785d8937c48c6b4170d",
        "https://etherscan.io/tx/",
        5000,
      );
    }, 1000);
  }, []);
  return <ToastProvider />;
}
