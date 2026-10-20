/**
 * Checks if all Lua files referenced in configuration-mapping.ts
 * are present in lua-bundle.json and reports the results to the console.
 */

import {
    BASE_TWEAKS,
    CONFIGURATION_MAPPING,
} from '@/lib/command-generator/data/configuration-mapping';

import { extractLuaReferences, getBundle } from '../../tests/utils/bundle';

/**
 * Main validation function
 */
function main(): void {
    console.log('Validating Lua file references in configuration mapping...\n');

    // Load the bundle
    const bundle = getBundle();
    if (!bundle) {
        console.error('ERROR: Could not read lua-bundle.json');
        process.exit(1);
    }

    console.log(`Bundle SHA: ${bundle.sha}`);
    console.log(`Bundle contains ${bundle.files.length} files\n`);

    // Extract all Lua references from the configuration mapping and base tweaks
    const configReferences = extractLuaReferences(CONFIGURATION_MAPPING);
    const baseTweaksReferences = extractLuaReferences(BASE_TWEAKS);
    const allReferences = [...configReferences, ...baseTweaksReferences];
    const uniqueReferences = [...new Set(allReferences)].toSorted();

    console.log(
        `Found ${uniqueReferences.length} unique Lua file references (${configReferences.length} from configuration mapping, ${baseTweaksReferences.length} from base tweaks)\n`
    );

    // Create a set of bundle paths for quick lookup
    const bundlePaths = new Set(bundle.files.map((f) => f.path));

    // Check each reference
    const missingFiles: string[] = [];

    for (const ref of uniqueReferences) {
        if (bundlePaths.has(ref)) {
            console.log(`  ✓ ${ref}`);
        } else {
            console.log(`  ✗ ${ref} (MISSING)`);
            missingFiles.push(ref);
        }
    }

    console.log('');

    // Report results
    if (missingFiles.length > 0) {
        console.error(
            `ERROR: ${missingFiles.length} file(s) referenced in configuration mapping are missing from lua-bundle.json:\n`
        );
        for (const file of missingFiles) {
            console.error(`  - ${file}`);
        }
        process.exit(1);
    }

    console.log('SUCCESS: All referenced Lua files are present in the bundle.');
}

main();
