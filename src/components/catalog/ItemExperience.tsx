"use client";

import { ArrowClockwise, ArrowsCounterClockwise, Cube, CubeFocus, HandSwipeRight, WarningCircle } from "@phosphor-icons/react";
import type { ModelViewerElement } from "@google/model-viewer";
import Image from "next/image";
import { createElement, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { CatalogItem } from "@/catalog/types";
import { PhoneHandoff } from "./PhoneHandoff";

/**
 * How this device can show the item in the room:
 * - "model-viewer": GLB loaded; model-viewer picks WebXR / Scene Viewer (Android) or Quick Look (iOS, with the USDZ)
 * - "quick-look":   USDZ-only item on iPhone/iPad; a native <a rel="ar"> link opens AR Quick Look
 * - "none":         no AR here; `reason` decides what we tell the customer
 */
type ArMode =
  | { kind: "checking" }
  | { kind: "model-viewer" }
  | { kind: "quick-look" }
  | { kind: "none"; reason: "desktop" | "browser" | "ios-only" };

type ViewerState = "loading" | "ready" | "error" | "unavailable";

const DEFAULT_ORBIT = "0deg 75deg auto";

function supportsQuickLook() {
  const a = document.createElement("a");
  return Boolean(a.relList?.supports?.("ar"));
}

function isDesktopPointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function noArReason(item: CatalogItem): Extract<ArMode, { kind: "none" }>["reason"] {
  if (isDesktopPointer()) return "desktop";
  return item.model.glb ? "browser" : "ios-only";
}

function formatCm(n: number) {
  return n >= 10 ? Math.round(n).toString() : n.toFixed(1);
}

export function ItemExperience({ item, children }: { item: CatalogItem; children: ReactNode }) {
  const { glb, usdz, poster, cameraOrbit = DEFAULT_ORBIT } = item.model;
  const mvRef = useRef<ModelViewerElement | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [libReady, setLibReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [viewer, setViewer] = useState<ViewerState>(glb ? "loading" : "unavailable");
  const [ar, setAr] = useState<ArMode>({ kind: "checking" });
  const [arError, setArError] = useState<string | null>(null);
  const [interacted, setInteracted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Load the viewer library only on this page, and only in the browser.
  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (!glb) {
      setAr(usdz && supportsQuickLook() ? { kind: "quick-look" } : { kind: "none", reason: noArReason(item) });
      return;
    }
    let cancelled = false;
    import("@google/model-viewer")
      .then(() => !cancelled && setLibReady(true))
      .catch(() => {
        if (cancelled) return;
        setViewer("error");
        // The viewer failed, but iPhone can still open the original USDZ natively.
        setAr(usdz && supportsQuickLook() ? { kind: "quick-look" } : { kind: "none", reason: noArReason(item) });
      });
    return () => {
      cancelled = true;
    };
  }, [glb, usdz, item]);

  const attachViewer = useCallback((el: ModelViewerElement | null) => {
    mvRef.current = el;
  }, []);

  // Wire model-viewer events. Progress goes straight to the DOM, not React state.
  useEffect(() => {
    const mv = mvRef.current;
    if (!libReady || !mv) return;
    let cancelled = false;

    const onProgress = (e: Event) => {
      const p = (e as CustomEvent<{ totalProgress: number }>).detail.totalProgress;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${p})`;
        barRef.current.style.opacity = p >= 1 ? "0" : "1";
      }
    };
    // model-viewer settles `canActivateAR` once the model is in, so decide (again) here.
    const decideAr = () => setAr(mv.canActivateAR ? { kind: "model-viewer" } : { kind: "none", reason: noArReason(item) });
    const onLoad = () => {
      setViewer("ready");
      decideAr();
    };
    const onError = () => {
      setViewer("error");
      // The GLB failed, but iPhone can still open the original USDZ natively.
      setAr(usdz && supportsQuickLook() ? { kind: "quick-look" } : { kind: "none", reason: noArReason(item) });
    };
    const onCamera = (e: Event) => {
      if ((e as CustomEvent<{ source: string }>).detail?.source === "user-interaction") setInteracted(true);
    };
    const onArStatus = (e: Event) => {
      const status = (e as CustomEvent<{ status: string }>).detail?.status;
      if (status === "failed")
        setArError("AR couldn't start. Check that camera access is allowed for this browser, then try again.");
    };
    mv.addEventListener("progress", onProgress);
    mv.addEventListener("load", onLoad);
    mv.addEventListener("error", onError);
    mv.addEventListener("camera-change", onCamera);
    mv.addEventListener("ar-status", onArStatus);

    (async () => {
      await customElements.whenDefined("model-viewer");
      await (mv as unknown as { updateComplete?: Promise<unknown> }).updateComplete;
      // Only an early "yes" is trusted; an early "no" waits for the load event.
      if (!cancelled && mv.canActivateAR) setAr({ kind: "model-viewer" });
    })();

    return () => {
      cancelled = true;
      mv.removeEventListener("progress", onProgress);
      mv.removeEventListener("load", onLoad);
      mv.removeEventListener("error", onError);
      mv.removeEventListener("camera-change", onCamera);
      mv.removeEventListener("ar-status", onArStatus);
    };
  }, [libReady, attempt, item, usdz]);

  const retry = () => {
    setViewer("loading");
    setAttempt((n) => n + 1);
  };

  const resetView = () => {
    const mv = mvRef.current;
    if (!mv) return;
    mv.cameraOrbit = cameraOrbit;
    mv.cameraTarget = "auto auto auto";
    mv.fieldOfView = "auto";
  };

  const launchAR = async () => {
    setArError(null);
    try {
      await mvRef.current?.activateAR();
    } catch {
      setArError("AR couldn't start on this device. You can still turn the item in 3D above.");
    }
  };

  const { width, height, depth } = item.scale.dimensionsCm;
  const sizeLine = `${formatCm(width)} × ${formatCm(height)} × ${formatCm(depth)} cm`;
  const quickLookHref = usdz ? `${usdz}#allowsContentScaling=${item.scale.lockScaleInAR ? 0 : 1}` : undefined;

  const arButtonClass =
    "flex min-h-13 w-full items-center justify-center gap-2.5 rounded-full bg-m-button px-6 text-base font-semibold text-m-button-text " +
    "transition-transform active:scale-[0.98] disabled:opacity-60";

  const arAction = (() => {
    if (ar.kind === "checking")
      return (
        <button type="button" disabled className={arButtonClass} aria-live="polite">
          <CubeFocus size={20} aria-hidden /> Checking AR…
        </button>
      );
    if (ar.kind === "model-viewer")
      return (
        <button type="button" onClick={launchAR} className={arButtonClass}>
          <CubeFocus size={20} weight="bold" aria-hidden /> View in AR
        </button>
      );
    if (ar.kind === "quick-look" && quickLookHref)
      return (
        // Safari opens AR Quick Look only when an <img> is the link's first child.
        <a rel="ar" href={quickLookHref} className={arButtonClass}>
          <img src={poster ?? item.thumbnail ?? ""} alt="" className="sr-only" />
          <CubeFocus size={20} weight="bold" aria-hidden /> View in AR
        </a>
      );
    return null;
  })();

  const noArMessage =
    ar.kind !== "none"
      ? null
      : viewer === "error"
        ? "AR needs the 3D model, which didn’t load. Try again above."
        : ar.reason === "ios-only"
          ? `AR for ${item.name} opens on iPhone and iPad for now.`
          : ar.reason === "browser"
            ? "This browser can’t open AR. Try Chrome on Android or Safari on iPhone. You can still turn the item in 3D."
            : null;

  return (
    <>
      <div className="mx-auto max-w-5xl lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-12 lg:px-6 lg:pt-8">
        {/* ---------- viewer ---------- */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="menu-stage relative mx-auto aspect-square max-h-[62dvh] w-full overflow-hidden lg:max-h-none lg:rounded-3xl">
            {poster && (
              <Image
                src={poster}
                alt={viewer === "ready" ? "" : `${item.name}, still image of the 3D model`}
                fill
                priority
                sizes="(min-width: 1024px) 560px, 100vw"
                // Admin previews use short-lived signed URLs; there's nothing worth optimising or caching.
                unoptimized={poster.includes("X-Amz-Signature=")}
                className={`object-contain transition-opacity duration-700 ${viewer === "ready" ? "opacity-0" : "opacity-100"}`}
              />
            )}

            {libReady &&
              glb &&
              createElement(
                "model-viewer",
                {
                  key: attempt,
                  ref: attachViewer,
                  // model-viewer caches a failed load per URL, so a retry needs a fresh one. A hash
                  // isn't sent to the server, so this also works for signed (admin preview) URLs.
                  src: attempt ? `${glb}#retry=${attempt}` : glb,
                  "ios-src": usdz,
                  alt: `3D model of ${item.name}. Drag to turn it, pinch to zoom.`,
                  ar: true,
                  "ar-modes": "webxr scene-viewer quick-look",
                  "ar-scale": item.scale.lockScaleInAR ? "fixed" : "auto",
                  "ar-placement": "floor",
                  "camera-controls": true,
                  "camera-orbit": cameraOrbit,
                  "touch-action": "pan-y",
                  "interaction-prompt": "none",
                  "auto-rotate": reduceMotion ? undefined : true,
                  "auto-rotate-delay": "4000",
                  "rotation-per-second": "14deg",
                  "shadow-intensity": "1",
                  "shadow-softness": "0.9",
                  loading: "eager",
                  reveal: "auto",
                  className: `absolute inset-0 size-full transition-opacity duration-700 ${viewer === "ready" ? "opacity-100" : "opacity-0"}`,
                  style: { background: "transparent", "--poster-color": "transparent" },
                },
                // Replace model-viewer's own AR button and progress bar with ours.
                createElement("span", { slot: "ar-button", hidden: true }),
                createElement("span", { slot: "progress-bar" }),
              )}

            {/* loading */}
            {viewer === "loading" && (
              <div className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-m-line" role="progressbar" aria-label="Loading 3D model">
                <div ref={barRef} className="h-full origin-left bg-m-accent transition-transform duration-300" style={{ transform: "scaleX(0.04)" }} />
              </div>
            )}
            {viewer === "loading" && (
              <p className="absolute bottom-4 left-4 rounded-full bg-m-bg/85 px-3 py-1.5 text-xs font-medium text-m-muted backdrop-blur" aria-live="polite">
                Loading 3D model…
              </p>
            )}

            {/* ready: hint + reset */}
            {viewer === "ready" && (
              <>
                <p
                  className={`pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-m-bg/85 px-3 py-1.5 text-xs font-medium text-m-muted backdrop-blur transition-opacity duration-500 ${
                    interacted ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <HandSwipeRight size={16} aria-hidden /> Drag to turn, pinch to zoom
                </p>
                <button
                  type="button"
                  onClick={resetView}
                  className="absolute bottom-3 right-3 grid size-11 place-items-center rounded-full bg-m-bg/85 text-m-text shadow-sm backdrop-blur active:scale-95"
                  aria-label="Reset view"
                  title="Reset view"
                >
                  <ArrowsCounterClockwise size={20} aria-hidden />
                </button>
              </>
            )}

            {/* error */}
            {viewer === "error" && (
              <div className="absolute inset-0 grid place-items-center bg-m-stage/80 p-6 text-center backdrop-blur-sm" role="alert">
                <div>
                  <WarningCircle size={28} className="mx-auto text-m-accent" aria-hidden />
                  <p className="mt-2 font-semibold">The 3D model didn’t load.</p>
                  <p className="mt-1 text-sm text-m-muted">Check your connection and try again.</p>
                  <button
                    type="button"
                    onClick={retry}
                    className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-m-line bg-m-bg px-5 text-sm font-medium"
                  >
                    <ArrowClockwise size={16} aria-hidden /> Try again
                  </button>
                </div>
              </div>
            )}

            {/* USDZ-only item: no in-browser 3D */}
            {viewer === "unavailable" && (
              <p className="absolute bottom-4 left-4 right-4 flex items-start gap-2 rounded-2xl bg-m-bg/85 px-3 py-2 text-xs text-m-muted backdrop-blur">
                <Cube size={16} className="mt-px shrink-0" aria-hidden />
                A turnable 3D preview isn’t available for this item in the browser yet.
              </p>
            )}
          </div>
        </div>

        {/* ---------- details ---------- */}
        <div className="px-4 pb-36 pt-6 sm:px-6 lg:px-0 lg:pb-12 lg:pt-0">
          {children}

          <dl className="mt-6 rounded-3xl border border-m-line p-5">
            <dt className="text-xs font-medium text-m-muted">Size in AR (width × height × depth)</dt>
            <dd className="mt-1 font-mono text-lg">{sizeLine}</dd>
            <dd className="mt-2 text-sm leading-relaxed text-m-muted">
              {item.scale.verified
                ? "Shown at its real, measured size."
                : "This size comes from the 3D scan file. It hasn’t been checked against the real object yet."}
            </dd>
          </dl>

          {/* desktop: AR action or phone handoff inline */}
          <div className="mt-6 hidden lg:block">
            {ar.kind === "none" && ar.reason === "desktop" ? <PhoneHandoff itemName={item.name} /> : arAction}
            {noArMessage && <p className="mt-3 text-sm text-m-muted">{noArMessage}</p>}
            {arError && (
              <p className="mt-3 text-sm text-m-accent" role="alert">
                {arError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* mobile: AR action pinned to the bottom, where thumbs are */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-m-line bg-m-bg/92 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto max-w-5xl">
          {arError && (
            <p className="mb-2 text-sm text-m-accent" role="alert">
              {arError}
            </p>
          )}
          {arAction ?? (
            <p className="flex items-start gap-2 py-1 text-sm text-m-muted">
              <CubeFocus size={18} className="mt-0.5 shrink-0" aria-hidden />
              {noArMessage ?? "AR isn’t available on this device."}
            </p>
          )}
          {arAction && (
            <p className="mt-2 text-center text-xs text-m-muted">
              Point your camera at a table. {item.name} appears at {formatCm(height)} cm tall.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
