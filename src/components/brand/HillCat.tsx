import { peekingCat } from "./art";

/**
 * The brand sheet's cat peeking over a teal hill, used as the top edge of the teal footer:
 * the hill's base is filled down to the footer so the two read as one shape, and the cat
 * peeks over it. Eyelids sit over the eyes so the page can make the cat blink.
 *
 * Art space is the traced artwork's own (0 0 2440 548). Decorative.
 */
/** The hill's measured bottom contour, lifted 8 units so it overlaps, then down to the footer. */
const BASE =
  "M0 428 L40 428 L120 428 L200 427 L280 427 L360 427 L440 427 L520 427 L600 428 L680 428 L760 430 L840 431 L920 433 L1000 435 L1080 436 L1160 437 L1240 440 L1320 448 L1400 457 L1480 467 L1560 476 L1640 485 L1720 494 L1800 503 L1880 511 L1960 520 L2040 529 L2120 538 L2440 548 L0 548 Z";

const EYES = [
  { cx: 1496, cy: 270.5, rx: 21, ry: 25 },
  { cx: 1659, cy: 239, rx: 21, ry: 25 },
];

export function HillCat({ className = "", ...data }: { className?: string } & Record<`data-${string}`, string | boolean | undefined>) {
  const layer = (name: string) => peekingCat.layers.find((l) => l.name === name)!;
  const cream = layer("cream");
  const teal = layer("teal");
  const yellow = layer("yellow");
  return (
    <svg viewBox="0 0 2440 548" preserveAspectRatio="xMinYMax meet" className={className} aria-hidden focusable="false" data-hillcat {...data}>
      {/* fill the wedge under the hill's sloped base so it sits flush on the footer */}
      <path d={BASE} fill={teal.fill} />
      <path d={cream.d} fill={cream.fill} fillRule="evenodd" />
      <path d={teal.d} fill={teal.fill} fillRule="evenodd" />
      <g data-cat-sparks>
        <path d={yellow.d} fill={yellow.fill} fillRule="evenodd" />
      </g>
      {/* eyelids: a cream patch with a closed-eye line, hidden until a blink scales them in */}
      {EYES.map((e) => (
        <g key={e.cx} data-cat-lid style={{ transformBox: "fill-box", transformOrigin: "50% 40%", transform: "scaleY(0)" }}>
          <ellipse cx={e.cx} cy={e.cy} rx={e.rx + 4} ry={e.ry + 5} fill={cream.fill} />
          <path
            d={`M${e.cx - e.rx} ${e.cy + 4} Q ${e.cx} ${e.cy + 16} ${e.cx + e.rx} ${e.cy + 4}`}
            fill="none"
            stroke={teal.fill}
            strokeWidth="9"
            strokeLinecap="round"
          />
        </g>
      ))}
    </svg>
  );
}
