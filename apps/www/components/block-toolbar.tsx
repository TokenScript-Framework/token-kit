"use client";

import { CircleHelp, Monitor, Smartphone, Tablet } from "lucide-react";
import * as React from "react";
import { ImperativePanelHandle } from "react-resizable-panels";

import { BlockCopyButton } from "@/components/block-copy-button";
import { StyleSwitcher } from "@/components/style-switcher";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useLiftMode } from "@/hooks/use-lift-mode";
import { trackEvent } from "@/lib/events";
import { cn } from "@/lib/utils";
import { Block } from "@/registry/schema";

export function BlockToolbar({
  block,
  resizablePanelRef,
}: {
  block: Block & { hasLiftMode: boolean };
  resizablePanelRef: React.RefObject<ImperativePanelHandle>;
}) {
  const { isLiftMode, toggleLiftMode } = useLiftMode(block.name);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <TabsList className="hidden h-7 rounded-md p-0 px-[calc(theme(spacing.1)_-_2px)] py-[theme(spacing.1)] sm:flex">
          <TabsTrigger
            value="preview"
            className="h-[1.45rem] rounded-sm px-2 text-xs"
            disabled={isLiftMode}
          >
            Preview
          </TabsTrigger>
          <TabsTrigger
            value="code"
            className="h-[1.45rem] rounded-sm px-2 text-xs"
            disabled={isLiftMode}
          >
            Code
          </TabsTrigger>
        </TabsList>
        <Separator orientation="vertical" className="mx-2 hidden h-4 md:flex" />
        <StyleSwitcher
          className="h-[calc(theme(spacing.7)_-_1px)] dark:h-7"
          disabled={isLiftMode}
        />
        <Popover>
          <PopoverTrigger
            disabled={isLiftMode}
            className="hidden text-muted-foreground hover:text-foreground disabled:opacity-50 sm:flex"
          >
            <CircleHelp className="h-3.5 w-3.5" />
            <span className="sr-only">Block description</span>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            sideOffset={20}
            className="space-y-3 rounded-[0.5rem] text-sm"
          >
            <p className="font-medium">
              What is the difference between the New York and Default style?
            </p>
            <p>
              A style comes with its own set of components, animations, icons
              and more.
            </p>
            <p>
              The <span className="font-medium">Default</span> style has larger
              inputs, uses lucide-react for icons and tailwindcss-animate for
              animations.
            </p>
            <p>
              The <span className="font-medium">New York</span> style ships with
              smaller buttons and inputs. It also uses shadows on cards and
              buttons.
            </p>
          </PopoverContent>
        </Popover>
        <div className="hidden items-center gap-2 sm:flex">
          <Separator
            orientation="vertical"
            className="mx-2 mr-0 hidden h-4 md:flex"
          />
          <div className="flex items-center gap-2">
            <a href={`#${block.name}`}>
              <Badge
                variant="secondary"
                className={cn("bg-transparent", isLiftMode && "opacity-50")}
              >
                {block.name}
              </Badge>
            </a>
          </div>
        </div>
      </div>
      {block.code && (
        <div className="ml-auto flex items-center gap-2 md:pr-[14px]">
          {block.hasLiftMode && (
            <>
              <div className="hidden h-7 items-center justify-between gap-2 md:flex">
                <Label htmlFor={`lift-mode-${block.name}`} className="text-xs">
                  Lift Mode
                </Label>
                <Switch
                  id={`lift-mode-${block.name}`}
                  checked={isLiftMode}
                  onCheckedChange={(value) => {
                    resizablePanelRef.current?.resize(100);
                    toggleLiftMode(block.name);

                    if (value) {
                      trackEvent({
                        name: "enable_lift_mode",
                        properties: {
                          name: block.name,
                        },
                      });
                    }
                  }}
                />
              </div>
              <Separator
                orientation="vertical"
                className="mx-2 hidden h-4 lg:inline-flex"
              />
            </>
          )}
          <div className="hidden h-[28px] items-center gap-1.5 rounded-md border p-[2px] shadow-sm md:flex">
            <ToggleGroup
              disabled={isLiftMode}
              type="single"
              defaultValue="100"
              onValueChange={(value) => {
                if (resizablePanelRef.current) {
                  resizablePanelRef.current.resize(parseInt(value));
                }
              }}
            >
              <ToggleGroupItem
                value="100"
                className="h-[22px] w-[22px] rounded-sm p-0"
              >
                <Monitor className="h-3.5 w-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="60"
                className="h-[22px] w-[22px] rounded-sm p-0"
              >
                <Tablet className="h-3.5 w-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="30"
                className="h-[22px] w-[22px] rounded-sm p-0"
              >
                <Smartphone className="h-3.5 w-3.5" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <Separator
            orientation="vertical"
            className="mx-2 hidden h-4 md:flex"
          />
          <BlockCopyButton
            event="copy_block_code"
            name={block.name}
            code={block.code}
            disabled={isLiftMode}
          />
        </div>
      )}
    </div>
  );
}
