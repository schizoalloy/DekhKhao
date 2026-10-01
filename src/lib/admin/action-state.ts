/** What an admin server action reports back to its form. */
export type ActionState = { ok: true; message?: string } | { ok: false; error: string; problems?: string[] } | null;

/** Postgres / PostgREST error codes turned into sentences for the admin. */
export function friendlyDbError(
  error: { code?: string; message: string },
  overrides: { unique?: string; inUse?: string; invalid?: string } = {},
): string {
  switch (error.code) {
    case "23505":
      return overrides.unique ?? "That name is already used.";
    case "23503":
      return overrides.inUse ?? "This is still in use somewhere else.";
    case "23514":
      return overrides.invalid ?? `One of the values isn't allowed (${error.message}).`;
    case "42501":
      return "You don't have permission to do that.";
    default:
      return error.message;
  }
}

/** Lowercase letters, numbers and hyphens, e.g. "Chicken Karahi (Half)" -> "chicken-karahi-half". */
export function slugify(text: string, max = 60) {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
}
