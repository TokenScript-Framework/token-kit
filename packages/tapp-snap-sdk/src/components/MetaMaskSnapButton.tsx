import React, { useState, useCallback, useEffect, useRef } from "react";
import { useMetaMaskStatus } from "../hooks/useMetaMaskStatus";
import { DEFAULT_CSS } from "../libs/constants";
import { SpinIcon } from "../icons/SpinIcon";

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
  title = "Import Token",
  cssClass = DEFAULT_CSS,
  onSnapInstalled,
  onSuccess,
  onError,
}) => {
  const { isMetaMaskInstalled, isFlask, isSnapInstalled, refreshSnapStatus } =
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
      } else if (!isFlask) {
        window.open("https://metamask.io/flask/", "_blank");
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
    isFlask,
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
  } else if (!isFlask) {
    buttonText = "Install MetaMask Flask";
  } else if (isSnapInstalled) {
    buttonText = title;
  }
  return (
    <button onClick={handleClick} disabled={isLoading} className={cssClass}>
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
