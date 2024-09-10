import { Config } from "@/src/utils/get-config";
import {
  registryBaseColorSchema,
  registryIndexSchema,
  registryItemWithContentSchema,
  registryWithContentSchema,
  stylesSchema,
} from "@/src/utils/registry/schema";
import { HttpsProxyAgent } from "https-proxy-agent";
import path from "path";
import { z } from "zod";

const baseUrl = process.env.COMPONENTS_REGISTRY_URL ?? "https://resources.smarttokenlabs.com/token-kit/ui";
const agent = process.env.https_proxy
  ? new HttpsProxyAgent(process.env.https_proxy)
  : undefined;

export async function getRegistryIndex() {
  try {
    const [result] = await fetchRegistry(["index.json"]);

    return registryIndexSchema.parse(result);
  } catch (error) {
    throw new Error(`Failed to fetch components from registry.`);
  }
}

export async function getRegistryStyles() {
  try {
    const [result] = await fetchRegistry(["styles/index.json"]);

    return stylesSchema.parse(result);
  } catch (error) {
    throw new Error(`Failed to fetch styles from registry.`);
  }
}

export async function getRegistryBaseColors() {
  return [
    {
      name: "slate",
      label: "Slate",
    },
    {
      name: "gray",
      label: "Gray",
    },
    {
      name: "zinc",
      label: "Zinc",
    },
    {
      name: "neutral",
      label: "Neutral",
    },
    {
      name: "stone",
      label: "Stone",
    },
  ];
}

export async function getRegistryBaseColor(baseColor: string) {
  try {
    const [result] = await fetchRegistry([`colors/${baseColor}.json`]);

    return registryBaseColorSchema.parse(result);
  } catch (error) {
    throw new Error(`Failed to fetch base color from registry.`);
  }
}

export async function resolveTree(
  index: z.infer<typeof registryIndexSchema>,
  names: string[],
) {
  const tree: z.infer<typeof registryIndexSchema> = [];

  for (const name of names) {
    const entry = index.find((entry) => entry.name === name);

    if (!entry) {
      continue;
    }

    tree.push(entry);

    if (entry.registryDependencies) {
      const dependencies = await resolveTree(index, entry.registryDependencies);
      tree.push(...dependencies);
    }
  }

  return tree.filter(
    (component, index, self) =>
      self.findIndex((c) => c.name === component.name) === index,
  );
}

export async function fetchTree(
  style: string,
  tree: z.infer<typeof registryIndexSchema>,
) {
  try {
    const paths = tree.map((item) => `styles/${style}/${item.name}.json`);
    const result = await fetchRegistry(paths);

    return registryWithContentSchema.parse(result);
  } catch (error) {
    throw new Error(`Failed to fetch tree from registry.`);
  }
}

export async function getItemTargetPath(
  config: Config,
  item: Pick<z.infer<typeof registryItemWithContentSchema>, "type">,
  override?: string,
) {
  if (override) {
    return override;
  }

  if (item.type === "components:ui" && config.aliases.ui) {
    return config.resolvedPaths.ui;
  }

  const [parent, type] = item.type.split(":");
  if (!(parent in config.resolvedPaths)) {
    return null;
  }

  return path.join(
    config.resolvedPaths[parent as keyof typeof config.resolvedPaths],
    type,
  );
}

const hardcodedStyle = {
  "styles/default/nft-card.json": {
    name: "nft-card",
    files: [
      {
        name: "NFTCard.tsx",
        content:
          'import { useQuery } from "@tanstack/react-query";\nimport axios from "axios";\nimport { ShieldCheck, ShieldX } from "lucide-react";\nimport React from "react";\nimport { erc721Abi } from "viem";\nimport { useReadContract } from "wagmi";\nimport { useTsMetadata } from "../../hooks";\nimport { OpenseaIcon } from "../icons/opensea-icon";\nimport { Card, CardContent, CardHeader } from "../shadcn/ui/card";\nimport { ScrollArea, ScrollBar } from "../shadcn/ui/scroll-area";\nimport { Skeleton } from "../shadcn/ui/skeleton";\nimport {\n  Tooltip,\n  TooltipContent,\n  TooltipProvider,\n  TooltipTrigger,\n} from "../shadcn/ui/tooltip";\n\nexport interface NFTCardProps {\n  chainId: number;\n  contract: `0x${string}`;\n  tokenId: string;\n  onClick?: () => void;\n}\n\nexport const NFTCard: React.FC<NFTCardProps> = ({\n  chainId,\n  contract,\n  tokenId,\n  onClick,\n}) => {\n  const { data: tokenURI } = useReadContract({\n    chainId: chainId,\n    address: contract,\n    abi: erc721Abi,\n    functionName: "tokenURI",\n    args: [BigInt(tokenId)],\n  });\n\n  const { data: metadata } = useQuery({\n    queryKey: ["metadata", chainId, contract, tokenId],\n    queryFn: async () => {\n      const res = await axios.get(tokenURI!);\n      return res.data;\n    },\n    enabled: !!tokenURI,\n  });\n\n  const { tsMetadata, isChecking } = useTsMetadata({\n    chainId,\n    contract,\n    options: { checkSignature: true },\n  });\n\n  if (!metadata || isChecking) {\n    return (\n      <Card>\n        <CardHeader className="relative space-y-0 p-0">\n          <Skeleton className="w-full rounded-lg pb-[100%]" />\n        </CardHeader>\n        <CardContent className="p-4">\n          <div className="relative flex w-full items-center space-x-4">\n            <Skeleton className="h-12 w-12 rounded-full" />\n            <div className="space-y-2">\n              <Skeleton className="h-4 w-48" />\n              <Skeleton className="h-4 w-36" />\n            </div>\n          </div>\n        </CardContent>\n      </Card>\n    );\n  }\n\n  return (\n    <Card onClick={onClick}>\n      <CardHeader className="relative space-y-0 p-0">\n        <a\n          href="https://opensea.io/assets/matic/0xd5ca946ac1c1f24eb26dae9e1a53ba6a02bd97fe/1202370524"\n          target="_blank"\n        >\n          <OpenseaIcon className="absolute right-2 top-2" />\n        </a>\n        <img className="rounded-lg" src={metadata?.image} />\n      </CardHeader>\n      <CardContent className="p-4">\n        <div className="flex flex-col gap-4">\n          <div className="relative w-full">\n            <h3 className="mb-2 text-lg font-semibold leading-none">\n              Description\n            </h3>\n            <p className="text-muted-foreground text-sm">\n              {metadata?.description}\n            </p>\n            <div className="absolute right-2 top-0">\n              <TooltipProvider>\n                <Tooltip>\n                  <TooltipTrigger>\n                    {tsMetadata?.signed ? (\n                      <ShieldCheck color="#16a34a" />\n                    ) : (\n                      <ShieldX color="#aa3131" />\n                    )}\n                  </TooltipTrigger>\n                  <TooltipContent>\n                    {tsMetadata?.signed ? "Secure Tokenscript" : "Insecure Tokenscript"}\n                  </TooltipContent>\n                </Tooltip>\n              </TooltipProvider>\n            </div>\n          </div>\n          <div className="w-full">\n            <h3 className="mb-2 text-lg font-semibold leading-none">Traits</h3>\n            <ScrollArea className="w-full whitespace-nowrap rounded-md border p-2">\n              <div className="flex w-full gap-2">\n                {metadata?.attributes?.map(\n                  ({\n                    trait_type,\n                    value,\n                  }: {\n                    trait_type: string;\n                    value: string;\n                  }) => {\n                    return (\n                      <div\n                        key={trait_type}\n                        className="bg-primary-100/10 flex w-full flex-col items-center rounded-md border"\n                      >\n                        <div className="font-semibold">{trait_type}</div>\n                        <div>{value}</div>\n                      </div>\n                    );\n                  },\n                )}\n              </div>\n              <ScrollBar orientation="horizontal" />\n            </ScrollArea>\n          </div>\n        </div>\n      </CardContent>\n    </Card>\n  );\n};\n',
      },
    ],
    type: "components:ui",
  },
  "colors/slate.json": {
    inlineColors: {
      light: {
        background: "white",
        foreground: "slate-950",
        card: "white",
        "card-foreground": "slate-950",
        popover: "white",
        "popover-foreground": "slate-950",
        primary: "slate-900",
        "primary-foreground": "slate-50",
        secondary: "slate-100",
        "secondary-foreground": "slate-900",
        muted: "slate-100",
        "muted-foreground": "slate-500",
        accent: "slate-100",
        "accent-foreground": "slate-900",
        destructive: "red-500",
        "destructive-foreground": "slate-50",
        border: "slate-200",
        input: "slate-200",
        ring: "slate-950",
      },
      dark: {
        background: "slate-950",
        foreground: "slate-50",
        card: "slate-950",
        "card-foreground": "slate-50",
        popover: "slate-950",
        "popover-foreground": "slate-50",
        primary: "slate-50",
        "primary-foreground": "slate-900",
        secondary: "slate-800",
        "secondary-foreground": "slate-50",
        muted: "slate-800",
        "muted-foreground": "slate-400",
        accent: "slate-800",
        "accent-foreground": "slate-50",
        destructive: "red-900",
        "destructive-foreground": "slate-50",
        border: "slate-800",
        input: "slate-800",
        ring: "slate-300",
      },
    },
    cssVars: {
      light: {
        background: "0 0% 100%",
        foreground: "222.2 84% 4.9%",
        card: "0 0% 100%",
        "card-foreground": "222.2 84% 4.9%",
        popover: "0 0% 100%",
        "popover-foreground": "222.2 84% 4.9%",
        primary: "222.2 47.4% 11.2%",
        "primary-foreground": "210 40% 98%",
        secondary: "210 40% 96.1%",
        "secondary-foreground": "222.2 47.4% 11.2%",
        muted: "210 40% 96.1%",
        "muted-foreground": "215.4 16.3% 46.9%",
        accent: "210 40% 96.1%",
        "accent-foreground": "222.2 47.4% 11.2%",
        destructive: "0 84.2% 60.2%",
        "destructive-foreground": "210 40% 98%",
        border: "214.3 31.8% 91.4%",
        input: "214.3 31.8% 91.4%",
        ring: "222.2 84% 4.9%",
        "chart-1": "12 76% 61%",
        "chart-2": "173 58% 39%",
        "chart-3": "197 37% 24%",
        "chart-4": "43 74% 66%",
        "chart-5": "27 87% 67%",
      },
      dark: {
        background: "222.2 84% 4.9%",
        foreground: "210 40% 98%",
        card: "222.2 84% 4.9%",
        "card-foreground": "210 40% 98%",
        popover: "222.2 84% 4.9%",
        "popover-foreground": "210 40% 98%",
        primary: "210 40% 98%",
        "primary-foreground": "222.2 47.4% 11.2%",
        secondary: "217.2 32.6% 17.5%",
        "secondary-foreground": "210 40% 98%",
        muted: "217.2 32.6% 17.5%",
        "muted-foreground": "215 20.2% 65.1%",
        accent: "217.2 32.6% 17.5%",
        "accent-foreground": "210 40% 98%",
        destructive: "0 62.8% 30.6%",
        "destructive-foreground": "210 40% 98%",
        border: "217.2 32.6% 17.5%",
        input: "217.2 32.6% 17.5%",
        ring: "212.7 26.8% 83.9%",
        "chart-1": "220 70% 50%",
        "chart-2": "160 60% 45%",
        "chart-3": "30 80% 55%",
        "chart-4": "280 65% 60%",
        "chart-5": "340 75% 55%",
      },
    },
    inlineColorsTemplate:
      "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n  ",
    cssVarsTemplate:
      "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n@layer base {\n  :root {\n    --background: 0 0% 100%;\n    --foreground: 222.2 84% 4.9%;\n    --card: 0 0% 100%;\n    --card-foreground: 222.2 84% 4.9%;\n    --popover: 0 0% 100%;\n    --popover-foreground: 222.2 84% 4.9%;\n    --primary: 222.2 47.4% 11.2%;\n    --primary-foreground: 210 40% 98%;\n    --secondary: 210 40% 96.1%;\n    --secondary-foreground: 222.2 47.4% 11.2%;\n    --muted: 210 40% 96.1%;\n    --muted-foreground: 215.4 16.3% 46.9%;\n    --accent: 210 40% 96.1%;\n    --accent-foreground: 222.2 47.4% 11.2%;\n    --destructive: 0 84.2% 60.2%;\n    --destructive-foreground: 210 40% 98%;\n    --border: 214.3 31.8% 91.4%;\n    --input: 214.3 31.8% 91.4%;\n    --ring: 222.2 84% 4.9%;\n    --radius: 0.5rem;\n    --chart-1: 12 76% 61%;\n    --chart-2: 173 58% 39%;\n    --chart-3: 197 37% 24%;\n    --chart-4: 43 74% 66%;\n    --chart-5: 27 87% 67%;\n  }\n\n  .dark {\n    --background: 222.2 84% 4.9%;\n    --foreground: 210 40% 98%;\n    --card: 222.2 84% 4.9%;\n    --card-foreground: 210 40% 98%;\n    --popover: 222.2 84% 4.9%;\n    --popover-foreground: 210 40% 98%;\n    --primary: 210 40% 98%;\n    --primary-foreground: 222.2 47.4% 11.2%;\n    --secondary: 217.2 32.6% 17.5%;\n    --secondary-foreground: 210 40% 98%;\n    --muted: 217.2 32.6% 17.5%;\n    --muted-foreground: 215 20.2% 65.1%;\n    --accent: 217.2 32.6% 17.5%;\n    --accent-foreground: 210 40% 98%;\n    --destructive: 0 62.8% 30.6%;\n    --destructive-foreground: 210 40% 98%;\n    --border: 217.2 32.6% 17.5%;\n    --input: 217.2 32.6% 17.5%;\n    --ring: 212.7 26.8% 83.9%;\n    --chart-1: 220 70% 50%;\n    --chart-2: 160 60% 45%;\n    --chart-3: 30 80% 55%;\n    --chart-4: 280 65% 60%;\n    --chart-5: 340 75% 55%;\n  }\n}\n\n@layer base {\n  * {\n    @apply border-border;\n  }\n  body {\n    @apply bg-background text-foreground;\n  }\n}",
  },
};

async function fetchRegistry(paths: string[]) {
  try {
    const results = await Promise.all(
      paths.map(async (path) => {
        const response = await fetch(`${baseUrl}/registry/${path}`, {
          agent,
        });
        return await response.json();
      }),
    );

    return results;
  } catch (error) {
    console.log(error);
    throw new Error(`Failed to fetch registry from ${baseUrl}.`);
  }
}
