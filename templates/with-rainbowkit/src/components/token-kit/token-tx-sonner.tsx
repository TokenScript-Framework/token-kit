"use client";

import { useEffect } from "react";
import { toast } from "@/hooks/token-kit/use-tx-toast";
import { useTransaction } from "wagmi";

const isValidTxHash = (hash: string): hash is `0x${string}` => {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
};

export const useTokenTxSonner = (txHash: string, txBaseUrl?: string) => {
  const { isLoading, isSuccess, isError } = useTransaction({
    hash: isValidTxHash(txHash) ? txHash : undefined,
  });

  const showTxToastTimer = 2500;

  useEffect(() => {
    if (!isValidTxHash(txHash)) {
      return;
    }
    if (isLoading) {
      toast.message("Transaction is pending...", {
        description: "Waiting for confirmation...",
        duration: showTxToastTimer,
      });
    } else if (isSuccess) {
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
                </a>.
              </>
            )}
          </span>
        ),
        duration: showTxToastTimer,
      });
    } else if (isError) {
      toast.error("Transaction failed", {
        description: "Something went wrong, please try again.",
        duration: showTxToastTimer,
        });
    } 
  }, [isLoading, isSuccess, isError, txHash, txBaseUrl]);
};
