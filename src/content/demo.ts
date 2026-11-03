/**
 * Media for the "See it in action" section. Swap files here; nothing else hard-codes them.
 *
 * PROTOTYPE: the recording and the live demo are third-party (ar-code.com) examples of AR
 * food preview, labelled as such on the page. Replace them with DekhKhao's own recording and a
 * DekhKhao-hosted demo dish before public launch.
 */
export const demo = {
  video: {
    src: "/media/ar-demo.mp4",
    poster: "/media/ar-demo-poster.webp",
    /** The file is 1080x1920 (9:16)... */
    width: 1080,
    height: 1920,
    /**
     * ...but the iPhone screen recording inside it is 884x1920 (iPhone's ~19.5:9), padded with
     * 98 px black bars on each side. The player frames the recording at its true shape and
     * crops the bars with object-fit: cover, so the file itself stays untouched.
     */
    content: { width: 884, height: 1920 },
    seconds: 14,
    /** Shown under the video. Keep it honest about where the footage comes from. */
    credit: "Example recording: a pizza placed in AR with ar-code.com (Pizza Hut demo). DekhKhao works the same way: scan, pick, place.",
  },
  /** A live AR dish a visitor can open on their own phone. Set to null to hide the card. */
  liveDemo: {
    url: "https://ar-code.com/EhRnMHzlh",
    qrSvg: "/media/demo-pizza-qr.svg",
    credit: "Demo pizza hosted on ar-code.com",
  } as { url: string; qrSvg: string; credit: string } | null,
};
