"use client";
import React, { useEffect, useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Inbox } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { TokenCard } from "@/registry/default/ui/token-card";
import AddToSnap from "@/registry/default/ui/add-to-snap";
import TappCard from "@/registry/default/ui/tapp-card";
import { TokenThumbnail } from "@/registry/default/ui/token-thumbnail";
import { Nav } from "./nav";
import "@rainbow-me/rainbowkit/styles.css";
export type TokenType = "ERC20" | "ERC721" | "ERC1155";
interface Token {
  address: `0x${string}`;
  name: string;
  logoURI: string;
  verified: boolean;
  chain: number;
  tokenIds?: string[];
}

// The following datas are only for components preview, can't be performed actual transactions.
const tokenLists: Record<TokenType, Token[]> = {
  ERC20: [
    {
      chain: 1,
      address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      name: "Tether USD",
      logoURI:
        "https://assets.coingecko.com/coins/images/325/standard/Tether.png?1696501661",
      verified: true,
    },
    {
      chain: 1,
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      name: "USD Coin",
      logoURI:
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
      verified: true,
    },
  ],
  ERC721: [
    {
      chain: 11155111,
      address: "0x3490FFc64A4E65aBb749317f7860E722Ba65a2b5",
      name: "SmartCats",
      logoURI:
        "https://resources.smartlayer.network/smartcat/reources/images/e5fd0c706c4eb3cc7f4295797f91e02e.png",
      verified: false,
      tokenIds: ["473843023", "1481423213"],
    },
    {
      chain: 137,
      address: "0xD5cA946AC1c1F24Eb26dae9e1A53ba6a02bd97Fe",
      name: "SmartCats",
      logoURI:
        "https://i.seadn.io/s/raw/files/d03c2839d6097f12e409abc6805eb180.png?auto=format&dpr=1&w=384",
      verified: true,
      tokenIds: ["2653133657"],
    },
  ],
  ERC1155: [
    {
      chain: 1,
      address: "0x73da73ef3a6982109c4d5bdb0db9dd3e3783f313",
      name: "MyCurioCards",
      logoURI:
        "https://i.seadn.io/gae/xNW1W9O2CYUNGS2GeHqv9yHw-wLdSb9uVoc51TL5GSp8yvC2en45pqp5zYFHhRGHZpgHJdagD2QELXwpu01frltG7Nl055aVqDTDSg?auto=format&dpr=1&w=384",
      verified: true,
      tokenIds: ["1", "2", "3"],
    },
  ],
};

const TokenList = ({
  tokens,
  onSelect,
  selectedToken,
}: {
  tokens: Token[];
  onSelect: (token: Token) => void;
  selectedToken: Token | null;
}) => {
  useEffect(() => {
    if (tokens.length > 0 && !selectedToken) {
      onSelect(tokens[0]);
    }
  }, [tokens, onSelect, selectedToken]);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2">
        {tokens.map((token) => (
          <TokenThumbnail
            key={token.address}
            onClick={() => onSelect(token)}
            token={token}
            className={`${selectedToken?.address === token.address ? "bg-accent" : "hover:bg-accent"}`}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

const TokenDetails = ({
  token,
  tokenType,
}: {
  token: Token | null;
  tokenType: TokenType;
}) => {
  const [tokenId, setTokenId] = useState<string>("");
  const { address } = useAccount();

  const [activeTab, setActiveTab] = useState("token");

  useEffect(() => {
    setActiveTab("token");
  }, [tokenType]);

  useEffect(() => {
    if (token) {
      if (
        tokenType !== "ERC20" &&
        token.tokenIds &&
        token.tokenIds.length > 0
      ) {
        setTokenId(token.tokenIds[0]);
      } else {
        setTokenId("");
      }
    }
  }, [token, tokenType]);
  return (
    <div className="flex h-full flex-col p-4">
      {tokenType === "ERC20" ? (
        token && (
          <TokenCard
            type={tokenType}
            chainId={token.chain}
            contract={token.address}
            wallet={address ?? "0x5814cf68Dcb994e7Ec81bB9097593a8cA540Cf3E"}
          />
        )
      ) : (
        <>
          {token && (
            <div className="mb-4 flex w-full items-center justify-between space-x-2">
              <div className="flex w-1/3 items-center justify-between space-x-2">
                <div className="font-bold">TokenId: </div>
                <Select value={tokenId} onValueChange={setTokenId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Token ID" />
                  </SelectTrigger>
                  <SelectContent>
                    {token.tokenIds?.map((id) => (
                      <SelectItem key={id} value={id}>
                        {id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {address && tokenType !== "ERC1155" && (
                  <AddToSnap
                    contract={token.address}
                    tokenId={tokenId}
                    chain={token.chain.toString()}
                    title={"S"}
                    cssClass={
                      "rounded-full px-[8px] py-[5px] w-6 h-6 flex items-center"
                    }
                  />
                )}
              </div>

              <ConnectButton showBalance={false} chainStatus="icon" />
            </div>
          )}
          <Separator />
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 dark:bg-transparent">
              <TabsTrigger value="token">Token</TabsTrigger>
              <TabsTrigger value="script">Script</TabsTrigger>
            </TabsList>
            <TabsContent
              value="token"
              className="mx-auto h-[calc(100vh-150px)] w-2/3"
            >
              {token && (
                <TokenCard
                  type={tokenType}
                  chainId={token.chain}
                  contract={token.address}
                  tokenId={tokenId}
                  className="h-full overflow-auto"
                />
              )}
            </TabsContent>
            <TabsContent value="script" className="mx-auto w-2/3">
              {tokenType !== "ERC1155" ? (
                <>
                  {address && token ? (
                    <div className="h-[calc(100vh-200px)] w-full">
                      <TappCard
                        chainId={token?.chain}
                        contract={token.address}
                        tokenId={tokenId}
                        cssClass="h-full w-full border"
                      />
                    </div>
                  ) : (
                    <div className="mt-10 flex h-full flex-col items-center justify-center">
                      <div className="mb-4 text-center">
                        <p className="text-xl font-bold">
                          Please connect wallet to view more.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-10 flex h-full flex-col items-center justify-center">
                  <div className="mb-4 text-center">
                    <p className="text-xl font-bold">
                      This token has no script.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default function Dashboard() {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  const [tokenType, setTokenType] = useState<TokenType>("ERC20");

  useEffect(() => {
    if (!tokenType) {
      setTokenType("ERC20");
    }
    setSelectedToken(tokenLists[tokenType][0]);
  }, [tokenType, setTokenType]);

  const handleTokenTypeChange = (tokenType: TokenType) => {
    setTokenType(tokenType);
  };

  return (
    <div className="flex h-screen flex-col text-sm">
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-screen">
          <ResizablePanel
            defaultSize={20}
            minSize={15}
            collapsible={true}
            maxSize={20}
            className="relative flex flex-col"
          >
            <div className="flex-1 overflow-y-auto">
              <Nav
                links={[
                  {
                    title: "Token Types",
                    icon: Inbox,
                    variant: "ghost",
                    children: [
                      {
                        title: "ERC20",
                        variant: "ghost",
                      },
                      { title: "ERC721", variant: "ghost" },
                      { title: "ERC1155", variant: "ghost" },
                    ],
                  },
                ]}
                tokenType={tokenType}
                onTokenTypeChange={handleTokenTypeChange}
              />
            </div>
            <Separator />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={30}
            minSize={30}
            maxSize={30}
            className="p-4"
          >
            {tokenType && (
              <TokenList
                key={tokenType}
                tokens={tokenLists[tokenType]}
                onSelect={setSelectedToken}
                selectedToken={selectedToken}
              />
            )}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={50}
            minSize={30}
            className="min-w-unset display:block"
          >
            <TokenDetails token={selectedToken} tokenType={tokenType} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
