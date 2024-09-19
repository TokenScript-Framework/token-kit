import { Registry } from "@/registry/schema";

export const ui: Registry = [
  {
    name: "token-card",
    type: "registry:ui",
    dependencies: ["@tanstack/react-query", "wagmi", "viem"],
    shadcnDependencies: ["card", "skeleton"],
    files: ["ui/token-card.tsx"],
  },
  {
    name: "token-thumbnail",
    type: "registry:ui",
    dependencies: ["lucide-react"],
    shadcnDependencies: ["card", "tooltip", "badge", "avatar"],
    files: ["ui/token-thumbnail.tsx"],
  },
];
