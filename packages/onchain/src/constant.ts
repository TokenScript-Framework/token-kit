export enum TokenTypes {
  ERC20 = "ERC20",
  ERC721 = "ERC721",
  ERC1155 = "ERC1155",
}

export const SUB_TYPES = {
  ERC20: ["ERC5169"],
  ERC721: [
    "ERC5169",
    "IERC721TokenReceiver",
    "IERC721Metadata",
    "IERC721Enumerable",
  ],
  ERC1155: ["ERC5169", "IERC1155TokenReceiver", "IERC1155Metadata_URI"],
};

export enum ERC721InterfaceIds {
  IERC721TokenReceiver = "0x150b7a02",
  IERC721Metadata = "0x5b5e139f",
  IERC721Enumerable = "0x780e9d63",
}

export enum ERC1155InterfaceIds {
  IERC1155TokenReceiver = "0x4e2312e0",
  IERC1155Metadata_URI = "0x0e89341c",
}

export const SUBTYPE_INTERFACEIDS = {
  ERC721: ERC721InterfaceIds,
  ERC1155: ERC1155InterfaceIds,
};

export enum InterfaceIds {
  ERC721 = "0x80ac58cd",
  ERC1155 = "0xd9b67a26",
}

export const UNKNOWN = "Unknown";

export type TokenType = {
  type: string;
  subTypes?: string[];
  scriptURI?: string[];
};

export interface ERC20TokenData {
  type: TokenType;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
}

export interface ERC721TokenData {
  type: TokenType;
  owner: `0x${string}`;
  tokenURI: string;
  tokenMetadata?: unknown;
  contractMetadata?: unknown;
}

export interface ERC1155TokenData {
  type: TokenType;
  uri: string;
  tokenMetadata?: unknown;
  contractMetadata?: unknown;
}

export type FetchHandler = (uri: string) => Promise<unknown>;

export type TokenDataOptions = {
  includeTokenMetadata?: boolean;
  includeContractMetadata?: boolean;
  ipfsGatewayDomain?: string;
  fetchHandler?: FetchHandler;
};

export type MyNftsOptions = Omit<TokenDataOptions, "includeContractMetadata">;
export type MyNftToken = {
  tokenId: bigint;
  tokenURI: string;
  tokenMetadata?: unknown;
};
export type MyNftTokenWithoutMetadata = Omit<MyNftToken, "tokenMetadata">;
export type MyNfts = {
  owner: `0x${string}`;
  tokens: MyNftToken[];
};

export const DEFAULT_IPFS_GATEWAY_DOMAIN = "https://gateway.pinata.cloud";
