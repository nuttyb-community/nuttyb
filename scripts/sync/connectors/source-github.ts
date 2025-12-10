import { LuaFile } from '@/types/types';

// Github types
export interface GitHubCommit {
    sha: string;
    node_id: string;
    commit: {
        author: {
            name: string;
            email: string;
            date: string;
        };
        committer: {
            name: string;
            email: string;
            date: string;
        };
        message: string;
    };
}

export interface GitHubTreeItem {
    path: string;
    mode: string;
    type: string;
    sha: string;
    size?: number;
    url: string;
}

export interface GitHubTreeResponse {
    sha: string;
    url: string;
    tree: GitHubTreeItem[];
    truncated: boolean;
}

const HEADERS = {
    'User-Agent': 'nuttyb-configurator',
    Accept: 'application/vnd.github.v3+json',
} as const;

/**
 * Fetches latest commit hash from the specified GitHub repository and branch.
 * @param owner Name of repository owner
 * @param name Name of repository itself
 * @param branch Source branch name
 * @returns String of latest commit hash
 */
export async function getLatestCommitHash(
    owner: string,
    name: string,
    branch: string
): Promise<string> {
    const url = `https://api.github.com/repos/${owner}/${name}/commits/${branch}`;

    const response = await fetch(url, { headers: HEADERS });

    if (!response.ok) {
        throw new Error(
            `Failed to fetch commit hash: ${response.status} ${response.statusText}`
        );
    }

    const data = (await response.json()) as GitHubCommit;

    return data.sha;
}

async function fetchLuaFileTree(
    owner: string,
    name: string,
    branch: string
): Promise<string[]> {
    const url = `https://api.github.com/repos/${owner}/${name}/git/trees/${branch}?recursive=1`;

    const response = await fetch(url, { headers: HEADERS });

    if (!response.ok) {
        throw new Error(
            `Failed to fetch file tree: ${response.status} ${response.statusText}`
        );
    }

    const data = (await response.json()) as GitHubTreeResponse;

    // Filter for lua/**/*.lua files
    const luaFiles = data.tree
        .filter(
            (item) =>
                item.type === 'blob' &&
                item.path.startsWith('lua/') &&
                item.path.endsWith('.lua')
        )
        .map((item) => item.path);

    return luaFiles;
}

async function fetchRawFile(
    owner: string,
    name: string,
    branch: string,
    filePath: string
): Promise<string> {
    const url = `https://raw.githubusercontent.com/${owner}/${name}/${branch}/${filePath}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Failed to fetch ${filePath}: ${response.status} ${response.statusText}`
        );
    }

    return response.text();
}

/**
 * Fetches all Lua files from the specified GitHub repository and branch.
 * @param owner Name of repository owner
 * @param name Name of repository itself
 * @param branch Source branch name
 * @returns An array of LuaFile objects containing path and data
 */
export async function fetchLua(
    owner: string,
    name: string,
    branch: string
): Promise<LuaFile[]> {
    const luaPaths = await fetchLuaFileTree(owner, name, branch);
    const files: LuaFile[] = [];

    for (const path of luaPaths) {
        try {
            const data = await fetchRawFile(owner, name, branch, path);
            files.push({ path, data });
        } catch (error) {
            console.error(`Failed to process ${path}:`, error);
        }
    }

    return files;
}
