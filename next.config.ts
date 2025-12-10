import { execSync } from 'node:child_process';

import type { NextConfig } from 'next';

/**
 * Get the current Git SHA for version tracking.
 * Falls back to 'development' if git is unavailable.
 */
function getGitSha(): string {
    try {
        return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch {
        return 'development';
    }
}

/**
 * Detect if we're building for GitHub Pages deployment.
 * The GITHUB_PAGES env var is set by the actions/configure-pages action.
 */
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    env: {
        NEXT_PUBLIC_GIT_SHA: getGitSha(),
    },
    // Static export for GitHub Pages
    output: 'export',
    // Base path for GitHub Pages subdirectory deployment
    // Deployed to: https://goldjee.github.io/NuttyB-Raptors-Configurator/
    basePath: isGitHubPages ? '/NuttyB-Raptors-Configurator' : '',
    // Disable image optimization (not supported in static export)
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
