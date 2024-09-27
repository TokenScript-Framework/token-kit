import { Config } from "@/src/utils/get-config";
import { RegistryItem } from "@/src/utils/registry/schema";
import { spinner } from "@/src/utils/spinner";
import { execa } from "execa";

export async function updateShadcnDependencies(
  shadcnDependencies: RegistryItem["shadcnDependencies"],
  config: Config,
  options: {
    silent?: boolean;
  },
) {
  shadcnDependencies = Array.from(new Set(shadcnDependencies));
  if (!shadcnDependencies?.length) {
    return;
  }

  options = {
    silent: false,
    ...options,
  };

  const dependenciesSpinner = spinner(`Installing shadcn dependencies.`, {
    silent: options.silent,
  })?.start();
  await execa("npx", ["shadcn@latest", "add", "-o", ...shadcnDependencies], {
    cwd: config.resolvedPaths.cwd,
  });
  dependenciesSpinner?.succeed();
}
