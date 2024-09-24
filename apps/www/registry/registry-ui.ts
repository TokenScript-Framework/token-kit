import { Registry } from "@/registry/schema";

export const ui: Registry = [
  {
    name: "token-card",
    type: "registry:ui",
    files: ["ui/token-card.tsx"],
    dependencies: ["react", "viem", "wagmi"],
  },
  {
    name: "token-thumbnail",
    type: "registry:ui",
    files: ["ui/token-thumbnail.tsx"],
    dependencies: ["react", "viem", "wagmi"],
  },
  {
    name: "token-tx-sonner",
    type: "registry:ui",
    files: ["ui/token-tx-sonner.tsx"],
    dependencies: ["react", "viem", "wagmi"],
  },
];
