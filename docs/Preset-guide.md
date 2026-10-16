# NuttyB Presets Guide

## What is a Preset?

A preset is **not** a standalone set of instructions that replaces everything. Think of it as a **"fancy checkbox"** — it loads the base configuration **plus** your preset on top.

When you select a preset:

- It **applies your preset's configuration** (settings like raptor HP, map, economy multipliers, etc.). Only the keys you define override the defaults — everything else stays.
- It **keeps all the regular settings** in the configurator, so you can fine-tune the preset afterwards. Changed settings mark the preset as modified (`*`).
- Its **name goes into the default lobby name tag**, e.g. `NuttyB CE [Mini Bosses][Medium][No Mex]`. A custom lobby name tag replaces it.
- Any **custom Lua tweaks** in your preset get merged into the bundle. If a tweak has a `replaces` field matching a built-in tweak, yours replaces it. If not, it's added alongside everything else.

> Only one preset can be active at a time. You can export presets and manually merge them into one if needed.

The difficulty levels are presets too. **Easy**, **Medium** and **Hard** set the raptor and queen HP multipliers, cross-faction T2 labs and T4 defences. **Medium** carries the default configuration, and **Reset all** returns to it.

## Why Use Presets?

| Scenario | Without Presets | With Presets |
|---|---|---|
| Changing a value in a built-in tweak | PR required | Edit your hosted tweak anytime |
| Adding entirely new tweaks | PR required | Add once to your preset |
| Sharing your setup with others | Screenshots or instructions | Single JSON file |
| Iterating on balance changes | Each change = PR | Edit freely on your own repo |

## How to Create a Preset

1. Click **New preset** (next to the Preset heading in the configurator).
2. Fill in name, description, and pick an icon.
3. (Optional) Add custom Lua tweaks — either a raw GitHub URL (`raw.githubusercontent.com` or `gist.githubusercontent.com`) or a local bundle path.

    You can optionally specify which built-in tweak(s) yours replaces.

## How to Share a Preset

### Option 1: Export as JSON

Click **Export** on your preset card. Share the downloaded `.json` file.

Recipients import it via **Import Preset from JSON File** in the preset panel (Click **New Preset** to open the panel)

### Option 2: Host on the Configurator

Add a folder under `public/presets/<your-name>/config.json` and submit a PR. Once merged, your preset appears for everyone.

Your custom tweaks reference Lua files on your own repo:

```
https://raw.githubusercontent.com/<user>/<repo>/<branch>/<path>/<file>.lua
```

The configurator fetches the latest version from that URL, if it doesn't Ctrl + F5 to refresh cache.

**Editing existing tweaks on your repo doesn't need a PR** — changes take effect for all users.

Adding a *new* tweak to your preset (modifying the `presetTweaks` array in `config.json`) still requires a PR.

## Preset JSON Structure

```json
{
    "version": 1,
    "id": "my-preset",
    "name": "My Preset",
    "description": "What this preset does",
    "icon": "IconBolt",
    "status": "enabled",
    "configuration": {
        "raptorHpMult": 1.3,
        "queenHpMult": 1.3,
        "isCrossFactionT2": true,
        "isDefencesT4": true,
        "challenges": "Mini Bosses",
        "gameMap": "Full Metal Plate (12P)",
        "start": "No rush",
        "lobbyName": "My Lobby",
        "isEcoT4": false,
        "isRFLRPCRebalance": true,
        "isRFLRPCT4": true,
        "isMegaNuke": false,
        "incomeMult": 1,
        "buildDistMult": 2,
        "buildPowerMult": 1,
        "queenCount": 12
    },
    "presetTweaks": [
        {
            "description": "My Custom Tweak",
            "type": "tweakdefs",
            "path": "https://raw.githubusercontent.com/user/repo/branch/file.lua",
            "replaces": "lua/built-in-tweak.lua"
        }
    ]
}
```

### Top-level fields

| Field | Required | Notes |
|---|---|---|
| `version` | No | Schema version (currently `1`) |
| `id` | No | Falls back to folder name if hosted; required for exported JSON |
| `name` | Yes | Display name |
| `description` | Yes | Short description |
| `icon` | Yes | Tabler icon (e.g. `IconBolt`, `IconMoodSmile`, `IconUser`) |
| `status` | No | `"enabled"` (default) or `"disabled"`. Disabled built-in presets stay in the bundle but are hidden from the showcase; disabled local presets stay visible (greyed out) so you can edit them back to enabled. |
| `configuration` | Yes | Settings to apply. Sparse merge — omit keys to keep defaults. |
| `presetTweaks` | No | Array of custom Lua tweaks (see below) |

### `configuration` keys

| Key | Type | Values |
|---|---|---|
| `raptorHpMult` | number | Raptor HP multiplier (0.1 – 10) |
| `queenHpMult` | number | Queen HP multiplier (0.1 – 10) |
| `isCrossFactionT2` | boolean | Enable cross-faction T2 labs (70% extra cost) |
| `isDefencesT4` | boolean | Enable T4 defences |
| `challenges` | string | `"None"`, `"Mini Bosses"`, `"Mini Bosses Extended"`, `"Experimental Wave Challenge"` |
| `gameMap` | string | Map name (e.g. `"Full Metal Plate (12P)"`) |
| `start` | string | `"No rush"`, `"No rush solo"`, `"Zero grace"`, `"Surrounded"` |
| `lobbyName` | string | Default lobby name |
| `isEcoT4` | boolean | Enable T4 economy |
| `isRFLRPCRebalance` | boolean | Enable LRPC rebalance |
| `isRFLRPCT4` | boolean | Enable T4 LRPC |
| `isMegaNuke` | boolean | Enable mega nuke |
| `isT3GeoWalls` | boolean | Enable T3 geo and walls |
| `incomeMult` | number | Income multiplier (0.1 – 10) |
| `buildDistMult` | number | Build distance multiplier (0.5 – 10) |
| `buildPowerMult` | number | Build power multiplier (0.1 – 10) |
| `queenCount` | number | Queen count (1 – 100) |

### `presetTweaks` item fields

| Field | Required | Notes |
|---|---|---|
| `description` | Yes | Human-readable name |
| `type` | Yes | `"tweakdefs"` or `"tweakunits"` |
| `path` | Yes | GitHub raw URL (`raw.githubusercontent.com` or `gist.githubusercontent.com`) or bundle path |
| `replaces` | No | Built-in tweak path(s) to replace. Can be a string or array. If omitted, the tweak is **added** alongside everything. |

## Character Limits & Minification

- The configurator has a **built-in minifier** — no need to minify manually.
- Use **Developer tools → Base64** to check if your bundle exceeds the max character limit.
- If it does, the configurator throws an error (it won't fail silently).

## FAQ

**Can I enable multiple presets at once?**
No. Only one preset can be active. Export and merge manually if needed.

**Does a preset disable regular tweaks?**
No. All regular toggleable tweaks remain available. The preset only overrides specific configuration values or replaces specific built-in Lua files.

**What happens if I edit my hosted tweak?**
No PR needed. The URL stays the same, and the configurator always fetches the latest version.

**What if I add a new tweak to my hosted preset?**
That changes `config.json`, so a PR is required to update it in the NuttyB repo.
