import { siteConfig } from "@/config/site";

type UrduWordmarkProps = {
  className?: string;
  /** Decorative instances are hidden from assistive tech when the English name sits beside them. */
  decorative?: boolean;
  /**
   * Two-tone treatment: دیکھ (see) keeps the surrounding colour, کھاؤ (eat) takes the accent.
   * Pass `false` for single-colour uses such as outlined or faint background marks.
   */
  split?: boolean;
  /** Colour class for the second word when `split` is on. */
  accentClass?: string;
};

/**
 * The Urdu brand mark, دیکھ کھاؤ. Always rendered from config so the spelling stays exact.
 * The two words stay separate words (with a real space) inside one RTL run.
 */
export function UrduWordmark({ className = "", decorative = false, split = true, accentClass = "text-chilli" }: UrduWordmarkProps) {
  const [see, eat] = siteConfig.nameUrdu.split(" ");
  return (
    <span lang="ur" dir="rtl" aria-hidden={decorative || undefined} className={`urdu whitespace-nowrap ${className}`}>
      {split ? (
        <>
          <span>{see}</span> <span className={accentClass}>{eat}</span>
        </>
      ) : (
        siteConfig.nameUrdu
      )}
    </span>
  );
}
