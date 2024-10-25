import { Registry } from "@/registry/schema";

export const ui: Registry = [
  {
    name: "token-card",
    type: "registry:ui",
    files: ["ui/token-card.tsx"],
    dependencies: ["@tanstack/react-query", "wagmi", "viem"],
    shadcnDependencies: ["card", "skeleton"],
  },
  {
    name: "token-thumbnail",
    type: "registry:ui",
    files: ["ui/token-thumbnail.tsx"],
    dependencies: ["lucide-react"],
    shadcnDependencies: ["avatar", "card", "tooltip"],
  },
  {
    name: "token-tx-sonner",
    type: "registry:ui",
    files: ["ui/token-tx-sonner.tsx"],
    dependencies: ["sonner", "@wagmi/core"],
  },
  {
    name: "my-nfts",
    type: "registry:ui",
    files: ["ui/my-nfts.tsx"],
    dependencies: ["@tanstack/react-query", "@token-kit/onchain"],
    registryDependencies: ["token-card"],
    shadcnDependencies: ["scroll-area"],
  },
  {
    name: "tapp-card",
    type: "registry:ui",
    files: ["ui/tapp-card.tsx"],
    dependencies: ["wagmi", "@frames.js/render", "@neynar/react", "viem"],
    shadcnDependencies: ["card", "skeleton"],
  },
  {
    name: "add-to-snap",
    type: "registry:ui",
    files: ["ui/add-to-snap.tsx"],
    dependencies: ["view"],
    shadcnDependencies: [],
  },
];
