"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { erc20Abi, erc721Abi, formatUnits } from "viem";
import { useReadContract, useReadContracts } from "wagmi";

export type TokenCardProps =
  | (ERC20TokenCardProps & { type: "ERC20" })
  | (ERC721TokenCardProps & { type: "ERC721" })
  | (ERC1155TokenCardProps & { type: "ERC1155" });

export const TokenCard: React.FC<TokenCardProps> = (props) => {
  switch (props.type) {
    case "ERC20":
      return <ERC20TokenCard {...props} />;
    case "ERC721":
      return <ERC721TokenCard {...props} />;
    case "ERC1155":
      return <ERC1155TokenCard {...props} />;
    default:
      return null;
  }
};

function TokenCardSkeleton() {
  return (
    <Card>
      <CardHeader className="relative space-y-0 p-0">
        <Skeleton className="w-full rounded-lg pb-[100%]" />
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative flex w-full items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type ERC20TokenCardProps = {
  chainId: number;
  contract: `0x${string}`;
  wallet: `0x${string}`;
  onClick?: () => void;
};
function ERC20TokenCard(props: ERC20TokenCardProps) {
  const { chainId, contract, wallet } = props;
  const { data } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        chainId: chainId,
        address: contract,
        abi: erc20Abi,
        functionName: "name",
      },
      {
        chainId: chainId,
        address: contract,
        abi: erc20Abi,
        functionName: "symbol",
      },
      {
        chainId: chainId,
        address: contract,
        abi: erc20Abi,
        functionName: "decimals",
      },
      {
        chainId: chainId,
        address: contract,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [wallet],
      },
    ],
  });

  if (!data) {
    return <TokenCardSkeleton />;
  }

  const [name, symbol, decimals, balance] = data;

  return (
    <Card>
      <CardContent className="p-4 cursor-pointer" onClick={props.onClick}>
        <div className="flex flex-col gap-4">
          <div className="relative w-full">
            <h3 className="mb-2 text-lg font-semibold leading-none">Name</h3>
            <p className="text-muted-foreground text-sm">{name}</p>
          </div>

          <div className="relative w-full">
            <h3 className="mb-2 text-lg font-semibold leading-none">Symbol</h3>
            <p className="text-muted-foreground text-sm">{symbol}</p>
          </div>

          <div className="relative w-full">
            <h3 className="mb-2 text-lg font-semibold leading-none">Balance</h3>
            <p className="text-muted-foreground text-sm">
              {formatUnits(balance, decimals)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ERC721TokenCardProps {
  chainId: number;
  contract: `0x${string}`;
  tokenId: string;
  onClick?: () => void;
}
function ERC721TokenCard(props: ERC721TokenCardProps) {
  const { chainId, contract, tokenId, onClick } = props;
  const { data: erc721TokenURI } = useReadContract({
    chainId,
    address: contract,
    abi: erc721Abi,
    functionName: "tokenURI",
    args: [BigInt(tokenId)],
  });

  const { data: erc721Metadata } = useQuery({
    queryKey: ["metadata", chainId, contract, tokenId],
    queryFn: async () => {
      const response = await fetch(rewriteUrlIfIpfsUrl(erc721TokenURI!));
      if (!response.ok) {
        throw new Error("Network error");
      }
      return response.json();
    },
    enabled: !!erc721TokenURI,
  });

  const metadata = erc721Metadata;
  const attributes = metadata?.attributes;

  if (!metadata) {
    return <TokenCardSkeleton />;
  }

  return (
    <Card>
      <CardHeader
        className="relative cursor-pointer space-y-0 p-0"
        onClick={onClick}
      >
        <img
          className="rounded-lg"
          src={rewriteUrlIfIpfsUrl(metadata?.image)}
        />
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="relative w-full">
            <h3 className="mb-2 text-lg font-semibold leading-none">
              Description
            </h3>
            <p className="text-muted-foreground text-sm">
              {metadata?.description}
            </p>
          </div>
          <div className="w-full">
            <h3 className="mb-2 text-lg font-semibold leading-none">Traits</h3>
            <ScrollArea className="w-full whitespace-nowrap rounded-md border p-2">
              <div className="flex w-full gap-2">
                {attributes?.map(
                  ({
                    trait_type,
                    value,
                  }: {
                    trait_type: string;
                    value: string;
                  }) => {
                    return (
                      <div
                        key={trait_type}
                        className="bg-primary-100/10 flex w-full flex-col items-center rounded-md border"
                      >
                        <div className="font-semibold">{trait_type}</div>
                        {value.toString().indexOf("https://") === 0 ? (
                          <a
                            href={value}
                            target="_blank"
                            className="text-primary-500 cursor-pointer underline"
                          >
                            {urlPipe(value)}
                          </a>
                        ) : (
                          <div>{valuePipe(value.toString())}</div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ERC1155TokenCardProps {
  chainId: number;
  contract: `0x${string}`;
  tokenId: string;
  onClick?: () => void;
}
export const ERC1155TokenCard: React.FC<ERC1155TokenCardProps> = ({
  chainId,
  contract,
  tokenId = "0",
  onClick,
}) => {
  const { data: erc1155TokenURI } = useReadContract({
    chainId: chainId,
    address: contract,
    abi: [
      {
        inputs: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
        ],
        name: "uri",
        outputs: [
          {
            internalType: "string",
            name: "",
            type: "string",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "uri",
    args: [BigInt(tokenId)],
  });

  const { data: erc1155Metadata } = useQuery({
    queryKey: ["metadata", chainId, contract, tokenId],
    queryFn: async () => {
      const response = await fetch(
        rewriteUrlIfIpfsUrl(erc1155TokenURI as string),
      );
      if (!response.ok) {
        throw new Error("Network error");
      }
      return response.json();
    },
    enabled: !!erc1155TokenURI,
  });

  const metadata = erc1155Metadata;
  const attributes =
    metadata?.attributes ||
    Object.entries(erc1155Metadata?.properties || {}).map(([key, value]) => ({
      trait_type: key,
      value,
    }));

  if (!metadata) {
    return <TokenCardSkeleton />;
  }

  return (
    <Card>
      <CardHeader
        className="relative cursor-pointer space-y-0 p-0"
        onClick={onClick}
      >
        <img
          className="rounded-lg"
          src={rewriteUrlIfIpfsUrl(metadata?.image)}
        />
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="relative w-full">
            <h3 className="mb-2 text-lg font-semibold leading-none">
              Description
            </h3>
            <p className="text-muted-foreground text-sm">
              {metadata?.description}
            </p>
          </div>
          <div className="w-full">
            <h3 className="mb-2 text-lg font-semibold leading-none">Traits</h3>
            <ScrollArea className="w-full whitespace-nowrap rounded-md border p-2">
              <div className="flex w-full gap-2">
                {attributes?.map(
                  ({
                    trait_type,
                    value,
                  }: {
                    trait_type: string;
                    value: string;
                  }) => {
                    return (
                      <div
                        key={trait_type}
                        className="bg-primary-100/10 flex w-full flex-col items-center rounded-md border"
                      >
                        <div className="font-semibold">{trait_type}</div>
                        {value.toString().indexOf("https://") === 0 ? (
                          <a
                            href={value}
                            target="_blank"
                            className="text-primary-500 cursor-pointer underline"
                          >
                            {urlPipe(value)}
                          </a>
                        ) : (
                          <div>{valuePipe(value.toString())}</div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function addressPipe(address: string, start: number = 38) {
  return `${address.slice(0, 6)}...${address.slice(start)}`;
}

function valuePipe(value: string) {
  return value.indexOf("0x") === 0 ? addressPipe(value) : value;
}

function urlPipe(url: string) {
  return `${url.slice(0, 10)}...${url.slice(-4)}`;
}

function rewriteUrlIfIpfsUrl(url: string) {
  if (!url) {
    return "";
  } else if (url.toLowerCase().startsWith("https://ipfs.io/ipfs")) {
    return url.replace(
      "https://ipfs.io/ipfs",
      "https://gateway.pinata.cloud/ipfs",
    );
  } else if (url.toLowerCase().startsWith("ipfs://ipfs")) {
    return url.replace("ipfs://ipfs", "https://gateway.pinata.cloud/ipfs");
  } else if (url.toLowerCase().startsWith("ipfs://")) {
    return url.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
  }
  return url;
}
