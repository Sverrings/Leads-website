/** Simple outline marks for the footer links, drawn to match the icon set. */
export function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.15" fill="currentColor" />
    </svg>
  );
}

export function YouTubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.5" y="5" width="19" height="14" rx="4.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10.2 9.2v5.6l4.8-2.8-4.8-2.8Z" fill="currentColor" />
    </svg>
  );
}

/** Product Hunt's mark: a P in a circle, outlined like the others. */
export function ProductHuntIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.1" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.6 17V7.6h3.3a2.7 2.7 0 0 1 0 5.4H9.6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
