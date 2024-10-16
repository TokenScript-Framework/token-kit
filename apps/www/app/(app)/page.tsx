import Link from "next/link";

import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import Dashboard from "./docs/sample/page";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

export default function IndexPage() {
  return (
    <div className="container relative">
      <PageHeader>
        <PageHeaderHeading>Build your web3 component library</PageHeaderHeading>
        <PageHeaderDescription>
          Beautifully designed components that you can copy and paste into your
          web3 apps.
        </PageHeaderDescription>
        <PageActions>
          <Button asChild size="sm">
            <Link href="/docs">Get Started</Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link
              target="_blank"
              rel="noreferrer"
              href={siteConfig.links.github}
            >
              GitHub
            </Link>
          </Button>
        </PageActions>
      </PageHeader>
      <div className="w-full border-slate-200 border">
        <RainbowKitProvider>
          <Dashboard />
        </RainbowKitProvider>
      </div>
    </div>
  );
}
