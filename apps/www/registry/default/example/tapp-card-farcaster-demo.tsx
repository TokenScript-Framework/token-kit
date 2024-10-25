import TappCard from "@/registry/default/ui/tapp-card";
import "@rainbow-me/rainbowkit/styles.css";
import {
  NeynarAuthButton,
  NeynarContextProvider,
  SIWN_variant,
  Theme,
  useNeynarContext,
} from "@neynar/react";
import "@/styles/globals.css";
import { useEffect, useState } from "react";
import { ConnectButton, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export default function TappCardFarcasterDemo() {
  const { address } = useAccount();
  return (
    <>
      <RainbowKitProvider>
        <div className="mb-4 flex justify-center">
          <ConnectButton showBalance={false} />
        </div>
        <NeynarContextProvider
          settings={{
            clientId: process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID || "",
            defaultTheme: Theme.Light,
            eventsCallbacks: {
              onAuthSuccess: () => {},
              onSignout() {},
            },
          }}
        >
          {address && <TappCardContent />}
        </NeynarContextProvider>
      </RainbowKitProvider>
    </>
  );
}

interface FarcasterUser {
  fid: number;
  signerUUID: string;
  username: string;
  displayName: string;
  verifiedAddresses: {
    ethAddresses: string[];
    solAddresses: string[];
  };
}

function TappCardContent() {
  const { user } = useNeynarContext();
  const [farcaster, setFarcaster] = useState<FarcasterUser | null>(null);

  useEffect(() => {
    if (user) {
      setFarcaster({
        fid: user.fid,
        signerUUID: user.signer_uuid,
        username: user.username,
        displayName: user.display_name ?? "",
        verifiedAddresses: {
          ethAddresses: user.verified_addresses.eth_addresses ?? [],
          solAddresses: user.verified_addresses.sol_addresses ?? [],
        },
      });
    }
  }, [user]);

  return (
    <div className="block">
      <div className="mb-4 neynar-button-container relative flex justify-center">
        <NeynarAuthButton
          variant={SIWN_variant.FARCASTER}
          className="flex items-center bg-gray-100 rounded-xl p-2"
        />
      </div>
      {user && farcaster && (
        <>
          <TappCard
            chainId={84532}
            contract="0x793124b7b430d4C795514D05B85d82519702423d"
            tokenId="1"
            cssClass="h-[800px] border"
          />
        </>
      )}
    </div>
  );
}
