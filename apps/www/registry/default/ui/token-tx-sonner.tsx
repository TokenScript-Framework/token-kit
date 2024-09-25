"use client";

import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { waitForTransactionReceipt } from "@wagmi/core";
import { config } from "@/config/wagmi-config";

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
  const toastId = txMessageStatusHandler({
    isLoading: true,
    isSuccess: false,
    isError: false,
    txHash,
    txBaseUrl,
  });

  waitForTransactionReceipt(config, {
    confirmations: 2,
    hash: txHash as `0x${string}`,
  })
    .then(() => {
      txMessageStatusHandler({
        isLoading: false,
        isSuccess: true,
        isError: false,
        txHash,
        txBaseUrl,
        error: undefined,
        toastId: toastId?.toString(),
        toastDuration: duration,
      });
    })
    .catch((error: TxError) => {
      txMessageStatusHandler({
        isLoading: false,
        isSuccess: false,
        isError: true,
        txHash,
        txBaseUrl,
        error,
        toastId: toastId?.toString(),
        toastDuration: duration,
      });
    })
    .finally(() => {
      if (toastId) {
        toast.dismiss(toastId);
      }
    });
};

const txMessageStatusHandler = ({
  isLoading,
  isSuccess,
  isError,
  txHash,
  txBaseUrl,
  error,
  toastId,
  toastDuration = 5000,
}: {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  txHash: string;
  txBaseUrl?: string;
  error?: TxError;
  toastId?: string;
  toastDuration?: number;
}) => {
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
