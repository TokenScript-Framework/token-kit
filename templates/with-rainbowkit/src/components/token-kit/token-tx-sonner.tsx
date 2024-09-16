"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Toaster as Sonner } from "sonner";
import { useTransaction } from 'wagmi';

interface TokenTxSonnerProps {
  txHash: string;
  txUri?: string;
}

const isValidTxHash = (hash: string): hash is `0x${string}` => {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
};

const TokenTxSonner: React.FC<TokenTxSonnerProps> = ({ txHash, txUri }) => {
  const { isLoading, isSuccess, isError } = useTransaction({
    hash: isValidTxHash(txHash) ? txHash : undefined,
  });

  useEffect(() => {
    if (!isValidTxHash(txHash)) return;

    if (isLoading) {
      toast("Transaction is pending...", {
        description: "Waiting for confirmation",
        duration: Infinity,
      });
    } else if (isSuccess) {
      toast.success("Transaction successful!", {
        description: (
          <span>
            Your transaction has been confirmed.
            {txUri && (
              <>
                Please see the full details{' '}
                <a className="underline" href={`${txUri}${txHash}`} target="_blank" rel="noopener noreferrer">
                  here
                </a>.
              </>
            )}
          </span>
        ),
        duration: 5000,
      });
    } else if (isError) {
      toast.error("Transaction failed", {
        description: "Something went wrong, please try again.",
        duration: 5000,
      });
    }
  }, [isLoading, isSuccess, isError, txHash, txUri]);

  return (
    <div className="flex flex-col gap-4 items-center">
      <Sonner />
    </div>
  );
};

export { TokenTxSonner };