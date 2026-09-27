/** Brand mark: a plate inside a camera viewfinder. */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden fill="none">
      <path d="M3 10V5.5A2.5 2.5 0 0 1 5.5 3H10M22 3h4.5A2.5 2.5 0 0 1 29 5.5V10M29 22v4.5a2.5 2.5 0 0 1-2.5 2.5H22M10 29H5.5A2.5 2.5 0 0 1 3 26.5V22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="16" cy="16" r="7.5" fill="#c2412a" />
      <circle cx="16" cy="16" r="3.2" fill="#f3ece1" />
    </svg>
  );
}
