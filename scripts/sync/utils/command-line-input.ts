import commandLineArgs, { OptionDefinition } from 'command-line-args';
import commandLineUsage, { Section } from 'command-line-usage';

import { REPO_BRANCH, REPO_NAME, REPO_OWNER } from '../sync';

const optionDefinitions: OptionDefinition[] = [
    { name: 'local-path', alias: 'p', type: String },
    { name: 'repository-owner', alias: 'o', type: String },
    { name: 'repository-name', alias: 'n', type: String },
    { name: 'repository-branch', alias: 'b', type: String },
    { name: 'force', alias: 'f', type: Boolean, defaultValue: false },
    { name: 'help', alias: 'h', type: Boolean, defaultValue: false },
];

interface CliOptions {
    localPath?: string;
    repositoryOwner?: string;
    repositoryName?: string;
    repositoryBranch?: string;
    force?: boolean;
    help?: boolean;
}

interface LocalOptions {
    type: 'local';
    localPath: string;
}

interface GithubOptions {
    type: 'github';
    repositoryOwner: string;
    repositoryName: string;
    repositoryBranch: string;
}

interface Options {
    source: LocalOptions | GithubOptions;
    force: boolean;
    help: boolean;
}

export function parseCliArgs(): Options {
    const args = commandLineArgs(optionDefinitions, {
        camelCase: true,
    }) as CliOptions;

    if (
        args.localPath &&
        (args.repositoryOwner || args.repositoryName || args.repositoryBranch)
    )
        throw new Error(
            'Cannot specify both local path and GitHub repository options.'
        );

    const source = args.localPath ? 'local' : 'github';

    const githubArgsProvided = [
        args.repositoryOwner,
        args.repositoryName,
        args.repositoryBranch,
    ].filter(Boolean).length;

    if (source === 'github' && githubArgsProvided > 0 && githubArgsProvided < 3)
        throw new Error(
            'For GitHub source, repository_owner, repository_name, and repository_branch must all be specified together.'
        );

    const sourceOptions: LocalOptions | GithubOptions =
        source === 'local'
            ? {
                  type: 'local',
                  localPath: args.localPath!,
              }
            : {
                  type: 'github',
                  repositoryOwner: args.repositoryOwner ?? REPO_OWNER,
                  repositoryName: args.repositoryName ?? REPO_NAME,
                  repositoryBranch: args.repositoryBranch ?? REPO_BRANCH,
              };

    return {
        source: sourceOptions,
        force: args.force!,
        help: args.help!,
    };
}

export function getHelpText(): string {
    const sections: Section[] = [
        {
            header: 'NuttyB Configurator Lua Sync Utility',
            content:
                'Synchronizes Lua files from a GitHub repository or local path into the application database.',
        },
        {
            header: 'Options for local synchronization',
            optionList: [
                {
                    name: 'local-path',
                    alias: optionDefinitions.find(
                        (opt) => opt.name === 'local-path'
                    )!.alias,
                    description:
                        'Path to local directory containing Lua files.',
                },
            ],
        },
        {
            header: 'Options for GitHub synchronization',
            content: `If no GitHub options are provided, the script will synchronize from the default repository ${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}.`,
            optionList: [
                {
                    name: 'repository-owner',
                    alias: optionDefinitions.find(
                        (opt) => opt.name === 'repository-owner'
                    )!.alias,
                    description: 'GitHub repository owner.',
                },
                {
                    name: 'repository-name',
                    alias: optionDefinitions.find(
                        (opt) => opt.name === 'repository-name'
                    )!.alias,
                    description: 'GitHub repository name.',
                },
                {
                    name: 'repository-branch',
                    alias: optionDefinitions.find(
                        (opt) => opt.name === 'repository-branch'
                    )!.alias,
                    description: 'GitHub repository branch.',
                },
            ],
        },
        {
            header: 'General Options',
            optionList: [
                {
                    name: 'force',
                    alias: optionDefinitions.find(
                        (opt) => opt.name === 'force'
                    )!.alias,
                    description:
                        'Force synchronization even if the latest commit matches the local version.',
                },
                {
                    name: 'help',
                    alias: optionDefinitions.find((opt) => opt.name === 'help')!
                        .alias,
                    description: 'Display this help text.',
                },
            ],
        },
    ];
    return commandLineUsage(sections);
}
