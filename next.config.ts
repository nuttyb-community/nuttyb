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
 * The GITHUB_PAGES env var is set manually in the GitHub Actions workflow.
 */
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

/**
 * Base path for GitHub Pages subdirectory deployment.
 * Read from NEXT_PUBLIC_BASE_PATH env var (set in deploy.yml).
 * Falls back to empty string for development builds.
 */
const basePath = isGitHubPages ? process.env.NEXT_PUBLIC_BASE_PATH || '' : '';

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    env: {
        NEXT_PUBLIC_GIT_SHA: getGitSha(),
        NEXT_PUBLIC_BUILD_DATE: new Date().toISOString().slice(0, 10),
        NEXT_PUBLIC_BASE_PATH: basePath,
    },
    // Static export for GitHub Pages
    output: 'export',
    basePath: basePath,
    // Disable image optimization (not supported in static export)
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
