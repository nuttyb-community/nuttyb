/** Maximum size for a single slot's command string (including prefix + payload) */
export const MAX_SLOT_SIZE = 16_000;

/** Maximum slots per tweak type (tweakdefs0-9, tweakunits0-9) */
export const MAX_SLOTS_PER_TYPE = 10;

/**
 * Reserved space for the command prefix (e.g. '!bset tweakunits9 ').
 * The packer must subtract this from MAX_SLOT_SIZE when checking payload fits.
 */
export const COMMAND_PREFIX_RESERVE = 20;
