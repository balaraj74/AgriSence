// Learn more: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the workspace root so Metro can see all hoisted node_modules and packages
config.watchFolders = [workspaceRoot];

// Tell Metro where to look for packages — mobile-local first, then workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

const mobileNodeModules = path.resolve(projectRoot, 'node_modules');

// Packages that MUST resolve from mobile's node_modules to avoid loading
// React 19 (workspace root / web app) instead of React 18 (react-native).
// extraNodeModules alone doesn't intercept imports from within node_modules,
// so we use resolveRequest to forcefully redirect every import of these packages.
const PINNED_TO_MOBILE = ['react', 'react-dom', 'react-native', 'scheduler'];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isPinned = PINNED_TO_MOBILE.some(
    (pkg) => moduleName === pkg || moduleName.startsWith(pkg + '/')
  );

  if (isPinned) {
    try {
      // Force resolution from mobile node_modules regardless of caller location
      const resolved = require.resolve(moduleName, {
        paths: [mobileNodeModules],
      });
      return { filePath: resolved, type: 'sourceFile' };
    } catch (_) {
      // If not found in mobile (e.g. react-dom is not installed), fall through
    }
  }

  // Default Metro resolution for everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
