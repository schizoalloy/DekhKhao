"use client";

import Image from "next/image";
import { createElement, useEffect, useRef, useState } from "react";
import { textures, type Model, type Render } from "@/content/assets";

type ModelViewerProps = {
  model: Model;
  poster: Render;
  alt: string;
  className?: string;
};

/**
 * Live, rotatable 3D view of a prepared (true-to-size) model.
 * The ~250 KB viewer library and the model only load once the element is near the
 * viewport; until then — and without JavaScript — the rendered still is shown.
 * AR placement is intentionally not enabled here: that lives in the product app.
 */
export function ModelViewer({ model, poster, alt, className = "" }: ModelViewerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        import("@google/model-viewer").then(() => !cancelled && setReady(true));
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    const mv = ref.current?.querySelector("model-viewer");
    if (!mv) return;
    const onLoad = () => setLoaded(true);
    mv.addEventListener("load", onLoad);
    return () => mv.removeEventListener("load", onLoad);
  }, [ready]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <Image
        src={poster.src}
        width={poster.width}
        height={poster.height}
        alt={loaded ? "" : alt}
        aria-hidden={loaded || undefined}
        sizes="(min-width: 768px) 30vw, 80vw"
        className={`absolute inset-0 m-auto w-[86%] transition-opacity duration-700 ${loaded ? "opacity-0" : "opacity-100"}`}
      />
      {ready &&
        createElement("model-viewer", {
          src: model.glb,
          alt,
          "camera-controls": true,
          "auto-rotate": true,
          "auto-rotate-delay": "0",
          "rotation-per-second": "18deg",
          "interaction-prompt": "none",
          "disable-zoom": true,
          "disable-pan": true,
          "touch-action": "pan-y",
          "camera-orbit": "0deg 62deg auto",
          "field-of-view": "22deg",
          "environment-image": textures.environment.src,
          exposure: "1.05",
          "shadow-intensity": "1",
          "shadow-softness": "0.9",
          loading: "eager",
          style: {
            width: "100%",
            height: "100%",
            background: "transparent",
            opacity: loaded ? 1 : 0,
            transition: "opacity 700ms",
            "--poster-color": "transparent",
          },
        })}
    </div>
  );
}
