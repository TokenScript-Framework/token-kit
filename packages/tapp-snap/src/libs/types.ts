export type ADDRESSTYPE = `0x${string}`;

export type Attribute = {
  trait_type: string;
  value: string | number;
};

export type Metadata = {
  chain: string;
  contract: ADDRESSTYPE;
  tokenId: string;
  owner: ADDRESSTYPE;
  actions: string[];
  name: string;
  description: string;
  aboutUrl: string;
  tokenMetadata: TokenMetadata & { svg?: string };
};

export type TokenMetadata = {
  image: string;
  attributes: Attribute[];
  description: string;
  name: string;
  animation_url?: string;
};

export type Token = {
  chain: string;
  contract: ADDRESSTYPE;
  tokenId: string;
  owner: ADDRESSTYPE;
  actions: string[];
  name: string;
  description: string;
  aboutUrl: string;
  tokenMetadata: TokenMetadata;
};

export type State = {
  [owner: string]: {
    [tokenIdentifier: string]: Token;
  };
};

export type TokenListState = {
  [key: string]: Token;
};
