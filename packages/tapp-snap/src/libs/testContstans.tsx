import { ADDRESSTYPE } from "./types";

export const tokenMetadata = {
  image:
    "https://resources.smartlayer.network/smartcat/reources/images/e5fd0c706c4eb3cc7f4295797f91e02e.png",
  attributes: [
    {
      trait_type: "Collection",
      value: "SmartCats",
    },
    {
      trait_type: "TokenId",
      value: "2665409553",
    },
    {
      trait_type: "Background",
      value: "SL Background Pink (Common)",
    },
    {
      trait_type: "Hat",
      value: "Glasses Black (Common)",
    },
    {
      trait_type: "Outfit",
      value: "SL Light Blue Hoodie (Common)",
    },
  ],
  description: "SmartCat#2426-2665409553",
  name: "SmartCat#2426-2665409553",
};

export const testOwner = "0x16f1cdf5200d7ae7f07c1522f19052a722d93970";
export const testToken = {
  chain: "1",
  contract: "0x06012c8cf97bead5deae237070f9587f8e7a266d" as ADDRESSTYPE,
  tokenId: "1049480",
  name: "test",
  description: "test",
  aboutUrl: "https://test.com",
  actions: ["action1"],
};

export const testState = {
  ["0x16f1CdF5200d7ae7f07c1522f19052A722D93970"]: {
    ["1-0x06012c8cf97bead5deae237070f9587f8e7a266d-1049480"]: {
      chain: "1",
      contract: "0x06012c8cf97bead5deae237070f9587f8e7a266d" as ADDRESSTYPE,
      tokenId: "1049480",
      actions: ["action1"],
      name: "test",
      description: "test",
      aboutUrl: "https://test.com",
      tokenMetadata: {
        image:
          "https://img.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/1049480.png",
        attributes: [
          { trait_type: "generation", value: "0" },
          { trait_type: "cooldown_index", value: "0" },
        ],
        description: "CryptoKitties description",
        name: "CryptoKitties #1049480",
      },
    },
  },
};
