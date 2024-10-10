"use client";
import React, { useRef, useState, RefObject, useEffect } from "react";
import { useWalletClient } from "wagmi";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/registry/default/lib/utils";

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
  cssClass?: string;
}
export default function TappCard({
  chainId,
  contract,
  tokenId,
  cssClass,
}: TappCardProps) {
  const NEXT_PUBLIC_VIEWER_ROOT = "https://viewer-staging.tokenscript.org";
  const url = `${NEXT_PUBLIC_VIEWER_ROOT}/?viewType=sts-token&chain=${chainId}&contract=${contract}&tokenId=${tokenId}`;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
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
