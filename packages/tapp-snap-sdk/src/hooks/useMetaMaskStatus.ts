import { useCallback, useEffect, useState } from "react";

export const useMetaMaskStatus = (snapId: string) => {
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isFlask, setIsFlask] = useState(false);
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

      if (isInstalled) {
        try {
          const clientVersion = await window.ethereum.request({
            method: "web3_clientVersion",
          });

          const isFlaskVersion =
            typeof clientVersion === "string" &&
            clientVersion.toLowerCase().includes("flask");
          setIsFlask(isFlaskVersion);

          if (isFlaskVersion) {
            await refreshSnapStatus();
          }
        } catch (error) {
          console.error("Error checking MetaMask status:", error);
        }
      }
    };

    checkMetaMaskStatus();
  }, [snapId]);

  return { isMetaMaskInstalled, isFlask, isSnapInstalled, refreshSnapStatus };
};
