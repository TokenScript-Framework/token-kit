import path from "path";
import { addOptionsSchema } from "@/src/commands/add";
import * as ERRORS from "@/src/utils/errors";
import {
  CONFIG_FILE_NAME,
  getConfig,
  SHADCN_CONFIG_FILE_NAME,
} from "@/src/utils/get-config";
import { highlighter } from "@/src/utils/highlighter";
import { logger } from "@/src/utils/logger";
import fs from "fs-extra";
import { z } from "zod";

export async function preFlightAdd(options: z.infer<typeof addOptionsSchema>) {
  const errors: Record<string, boolean> = {};

  // Ensure target directory exists.
  // Check for empty project. We assume if no package.json exists, the project is empty.
  if (
    !fs.existsSync(options.cwd) ||
    !fs.existsSync(path.resolve(options.cwd, "package.json"))
  ) {
    errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT] = true;
    return {
      errors,
      config: null,
      shadcnConfig: null,
    };
  }

  // Check for existing token-kit-ui-components.json file.
  if (!fs.existsSync(path.resolve(options.cwd, CONFIG_FILE_NAME))) {
    errors[ERRORS.MISSING_CONFIG] = true;
    return {
      errors,
      config: null,
      shadcnConfig: null,
    };
  }

  let config;
  try {
    config = await getConfig(options.cwd);
  } catch (error) {
    logger.break();
    logger.error(
      `An invalid ${highlighter.info(
        CONFIG_FILE_NAME,
      )} file was found at ${highlighter.info(
        options.cwd,
      )}.\nBefore you can add components, you must create a valid ${highlighter.info(
        CONFIG_FILE_NAME,
      )} file by running the ${highlighter.info("init")} command.`,
    );
    logger.error(
      `Learn more at ${highlighter.info(
        "https://token-kit.smarttokenlabs.com/docs/components-json",
      )}.`,
    );
    logger.break();
    process.exit(1);
  }

  let shadcnConfig;
  try {
    if (!fs.existsSync(path.resolve(options.cwd, SHADCN_CONFIG_FILE_NAME))) {
      throw new Error("No shadcn config file found.");
    }

    shadcnConfig = await getConfig(options.cwd, "shadcn");
  } catch (error) {
    logger.break();
    logger.error(
      `No valid ${highlighter.info(
        SHADCN_CONFIG_FILE_NAME,
      )} file was found at ${highlighter.info(
        options.cwd,
      )}.\nBefore you can add components, you must create a valid ${highlighter.info(
        SHADCN_CONFIG_FILE_NAME,
      )} file by properly initiate shadcn package.`,
    );
    logger.error(
      `Learn more at ${highlighter.info(
        "https://ui.shadcn.com/docs/components-json",
      )}.`,
    );
    logger.break();
    process.exit(1);
  }

  return {
    errors,
    config: config!,
    shadcnConfig: shadcnConfig!,
  };
}
