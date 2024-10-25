"use client";
import React, {
  useRef,
  useState,
  RefObject,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  useAccount,
  useReadContracts,
  useWalletClient,
  useConnect,
  useConnectors,
} from "wagmi";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/registry/default/lib/utils";
import { useFarcasterIdentity } from "@frames.js/render/identity/farcaster";
import { useFrame } from "@frames.js/render/use-frame";
import {
  fallbackFrameContext,
  OnTransactionArgs,
  signFrameAction,
} from "@frames.js/render";
import {
  FrameUI,
  type FrameUIComponents,
  type FrameUITheme,
} from "@frames.js/render/ui";
import { WebStorage } from "@frames.js/render/identity/storage";
import { NeynarContextProvider, Theme, useNeynarContext } from "@neynar/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  mainnet,
  goerli,
  sepolia,
  polygon,
  polygonMumbai,
  bsc,
  bscTestnet,
  arbitrum,
  arbitrumGoerli,
  optimism,
  optimismGoerli,
  base,
  baseSepolia,
} from "viem/chains";

const ERC5169_ABI = [
  {
    inputs: [],
    name: "scriptURI",
    outputs: [
      {
        internalType: "string[]",
        name: "",
        type: "string[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function TappCardSkeleton(props: { className?: string }) {
  return (
    <Card className={cn("w-[350px] overflow-hidden", props.className)}>
      <CardHeader className="p-0">
        <Skeleton className="w-full h-[200px]" />
      </CardHeader>
      <CardContent className="p-4">
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex flex-col">
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-5 w-28" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface TappCardProps {
  chainId: number;
  contract: `0x${string}`;
  tokenId: string;
  scriptURI?: string;
  cssClass?: string;
}

export default function TappCard({
  chainId,
  contract,
  tokenId,
  cssClass,
}: TappCardProps) {
  const { data } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        chainId,
        address: contract,
        abi: ERC5169_ABI,
        functionName: "scriptURI",
        args: [],
      },
    ],
  });

  const scriptURI = data?.[0][0] || "";
  const viewerType = data?.[0]
    ? new URL(data[0] as unknown as string).hostname.startsWith("viewer")
      ? "ts"
      : "farcaster"
    : "farcaster";

  if (!scriptURI) {
    return <TappCardSkeleton />;
  }

  return viewerType === "ts" ? (
    <TsViewer
      chainId={chainId}
      contract={contract}
      tokenId={tokenId}
      cssClass={cssClass}
    />
  ) : (
    <>
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
        <FarcasterFrame
          chainId={chainId}
          contract={contract}
          tokenId={tokenId}
          scriptURI={scriptURI}
        />
      </NeynarContextProvider>
    </>
  );
}

export function TsViewer({
  chainId,
  contract,
  tokenId,
  cssClass,
}: TappCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const url = `https://viewer-staging.tokenscript.org/?viewType=sts-token&chain=${chainId}&contract=${contract}&tokenId=${tokenId}`;
  useIframePostMessage(iframeRef, url);

  const handleIframeLoad = () => {
    setIsLoaded(true);
  };

  return (
    <>
      {!isLoaded && <TappCardSkeleton />}
      <iframe
        ref={iframeRef}
        src={url}
        className={cn(
          "mx-auto h-[650px] max-w-[500px] w-full iframe-placeholder",
          cssClass,
        )}
        onLoad={handleIframeLoad}
      ></iframe>
    </>
  );
}

export function FarcasterFrame({
  chainId,
  contract,
  tokenId,
  scriptURI,
}: TappCardProps) {
  type StylingProps = {
    className?: string;
    style?: React.CSSProperties;
  };

  const components: FrameUIComponents<StylingProps> = {};

  const theme: FrameUITheme<StylingProps> = {
    Root: {
      className:
        "flex flex-col max-w-[600px] gap-2 border rounded-lg ovrflow-hidden bg-white relative",
    },
    LoadingScreen: {
      className: "absolute top-0 left-0 right-0 bottom-0 bg-gray-300 z-10",
    },
    ImageContainer: {
      className: "relative w-full border-b border-gray-300 overflow-hidden",
      style: {
        aspectRatio: "var(--frame-image-aspect-ratio)",
      },
    },
    ButtonsContainer: {
      className: "flex justify-evenly space-x-2 px-2 pb-2",
    },
    Button: {
      className:
        "bg-gray-100 border-gray-200 flex items-center justify-center flex-row text-sm rounded-lg border cursor-pointer gap-1.5 h-10 py-2 px-4 w-full ",
    },
  };
  const { user } = useNeynarContext();
  const connectors = useConnectors();
  const { connect } = useConnect();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    title: "",
    description: "",
    link: "",
  });
  const storage = useMemo(() => new WebStorage(), []);
  const signerState = useFarcasterIdentity({
    storage,
    onMissingIdentity: useCallback(() => {
      if (user && typeof user === "object" && user.fid) {
        return signerState.impersonateUser(user.fid);
      }
      return signerState.createSigner();
    }, [user]),
  });

  const frameConfig = useMemo(
    () => ({
      homeframeUrl: scriptURI,
      frameActionProxy:
        process.env.NEXT_PUBLIC_FRAME_RENDER_URL ||
        "http://localhost:3000/frames",
      frameGetProxy:
        process.env.NEXT_PUBLIC_FRAME_RENDER_URL ||
        "http://localhost:3000/frames",
      frameContext: fallbackFrameContext,
      signerState,
      signFrameAction,
      connectedAddress: address,
      async onConnectWallet() {
        try {
          const connector = connectors[0];
          connect({ connector, chainId: chainId });
        } catch (error) {
          console.error("Error for connect wallet:", error);
          setError("Error for connect wallet");
        }
      },
      async onTransaction(arg: OnTransactionArgs) {
        try {
          setError("");
          if (!address) {
            throw new Error("No wallet connected");
          }

          if (!walletClient) {
            throw new Error("Can't get the wallet client.");
          }

          if (!arg.transactionData || typeof arg.transactionData !== "object") {
            throw new Error("Wrong transactioin data.");
          }

          const { params } = arg.transactionData;

          const txHash = await walletClient.sendTransaction({
            account: address,
            to: params.to as `0x${string}`,
            data: params.data as `0x${string}`,
            gas: BigInt(6000000),
            value: BigInt(params.value ?? 0),
          });

          setTxHash(txHash);

          return txHash;
        } catch (error: unknown) {
          if (error instanceof Error) {
            if (error.message.includes("rejected")) {
              setError("User rejected the transaction.");
            } else {
              setError("Error for wallet, please check wallet or refresh");
            }
          } else {
            setError(String(error));
          }
          throw error;
        }
      },
      onLinkButtonClick(event: {
        action: string;
        label: string;
        target: string;
      }) {
        setDialogContent({
          title: "Confirm",
          description: `Do you confirm to open the link: ${event.target}`,
          link: event.target,
        });
        setDialogOpen(true);
      },
    }),
    [chainId, contract, tokenId, signerState],
  );

  const frameState = useFrame(frameConfig);

  return (
    <>
      <FrameUI frameState={frameState} components={components} theme={theme} />
      {error && (
        <div className="text-red-500 mb-4 p-2 bg-red-100 rounded mt-4 max-w-[600px] break-words">
          Error: {error}
        </div>
      )}
      {txHash && (
        <div className="text-green-500 mb-4 p-2 bg-green-100 rounded mt-4 max-w-[600px] break-words">
          Transaction is submitted. For more details, please access:
          <a
            href={`${getBlockExplorerUrl(chainId)}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {txHash}
          </a>
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
            <DialogDescription>{dialogContent.description}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                window.open(dialogContent.link);
                setDialogOpen(false);
              }}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function getBlockExplorerUrl(chainId: number): string {
  const chain = [
    mainnet,
    goerli,
    sepolia,
    polygon,
    polygonMumbai,
    bsc,
    bscTestnet,
    arbitrum,
    arbitrumGoerli,
    optimism,
    optimismGoerli,
    base,
    baseSepolia,
  ].find((c) => c.id === chainId);

  return chain?.blockExplorers?.default?.url || "https://etherscan.io";
}

export const useIframePostMessage = (
  iframeRef: RefObject<HTMLIFrameElement>,
  targetOrigin: string,
) => {
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    function sendResponse(
      messageData: MessageEvent["data"],
      response: unknown,
      error?: unknown,
    ) {
      const data = messageData;

      if (error) {
        data.error = error;
      } else {
        data.result = response;
      }

      iframeRef.current?.contentWindow?.postMessage(data, "*");
    }

    const handleMessage = async (event: MessageEvent) => {
      if (!walletClient) {
        return;
      }

      if (!event.data.method) {
        return;
      }

      try {
        switch (event.data.method) {
          case "eth_accounts":
          case "eth_requestAccounts": {
            const data = await walletClient.request({
              method: event.data.method,
            });
            sendResponse(event.data, data);
            break;
          }
          case "eth_getCode":
          case "eth_chainId":
          case "net_version":
          case "eth_blockNumber":
          case "eth_estimateGas":
          case "eth_sendTransaction":
          case "eth_getTransactionByHash":
          case "eth_getTransactionReceipt":
          case "eth_getTransactionCount":
          case "personal_sign":
          case "eth_call":
          case "eth_signTypedData":
          case "eth_signTypedData_v4":
          case "eth_getBlockByNumber":
          case "wallet_switchEthereumChain": {
            const data = await walletClient.request({
              method: event.data.method,
              params: event.data.params,
            });
            sendResponse(event.data, data);
            break;
          }

          default:
            sendResponse(event.data, null, {
              code: -1,
              message:
                "RPC Method " + event.data.method + " is not implemented",
            });
            break;
        }
      } catch (e: unknown) {
        const error = e as CustomError;

        sendResponse(event.data, null, {
          code: error.data?.code ?? error.code,
          message:
            error.message +
            (error.data?.message ? " " + error.data?.message : ""),
        });
      }
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, [iframeRef, targetOrigin, walletClient]);
};

interface CustomError extends Error {
  data?: { code?: number; message?: string };
  code?: number;
}
