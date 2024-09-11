import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { addressPipe } from "@/libs";
import { ShieldCheck, ShieldX } from "lucide-react";
import React from "react";

type TokenCollection = {
  signed: boolean;
  chainId: number;
  address: `0x${string}`;
  name: string;
  tokenIds?: string[];
  logoURI?: string;
};

export interface TokenThumbnailProps {
  type: "ERC20" | "ERC721" | "ERC1155";
  token: TokenCollection;
  selected: boolean;
  onClick?: () => void;
}

export const TokenThumbnail: React.FC<TokenThumbnailProps> = ({
  type,
  token,
  selected,
  onClick,
}) => {
  return (
    <Card
      className={`${selected ? "bg-accent" : ""} cursor-pointer text-left dark:bg-gray-900  hover:bg-accent w-full`}
      onClick={onClick}
    >
      <CardContent>
        <div className="flex justify-between items-center m-0">
          <div className="flex justify-start items-center">
            <Avatar className="w-10 h-10">
              <AvatarImage src={token.logoURI} alt="token" />
              <AvatarFallback className="bg-primary-100/20">T</AvatarFallback>
            </Avatar>

            <div className="ml-4">
              <div className="font-bold">
                <span>{token.name}</span>
              </div>
              <div className="mt-2">
                <a className="hover:text-primary-500 text-[12px] text-gray-500 underline ">
                  {addressPipe(token.address)}
                </a>
              </div>
            </div>
          </div>
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-end">
                    {token.signed ? (
                      <ShieldCheck color="#16a34a" />
                    ) : (
                      <ShieldX color="#aa3131" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {token.signed ? "Secure Tokenscript" : "Insecure Tokenscript"}
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
