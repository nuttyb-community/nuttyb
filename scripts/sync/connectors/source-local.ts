import fs from 'node:fs';
import path from 'node:path';

import { LuaFile } from '@/types/types';

/**
 * Recursively collects all .lua file paths from a directory.
 * @param dir Absolute path to scan
 * @param basePath Relative path prefix for results
 * @returns Array of relative file paths
 */
function getLuaFilesRecursively(dir: string, basePath: string): string[] {
    const results: string[] = [];

    if (!fs.existsSync(dir)) {
        return results;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(basePath, entry.name);

        if (entry.isDirectory()) {
            results.push(...getLuaFilesRecursively(fullPath, relativePath));
        } else if (entry.isFile() && entry.name.endsWith('.lua')) {
            // Normalize path separators to forward slashes (matching GitHub format)
            results.push(relativePath.replaceAll('\\', '/'));
        }
    }

    return results;
}

/**
 * Fetches all Lua files from the specified local directory.
 * @param localPath Path to the root directory containing Lua files
 * @returns An array of LuaFile objects containing path and data
 */
export function fetchLua(localPath: string): LuaFile[] {
    const absolutePath = path.resolve(localPath);

    if (!fs.existsSync(absolutePath)) {
        throw new Error(`Local path does not exist: ${absolutePath}`);
    }

    const luaPaths = getLuaFilesRecursively(absolutePath, '');
    const files: LuaFile[] = [];

    for (const filePath of luaPaths) {
        try {
            const fullPath = path.join(absolutePath, filePath);
            const data = fs.readFileSync(fullPath, 'utf8');
            files.push({ path: filePath, data });
        } catch (error) {
            console.error(`Failed to read ${filePath}:`, error);
        }
    }

    return files;
}
