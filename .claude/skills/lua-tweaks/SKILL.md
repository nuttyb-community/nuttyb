---
name: lua-tweaks
description: Use when creating or modifying Lua tweak files in lua/ (tweakdefs/tweakunits for the BAR NuttyB mod) — covers the edit→sync→test workflow, how a file gets wired into the configurator, and BAR engine gotchas (merge semantics, buildoptions ordering, load order) that are not visible from the code.
---

# Working on Lua tweaks

Style and authoring conventions live in `lua/CONTRIBUTING.md` — read it first for file structure (tweakunits = plain table, tweakdefs = `do...end` block), headers, helper patterns, and naming rules (tier prefixes like `T3`/`T4`, not "Epic"). This skill covers what that guide doesn't: the workflow and the engine behavior you can't see.

## Workflow

1. Edit files under `lua/`.
2. Regenerate the bundle the web app consumes: `bun run sync -p .` (rewrites `public/data/lua-bundle.json`). The configurator never reads `lua/*.lua` directly — **an unsynced edit is invisible to the app and to `bun test`**.
3. `bun test` — bundle/packing tests validate that every referenced file exists and fits slot limits.
4. Manual check: `bun dev`, then the `/editor` page shows packed slot contents and per-slot encoded sizes; `/data` shows each file's encoded form.

`lua/misc/` contains standalone optional widgets/tweaks that are NOT wired into the configurator — editing them needs no registration.

## Wiring a new file into the configurator

A new `lua/foo.lua` does nothing until referenced. In `src/lib/command-generator/data/configuration-mapping.ts`:

1. Reference it with a `~` prefix, either in `BASE_TWEAKS` (always on) or in a `CONFIGURATION_MAPPING` entry's `tweakdefs`/`tweakunits` array (toggleable — see the `configurator-data` skill for adding a new option).
2. Add a `LUA_PRIORITIES` entry. **Keys must be bare paths without `~`** (`'lua/foo.lua': N`) — prefixed keys silently fall back to priority 99 (this exact bug is documented as C1 in `docs/proposals.md`). Lower numbers load first; pick a value that places the file after everything it depends on.
3. Template files use `$VAR$` placeholders and are referenced as `~lua/foo.lua{VAR=value}`.

## Engine gotchas (load-bearing, easy to break)

- **Load order matters.** Files are concatenated into slots in `LUA_PRIORITIES` order, and tweakdefs run **before** tweakunits. A tweakdefs file that clones a unit must load before anything referencing the clone.
- **`table.merge` deep-merges; second argument wins** on scalar conflicts. But **array parts (like `buildoptions`) merge by index**, not by value — duplicates and ordering in `buildoptions` lists are load-bearing. Never "clean up" duplicate buildoptions entries or reorder them; a later merge may rely on index positions.
- **Tweakunits plain tables can't share a slot.** The packer gives each plain-table file its own tweakunits slot (engine expects one table per slot). Many small plain-table files burn slots fast (10 max per type); `do...end`-style files can be merged together.
- **Slot size limit:** ~16,000 chars per encoded `!bset` command. Files are minified then base64-encoded; the `/editor` page shows the real per-slot size.
- **Shields have two radius definitions:** the weapondef radius and a `customparams` radius — scale both or visuals/gameplay desync.
- **Unit display names/tooltips come from `customparams.i18n_en_humanname` / `i18n_en_tooltip`** (consumed by the name-override widget), not from `unitDef.description` — editing `description` does nothing visible.
- **Balance convention:** T4 eco buildings must stay non-explosive (no self-d/death explosion damage buffs) — stated in tooltips like "non-explosive"; keep it that way.

## Checks before committing

`bun test && bun lint` (pre-commit hook enforces both). If you added/renamed a file, confirm `bun run sync -p .` was run — a stale bundle is the most common silent failure.
