"use client"
import { TokenCard } from "@/components/token-kit/token-card";
import { TokenThumbnail } from "@/components/token-kit/token-thumbnail";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { showTxSonner } from "@/components/token-kit/token-tx-sonner";
import { useEffect } from "react";

export default function Home() {

  useEffect(() => {
    setTimeout(() => {
      showTxSonner('0x6ab620baa39d4bf784a229c1aa4df0b25267863a4e623785d8937c48c6b4170d', 'https://etherscan.io/tx/', 5000);
    }, 0);
  }, []);
  
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Token-Kit template</h1>
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              src/app/page.tsx
            </code>
            .
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className="grid grid-cols-3 gap-10">
          <div>
            <TokenCard
              type="ERC20"
              chainId={1}
              contract="0xdac17f958d2ee523a2206206994597c13d831ec7"
              wallet="0x04B07Ab1970898FF7e4e6a487530515129deF530"
            />
          </div>

          <div className="max-w-xs">
            <TokenCard
              type="ERC721"
              chainId={137}
              tokenId="1649017156"
              contract="0xD5cA946AC1c1F24Eb26dae9e1A53ba6a02bd97Fe"
            />
          </div>

          <div className="max-w-xs">
            <TokenCard
              type="ERC1155"
              chainId={1}
              tokenId="1"
              contract="0x73da73ef3a6982109c4d5bdb0db9dd3e3783f313"
            />
          </div>
        </div>

        <div>
          <TokenThumbnail
            token={{
              address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
              name: "Tether USD",
              chainId: 1,
              logoURI:
                "https://assets.coingecko.com/coins/images/325/standard/Tether.png?1696501661",
              verified: true,
            }}
          />
        </div>

        <div className="flex flex-col gap-4 items-center sm:flex-row">
          <ConnectButton />
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://github.com/tokenScript-Framework/token-kit/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>

      </main>
    </div>
  );
}