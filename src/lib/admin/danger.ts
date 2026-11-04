/**
 * What the admin types to confirm anything in a restaurant's Danger Zone. The button only enables
 * once it matches, and the server actions (src/app/admin/actions/danger.ts) check it again.
 */
export const DANGER_CONFIRMATION = "Yes, go ahead and delete it";

export const isDangerConfirmed = (typed: string) => typed.trim() === DANGER_CONFIRMATION;
