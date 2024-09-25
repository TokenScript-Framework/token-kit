import { Transformer } from "@/src/utils/transformers";

export const transformImport: Transformer = async ({
  sourceFile,
  config,
  shadcnConfig,
}) => {
  const importDeclarations = sourceFile.getImportDeclarations();

  for (const importDeclaration of importDeclarations) {
    const moduleSpecifier = importDeclaration.getModuleSpecifierValue();

    // Replace @/components/[style] with the shadcn components alias.
    if (moduleSpecifier.startsWith("@/components/")) {
      if (shadcnConfig.aliases.ui) {
        importDeclaration.setModuleSpecifier(
          moduleSpecifier.replace(
            /^@\/components\/[^/]+\/ui/,
            shadcnConfig.aliases.ui,
          ),
        );
      } else {
        importDeclaration.setModuleSpecifier(
          moduleSpecifier.replace(
            /^@\/components\/[^/]+/,
            shadcnConfig.aliases.components,
          ),
        );
      }
    }

    // Replace @/registry/[style] with the token-kit ui components alias.
    if (moduleSpecifier.startsWith("@/registry/")) {
      if (config.aliases.ui) {
        importDeclaration.setModuleSpecifier(
          moduleSpecifier.replace(/^@\/registry\/[^/]+\/ui/, config.aliases.ui),
        );
      } else {
        importDeclaration.setModuleSpecifier(
          moduleSpecifier.replace(
            /^@\/registry\/[^/]+/,
            config.aliases.components,
          ),
        );
      }
    }

    // Replace `import { cn } from "@/lib/utils"`
    if (moduleSpecifier == "@/lib/utils") {
      const namedImports = importDeclaration.getNamedImports();
      const cnImport = namedImports.find((i) => i.getName() === "cn");
      if (cnImport) {
        importDeclaration.setModuleSpecifier(
          moduleSpecifier.replace(/^@\/lib\/utils/, config.aliases.utils),
        );
      }
    }
  }

  return sourceFile;
};
