import React, { useState, useCallback, useEffect } from "react";
import { useMetaMaskStatus } from "../hooks/useMetaMaskStatus";
import { Token } from "../libs/types";
import { MetaMaskSnapButton } from "./MetaMaskSnapButton";
import { TAPP_SNAP_ID, SNAP_METHOD } from "../libs/constants";
import { getMetadata } from "../libs/utils";
import { ADDRESSTYPE } from "../libs/types";

interface TappSnapButtonProps {
  chain: string;
  contract: ADDRESSTYPE;
  tokenId?: string;
  title?: string;
  cssClass?: string;
  onSuccess?: (result: unknown) => void;
  onError?: (error: Error) => void;
}

export const ImportButton: React.FC<TappSnapButtonProps> = ({
  chain,
  contract,
  tokenId,
  title,
  cssClass,
  onSuccess,
  onError,
}) => {
  const { isMetaMaskInstalled, isFlask, isSnapInstalled } =
    useMetaMaskStatus(TAPP_SNAP_ID);
  const [metadata, setMetadata] = useState<Token>({} as Token);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (isMetaMaskInstalled && isFlask) {
        if (isSnapInstalled) {
          setMetadata(await getMetadata(chain, contract, tokenId));
        }
      }
    };
    fetchMetadata();
  }, [
    chain,
    contract,
    isFlask,
    isMetaMaskInstalled,
    isSnapInstalled,
    setMetadata,
    tokenId,
  ]);

  const handleSnapInstalled = useCallback(async () => {
    if (chain && contract) {
      const tokenData = await getMetadata(chain, contract, tokenId);

      setMetadata(tokenData);
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
};
