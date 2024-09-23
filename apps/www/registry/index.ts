import { examples } from "@/registry/registry-examples";
import { hooks } from "@/registry/registry-hooks";
import { lib } from "@/registry/registry-lib";
import { ui } from "@/registry/registry-ui";
import { Registry } from "@/registry/schema";

export const registry: Registry = [...ui, ...examples, ...lib, ...hooks];
