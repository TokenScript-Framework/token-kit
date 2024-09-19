export type ADDRESSTYPE = `0x${string}`;
export type Attribute = {
  trait_type: string;
  value: string | number;
};

export type Token = {
  chain: string;
  contract: ADDRESSTYPE;
  tokenId?: string;
  actions: string[];
  name: string;
  description: string;
  aboutUrl: string;
  tokenMetadata: TokenMetadata;
};

export type TokenMetadata = {
  image?: string;
  attributes: Attribute[];
  description: string;
  name: string;
  animation_url?: string;
};

export type ContractMetadata = {
  name: string;
  description: string;
  external_link?: string;
  image?: string;
};
