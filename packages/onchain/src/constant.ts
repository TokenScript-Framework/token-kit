export const IERC721InterfaceId = "0x80ac58cd";
export const IERC1155InterfaceId = "0xd9b67a26";
enum ERC721InterfaceId {
  IERC721TokenReceiver = "0x150b7a02",
  IERC721Metadata = "0x5b5e139f",
  IERC721Enumerable = "0x780e9d63",
}

enum ERC1155InterfaceId {
  IERC1155TokenReceiver = "0x4e2312e0",
  IERC1155Metadata_URI = "0x0e89341c",
}

export const interfaceIdMap = {
  ERC721: ERC721InterfaceId,
  ERC1155: ERC1155InterfaceId,
};

export const tokenTypes = ["ERC20", "ERC721", "ERC1155"];
export const earlyReturnTypes = ["ERC20", "ERC5169"];
