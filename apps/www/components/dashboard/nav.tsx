"use client";

import Link from "next/link";
import { LucideIcon, ExternalLinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { TokenType } from ".";

interface NavProps {
  links: {
    title: string;
    label?: string;
    icon: LucideIcon;
    href?: string;
    variant: "default" | "ghost";
    children?: {
      title: string;
      variant: "default" | "ghost";
    }[];
  }[];
  tokenType: string;
  onTokenTypeChange?: (tokenType: TokenType) => void;
}

export function Nav({ links, tokenType, onTokenTypeChange }: NavProps) {
  const childrenClickHandler = (type: TokenType) => {
    onTokenTypeChange?.(type);
  };
  return (
    <>
      <div
        className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
        key={links.length}
      >
        <nav
          className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2"
          key={links.length + "nav"}
        >
          {links.map((link, index) => (
            <div key={index + "div"} className="w-full">
              <Link
                key={index + link.title}
                href={link.href ? link.href : "#"}
                target="_blank"
                className={cn(
                  buttonVariants({ variant: link.variant, size: "sm" }),
                  link.variant === "default" &&
                    "dark:text-white dark:hover:text-white",
                  "w-full justify-start",
                  link.children && "bg-unset hover:bg-unset",
                )}
              >
                <link.icon className="mr-2 h-4 w-4" key={index + "icon"} />
                {link.title}
                {link.href && (
                  <span
                    className={cn(
                      "ml-auto",
                      link.variant === "default" &&
                        "text-background dark:text-white",
                    )}
                    key={index + "span"}
                  >
                    <ExternalLinkIcon className="h-4 w-4" />
                  </span>
                )}
              </Link>
              {link.children?.map((child, index) => (
                <div key={index + "chaild"} className="w-full">
                  <Link
                    key={child.title + index}
                    href="#"
                    className={cn(
                      buttonVariants({ variant: child.variant, size: "sm" }),
                      child.variant === "default" &&
                        "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                      child.title === tokenType && "bg-gray-100 dark:bg-muted",
                      "mb-2 w-full cursor-pointer justify-start",
                    )}
                    onClick={() =>
                      childrenClickHandler(child.title as TokenType)
                    }
                  >
                    {child.title}
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
