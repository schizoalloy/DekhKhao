"use client";

import { CheckCircle, UploadSimple, WarningCircle } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { completeUpload, removeFile, requestUpload } from "@/app/admin/actions/files";
import { acceptAttribute, contentTypeFor, formatBytes, SLOTS, type FileSlot } from "@/lib/admin/file-rules";
import { ui } from "./styles";

type Current = { fileName: string | null; size: number | null; isPublic: boolean } | null;

/**
 * One file slot (GLB, USDZ, poster, thumbnail or logo). The file goes straight from the browser to
 * the private R2 bucket through a signed URL; the server checks it before it's attached.
 */
export function FileUpload({
  restaurantId,
  itemId,
  slot,
  current,
}: {
  restaurantId: string;
  itemId: string | null;
  slot: FileSlot;
  current: Current;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rules = SLOTS[slot];

  async function upload(file: File) {
    setError(null);
    const contentType = contentTypeFor(slot, file.name);
    if (!contentType) return setError(`Choose a ${acceptAttribute(slot).replaceAll(",", " or ")} file.`);
    if (file.size > rules.maxBytes) return setError(`That file is ${formatBytes(file.size)}; the limit is ${formatBytes(rules.maxBytes)}.`);

    setProgress(0);
    try {
      const request = await requestUpload({ restaurantId, itemId, slot, fileName: file.name, size: file.size });
      if (!request.ok) throw new Error(request.error);
      await put(request.uploadUrl, file, request.contentType, setProgress);
      const done = await completeUpload({ assetId: request.assetId, restaurantId, itemId, slot });
      if (!done.ok) throw new Error(done.error);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  }

  async function remove() {
    if (!window.confirm(`Remove the ${rules.label.toLowerCase()}? The live menu keeps it until you publish again.`)) return;
    setError(null);
    const res = await removeFile({ restaurantId, itemId, slot });
    if (!res.ok) setError(res.error);
    router.refresh();
  }

  const busy = progress !== null;
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">{rules.label}</p>
          <p className={ui.hint}>
            {rules.hint} Max {formatBytes(rules.maxBytes)}.
          </p>
          {current?.fileName && (
            <p className="mt-2 flex items-center gap-1.5 text-sm">
              <CheckCircle size={16} className="shrink-0 text-leaf" aria-hidden />
              <span className="truncate">{current.fileName}</span>
              {current.size != null && <span className="shrink-0 text-muted">· {formatBytes(current.size)}</span>}
              {current.isPublic && <span className={`${ui.badge} bg-leaf/10 text-leaf`}>live</span>}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <label className={`${ui.buttonSecondary} cursor-pointer ${busy ? "pointer-events-none opacity-50" : ""}`}>
            <UploadSimple size={16} aria-hidden /> {current?.fileName ? "Replace" : "Upload"}
            <input
              ref={input}
              type="file"
              accept={acceptAttribute(slot)}
              className="sr-only"
              disabled={busy}
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
            />
          </label>
          {current?.fileName && !busy && (
            <button type="button" onClick={remove} className={ui.buttonDanger}>
              Remove
            </button>
          )}
        </div>
      </div>

      {busy && (
        <div className="mt-3" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-label="Uploading">
          <div className="h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full origin-left bg-ink transition-transform" style={{ transform: `scaleX(${progress})` }} />
          </div>
          <p className="mt-1 text-xs text-muted">{progress < 1 ? `Uploading… ${Math.round(progress * 100)}%` : "Checking the file…"}</p>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 flex items-start gap-1.5 text-sm text-chilli-deep">
          <WarningCircle size={16} className="mt-0.5 shrink-0" aria-hidden /> {error}
        </p>
      )}
    </div>
  );
}

/** PUT with upload progress (fetch can't report it). */
function put(url: string, file: File, contentType: string, onProgress: (p: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? (onProgress(1), resolve())
        : reject(new Error(`Upload was refused (HTTP ${xhr.status}). Try again.`));
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection, then try again."));
    xhr.send(file);
  });
}
