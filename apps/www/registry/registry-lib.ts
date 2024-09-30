import { Registry } from "@/registry/schema";

export const lib: Registry = [
  {
    name: "utils",
    type: "registry:lib",
    dependencies: ["clsx", "tailwind-merge", "@wagmi/core", "wagmi"],
    files: [
      {
        path: "lib/utils.ts",
        type: "registry:lib",
      },
    ],
  },
];
