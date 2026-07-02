# Code Audit Proposals

Audit of `src/` (Next.js Configurator app), 2026-07-02. Proposals are ranked by severity: **Critical** (wrong output shipped to users), **High** (correctness/robustness/performance defects), **Medium** (fragile design, UX hazards), **Low** (hygiene).

**Instructions for coding agents working these tasks:**

- Work one proposal per PR. Run `bun test` and `bun lint` before committing (a pre-commit hook also enforces this).
- Tests live in `tests/`, run with Bun's test runner. Add/extend tests as stated in each proposal's acceptance criteria.
- Follow `AGENTS.md` conventions: no `any`, Mantine for UI, business logic out of components, Prettier formatting, conventional-commit PR titles.
- Do not change the shape of generated lobby commands except where a proposal explicitly says so — `tests/command-generator.test.ts` and `tests/command-template.test.ts` pin current behavior.

---

## Critical

### C1. `LUA_PRIORITIES` keys with `~` prefix never match — wrong Lua load order

**Files:** `src/lib/command-generator/data/configuration-mapping.ts:25-27`, `src/lib/command-generator/command-generator.ts:145-147`, `tests/command-generator.test.ts:98-109`

**Problem:** `getLuaPriority()` looks up `LUA_PRIORITIES[cleanLuaPath(path)]`, and `cleanLuaPath` strips the leading `~`. Three registry keys keep the `~` prefix — `'~lua/eco-t4.lua': 9`, `'~lua/rflrpc-rebalance.lua': 10`, `'~lua/rflrpc-t4.lua': 11` — so they can never match a cleaned path. Those files silently fall back to `DEFAULT_LUA_PRIORITY` (99) and load after `unit-launchers` (13) and `geo+walls-t3` (14) instead of at 9–11. In BAR, `buildoptions` merges are index/order-sensitive, so load order is load-bearing; this changes actual game behavior. Additionally `lua/mini-bosses-extended.lua` (referenced by the "Mini Bosses Extended" challenge) has no priority entry at all while `mini-bosses.lua` is 5 — almost certainly an oversight of the same kind.

The existing test helper `validatePriorityOrder` uses the identical buggy lookup, so tests pass while mirroring the bug.

**Fix:**
1. Remove the `~` prefix from the three keys in `LUA_PRIORITIES`.
2. Add `'lua/mini-bosses-extended.lua': 5` (same tier as `mini-bosses.lua` — confirm no conflict; if both can never be active together, same value is safe).
3. Add a test that every key in `LUA_PRIORITIES` equals `cleanLuaPath(key)` (i.e. no `~` prefix, no `{...}` suffix), so this class of typo can't recur.
4. Add a test that every Lua path referenced in `BASE_TWEAKS` and `CONFIGURATION_MAPPING` resolves to an explicit (non-default) priority via `getLuaPriority` — export `getLuaPriority` or test through `LUA_PRIORITIES[cleanLuaPath(ref)]`.

**Relation to H4:** land this first as the minimal targeted fix (it is Critical and two lines of data), then do H4, which removes the two-spellings problem that caused this bug and makes the step-3 guard trivially true. Keep both tests — they remain valid after H4.

**Acceptance criteria:** New tests fail on current `main` and pass after the fix; `bun test` green; generated slot content ordering for a default configuration places `eco-t4` between `eco-t3` (8) and `air-rework-t4` (12).

---

### C2. Stray `$` in "Raptor Crater Inverted" map command

**Files:** `src/lib/command-generator/data/configuration-mapping.ts:188`

**Problem:** The command `'!disablemapdamage 0$'` contains a trailing `$`. It is not a template (`isCommandTemplate` requires `$name$` pairs), so the literal string `!disablemapdamage 0$` is emitted into the lobby command block. The lobby server will receive a malformed argument; at best it's ignored, at worst map damage stays disabled on a map whose gimmick (inverted crater) needs it enabled. Typo dates back to the original source import.

**Fix:**
1. Change to `'!disablemapdamage 0'`.
2. Add a test that iterates all `command` arrays in `CONFIGURATION_MAPPING` plus `BASE_COMMANDS`, interpolates them with `DEFAULT_CONFIGURATION`, and asserts no output command contains a `$` character. (Template placeholders must be fully consumed by interpolation; a surviving `$` is always a bug.)

**Acceptance criteria:** New test fails on current `main`, passes after fix; no other command in the data emits a literal `$`.

---

## High

### H1. Fallback minifier concatenates statements without separators — can emit invalid Lua

**Files:** `src/lib/lua-utils/minificator.ts:48-83`

**Problem:** `minifyNonMinifiable` (used whenever `luamin.Minify` throws — which includes every plain-table tweakunits file, since a bare `{...}` is not a valid Lua chunk) builds `output` as lines joined by `\n`, then executes `output = output.replaceAll('\n', '')`, gluing all lines together with **no separator at all**. Two consequences:

- Token merging: lines like `end` + `do`, or `local x = 1` + `local y = 2` become `enddo` / `local x = 1local y = 2` — invalid Lua that only fails at game load time, inside a base64 blob nobody can read. Plain tables mostly survive because lines end in `,`/`{`/`}`, which is why this hasn't visibly exploded, but any `do...end` tweakdefs file that trips luamin goes through the same path.
- The subsequent cleanup `output.replaceAll(/\n\n\n+/g, '\n\n')` is dead code (no newlines remain).

**Fix:** Replace `output.replaceAll('\n', '')` with a join that preserves a separator — simplest correct change: join processed lines with `'\n'` and delete the dead cleanup, or join with a single space. Whitespace is a valid statement separator in Lua; zero-width is not. Keep the rest of the function unchanged.

**Acceptance criteria:** Add a test in `tests/` (e.g. extend `lua-comments.test.ts` or new `minificator.test.ts`): minify a two-statement snippet that luamin rejects (e.g. content with an exotic construct, or call `minifyNonMinifiable` indirectly via a bare-table + trailing statements fixture) and assert the output does not contain merged tokens like `1local` / `enddo` (regex `/\d[a-z]|end[a-z]/` is a reasonable proxy). Existing packer/bundle tests stay green.

---

### H2. `generateCommands` (luamin over the whole bundle) re-runs on every render

**Files:** `src/app/configurator/page.tsx:25`, `src/components/tabs/editor/editor.tsx:170-175`, `src/hooks/use-tweak-data.ts`, `src/lib/command-generator/packer.ts:192-203`

**Problem:** `generateCommands` minifies (luamin) and base64-encodes every active Lua file — the most expensive computation in the app. Two memoization defeats make it run far more often than intended:

1. `configurator/page.tsx:25`: `const enabledCustomTweaks = [...getEnabledTweaks(), ...activePresetTweaks];` creates a new array identity on **every render**, which is a dependency of `useTweakData`'s `useMemo` — so every re-render of the page (each keystroke in lobby name pre-debounce, each tooltip hover that triggers state, etc.) re-runs full command generation.
2. `editor.tsx:170-175`: `getSlotSize`/`getFileSize` are inline arrows (new identity per render) passed into `EditorSidebar`, where they are dependencies of the `fileSizes`/`slotSizes` `useMemo`s — defeating the "pre-calculate to avoid recalculating" intent and re-minifying every listed file/slot each render.

**Fix:**
1. In `configurator/page.tsx`, wrap the merge in `useMemo` keyed on `[getEnabledTweaks, activePresetTweaks]` (the editor already does exactly this at `editor.tsx:41-44` — copy that pattern).
2. In `editor.tsx`, wrap `getSlotSize`/`getFileSize` in `useCallback` keyed on `[getSlotContent]` / `[getCurrentContent]`.
3. Add a module-level memo cache in the packer for minification: in `packLuaSources`, replace the direct `minify(remaining)` call with a lookup in a `Map<string, string>` keyed by source content (cap size ~200 entries, evict-all when full is fine — content set is small and stable). This makes even legitimate re-generations (config toggle) cheap since unchanged files skip luamin.

**Acceptance criteria:** `bun test` green (pure-function behavior unchanged). Manual check per `/verify` flow: typing in the lobby-name field no longer causes visible lag with all toggles enabled; React DevTools profiler (or a temporary counter log) shows `generateCommands` executing only when configuration/tweaks actually change.

---

### H3. Imported/bundled preset configurations are not sanitized — unknown keys crash command generation

**Files:** `src/lib/command-generator/configuration/mapper.ts:24-34`, `src/components/contexts/presets-context.tsx:84-97`, `src/components/tabs/configurator/preset-showcase/preset-modal.tsx:200-208`, `src/lib/configuration-storage/storage.ts:42-69`

**Problem:** Three ingestion paths spread untrusted JSON straight over `DEFAULT_CONFIGURATION`:
- bundle preset `config.json` parsing (`presets-context.tsx:92`),
- preset JSON file import in the modal (`preset-modal.tsx:204`),
- (only `validateStoredConfiguration` for localStorage does it right, by filtering to known keys).

A preset JSON with an extra key (e.g. a key renamed in a newer app version, or a hand-edited file) puts that key into `Configuration`. `getMappedData` then executes `CONFIGURATION_MAPPING[configKey].values` — `undefined.values` throws `TypeError`, caught by `useTweakData` and surfaced as a cryptic "Cannot read properties of undefined" error banner with zero commands. Invalid enum *values* (e.g. `gameMap: "Nonexistent Map"`) silently produce no commands for that option. Since presets are a shared/community artifact, this is a realistic input, not a hypothetical.

**Fix:**
1. Extract the key-filter + merge logic from `validateStoredConfiguration` into an exported `sanitizeConfiguration(partial: unknown): Configuration` in `storage.ts` (filter to `Object.keys(DEFAULT_CONFIGURATION)`, merge over defaults). Additionally validate enum-typed fields (`presetDifficulty`, `challenges`, `gameMap`, `start`) against their `const` arrays and clamp/replace invalid values with the default.
2. Use it in all three ingestion sites (`validateStoredConfiguration` itself, `presets-context.tsx` builtInPresets parse, `preset-modal.tsx` import handler).
3. Defensive guard in `getMappedData`: `if (!mapping) continue;` — one line, converts any future gap from a crash into a no-op.

**Acceptance criteria:** New tests: `sanitizeConfiguration` drops unknown keys, replaces invalid enum values with defaults, passes valid configs through unchanged; `getMappedData` with a config containing an extra key does not throw. Importing a preset JSON with junk keys in the UI selects/saves cleanly.

---

### H4. Drop the `~` prefix for Lua source references

**Files:** `src/lib/command-generator/data/configuration-mapping.ts` (all `~lua/...` entries in `BASE_TWEAKS` and `CONFIGURATION_MAPPING`), `src/lib/command-generator/interpolator.ts:26-37`, `src/lib/command-generator/command-generator.ts:122-130`, `src/app/data/page.tsx:41, 56, 99, 114`, `src/components/tabs/editor/editor-sidebar.tsx:75`, `tests/command-generator.test.ts`

**Prerequisite:** C1 (tiny targeted data fix) should merge first; this proposal then removes the design flaw that made C1 possible. Subsumes L1.

**Problem:** Lua file references are written as `~lua/file.lua` while the same paths appear un-prefixed as bundle keys, `LUA_PRIORITIES` keys, preset-tweak `path`s, and `replaces` targets. The `~` is a discriminator with only one variant: every entry in every `tweakdefs`/`tweakunits` array is a file reference (plain commands live in separate `command` arrays; preset tweaks and remote URLs already use bare paths). The prefix therefore distinguishes nothing, yet it creates two spellings of every path, and the codebase pays for that everywhere:

- `cleanLuaPath` exists mostly to undo it, and bug C1 happened precisely because registry keys used one spelling while lookups used the other.
- `data/page.tsx` and `editor-sidebar.tsx` each hand-roll their own stripping (formerly L1).
- `parseReference` hard-fails on a missing `~`, making the prefix load-bearing ceremony rather than optional documentation.

The `{VAR=value}` template suffix is orthogonal and stays — it is self-announcing where used.

**Fix:**
1. Delete the `~` from every path in `BASE_TWEAKS` and `CONFIGURATION_MAPPING` (and the "References to actual Lua files are prefixed with ~" comment at `configuration-mapping.ts:124`).
2. In `parseReference` (`interpolator.ts`), stop requiring the prefix: accept a bare path, but keep *tolerating* a leading `~` (strip it silently) so any stray old-format string — e.g. hand-edited data or future merges from older branches — still resolves. Update the regex to `/^~?([^{]+)(?:\{([^}]+)\})?$/` and drop the "missing ~ prefix" warn/return-null branch.
3. Reduce `cleanLuaPath` to stripping the `{...}` suffix, keeping the `^~` strip for the same tolerance reason; update its doc example.
4. Replace the hand-rolled `path.replace(/^~/, '').split('{')[0]` at the five call sites (`data/page.tsx` ×4-ish, `editor-sidebar.tsx`) with `cleanLuaPath` (this absorbs L1).
5. Update tests that assert on `~`-prefixed reference strings; the C1 tests (registry-key hygiene, explicit priorities for all referenced paths) must remain and stay green.

**Acceptance criteria:** `grep -rn '~lua/' src/` returns nothing; `bun test` green; generated commands for the default configuration are byte-identical to before the change (the prefix never reached the output — a before/after diff of the Generated Commands text is the proof); slot source manifests (`-- Source: [...]`) now show bare paths consistently.

---

## Medium

### M1. Custom-tweak slot allocation regex-parses the app's own generated command strings

**Files:** `src/lib/command-generator/command-generator.ts:175-248, 405-422`

**Problem:** `generateCommands` builds structured `Command` objects with exact `slot.index` metadata, then flattens them to strings and has `allocateCustomTweaks` re-discover used slots with `/!bset\s+(tweakdefs|tweakunits)(\d?)\s/` — parsing output we just produced. This is the "stringly-typed round trip" antipattern: the regex is case-sensitive (`!bSet` would be missed), assumes single-digit slots, and silently under-detects if the command format ever changes — leading to duplicate `!bset tweakdefsN` commands where the later one overwrites the earlier in the lobby.

**Fix:** Change `allocateCustomTweaks` to accept the used slot indices directly: build `usedSlots` from `tweakdefsResult.commands` / `tweakunitsResult.commands` (each has `slot.index` and `type`), not from strings. Signature becomes `allocateCustomTweaks(usedSlots: Record<LuaTweakType, Set<number>>, customTweaks: ...)`. Delete the regex.

**Acceptance criteria:** Existing command-generator tests green; add a test that when packed sources occupy tweakdefs slots 0–1, the first custom tweakdefs tweak gets slot 2 (or the first free ≥1 per current policy), and no two generated commands target the same slot name.

---

### M2. User vs. preset tweak discrimination via ID sign convention

**Files:** `src/lib/command-generator/command-generator.ts:68-83, 367-372`, `src/lib/presets/resolver.ts:12-26`, `src/components/contexts/custom-tweaks-context.tsx:144-152`

**Problem:** Preset tweaks get negative IDs (`-(index+1)` in `resolver.ts`), user tweaks get `Date.now()`, and `generateCommands` separates them with `t.id > 0` / `t.id >= 0` checks. This magic convention is spread across three files with no type-level representation, and it has a real hole: an ID of exactly `0` would be excluded from *both* groups (`id > 0` fails, `id >= 0` returns false in the preset filter). It also makes `Date.now()` collisions (two adds in one ms) produce duplicate React keys and broken delete-by-id.

**Fix:** Add an explicit discriminator to `CustomTweak`: `source: 'user' | 'preset'` (set `'preset'` in `resolver.ts` `buildTweak`, `'user'` in `addTweak`). Replace the sign checks in `command-generator.ts` with `t.source === 'preset'` / `'user'`. For stored user tweaks missing the field, default to `'user'` in `validateAndMigrateStoredData` (this is the existing migration hook — one line). Keep numeric IDs as-is (they're only identity now, not semantics); optionally switch new user IDs to `crypto.randomUUID()`-backed numbers is NOT needed — out of scope.

**Acceptance criteria:** `bun test` green; grep shows no remaining `id > 0` / `id >= 0` / `id < 0` semantic checks in `src/`; existing saved tweaks in localStorage still load (migration path covered by a test on `validateAndMigrateStoredData`).

---

### M3. Applying a preset writes configuration one key at a time (15 sequential state+localStorage writes)

**Files:** `src/components/contexts/presets-context.tsx:137-147`, `src/components/contexts/configurator-context.tsx:61-71`

**Problem:** `applyConfiguration` loops `setProperty(key, value)` over every key. Each call runs a functional update and a synchronous `localStorage.setItem` with full JSON serialization — ~15 writes per preset click. React batches the renders, but the storage writes and `createStoredConfiguration` allocations are all executed, and the pattern invites subtle bugs (any future non-functional update in `setProperty` would clobber earlier keys). It also fires the auto-save-to-local-preset effect with intermediate states.

**Fix:** Add `setConfiguration(config: Configuration): void` to `ConfiguratorContextValue` (one `setStoredConfig(createStoredConfiguration(config))` call). Use it in `applyConfiguration`. Keep `setProperty` for single-field UI edits.

**Acceptance criteria:** Selecting a preset performs one localStorage write for `nuttyb-configuration` (verifiable with a spy in a test or devtools); behavior otherwise unchanged.

---

### M4. Preset delete is a single unconfirmed click

**Files:** `src/components/tabs/configurator/preset-showcase/preset-card-list.tsx:156-167`, `src/components/contexts/presets-context.tsx:304-312`

**Problem:** The trash `ActionIcon` on a preset card calls `onDelete(preset.id)` directly. One misclick permanently destroys a hand-built local preset (there is no undo; export is the only backup). Deleting the active preset also silently switches configuration to `default`, discarding the user's current settings.

**Fix:** Wrap deletion in a confirmation — Mantine's `Modal` or `Popover` inline confirm ("Delete preset '<name>'? This cannot be undone.") in `preset-card-list.tsx`. No context changes needed.

**Acceptance criteria:** Clicking trash shows a confirm step; confirming deletes, dismissing does not. Lint/tests green.

---

### M5. Dead chunking abstraction: `Chunk[]` always contains exactly one chunk

**Files:** `src/lib/command-generator/command-generator.ts:103-120, 326-338, 472-475`, `src/hooks/use-tweak-data.ts:42-44`, `src/components/contexts/tweak-data-context.tsx`, `src/components/tabs/configurator/generated-commands.tsx:136-138`

**Problem:** `groupIntoChunks` documents "respecting message size limit" but is hardcoded to return `[{ commands }]`; its doc comment even admits "always contains exactly one chunk". Consumers dutifully `.map()` over chunks/sections that can only have one element. This is speculative structure that misleads readers into thinking multi-chunk output exists and is tested. Meanwhile the *real* per-command size check inside it throws a user-facing error string that duplicates the packer's own limit enforcement.

**Fix (choose the simpler, and it is deletion):** Remove the `Chunk` type and `groupIntoChunks`; make `PackingResult.chunks: Chunk[]` become `commands: Command[]`. Keep the per-command `MAX_SLOT_SIZE` assertion as a plain loop in `generateCommands`. Update `useTweakData` (`sections` becomes a single joined string or a one-element array — prefer changing `TweakDataContext.sections: string[]` to `commandText: string`), `use-slot-content.ts`, `generated-commands.tsx`, and the two test files that map over chunks. If actual lobby-message-size chunking is a real upcoming requirement, implement it instead — but do not keep the shell.

**Acceptance criteria:** No type named `Chunk` remains; tests updated and green; the Generated Commands UI renders identically (one copyable block).

---

### M6. Numeric input fallbacks contradict defaults and mishandle clearing

**Files:** `src/components/tabs/configurator/sections/general.tsx:141-143, 159-161, 177-179, 195-197`, `src/lib/command-generator/data/configuration.ts:63-67`

**Problem:** `onChange={(value) => setProperty('queenCount', Number(value) || 8)}` — the fallback `8` disagrees with `DEFAULT_CONFIGURATION.queenCount = 12`. All four numeric inputs use `Number(value) || fallback`, which also coerces a legitimately-typed `0` (or a transient empty string while editing) into the fallback mid-keystroke, fighting the user. Mantine's `min`/`max` only clamp on blur/steppers, so out-of-range values can transiently persist to storage (and permanently via imported presets — see H3 for the import side).

**Fix:** Write a tiny helper in `general.tsx` (or `lib`): `clampNumber(value: string | number, min: number, max: number, fallback: number): number` — returns fallback for `''`/NaN, else clamps. Use `DEFAULT_CONFIGURATION.<key>` as each fallback so defaults have one source of truth. Apply to all four `NumberInput`s.

**Acceptance criteria:** Clearing a numeric field and blurring restores the documented default (12 for queen count); typing an out-of-range number persists the clamped value; no `|| 8` literal remains.

---

## Low

### L1. Path-cleaning logic duplicated instead of using `cleanLuaPath` — **subsumed by H4**

**Files:** `src/app/data/page.tsx:41, 56, 99, 114`, `src/components/tabs/editor/editor-sidebar.tsx:75`, `src/lib/command-generator/command-generator.ts:128-130`

**Problem:** `path.replace(/^~/, '').split('{')[0]` is hand-rolled in five places; `cleanLuaPath` in `command-generator.ts` does exactly this (with a stricter `{...}` tail regex). Divergent copies will rot independently.

**Fix:** Covered by H4 step 4. Only work this standalone if H4 is rejected: import and use `cleanLuaPath` at all five sites (it is already exported).

**Acceptance criteria:** `grep -r "replace(/\^~/" src/` returns only `cleanLuaPath`'s own definition; tests green.

### L2. Editor localStorage keys bypass the central key registry

**Files:** `src/components/tabs/editor/hooks/use-editor-storage.ts:14, 17`, `src/lib/configuration-storage/keys.ts`

**Problem:** `'nuttyb-edited-files'` / `'nuttyb-edited-slots'` are string literals while every other key lives in `keys.ts`, whose header says "All storage keys should be defined here to avoid collisions."

**Fix:** Add `EDITED_FILES_STORAGE_KEY` / `EDITED_SLOTS_STORAGE_KEY` to `keys.ts` with the same values (no migration needed) and import them.

**Acceptance criteria:** No `'nuttyb-*'` string literal outside `keys.ts`.

### L3. `useLocalStorage` is single-consumer-per-key but this constraint is undocumented; migration effect writes back unconditionally

**Files:** `src/hooks/use-local-storage.ts`, `src/components/contexts/custom-tweaks-context.tsx:123-131`

**Problem:** Two `useLocalStorage` instances sharing a key silently diverge (each holds its own ref; no cross-instance or cross-tab sync). Today every key has exactly one consumer, but nothing states or enforces that. Separately, the custom-tweaks migration effect calls `setStoredData(storedData)` on every load even when nothing was migrated — a redundant write and an `eslint-disable` for deps.

**Fix:** (a) Add a doc comment on `useLocalStorage` stating the single-consumer-per-key constraint. (b) In `validateAndMigrateStoredData`, return a flag (or compare) so the write-back effect only fires when a priority was actually assigned; simplest: have the effect check `storedData.tweaks.some(t => t.priority === undefined)` is impossible post-migration — instead track "changed" by comparing lengths of tweaks missing priority pre-migration; a `didMigrate` boolean alongside the parsed value is the clean shape.

**Acceptance criteria:** Loading the app with already-migrated data performs no `setItem` for `nuttyb-custom-tweaks` on mount (spy in test); doc comment present.

### L4. Minor dead/dubious code in command generation

**Files:** `src/lib/command-generator/command-template.ts:166`, `src/lib/command-generator/command-generator.ts:152-156`

**Problem:** (a) `extras: config.challenges` in `buildTemplateContext` — no template references `$extras$`; dead map entry (knip can't see object keys). (b) `getPresetPriority` silently uses only `targets[0]` when a preset tweak replaces multiple files that may have different priorities — behavior is defensible (first target dominates) but undocumented.

**Fix:** Delete the `extras` entry (or rename to `challenges` and actually use it if a template needs it). Add one doc line to `getPresetPriority`: "Uses the first replaced target's priority; multi-target replaces inherit the earliest slot position." Optionally use `Math.min` over all targets for correctness — decide, then document.

**Acceptance criteria:** Tests green; no `$extras$` references exist (grep).

### L5. Two different mechanisms read the base path

**Files:** `src/components/contexts/lua-bundle-context.tsx:8`, `src/app/page.tsx:17`

**Problem:** The bundle fetch uses the private Next.js env `process.env.__NEXT_ROUTER_BASEPATH` while the root page uses `NEXT_PUBLIC_BASE_PATH`. Relying on a private `__NEXT_*` variable can break on Next upgrades without warning.

**Fix:** Standardize on `NEXT_PUBLIC_BASE_PATH` (already part of the build setup) in `lua-bundle-context.tsx`.

**Acceptance criteria:** `grep -r "__NEXT_ROUTER_BASEPATH" src/` is empty; bundle still loads in dev (`bun dev`) and in a `NEXT_PUBLIC_BASE_PATH`-set production build.

### L6. Lobby-name field freezes the auto-generated tag once touched

**Files:** `src/components/tabs/configurator/sections/general.tsx:66-105`

**Problem:** The input displays the computed default tag as its *value* (not just placeholder). If the user clicks in and types anything — including re-typing the default — the literal text is persisted to `configuration.lobbyName`, and from then on the tag no longer updates when difficulty/challenge changes. Also `onMouseLeave={() => debouncedSetProperty.flush()}` commits half-typed input on an accidental mouse-out.

**Fix:** Keep `value` empty when `configuration.lobbyName` is empty and show the computed tag only as `placeholder` (already passed). Add a small "reset to auto" clear button (Mantine `TextInput` `rightSection`) when a custom value is set. Drop the `onMouseLeave` flush; `onBlur` suffices.

**Acceptance criteria:** With no custom name, changing difficulty updates the placeholder tag; typing a custom name persists it; clearing it restores auto behavior.

---

## Explicitly not proposed

- **Splitting `preset-modal.tsx` (598 lines):** it is almost entirely declarative JSX with local form state; splitting would add indirection without reducing complexity. Revisit only if a second consumer of its sub-forms appears.
- **Replacing the hand-rolled `useLocalStorage`:** the ref+forceRender implementation is sound for the app's SSR constraints; a library swap is churn without benefit (see L3 for the documentation gap instead).
- **base64 `new Base64()` per call:** negligible cost, correct behavior, leave it.
