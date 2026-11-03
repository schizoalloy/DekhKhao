"use client";

import { ArrowCounterClockwise, CornersOut, Pause, Play, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { demo } from "@/content/demo";

type Status = "idle" | "playing" | "paused" | "ended" | "error";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * The AR demo recording in an iPhone-shaped frame at the recording's true proportions.
 * Brand controls: a centred play button, and a bar (play/pause, scrubber, time, sound,
 * full screen) that hides itself while the video plays. Nothing downloads until play is
 * pressed; the video pauses when scrolled out of view.
 */
export function DemoVideo() {
  const { src, poster, content, seconds } = demo.video;
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const hideTimer = useRef<number | undefined>(undefined);
  const [status, setStatus] = useState<Status>("idle");
  const [muted, setMuted] = useState(false);
  const [chrome, setChrome] = useState(true);
  const [scrub, setScrub] = useState(0);

  const showChrome = useCallback(() => {
    setChrome(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setChrome(false);
    }, 2200);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => !e.isIntersecting && !v.paused && v.pause(), { threshold: 0.25 });
    io.observe(v);
    return () => {
      io.disconnect();
      window.clearTimeout(hideTimer.current);
    };
  }, []);

  const play = async () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.ended) v.currentTime = 0;
    try {
      await v.play();
      showChrome();
    } catch {
      setStatus("error");
    }
  };
  const toggle = () => (videoRef.current?.paused ? play() : videoRef.current?.pause());

  const onTime = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const p = v.currentTime / v.duration;
    if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`;
    if (timeRef.current) timeRef.current.textContent = `${fmt(v.currentTime)} / ${fmt(v.duration)}`;
    setScrub(Math.round(p * 1000));
  };

  const seek = (value: number) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    v.currentTime = (value / 1000) * v.duration;
    onTime();
    showChrome();
  };

  const fullscreen = () => {
    const v = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    const frame = frameRef.current;
    if (!v || !frame) return;
    if (frame.requestFullscreen) frame.requestFullscreen().catch(() => v.webkitEnterFullscreen?.());
    else v.webkitEnterFullscreen?.();
  };

  const playing = status === "playing";
  const barVisible = !playing || chrome;

  return (
    <div className="relative mx-auto w-[min(68vw,290px)] lg:w-[min(100%,318px)]">
      {/* bezel: proportions of a current iPhone; the recording already shows its own status bar and island */}
      <div className="rounded-[3rem] bg-charcoal p-[3.4%] shadow-[0_50px_90px_-35px_rgb(0_20_18/0.75),inset_0_0_0_1.5px_rgb(255_255_255/0.1)]">
        <div
          ref={frameRef}
          onPointerMove={() => playing && showChrome()}
          className="relative overflow-hidden rounded-[2.5rem] bg-black [&:fullscreen]:rounded-none"
          style={{ aspectRatio: `${content.width} / ${content.height}` }}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 size-full object-cover"
            preload="none"
            playsInline
            muted={muted}
            onClick={toggle}
            onPlay={() => setStatus("playing")}
            onPause={() => {
              setStatus((s) => (s === "ended" ? s : "paused"));
              setChrome(true);
            }}
            onEnded={() => {
              setStatus("ended");
              setChrome(true);
            }}
            onTimeUpdate={onTime}
            onLoadedMetadata={onTime}
            onError={() => setStatus("error")}
            aria-label="Screen recording of a phone placing a pizza on a real table in augmented reality"
          >
            <source src={src} type="video/mp4" />
          </video>

          {/* poster as an image, so it is cropped exactly like the video on every browser */}
          {status === "idle" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full object-cover" />
          )}

          {/* centred play / replay */}
          {!playing && status !== "error" && (
            <button
              type="button"
              onClick={play}
              className="group absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_50%,rgb(0_0_0/0.04),rgb(0_0_0/0.32))]"
              aria-label={status === "ended" ? "Replay the AR demo video" : "Play the AR demo video"}
            >
              <span className="relative grid size-[4.75rem] place-items-center rounded-full bg-orange text-charcoal shadow-[0_14px_30px_-10px_rgb(0_0_0/0.6)] transition-transform duration-300 ease-[var(--ease-snap)] group-hover:scale-110 group-active:scale-95">
                {status === "idle" && <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-full ring-4 ring-orange/60" />}
                {status === "ended" ? (
                  <ArrowCounterClockwise size={30} weight="bold" aria-hidden />
                ) : (
                  <Play size={30} weight="fill" className="translate-x-[2px]" aria-hidden />
                )}
              </span>
              {status === "idle" && (
                <span className="absolute bottom-[13%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-cream px-4 py-2 text-sm font-semibold text-charcoal">
                  Watch the demo ({seconds}s)
                </span>
              )}
            </button>
          )}

          {/* control bar */}
          {status !== "idle" && status !== "error" && (
            <div
              className={`absolute inset-x-[5%] bottom-[3.5%] flex items-center gap-1.5 rounded-full bg-charcoal/80 px-1.5 py-1 text-cream backdrop-blur-md transition-[opacity,transform] duration-300 ${
                barVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
              }`}
            >
              <button
                type="button"
                onClick={toggle}
                className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-cream/15"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? <Pause size={18} weight="fill" aria-hidden /> : <Play size={18} weight="fill" aria-hidden />}
              </button>
              <div className="relative h-9 min-w-0 flex-1">
                <div aria-hidden className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-cream/25">
                  <div ref={fillRef} className="h-full origin-left scale-x-0 rounded-full bg-yellow" />
                </div>
                <input
                  type="range"
                  min={0}
                  max={1000}
                  value={scrub}
                  onChange={(e) => seek(Number(e.target.value))}
                  aria-label="Seek"
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
              </div>
              <span ref={timeRef} className="shrink-0 text-[0.68rem] font-semibold tabular-nums text-cream/85">
                0:00 / {fmt(seconds)}
              </span>
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-cream/15"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? <SpeakerSlash size={18} aria-hidden /> : <SpeakerHigh size={18} aria-hidden />}
              </button>
              <button
                type="button"
                onClick={fullscreen}
                className="hidden size-9 shrink-0 place-items-center rounded-full hover:bg-cream/15 sm:grid"
                aria-label="Full screen"
              >
                <CornersOut size={18} aria-hidden />
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-cream p-4 text-sm text-charcoal" role="alert">
              The video couldn’t play here.{" "}
              <a href={src} className="font-semibold text-teal underline">
                Open it directly
              </a>
              .
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
