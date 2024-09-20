import { Registry } from "@/registry/schema";

export const examples: Registry = [
  {
    name: "accordion-demo",
    type: "registry:example",
    registryDependencies: ["accordion"],
    files: ["example/accordion-demo.tsx"],
  },
  {
    name: "token-card-demo",
    type: "registry:example",
    registryDependencies: ["token-card"],
    files: ["example/token-card-demo.tsx"],
  },
];
