"use client";

import { Trash, WarningOctagon } from "@phosphor-icons/react";
import { useActionState, useId, useState } from "react";
import { deleteArModels, deleteRestaurant, deleteWholeMenu } from "@/app/admin/actions/danger";
import type { ActionState } from "@/lib/admin/action-state";
import { DANGER_CONFIRMATION, isDangerConfirmed } from "@/lib/admin/danger";
import { ActionResult, SubmitButton } from "./ActionForm";
import { ui } from "./styles";

type Counts = { categories: number; items: number; models: number; files: number };

const count = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/**
 * Irreversible deletes for one restaurant, at the bottom of its admin page. Each one needs the
 * admin to type DANGER_CONFIRMATION, which the server checks again.
 */
export function DangerZone({
  restaurantId,
  name,
  address,
  isLive,
  counts,
}: {
  restaurantId: string;
  name: string;
  /** The menu address as shown in the admin, e.g. "/r/pizzahut" or "pizzahut.dekhkhao.com". */
  address: string;
  isLive: boolean;
  counts: Counts;
}) {
  const offline = isLive ? " The live menu goes offline straight away." : "";
  return (
    <section aria-labelledby="danger-heading" className="mt-16 rounded-3xl border-2 border-danger bg-danger/[0.03] p-5 sm:p-6">
      <h2 id="danger-heading" className="flex items-center gap-2 font-display text-xl font-bold tracking-[0.08em] text-danger">
        <WarningOctagon size={26} weight="fill" aria-hidden /> THE DANGER ZONE
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
        Nothing here can be undone. Each action asks you to type{" "}
        <span className="font-mono font-medium text-danger">{DANGER_CONFIRMATION}</span> before it runs.
      </p>

      <div className="mt-6 divide-y divide-danger/20 overflow-hidden rounded-2xl border border-danger/30 bg-white">
        <DangerAction
          restaurantId={restaurantId}
          action={deleteWholeMenu}
          title="Delete the whole menu"
          button="Delete all categories and items"
          description={`Deletes ${count(counts.categories, "category", "categories")} and ${count(counts.items, "item")}, with their 3D models and pictures.${offline} ${name}, its address, logo, settings and publish history stay, so you can build a new menu.`}
          unavailable={counts.categories + counts.items === 0 ? "There's no menu to delete." : null}
        />
        <DangerAction
          restaurantId={restaurantId}
          action={deleteArModels}
          title="Delete all AR models"
          button="Delete all 3D models"
          description={`Deletes ${count(counts.models, "3D model file")} (GLB and USDZ) from every item. Items, prices and pictures stay.${isLive ? " The live menu goes offline, because a menu can't be published without models." : ""}`}
          unavailable={counts.models === 0 ? "No 3D models are uploaded." : null}
        />
        <DangerAction
          restaurantId={restaurantId}
          action={deleteRestaurant}
          title="Delete this restaurant"
          button={`Delete ${name}`}
          description={`Deletes ${name} and everything in it: the ${isLive ? "live " : ""}menu, every category and item, ${count(counts.files, "uploaded file")} and its publish history. QR codes printed for ${address} stop working, and the address becomes free, so if another restaurant takes it later, old QR codes would open that restaurant's menu.`}
          unavailable={null}
        />
      </div>
    </section>
  );
}

function DangerAction({
  restaurantId,
  action,
  title,
  button,
  description,
  unavailable,
}: {
  restaurantId: string;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  title: string;
  button: string;
  description: string;
  /** Why the action can't run right now, or null. */
  unavailable: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const close = () => {
    setOpen(false);
    setTyped("");
  };
  const [state, formAction, pending] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await action(prev, formData);
    if (result?.ok) close();
    return result;
  }, null);
  const inputId = useId();
  const descriptionId = useId();

  return (
    <div className="p-4 sm:p-5">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between sm:gap-6">
        <div className="min-w-0 max-w-2xl">
          <h3 className="font-semibold text-ink">{title}</h3>
          <p id={descriptionId} className="mt-1 text-sm leading-relaxed text-muted">
            {description}
          </p>
          {unavailable && <p className="mt-1.5 text-xs font-medium text-muted">{unavailable}</p>}
        </div>
        {!open && (
          <button
            type="button"
            className={`${ui.buttonDanger} shrink-0`}
            disabled={Boolean(unavailable)}
            aria-describedby={descriptionId}
            onClick={() => setOpen(true)}
          >
            <Trash size={16} aria-hidden /> {button}
          </button>
        )}
      </div>

      {open && (
        <form action={formAction} className="mt-4 rounded-2xl border border-danger/30 bg-danger/[0.04] p-4">
          <input type="hidden" name="restaurantId" value={restaurantId} />
          <label htmlFor={inputId} className="block text-sm leading-relaxed text-ink">
            To confirm, type <span className="font-mono font-semibold text-danger">{DANGER_CONFIRMATION}</span>
          </label>
          <input
            id={inputId}
            name="confirmation"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && close()}
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-describedby={descriptionId}
            className={`${ui.input} max-w-md font-mono focus:border-danger`}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <SubmitButton variant="destroy" disabled={!isDangerConfirmed(typed)}>
              <Trash size={16} aria-hidden /> {button}
            </SubmitButton>
            <button type="button" className={ui.buttonSecondary} onClick={close}>
              Cancel
            </button>
          </div>
        </form>
      )}
      {!pending && <ActionResult state={state} />}
    </div>
  );
}
