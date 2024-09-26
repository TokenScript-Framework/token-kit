import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/registry/default/lib/utils";
import { NFTCardSkeleton, TokenCard } from "@/registry/default/ui/token-card";
import { useQuery } from "@tanstack/react-query";
import { myNfts, MyNftsInput } from "@token-kit/onchain";

export const MyNfts = (
  props: MyNftsInput & { chainId: number; className?: string },
) => {
  const { data, isLoading } = useQuery({
    queryKey: ["myNfts", props.address, props.chainId],
    queryFn: () => myNfts(props),
  });

  return (
    <ScrollArea
      className={cn(
        "w-[500px] whitespace-nowrap rounded-md border",
        props.className,
      )}
    >
      <div className="flex w-max space-x-4 p-4">
        {isLoading
          ? [...Array(3)].map((_, index) => <NFTCardSkeleton key={index} />)
          : data?.tokens.map((nft) => (
              <TokenCard
                key={nft.tokenId.toString()}
                type="ERC721"
                chainId={props.chainId}
                contract={props.address}
                tokenId={nft.tokenId.toString()}
              />
            ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
