"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/registry/default/lib/utils";
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

function TokenCardSkeleton(props: { className?: string }) {
  return (
    <Card className={props.className}>
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

function NFTCardSkeleton(props: { className?: string }) {
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

type ERC20TokenCardProps = {
  chainId: number;
  contract: `0x${string}`;
  wallet: `0x${string}`;
  onClick?: () => void;
  className?: string;
};
function ERC20TokenCard(props: ERC20TokenCardProps) {
  const { chainId, contract, wallet } = props;
  const { data } = useERC20Balance({ chainId, contract, wallet });

  if (!data) {
    return <TokenCardSkeleton className={props.className} />;
  }

  const [name, symbol, decimals, balance] = data;

  return (
    <Card className={props.className}>
      <CardContent className="p-4" onClick={props.onClick}>
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
  className?: string;
}
function ERC721TokenCard({
  chainId,
  contract,
  tokenId,
  ...props
}: ERC721TokenCardProps) {
  const { data, ...v } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        chainId,
        address: contract,
        abi: erc721Abi,
        functionName: "tokenURI",
        args: [BigInt(tokenId)],
      },
      {
        chainId,
        address: contract,
        abi: erc721Abi,
        functionName: "name",
      },
    ],
  });
  console.log(v, "===========v");

  const [erc721TokenURI, name] = data || [];

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
    return <NFTCardSkeleton className={props.className} />;
  }

  return (
    <TokenMetadataDisplay
      title={name || ""}
      metadata={metadata}
      attributes={attributes}
      {...props}
    />
  );
}

interface ERC1155TokenCardProps {
  chainId: number;
  contract: `0x${string}`;
  tokenId: string;
  onClick?: () => void;
  className?: string;
}
export const ERC1155TokenCard = ({
  chainId,
  contract,
  tokenId,
  ...props
}: ERC1155TokenCardProps) => {
  const { data: erc1155TokenURI } = useReadContract({
    chainId: chainId,
    address: contract,
    abi: [
      {
        inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
        name: "uri",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "uri",
    args: [BigInt(tokenId)],
  });

  const { data: metadata } = useQuery({
    queryKey: ["metadata", chainId, contract, tokenId],
    queryFn: async () => {
      const response = await fetch(
        rewriteUrlIfIpfsUrl(erc1155TokenURI as string),
      );
      if (!response.ok) {
        throw new Error("Network error");
      }
      return (await response.json()) as {
        name: string;
        decimals: string;
        description: string;
        image: string;
        properties: { [key: string]: string };
      };
    },
    enabled: !!erc1155TokenURI,
  });

  const attributes = Object.entries(metadata?.properties || {}).map(
    ([key, value]) => ({ trait_type: key, value }),
  );

  if (!metadata) {
    return <NFTCardSkeleton />;
  }

  return (
    <TokenMetadataDisplay
      title={metadata?.name}
      metadata={metadata}
      attributes={attributes}
      {...props}
    />
  );
};

interface TokenMetadataDisplayProps {
  title: string;
  metadata: { image: string; description?: string };
  attributes?: Array<{ trait_type: string; value: string }>;
  className?: string;
}

export const TokenMetadataDisplay = ({
  title,
  metadata,
  attributes,
  className,
}: TokenMetadataDisplayProps) => {
  return (
    <Card className={cn("w-[350px] overflow-hidden", className)}>
      <CardHeader className="p-0">
        <img
          alt="NFT"
          className="w-full object-cover"
          src={rewriteUrlIfIpfsUrl(metadata?.image)}
        />
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          {metadata?.description}
        </p>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-sm">
          {attributes?.map((item) => (
            <div key={item.trait_type} className="flex flex-col">
              <dt className="font-medium text-muted-foreground">
                {item.trait_type}
              </dt>
              <dd className="font-semibold">
                {item.value.toString().indexOf("https://") === 0 ? (
                  <a
                    href={item.value}
                    target="_blank"
                    className="text-primary-500 cursor-pointer underline"
                  >
                    {shortenUrl(item.value)}
                  </a>
                ) : (
                  <div>{formatValueOrAddress(item.value.toString())}</div>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
};

const formatAddress = (
  address: `0x${string}`,
  prefixLength = 6,
  suffixLength = 4,
): string => {
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
};

const formatValueOrAddress = (value: string): string => {
  return value.startsWith("0x") ? formatAddress(value as `0x${string}`) : value;
};

function shortenUrl(url: string) {
  return `${url.slice(0, 10)}...${url.slice(-4)}`;
}

function rewriteUrlIfIpfsUrl(url: string) {
  if (url.toLowerCase().startsWith("https://ipfs.io/ipfs")) {
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

function useERC20Balance({
  chainId,
  contract,
  wallet,
}: {
  chainId: number;
  contract: `0x${string}`;
  wallet: `0x${string}`;
}) {
  return useReadContracts({
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
}
