"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/admin/action-state";
import { ui } from "./styles";

/** A form bound to an admin server action, with its result shown underneath. */
export function ActionForm({
  action,
  children,
  className,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  return (
    <form action={formAction} className={className}>
      {children}
      {state && !state.ok && (
        <div role="alert" className="mt-3 rounded-2xl bg-chilli/10 px-4 py-3 text-sm text-chilli-deep">
          <p>{state.error}</p>
          {state.problems && state.problems.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {state.problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {state?.ok && state.message && (
        <p role="status" className="mt-3 text-sm text-leaf">
          {state.message}
        </p>
      )}
    </form>
  );
}

export function SubmitButton({
  children,
  variant = "primary",
  confirm,
  className = "",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  /** Asks before submitting, for actions that are hard to undo. */
  confirm?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  const style = variant === "danger" ? ui.buttonDanger : variant === "secondary" ? ui.buttonSecondary : ui.button;
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${style} ${className}`}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {pending ? "Working…" : children}
    </button>
  );
}
