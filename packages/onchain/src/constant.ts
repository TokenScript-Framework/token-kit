// export const IERC721InterfaceId = "0x80ac58cd";
// export const IERC1155InterfaceId = "0xd9b67a26";
// enum ERC721InterfaceId {
//   IERC721TokenReceiver = "0x150b7a02",
//   IERC721Metadata = "0x5b5e139f",
//   IERC721Enumerable = "0x780e9d63",
// }

// enum ERC1155InterfaceId {
//   IERC1155TokenReceiver = "0x4e2312e0",
//   IERC1155Metadata_URI = "0x0e89341c",
// }

// export const interfaceIdMap = {
//   ERC721: ERC721InterfaceId,
//   ERC1155: ERC1155InterfaceId,
// };

// export const tokenTypes = ["ERC20", "ERC721", "ERC1155"];
// export const earlyReturnTypes = ["ERC20", "ERC5169"];

export const TOKEN_TYPES = ["ERC20", "ERC721", "ERC1155"];
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

export const SUBTYPE_INTERFACEIDS = {
  ERC721: {
    IERC721TokenReceiver: "0x150b7a02",
    IERC721Metadata: "0x5b5e139f",
    IERC721Enumerable: "0x780e9d63",
  },
  ERC1155: {
    IERC1155TokenReceiver: "0x4e2312e0",
    IERC1155Metadata_URI: "0x0e89341c",
  },
};

export const INTERFACEIDS = { ERC721: "0x80ac58cd", ERC1155: "0xd9b67a26" };

export type TOKEN_TYPE = { type: string; subType?: string[] };
