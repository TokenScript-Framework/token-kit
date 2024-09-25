"use client";

// import { config } from "@/registry/default/wagmi";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  mainnet,
  sepolia,
  polygon,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
} from "@wagmi/core/chains";
import { waitForTransactionReceipt, http, createConfig } from "@wagmi/core";

const config = createConfig({
  chains: [
    mainnet,
    sepolia,
    polygon,
    avalanche,
    avalancheFuji,
    base,
    baseSepolia,
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [avalanche.id]: http(),
    [avalancheFuji.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

const ToastProvider = () => {
  return <Toaster />;
};

type TxError = {
  message: string;
};

const showTxSonner = (
  txHash: string,
  txBaseUrl?: string,
  duration?: number,
) => {
  const toastId = txMessageStatusHandler(true, false, false, txHash, txBaseUrl);

  waitForTransactionReceipt(config, {
    confirmations: 2,
    hash: txHash as `0x${string}`,
  })
    .then(() => {
      txMessageStatusHandler(
        false,
        true,
        false,
        txHash,
        txBaseUrl,
        undefined,
        toastId?.toString(),
        duration,
      );
    })
    .catch((error: TxError) => {
      txMessageStatusHandler(
        false,
        false,
        true,
        txHash,
        txBaseUrl,
        error,
        toastId?.toString(),
        duration,
      );
    })
    .finally(() => {
      if (toastId) {
        toast.dismiss(toastId);
      }
    });
};

const txMessageStatusHandler = (
  isLoading: boolean,
  isSuccess: boolean,
  isError: boolean,
  txHash: string,
  txBaseUrl?: string,
  error?: TxError,
  toastId?: string,
  toastDuration: number = 5000,
) => {
  if (isLoading) {
    return toast.loading("Transaction is pending...", {
      description: "Waiting for confirmation...",
      duration: 30000,
    });
  } else if (isSuccess && toastId) {
    toast.success("Transaction successful!", {
      description: (
        <span>
          Your transaction has been confirmed.
          {txBaseUrl && (
            <>
              {" "}
              See details{" "}
              <a
                className="underline"
                href={`${txBaseUrl}${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </a>
              .
            </>
          )}
        </span>
      ),
      duration: toastDuration,
    });
  } else if (isError && toastId) {
    toast.error("Transaction failed", {
      description: `Something went wrong: ${error?.message || "Unknown error"}`,
      duration: toastDuration,
    });
    console.error("error:", error);
  }
};

export { toast, ToastProvider, showTxSonner };
