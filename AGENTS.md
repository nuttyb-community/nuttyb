# LLM Context Guide

This file provides guidance to LLM agents when working with code in this repository.

## Project Overview

Community NuttyB is a monorepo containing:

- Lua tweaks for the NuttyB mod for Beyond All Reason (BAR) game (`lua/` directory)
- A Next.js web application (Configurator) that generates custom mod configurations (`src/` directory)

The Configurator allows players to select game tweaks and generates lobby commands + base64-encoded Lua bundles.

## Development Commands

### Setup

```bash
bun install
```

### Web Development

```bash
bun dev                    # Start Next.js dev server at localhost:3000
bun build                  # Build for production
bun start                  # Start production server
```

### Lua Sync

```bash
bun run sync -p .          # Sync Lua files from local path
bun run sync --help        # See all sync options
```

The sync script generates the Lua bundle (`public/data/lua-bundle.json`) that Configurator uses. Run this after modifying Lua tweak files.

### Quality Checks

```bash
bun test                   # Run tests (required before commits)
bun lint                   # ESLint checks
bun knip                   # Detect unused files and dependencies
```

There is a pre-commit hook that automatically runs required checks automatically before committing.

## Project Skills

Task-specific guides for coding agents live in `.claude/skills/` (Claude Code loads them automatically; other agents should read the relevant `SKILL.md` before starting):

- **`lua-tweaks`** — creating/modifying Lua tweak files: edit→sync→test workflow, wiring files into the configurator, and BAR engine gotchas (load order, `table.merge`/buildoptions semantics, slot limits).
- **`configurator-data`** — adding/changing configurator settings and built-in presets: the cross-file checklist and a map of the command-generation pipeline.

Known defects and the ranked improvement backlog are in `docs/proposals.md` — check it before fixing anything in `src/lib/command-generator/`.

## Architecture

### Key Directories

- `docs/`: Documentation files, including contributing guidelines
- `lua/`: Lua sources code for NuttyB tweaks
- `src/app/`: Next.js 16 App Router pages
    - `/configurator`: Main configuration interface
    - `/base64`: Direct base64 bundle viewer
    - `/custom`: Custom configuration tools
    - `/data`: Bundle data viewer
- `src/components/`: React components (uses Mantine UI library)
- `src/lib/`: Common reusable business logic
    - `command-generator/`: Generates lobby commands and bundles
    - `lua-utils/`: Lua file parsing and manipulation
    - `encoders/`: Base64 encoding utilities
    - `configuration-storage/`: Browser storage for user configs
- `src/hooks/`: Custom React hooks
- `src/types/`: Reusable TypeScript type definitions
- `scripts/`: Utility scripts (e.g., sync script)
- `tests/`: Unit and integration tests

### Lua Tweaks System

Two types of Lua files in the `lua/` directory:

1. **Tweakunits**: Plain Lua tables (no return statement) that modify unit properties
2. **Tweakdefs**: Executable code wrapped in `do...end` blocks for complex logic

**Critical**: Tweakdefs MUST wrap code in `do...end` blocks to prevent variable namespace pollution when files are merged.

Example Tweakdef structure:

```lua
-- Feature description
-- Authors: Name
-- https://github.com/nuttyb-community/nuttyb

do
    local unitDefs = UnitDefs or {}
    -- Logic here
end
```

## Important Conventions

### Lua Files

- Tweakdefs MUST use `do...end` blocks for proper scoping
- Include header with feature name, authors, GitHub URL
- Use local variable aliasing for performance: `local unitDefs = UnitDefs or {}`
- Always check unit existence before build options modification
- Stylua for formatting (will not work for tweakunits and template Lua files)

### TypeScript/React

- Avoid `any` types - Use proper TypeScript, reuse existing types
- Use functional React components with hooks
- Use Mantine components for UI consistency
- Avoid inline styles; use Mantine props
- Extract business logic from components into utilities/hooks
- Follow existing folder structure and naming conventions
- Prettier for formatting
- ESLint enforces import order, React hooks, and Next.js best practices
- Knip detects unused exports and dependencies

### Git

- LF line endings only

## Pull Request Guidelines

**When creating pull requests:**

1. Always check `.github/PULL_REQUEST_TEMPLATE.md` for the latest format
2. Include all sections from the template
3. **Follow PR title conventions**: Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
    - Format: `type(scope): description`
    - Example: `chore(configurator): improve settings descriptions`
    - Types: `fix`, `feat`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

**Important**: Always reference the actual template file at `.github/PULL_REQUEST_TEMPLATE.md` instead of using cached content, as the template may be updated over time.

## Platform-Specific Instructions

- **[CLAUDE.md](CLAUDE.md)** - For Claude/Anthropic tools
- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** - For GitHub Copilot
- **[GEMINI.md](GEMINI.md)** - For Google Gemini tools
- **[GPT.md](GPT.md)** - For OpenAI/ChatGPT tools
- **[.cursor/rules/dev-standard.mdc](.cursor/rules/dev-standard.mdc)** - For Cursor editor
