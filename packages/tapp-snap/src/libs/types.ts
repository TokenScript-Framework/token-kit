import { Json } from "@metamask/utils";

export type ADDRESSTYPE = `0x${string}`;

export type Attribute = {
  trait_type: string;
  value: string | number;
};

type BaseTokenInfo = {
  chain: string;
  contract: ADDRESSTYPE;
  tokenId: string;
  owner: ADDRESSTYPE;
  actions: string[];
  name: string;
  description: string;
  aboutUrl: string;
};

export type Metadata = BaseTokenInfo & {
  tokenMetadata: TokenMetadata & { svg?: string };
};

export type Token = Omit<Metadata, "tokenMetadata"> & {
  tokenMetadata: TokenMetadata;
};

export type TokenMetadata = {
  image: string;
  attributes: Attribute[];
  description: string;
  name: string;
  animation_url?: string;
};

export type State = {
  [owner: string]: {
    [tokenIdentifier: string]: Token;
  };
};

export type TokenListState = {
  [key: string]: Token;
};

export type CheckResult =
  | { result: false; dialog: Json }
  | { result: true; owner: ADDRESSTYPE };
