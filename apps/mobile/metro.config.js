const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Get the monorepo root
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

// Watch all files in the monorepo
config.watchFolders = [monorepoRoot];

// Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Enable package exports for select libraries (Privy recommended config)
const resolveRequestWithPackageExports = (context, moduleName, platform) => {
  // Package exports in `isows` (a `viem` dependency) are incompatible
  if (moduleName === "isows") {
    const ctx = {
      ...context,
      unstable_enablePackageExports: false,
    };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }

  // Package exports in `zustand` are incompatible
  if (moduleName.startsWith("zustand")) {
    const ctx = {
      ...context,
      unstable_enablePackageExports: false,
    };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }

  // Package exports in `jose` are incompatible, use browser version
  if (moduleName === "jose") {
    const ctx = {
      ...context,
      unstable_conditionNames: ["browser"],
    };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }

  // Enable package exports for Privy packages
  if (moduleName.startsWith("@privy-io/")) {
    const ctx = {
      ...context,
      unstable_enablePackageExports: true,
    };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

config.resolver.resolveRequest = resolveRequestWithPackageExports;

// Ensure proper resolution of package exports
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = [
  "browser",
  "require",
  "react-native",
  "import",
  "default",
];

module.exports = withNativeWind(config, { input: "./global.css" });
