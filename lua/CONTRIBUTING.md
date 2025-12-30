# Contributing Lua Tweaks to NuttyB

This guide covers the patterns and conventions used in NuttyB Lua tweak files for Beyond All Reason (BAR).

## File Types

NuttyB uses two types of Lua tweak files that correspond to BAR's modding system:

| Type           | Purpose                                                                 | Structure                   |
| -------------- | ----------------------------------------------------------------------- | --------------------------- |
| **TweakUnits** | Modify existing unit properties (stats, costs, weapons)                 | Plain Lua table `{}`        |
| **TweakDefs**  | Complex logic, create new units, modify multiple units programmatically | Wrapped in `do...end` block |

---

## Header Comments

All Lua files should include a header comment with:

```lua
-- Feature Name
-- Authors: YourName
-- https://github.com/nuttyb-community/nuttyb
```

## TweakUnits Files

TweakUnits files are **plain Lua tables without a return statement**. The game engine automatically merges these tables with existing unit definitions.

### Structure

```lua
-- NuttyB Feature Name
-- Authors: YourName
-- https://github.com/nuttyb-community/nuttyb

{
    unitname = {
        property = value,
        nested = {
            subproperty = value,
        },
    },
    anotherunit = {
        property = value,
    },
}
```

## TweakDefs Files

TweakDefs files contain executable Lua code **wrapped in a `do...end` block**.

### Structure

```lua
-- NuttyB Feature Name
-- Authors: YourName
-- https://github.com/nuttyb-community/nuttyb

do
    local unitDefs = UnitDefs or {}

    -- Your logic here

end
```

### Why `do...end`?

1. **Variable Scoping**: Local variables don't leak into global scope
2. **Multiple Files**: Prevents conflicts when multiple tweak files are merged together
3. **Clean Execution**: Code runs immediately when the file is processed

### Example: Creating New Units

```lua
-- T3 Cons & Taxed Factories
-- Authors: Nervensaege, TetrisCo
-- https://github.com/nuttyb-community/nuttyb

do
    local unitDefs, factions, tableMerge =
        UnitDefs or {},
        { 'arm', 'cor', 'leg' },
        table.merge

    local function addNewMergedUnitDef(baseUnit, newUnit, mergeProps)
        if unitDefs[baseUnit] and not unitDefs[newUnit] then
            unitDefs[newUnit] = tableMerge(unitDefs[baseUnit], mergeProps)
        end
    end

    for _, faction in pairs(factions) do
        -- T3 Construction Turret
        addNewMergedUnitDef(faction .. 'nanotct2', faction .. 'nanotct3', {
            metalcost = 3700,
            energycost = 62000,
            health = 8800,
            workertime = 1900,
            customparams = {
                i18n_en_humanname = 'T3 Construction Turret',
                i18n_en_tooltip = 'More BUILDPOWER! For the connoisseur',
            },
        })
    end
end
```

### Example: Iterating Over Units

```lua
do
    local unitDefs = UnitDefs or {}

    for name, def in pairs(unitDefs) do
        if string.sub(name, 1, 7) == 'raptor_' then
            -- Modify all raptor units
            def.health = def.health * 1.5
        end
    end
end
```

### Example: Using `table.mergeInPlace`

```lua
do
    local unitDefs = UnitDefs or {}
    local merge = table.mergeInPlace or table.merge

    merge(unitDefs, {
        armsilo = {
            energycost = 1500000,
            metalcost = 98720,
            maxthisunit = 1,
        },
        corsilo = {
            energycost = 1500000,
            metalcost = 98720,
            maxthisunit = 1,
        },
    })
end
```

---

## Template Files

Template files use **placeholder variables** that get replaced by the configurator at runtime. Use the `$VARIABLE_NAME$` syntax.

### Example: HP Multiplier Template

```lua
-- NuttyB v1.52 $HP_MULTIPLIER$X HP
-- https://github.com/nuttyb-community/nuttyb

for unitName, unitDef in pairs(UnitDefs) do
    if
        unitDef.customparams
        and unitDef.customparams.subfolder == 'other/raptors'
        and unitDef.health
        and not unitName:match('^raptor_queen_.*')
    then
        unitDef.health = unitDef.health * $HP_MULTIPLIER$
    end
end
```

### Available Template Variables

If you want to use a template variable in your Lua code, make sure it is defined in `configuration-mapping.ts`.

---

## Common Patterns

### Local Variable Aliasing

For performance and readability, alias commonly used globals at the top of the `do` block:

```lua
do
    local unitDefs, tableMerge, tableCopy =
        UnitDefs or {},
        table.merge,
        table.copy

    -- Use unitDefs, tableMerge, tableCopy throughout
end
```

### Safe Unit Access

Always check if a unit exists before modifying:

```lua
if unitDefs[unitName] then
    unitDefs[unitName].health = 5000
end
```

### Cloning Units

```lua
local function cloneUnit(sourceUnit, targetUnit, overrides)
    if unitDefs[sourceUnit] and not unitDefs[targetUnit] then
        unitDefs[targetUnit] = table.merge(unitDefs[sourceUnit], overrides)
    end
end

cloneUnit('armfus', 'armfust4', {
    name = 'Legendary Fusion Reactor',
    metalcost = 50000,
    energymake = 72000,
})
```

### Deep Copy for Independent Modifications

```lua
local function deepCopy(orig)
    local copy = {}
    for k, v in pairs(orig) do
        copy[k] = type(v) == 'table' and deepCopy(v) or v
    end
    return copy
end
```

---

## Helper Functions

### `ensureBuildOption` - Add Build Options Safely

This helper function safely adds a build option to a builder unit, preventing duplicates and handling missing units gracefully.

```lua
local function ensureBuildOption(builderName, optionName)
    local builder = unitDefs[builderName]
    local optionDef = optionName and unitDefs[optionName]
    if not builder or not optionDef then
        return
    end

    builder.buildoptions = builder.buildoptions or {}
    for i = 1, #builder.buildoptions do
        if builder.buildoptions[i] == optionName then
            return
        end
    end

    builder.buildoptions[#builder.buildoptions + 1] = optionName
end
```

#### Usage

```lua
do
    local unitDefs = UnitDefs or {}

    local function ensureBuildOption(builderName, optionName)
        local builder = unitDefs[builderName]
        local optionDef = optionName and unitDefs[optionName]
        if not builder or not optionDef then
            return
        end

        builder.buildoptions = builder.buildoptions or {}
        for i = 1, #builder.buildoptions do
            if builder.buildoptions[i] == optionName then
                return
            end
        end

        builder.buildoptions[#builder.buildoptions + 1] = optionName
    end

    -- Create a new unit
    unitDefs['armannit4'] = table.merge(unitDefs['armannit3'], {
        name = 'Legendary Pulsar',
        metalcost = 43840,
        energycost = 1096000,
    })

    -- Add to multiple builders
    local builders = {
        'armaca', 'armack', 'armacv',
        'armt3airaide', 'armt3aide',
    }

    for i = 3, 10 do
        builders[#builders + 1] = 'armcomlvl' .. i
    end

    for _, builderName in pairs(builders) do
        ensureBuildOption(builderName, 'armannit4')
    end
end
```

### `addNewMergedUnitDef` - Create Merged Unit Definitions

```lua
local function addNewMergedUnitDef(baseUnit, newUnit, mergeProps)
    if unitDefs[baseUnit] and not unitDefs[newUnit] then
        unitDefs[newUnit] = table.merge(unitDefs[baseUnit], mergeProps)
    end
end
```

### `newUnit` - Shorthand for Unit Creation

```lua
local function newUnit(old, new, data)
    if unitDefs[old] and not unitDefs[new] then
        unitDefs[new] = table.merge(unitDefs[old], data or {})
    end
end

newUnit('raptor_queen_veryeasy', 'raptor_miniq_a', {
    name = 'Queenling Prima',
    health = 300000,
    customparams = {
        i18n_en_humanname = 'Queenling Prima',
        i18n_en_tooltip = 'Majestic and bold, ruler of the hunt.',
    },
})
```

---

## Best Practices

### 1. Use Descriptive Names

```lua
-- Good
local legPulsarName = 'armannit4'
local taxMultiplier = 1.5

-- Avoid
local n = 'armannit4'
local x = 1.5
```

### 2. Group Related Modifications

```lua
-- Good: All flak modifications together
{
    armflak = {
        airsightdistance = 1350,
        energycost = 30000,
        metalcost = 1500,
        health = 4000,
    },
    corflak = {
        airsightdistance = 1350,
        energycost = 30000,
        metalcost = 1500,
        health = 4000,
    },
    legflak = {
        airsightdistance = 1350,
        energycost = 35000,
        metalcost = 2100,
        health = 6000,
    },
}
```

### 3. Include i18n Custom Parameters

Always include human-readable names and tooltips:

```lua
customparams = {
    i18n_en_humanname = 'Legendary Fusion Reactor',
    i18n_en_tooltip = 'Produces 72000 Energy (non-explosive)',
    techlevel = 4,
},
```

### 4. Set Appropriate Icon Types

When creating new units, set the icon type to an existing similar unit:

```lua
unitDefs['newunit'] = table.merge(unitDefs['baseunit'], {
    icontype = 'baseunit',  -- Use existing icon
})
```

### 5. Handle Missing Dependencies

```lua
-- Check if required unit exists before creating dependent units
if unitDefs.cormandot4 then
    for k, s in pairs(NewUnits) do
        -- Create launcher units
    end
end
```

### 6. Test Locally Before Submitting

Use the configurator's local sync feature to test your changes:

```bash
bun run sync -p .
```
