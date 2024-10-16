import React, { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type ADDRESSTYPE = `0x${string}`;

type Token = {
  chain: string;
  contract: ADDRESSTYPE;
  tokenId?: string;
};

const SpinIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const DEFAULT_CSS =
  "flex justify-center min-w-32 max-w-40 bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 ";

const TAPP_SNAP_ID =
  process.env.NEXT_PUBLIC_TAPP_SNAP_ID || "npm:@token-kit/tapp-snap";

const SNAP_METHOD = "import";

interface AddToSnapProps {
  chain: string;
  contract: ADDRESSTYPE;
  tokenId?: string;
  title?: string;
  cssClass?: string;
  onSuccess?: (result: unknown) => void;
  onError?: (error: Error) => void;
}

export default function AddToSnap({
  chain,
  contract,
  tokenId,
  title,
  cssClass,
  onSuccess,
  onError,
}: AddToSnapProps) {
  const { isMetaMaskInstalled, isSnapInstalled } =
    useMetaMaskStatus(TAPP_SNAP_ID);
  const [metadata, setMetadata] = useState<Token>({} as Token);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (isMetaMaskInstalled && isSnapInstalled) {
        setMetadata({ chain, contract, tokenId });
      }
    };
    fetchMetadata();
  }, [
    chain,
    contract,
    isMetaMaskInstalled,
    isSnapInstalled,
    setMetadata,
    tokenId,
  ]);

  const handleSnapInstalled = useCallback(async () => {
    if (chain && contract) {
      setMetadata({ chain, contract, tokenId });
    }
  }, [chain, contract, tokenId]);

  return (
    <MetaMaskSnapButton
      snapId={TAPP_SNAP_ID}
      snapMethod={SNAP_METHOD}
      snapParams={metadata}
      title={title}
      cssClass={cssClass}
      onSnapInstalled={handleSnapInstalled}
      onSuccess={onSuccess}
      onError={onError}
    />
  );
}

export const useMetaMaskStatus = (snapId: string) => {
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isSnapInstalled, setIsSnapInstalled] = useState(false);

  const checkSnapInstallation = useCallback(async () => {
    try {
      const snaps = (await window.ethereum.request({
        method: "wallet_getSnaps",
      })) as Record<string, unknown>;
      return snaps && !!snaps[snapId];
    } catch (error) {
      console.error("Error checking snap installation:", error);
      return false;
    }
  }, [snapId]);

  const refreshSnapStatus = useCallback(async () => {
    const snapInstalled = await checkSnapInstallation();
    setIsSnapInstalled(snapInstalled);
  }, [checkSnapInstallation]);

  useEffect(() => {
    const checkMetaMaskStatus = async () => {
      const isInstalled =
        typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask;
      setIsMetaMaskInstalled(isInstalled);
      await refreshSnapStatus();
    };

    checkMetaMaskStatus();
  }, [snapId]);

  return { isMetaMaskInstalled, isSnapInstalled, refreshSnapStatus };
};

interface MetaMaskSnapButtonProps {
  snapId: string;
  snapMethod: string;
  snapParams: unknown;
  title?: string;
  cssClass?: string;
  onSnapInstalled?: () => Promise<void>;
  onSuccess?: (result: unknown) => void;
  onError?: (error: Error) => void;
}
export const MetaMaskSnapButton: React.FC<MetaMaskSnapButtonProps> = ({
  snapId,
  snapMethod,
  snapParams,
  title = "Add to Snap",
  cssClass = DEFAULT_CSS,
  onSnapInstalled,
  onSuccess,
  onError,
}) => {
  const { isMetaMaskInstalled, isSnapInstalled, refreshSnapStatus } =
    useMetaMaskStatus(snapId);
  const [isLoading, setIsLoading] = useState(false);
  const snapParamsRef = useRef(snapParams);

  const installSnap = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: "wallet_requestSnaps",
        params: { [snapId]: {} },
      });
      return true;
    } catch (error) {
      console.error("Error installing snap:", error);
      onError?.(
        error instanceof Error ? error : new Error("Failed to install snap"),
      );
      return false;
    }
  }, [snapId, onError]);

  const invokeSnap = useCallback(async () => {
    console.log(snapParamsRef.current);
    try {
      const result = await window.ethereum.request({
        method: "wallet_invokeSnap",
        params: {
          snapId,
          request: { method: snapMethod, params: snapParamsRef.current },
        },
      });
      onSuccess?.(result);
    } catch (error) {
      console.error("Error invoking snap:", error);
      onError?.(
        error instanceof Error ? error : new Error("Failed to invoke snap"),
      );
    }
  }, [snapId, snapMethod, onSuccess, onError]);

  useEffect(() => {
    snapParamsRef.current = snapParams;
  }, [snapParams]);

  const handleClick = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!isMetaMaskInstalled) {
        window.open("https://metamask.io/download/", "_blank");
      } else {
        if (!isSnapInstalled) {
          const installed = await installSnap();
          if (installed) {
            await refreshSnapStatus(); // 刷新 Snap 安装状态
            if (onSnapInstalled) {
              await onSnapInstalled();
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          }
        }

        await invokeSnap();
      }
    } catch (error) {
      console.error("Error:", error);
      onError?.(
        error instanceof Error ? error : new Error("Unknown error occurred"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    isMetaMaskInstalled,
    isSnapInstalled,
    invokeSnap,
    installSnap,
    refreshSnapStatus,
    onSnapInstalled,
    onError,
  ]);

  let buttonText = title;
  if (!isMetaMaskInstalled) {
    buttonText = "Install MetaMask";
  } else if (isSnapInstalled) {
    buttonText = title;
  }
  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={cn(DEFAULT_CSS, cssClass)}
    >
      {isLoading ? (
        <>
          <SpinIcon className="h-5 w-5 animate-spin text-white" />
        </>
      ) : (
        buttonText
      )}
    </button>
  );
};
