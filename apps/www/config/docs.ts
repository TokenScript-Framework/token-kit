import { MainNavItem, SidebarNavItem } from "types/nav";

export interface DocsConfig {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
  chartsNav: SidebarNavItem[];
}

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      title: "Documentation",
      href: "/docs",
    },
    {
      title: "Components",
      href: "/docs/components/token-card",
    },
    {
      title: "Lambdas",
      href: "/docs/lambdas/og",
    },
    {
      title: "Packages",
      href: "/docs/packages/hooks",
    },
    {
      title: "Apps",
      href: "/docs/apps/farcaster-token-frame",
    },
  ],
  sidebarNav: [
    {
      title: "Getting Started",
      items: [
        {
          title: "Introduction",
          href: "/docs",
          items: [],
        },
        {
          title: "Installation",
          href: "/docs/installation",
          items: [],
        },
        {
          title: "CLI",
          href: "/docs/cli",
          label: "Updated",
          items: [],
        },
        {
          title: "Changelog",
          href: "/docs/changelog",
          items: [],
        },
      ],
    },
    {
      title: "Components",
      items: [
        {
          title: "Token Card",
          href: "/docs/components/token-card",
          items: [],
        },
        {
          title: "Token Thumbnail",
          href: "/docs/components/token-thumbnail",
          items: [],
        },
        {
          title: "My NFTs",
          href: "/docs/components/my-nfts",
          items: [],
        },
        {
          title: "Token Tx Sonner",
          href: "/docs/components/token-tx-sonner",
          items: [],
        },
        {
          title: "Tapp Card",
          href: "/docs/components/tapp-card",
          items: [],
        },
        {
          title: "Add To Snap",
          href: "/docs/components/add-to-snap",
          items: [],
        },
      ],
    },
    {
      title: "Lambdas",
      items: [
        {
          title: "OG",
          href: "/docs/lambdas/og",
          items: [],
        },
        {
          title: "Farcaster",
          href: "/docs/lambdas/farcaster",
          items: [],
        },
      ],
    },
    {
      title: "Packages",
      items: [
        {
          title: "Hooks",
          href: "/docs/packages/hooks",
          items: [],
        },
        {
          title: "Onchain Tools",
          href: "/docs/packages/onchain-tools",
          items: [],
        },
        {
          title: "Tapp snap",
          href: "/docs/packages/tapp-snap",
          items: [],
        },
      ],
    },
    {
      title: "Apps",
      items: [
        {
          title: "Farcaster Token Frame",
          href: "/docs/apps/farcaster-token-frame",
          items: [],
        },
        {
          title: "Wallet Pass",
          href: "/docs/apps/wallet-pass",
          items: [],
        },
      ],
    },
  ],
  chartsNav: [
    {
      title: "Getting Started",
      items: [
        {
          title: "Introduction",
          href: "/docs/charts",
          items: [],
        },
        {
          title: "Installation",
          href: "/docs/charts/installation",
          items: [],
        },
        {
          title: "Theming",
          href: "/docs/charts/theming",
          items: [],
        },
      ],
    },
    {
      title: "Charts",
      items: [
        {
          title: "Area Chart",
          href: "/docs/charts/area",
          items: [],
        },
        {
          title: "Bar Chart",
          href: "/docs/charts/bar",
          items: [],
        },
        {
          title: "Line Chart",
          href: "/docs/charts/line",
          items: [],
        },
        {
          title: "Pie Chart",
          href: "/docs/charts/pie",
          items: [],
        },
        {
          title: "Radar Chart",
          href: "/docs/charts/radar",
          items: [],
        },
        {
          title: "Radial Chart",
          href: "/docs/charts/radial",
          items: [],
        },
      ],
    },
    {
      title: "Components",
      items: [
        {
          title: "Tooltip",
          href: "/docs/charts/tooltip",
          items: [],
        },
        {
          title: "Legend",
          href: "/docs/charts/legend",
          items: [],
        },
      ],
    },
  ],
};
