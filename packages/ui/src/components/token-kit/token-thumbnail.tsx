import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldX } from "lucide-react";
import React from "react";

type TokenCollection = {
  verified: boolean;
  chainId: number;
  address: `0x${string}`;
  name: string;
  tokenIds?: string[];
  logoURI?: string;
};

export interface TokenThumbnailProps {
  token: TokenCollection;
  onClick?: () => void;
  className?: string;
}

export const TokenThumbnail = ({
  token,
  onClick,
  className,
}: TokenThumbnailProps) => {
  return (
    <Card
      className={cn(
        "cursor-pointer text-left dark:bg-gray-900  hover:bg-accent w-full",
        className,
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center gap-10">
          <div className="flex justify-start items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={token.logoURI} alt="token" />
              <AvatarFallback className="">T</AvatarFallback>
            </Avatar>

            <div className="">
              <div className="font-bold">
                <span>{token.name}</span>
              </div>
              <div className="">
                <span className="hover:text-primary-500 text-[12px] text-gray-500 underline ">
                  {formatAddress(token.address)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-end">
                    {token.verified ? (
                      <ShieldCheck color="#16a34a" />
                    ) : (
                      <ShieldX color="#aa3131" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {token.verified ? "Verified" : "Unverified"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {token.tokenIds && (
              <Badge
                variant="outline"
                className="text-primary-500 border-primary-500 mt-2 rounded-full"
              >
                {token.tokenIds.length}
              </Badge>
            )}
          </div>
        </div>
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
