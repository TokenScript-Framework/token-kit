import { Registry } from "@/registry/schema";

export const examples: Registry = [
  {
    name: "token-card-erc20-demo",
    type: "registry:example",
    registryDependencies: ["token-card"],
    files: ["example/token-card-erc20-demo.tsx"],
  },
  {
    name: "token-card-erc721-demo",
    type: "registry:example",
    registryDependencies: ["token-card"],
    files: ["example/token-card-erc721-demo.tsx"],
  },
  {
    name: "token-card-erc1155-demo",
    type: "registry:example",
    registryDependencies: ["token-card"],
    files: ["example/token-card-erc1155-demo.tsx"],
  },
  {
    name: "token-thumbnail-demo",
    type: "registry:example",
    registryDependencies: ["token-thumbnail"],
    files: ["example/token-thumbnail-demo.tsx"],
  },
];
