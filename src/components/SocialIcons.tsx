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

/** TikTok's note: a stem with a round foot and the flag curling off its top. */
export function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    // Drawn a little closer than the others (21-unit view box, thinner line) so the
    // open shape carries the same weight as the boxed Instagram and YouTube marks.
    <svg width={size} height={size} viewBox="1.5 1.5 21 21" fill="none" aria-hidden="true">
      <path d="M14.4 3.5v10.9a3.85 3.85 0 1 1-3.85-3.85" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14.4 3.5c.5 2.6 2.4 4.35 5.1 4.55" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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
