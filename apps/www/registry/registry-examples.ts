import { Registry } from "@/registry/schema";

export const examples: Registry = [
  {
    name: "token-card-demo",
    type: "registry:example",
    registryDependencies: ["token-card"],
    files: ["example/token-card-demo.tsx"],
  },
  {
    name: "token-thumbnail-demo",
    type: "registry:example",
    registryDependencies: ["token-thumbnail"],
    files: ["example/token-thumbnail-demo.tsx"],
  },
];
