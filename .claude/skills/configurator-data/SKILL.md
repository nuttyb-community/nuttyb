---
name: configurator-data
description: Use when adding or changing a configurator setting (toggle, dropdown, multiplier), a built-in preset, or when debugging command generation — provides the cross-file checklist and a map of the Configuration → commands pipeline so you don't have to re-derive it from eight files.
---

# Configurator data & command pipeline

## Pipeline map (where generation happens)

```
Configuration (user settings, localStorage)
  → getMappedData()            src/lib/command-generator/configuration/mapper.ts
      BASE_COMMANDS + BASE_TWEAKS + CONFIGURATION_MAPPING lookups
  → interpolateCommands()      command-template.ts   ($var$ / $?...?$ templates)
  → resolveLuaSources()        interpolator.ts       (path{VAR=v} → bundle content)
  → sortLua()                  by LUA_PRIORITIES     (data/configuration-mapping.ts)
  → packLuaSources()           packer.ts             (minify → base64 → !bset tweakdefsN)
  → generateCommands()         command-generator.ts  (+ custom/preset tweak slot allocation)
```

Consumed by `useTweakData` (configurator page) and `useSlotContent` (editor page). Output-pinning tests: `tests/command-generator.test.ts`, `tests/command-template.test.ts`.

Known pitfalls and ranked defects in this pipeline are catalogued in `docs/proposals.md` — check it before "fixing" something that is already spec'd there.

## Checklist: adding a configuration option

Work top-down; the `ValueMapping` type makes step 2 a compile error until step 1 is done.

1. **`src/lib/command-generator/data/configuration.ts`** — add the field to `Configuration` and `DEFAULT_CONFIGURATION`. For enums, add a `const` array + derived type (see `START_OPTIONS`).
2. **`src/lib/command-generator/data/configuration-mapping.ts`** — add the `CONFIGURATION_MAPPING` entry mapping each value to `command` / `tweakdefs` / `tweakunits` arrays (Lua refs are bare paths like `lua/foo.lua`, optionally with a `{VAR=value}` template suffix). Boolean options use string keys `true`/`false`. The entry's `description` is the option's label in the preset diff (`src/lib/presets/config-diff.ts`, shown in the preset popover and form). Any newly referenced Lua file also needs a `LUA_PRIORITIES` entry with the same bare path key (see the `lua-tweaks` skill).
3. **Numeric options** get an empty `values: {}` and flow through templates instead: either add the variable to `buildTemplateContext()` in `command-template.ts` and use `$varName$` inside a `BASE_COMMANDS` entry (`$?...?$` for optional sections), or — for values a Lua file needs — build a templated reference like `lua/foo.lua{VAR=${configuration.x}}` in `getMappedData()` (`mapper.ts`), as the HP templates do.
4. **UI** — add the control in `src/components/tabs/configurator/sections/`: pick the section by topic, not control type — `general-settings.tsx` (lobby, map, start), `difficulty.tsx` (raptor/queen numbers, challenges), `economy.tsx` (income, build power, eco style, T2/T3 production), `military.tsx` (unit tiers, defences, launchers), `performance.tsx` (effects reduction), or `extras.tsx` (eco + military crossovers like Mega Nuke, T3 Geo + Walls). Numbers go through `useNumberSetting`; everything else uses `useConfiguratorContext().setProperty`.
5. **`public/presets/schema.json`** — add the key to `configuration.properties` (with type and range). `tests/preset-schema.test.ts` fails until the schema's keys match `Configuration`.
6. **Tests** — extend `tests/command-generator.test.ts` (and `command-template.test.ts` for template vars) to pin the new output.
7. **Storage migration is automatic** — `validateStoredConfiguration` merges stored configs over `DEFAULT_CONFIGURATION` and drops unknown keys, so renames/removals need no manual migration.

Removing an option is the same list in reverse; stale localStorage keys are dropped automatically.

## Checklist: adding a built-in preset

1. Create `public/presets/<id>/config.json`:

```json
{
    "id": "my-preset",
    "name": "Display Name",
    "description": "One sentence.",
    "configuration": { "raptorHpMult": 3, "queenHpMult": 3 },
    "presetTweaks": [
        {
            "description": "Replacement eco",
            "type": "tweakdefs",
            "path": "lua/eco-t3.lua",
            "replaces": "lua/eco-t3.lua"
        }
    ]
}
```

- `configuration` is a **partial** — unspecified keys fall back to defaults.
- `"status": "disabled"` hides a preset without deleting it.
- `presetTweaks[].path` is a bundled path (`lua/...`) or an `https://raw.githubusercontent.com/...` / gist URL — remote hosts are whitelisted in `src/lib/presets/tweak-url.ts`.
- `replaces` (string or array) disables the listed built-in file(s) while the preset is active; the tweak inherits the replaced file's load priority.

2. Run `bun run sync -p .` — presets ship inside `public/data/lua-bundle.json`; without a sync the new preset does not appear.
3. Preset ordering on the showcase is hardcoded in `presets-context.tsx` (`casual`, `easy`, `default`, `hard`, then the rest by name).

## Verifying changes

`bun test && bun lint`, then `bun dev` and check: the option renders, toggling it changes the Generated Commands block, slot usage stays within limits (shown next to the "Generated Commands" title), and a changed value appears with its `description` label in the preset popover.
