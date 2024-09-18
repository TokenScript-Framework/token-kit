"use client";

import { useEffect } from "react";
import { useTransaction } from "wagmi";
import { useToast } from "@/components/token-kit/token-tx-sonner";

interface TokenTxSonnerProps {
  txHash: string;
  txBaseUrl?: string;
}

const isValidTxHash = (hash: string): hash is `0x${string}` => {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
};

export const useSonnerTransactionStatus = ({ txHash, txBaseUrl }: TokenTxSonnerProps) => {
  const { isLoading, isSuccess, isError } = useTransaction({
    hash: isValidTxHash(txHash) ? txHash : undefined,
  });

  const { toast } = useToast();

  useEffect(() => {
    if (!isValidTxHash(txHash)) return;
    if (isLoading) {
      toast.pending(
        "Transaction is pending...", { 
          description: "Waiting for confirmation",
          // duration: 5000
      });
    } else if (isSuccess) {
      toast.success("Transaction successful!", {
        description: (
          <span>
            Your transaction has been confirmed.
            {txBaseUrl && (
              <>
                Please see the full details{' '}
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
        // duration: 5000,
      });
    } else if (isError) {
      toast.error("Transaction failed", {
        description: "Something went wrong, please try again.",
        // duration: 5000,
      });
    }

  }, [isLoading, isSuccess, isError, txHash, txBaseUrl]);

  return null;
};

