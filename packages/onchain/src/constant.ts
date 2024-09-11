export enum TOKEN_TYPES {
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

export enum ERC721_SUBTYPE_INTERFACEIDS {
  IERC721TokenReceiver = "0x150b7a02",
  IERC721Metadata = "0x5b5e139f",
  IERC721Enumerable = "0x780e9d63",
}

export enum ERC1155_SUBTYPE_INTERFACEIDS {
  IERC1155TokenReceiver = "0x4e2312e0",
  IERC1155Metadata_URI = "0x0e89341c",
}

export const SUBTYPE_INTERFACEIDS = {
  ERC721: ERC721_SUBTYPE_INTERFACEIDS,
  ERC1155: ERC1155_SUBTYPE_INTERFACEIDS,
};

export enum INTERFACE_IDS {
  ERC721 = "0x80ac58cd",
  ERC1155 = "0xd9b67a26",
}

export const UNKNOWN_TYPE = "Unknown Type";

export type TokenType = {
  type: string;
  subTypes?: string[];
  scriptURI?: string[];
};
