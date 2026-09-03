export const HOOK_NAME = "memory-system"


/** Maximum summary length per session (chars) */
export const MAX_SUMMARY_LENGTH = 2000

/** Days after which daily logs are auto-archived to MEMORY.md */
export const ARCHIVE_AFTER_DAYS = 7

/** Rotate long-term memory before it becomes too large to recall efficiently. */
export const MAX_MEMORY_FILE_SIZE = 256 * 1024

/** Number of rotated long-term memory files retained alongside MEMORY.md. */
export const MAX_MEMORY_ROTATIONS = 3

/** Tags that trigger deep summary from full transcripts */
export const DEEP_SUMMARY_TAGS = ["#project", "#preference", "#policy", "#important"] as const
